<template>
  <div class="integration-sonar-container">
    <el-alert
      type="info"
      :closable="false"
    >
      <template>
        Support Integration Sonar Server，Use After Configuration SonarQube After scanning the code, you can upload the result to the integrated address，For details, please refer to
        <el-link style="font-size: 14px; vertical-align: baseline;"
                 type="primary"
                 :href="`https://docs.koderover.com/zadig/settings/sonar/`"
                 :underline="false"
                 target="_blank">Help Documentation</el-link> 。
      </template>
    </el-alert>
    <div class="btn">
      <el-button
        v-if="tableData.length === 0"
        size="small"
        type="primary"
        plain
        @click="handleSonarAdd"
        >Add To</el-button
      >
    </div>
    <div class="jeknins-container">
    <Etable :tableColumns="tableColumns" :tableData="tableData" id="id" />
    </div>

    <SonarOperate :getSonar="getSonar" ref="sonarRef" />
  </div>
</template>
<script>
import Etable from '@/components/common/etable'
import SonarOperate from './components/sonarOperate'
import { querySonarAPI, deleteSonarAPI } from '@/api'
import { cloneDeep } from 'lodash'
export default {
  name: 'Sonar',
  components: {
    Etable,
    SonarOperate
  },
  data () {
    return {
      tableColumns: [
        {
          prop: 'server_address',
          label: 'Service Address'
        },
        {
          label: 'Operate',
          width: '160px',
          render: (scope) => {
            return (
              <div>
                <el-button type="primary" size="mini" onClick={() => { this.handleSonarEdit(scope.row) }} plain>
                  Edit
                </el-button>
                <el-button type="danger" size="mini" onClick={() => { this.handleSonarDelete(scope.row) }} plain>
                  Delete
                </el-button>
              </div>
            )
          }
        }
      ],
      tableData: []
    }
  },
  methods: {
    async handleSonarDelete (data) {
      this.$confirm('Are you sure you want to delete this configuration？', 'Confirm', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteSonarAPI(data).then(() => {
          this.$message.success('Successfully Deleted')
          this.getSonar()
        })
      })
    },
    handleSonarAdd () {
      this.$refs.sonarRef.openDialog()
    },
    handleSonarEdit (data) {
      this.$refs.sonarRef.openDialog(cloneDeep(data))
    },
    async getSonar () {
      const key = this.$utils.rsaEncrypt()
      const res = await querySonarAPI(key).catch(error => console.log(error))
      if (res) {
        this.tableData = res
      }
    }
  },
  activated () {
    this.getSonar()
  }
}
</script>
<style lang="less" scoped>
.integration-sonar-container {
  .btn {
    padding: 15px 0;
  }
}
</style>
