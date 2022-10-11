<template>
  <el-dialog title :visible.sync="dialogVisible" width="700px" custom-class="manage-service-dialog" :close-on-click-modal="false">
    <div slot="title">{{ productInfo.env_name }} Surroundings - {{ opeDesc }}Serve</div>
    <div class="manage-services-container">
      <el-form ref="serviceFormRef" class="primary-form" :model="updateServices" label-width="100px" label-position="left">
        <el-form-item
          label="Service Selection"
          props="service_names"
          :rules="{ required: true, type: 'array', message: 'Please select a service name', trigger: ['blur', 'change']}"
        >
          <el-select v-model="updateServices.service_names" placeholder="Please Select A Service" size="small" filterable multiple clearable collapse-tags>
            <el-option v-for="service in currentAllInfo.services" :key="service" :label="service" :value="service"></el-option>
          </el-select>
          <el-button type="primary" size="mini" plain @click="updateServices.service_names = currentAllInfo.services">Select All</el-button>
        </el-form-item>
      </el-form>
      <template v-if="opeType !== 'delete'">
        <div class="var-title">The selected service has environment variables used，Please confirm the corresponding variable value
          <VariablePreviewEditor :services="previewServices" :projectName="productInfo.product_name" :envName="productInfo.env_name" :variables="currentVars" />
        </div>
        <el-table :data="currentVars" style="width: 100%;">
          <el-table-column prop="key" label="Key"></el-table-column>
          <el-table-column label="Value">
            <template slot-scope="{ row }">
              <VariableEditor :varKey="row.key" :value.sync="row.value" />
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>
    <div slot="footer">
      <el-button @click="closeDialog" size="small" :disabled="loading">Cancel</el-button>
      <el-button type="primary" size="small" @click="updateEnvironment" :loading="loading">Sure</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { autoUpgradeEnvAPI, deleteEnvServicesAPI, getSingleProjectAPI } from '@api'
import { cloneDeep, flatten, difference, intersection } from 'lodash'
export default {
  props: {
    fetchAllData: Function,
    productInfo: Object // add: vars/services
  },
  data () {
    return {
      opeType: '',
      dialogVisible: false,
      allProductInfo: {
        // all services and variables
        services: [],
        vars: []
      },
      currentAllInfo: {
        // currently available services and variables
        services: [],
        vars: []
      },
      updateServices: {
        // env_names: [], // use this parameter when adding or updating services
        service_names: []
        // vars: []  // use this parameter when adding or updating services
      },
      loading: false
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    currentVars () {
      const services = this.updateServices.service_names
      return this.currentAllInfo.vars.filter(
        item => intersection(item.services, services).length
      )
    },
    opeDesc () {
      const typeEnum = {
        add: 'Add To',
        update: 'Renew',
        delete: 'Delete'
      }
      return typeEnum[this.opeType] || ''
    },
    isBaseEnv () {
      return this.productInfo.share_env_is_base
    },
    baseEnvName () {
      return this.productInfo.share_env_base_env
    },
    envType () {
      return this.productInfo.share_env_enable ? 'share' : 'general'
    },
    previewServices () {
      return this.updateServices.service_names.map(item => { return { service_name: item } })
    }
  },
  methods: {
    updateEnvironment () {
      let payload = {
        service_names: cloneDeep(this.updateServices.service_names)
      }
      if (this.opeType !== 'delete') {
        payload = [{
          ...payload,
          env_name: this.productInfo.env_name,
          vars: this.currentVars
        }]
      }
      this.loading = true
      if (this.opeType === 'delete') {
        deleteEnvServicesAPI(this.projectName, this.productInfo.env_name, payload).then(() => {
          this.$message.success(`${this.opeDesc}Service Success！`)
          this.closeDialog()
          this.fetchAllData()
        }).catch(error => {
          console.log(error)
          if (error.response && error.response.data.code === 6094) {
            const HtmlStrings = []
            for (const service in error.response.data.extra) {
              if (Object.hasOwnProperty.call(error.response.data.extra, service)) {
                const envNames = error.response.data.extra[service]
                HtmlStrings.push(`Serve ${service} Exists in the sub-environment ${envNames.join(',')} Middle`)
              }
            }
            const HtmlTemplate = `<p>The service to be deleted exists in the subenvironment，Please remove the reference before proceeding${this.opeDesc}Operate！</p><br><p>${HtmlStrings.join('<br>')}</p>`
            this.$message({
              message: HtmlTemplate,
              type: 'warning',
              dangerouslyUseHTMLString: true,
              duration: 5000
            })
          }
        }).finally(() => {
          this.loading = false
        })
      } else if (this.opeType === 'add' || this.opeType === 'update') {
        autoUpgradeEnvAPI(this.projectName, payload, false).then(() => {
          this.$message.success(`${this.opeDesc}Service Success！`)
          this.closeDialog()
          this.fetchAllData()
        }).catch(error => {
          const description = error.response.data.description
          const res = description.match('the following services are modified since last update')
          if (res) {
            this.updateEnvByForce(payload, description)
          }
        }).finally(() => {
          this.loading = false
        })
      }
    },
    updateEnvByForce (payload, description) {
      const message = JSON.parse(description.match(/{.+}/g)[0])
      const key = Object.keys(message)[0]
      const value = message[key].map(item => {
        return item.name
      })
      this.$confirm(`Your update operation will overwrite the environment in ${key} Of ${value} Service Change，Confirm To Continue?`, 'Hint', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const force = true
        autoUpgradeEnvAPI(this.projectName, payload, force).then((res) => {
          this.closeDialog()
          this.fetchAllData()
          this.$message({
            message: 'Update environment succeeded',
            type: 'success'
          })
        })
      })
    },
    closeDialog () {
      this.dialogVisible = false
      this.updateServices.service_names = []
    },
    async openDialog (type) {
      const projectName = this.projectName
      const isBaseEnv = this.isBaseEnv
      const baseEnvName = this.baseEnvName
      const envType = this.envType
      const res = await getSingleProjectAPI(projectName, envType, isBaseEnv, baseEnvName)
      if (res) {
        this.allProductInfo = {
          services: flatten(res.services),
          vars: res.vars || []
        }
      }
      this.dialogVisible = true
      this.opeType = type

      const productServices = flatten(this.productInfo.services)

      let vars = []
      let services = []
      switch (this.opeType) {
        case 'add':
          vars = cloneDeep(this.allProductInfo.vars) || []
          services = difference(this.allProductInfo.services, productServices)
          break
        case 'update':
        case 'delete':
          vars = cloneDeep(this.productInfo.vars) || []
          services = productServices
          break
      }
      this.currentAllInfo = { vars, services }
    }
  }
}
</script>

<style lang="less">
.manage-service-dialog {
  .el-dialog__header {
    padding: 15px;
    text-align: center;
    border-bottom: 1px solid #e4e4e4;
  }

  .el-dialog__body {
    padding: 30px 40px;

    .var-title {
      margin: 20px 0 10px;
    }
  }
}
</style>
