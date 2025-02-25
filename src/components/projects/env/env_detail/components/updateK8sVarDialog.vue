<template>
  <el-dialog
    title="更新环境变量"
    :visible.sync="updateK8sEnvVarDialogVisible"
    width="60%"
    class="update-env-variable"
  >
    <div class="search-variable">
      <el-input
        size="mini"
        class="search-input"
        clearable
        v-model="varSearch"
        placeholder="搜索全局变量"
      >
        <i class="el-icon-search el-input__icon" slot="prefix"></i>
      </el-input>
    </div>
    <div>全局变量列表
      <el-tooltip
        effect="dark"
        content="环境所用的变量，您可以修改原有 Value，也可以保持原样"
        placement="top"
      >
        <span class="el-icon-question"></span>
      </el-tooltip>
      <VariablePreviewEditor :services="previewServices" :projectName="productInfo.product_name" :envName="productInfo.env_name" :variables="remainingVars" />
    </div>
    <div class="kv-container">
      <el-table :data="remainingVars" style="width: 100%;">
        <el-table-column label="Key">
          <template slot-scope="scope">
            <span>{{ scope.row.key }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Value">
          <template slot-scope="scope">
            <VariableEditor :varKey="scope.row.key" :value.sync="scope.row.value" />
          </template>
        </el-table-column>
        <el-table-column label="关联服务" :filters="serviceFilters" :filter-method="filterMethods">
          <template slot-scope="scope">
            <span>{{
              scope.row.services ? scope.row.services.join(',') : '-'
            }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <span slot="footer" class="dialog-footer">
      <span class="update-desc">确认更新后，修改的变量关联的服务会重启</span>
      <el-button
        size="small"
        type="primary"
        :disabled="remainingVars.length === 0"
        :loading="updateK8sEnvVarLoading"
        @click="updateK8sEnvVar"
        >更新</el-button
      >
      <el-button size="small" @click="updateK8sEnvVarDialogVisible = false"
        >取 消</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import { updateK8sEnvAPI } from '@/api'
import { cloneDeep, flatten, intersection } from 'lodash'
export default {
  name: 'updateK8sVar',
  props: {
    fetchAllData: Function,
    productInfo: Object
  },
  data () {
    return {
      updateK8sEnvVarDialogVisible: false,
      updateK8sEnvVarLoading: false,
      vars: [],
      services: [],
      varSearch: '',
      serviceFilters: []
    }
  },
  computed: {
    remainingVars () {
      const varSearch = this.varSearch.toLocaleLowerCase()
      return this.vars.filter(item => item.key.toLocaleLowerCase().includes(varSearch))
    },
    previewServices () {
      return this.services.map(item => { return { service_name: item } })
    }
  },
  methods: {
    filterMethods (value, row) {
      return row.services.includes(value)
    },
    openDialog () {
      this.updateK8sEnvVarDialogVisible = true
    },
    updateK8sEnvVar () {
      const projectName = this.productInfo.product_name
      const envName = this.productInfo.env_name
      const envType = this.productInfo.isProd ? 'prod' : ''
      const payload = {
        service_names: this.services,
        vars: this.vars
      }
      const force = false
      this.updateK8sEnvVarLoading = true
      updateK8sEnvAPI(projectName, envName, payload, envType, force).then(
        (response) => {
          this.updateK8sEnvVarLoading = false
          this.updateK8sEnvVarDialogVisible = false
          this.fetchAllData()
          this.$message({
            message: '更新环境变量成功，请等待服务升级',
            type: 'success'
          })
        }).catch(error => {
        const description = error.response.data.description
        const res = description.match('the following services are modified since last update')
        if (res) {
          this.updateEnv(description)
        }
      })
    },
    updateEnv (res) {
      const message = JSON.parse(res.match(/{.+}/g)[0])
      this.$confirm(`您的更新操作将覆盖环境中${message.name}服务变更，确认继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const projectName = this.productInfo.product_name
        const envName = this.productInfo.env_name
        const envType = this.productInfo.isProd ? 'prod' : ''
        const payload = { vars: this.vars }
        const force = true
        updateK8sEnvAPI(projectName, envName, payload, envType, force).then(
          response => {
            this.fetchAllData()
            this.updateK8sEnvVarLoading = false
            this.updateK8sEnvVarDialogVisible = false
            this.$message({
              message: '更新环境成功，请等待服务升级',
              type: 'success'
            })
          })
      })
    }
  },
  watch: {
    updateK8sEnvVarDialogVisible (value) {
      if (value) {
        const services = flatten(this.productInfo.services)
        const vars = this.productInfo.vars.filter(
          item => intersection(item.services, services).length
        )
        this.services = services
        this.serviceFilters = services.map(service => {
          return {
            text: service,
            value: service
          }
        })
        this.vars = cloneDeep(vars)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.update-env-variable {
  .search-variable {
    margin-top: -20px;
    margin-bottom: 20px;

    /deep/.el-input.search-input {
      width: 300px;
    }
  }

  .kv-container {
    margin-top: 14px;

    /deep/.el-table {
      .el-table__column-filter-trigger i {
        margin-left: 5px;
        color: black;
      }
    }
  }

  .update-desc {
    display: inline-block;
    margin-right: 5px;
    color: red;
    font-size: 13px;
  }
}
</style>
