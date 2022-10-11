<template>
  <div class="integration-jenkins-container">
    <el-alert
      type="info"
      :closable="false"
    >
      <template>
        Support Integration Jenkins Server，After configuration the workflow can be used Jenkins Job Build Image，For details, please refer to
        <el-link style="font-size: 14px; vertical-align: baseline;"
                 type="primary"
                 :href="`https://docs.koderover.com/zadig/settings/jenkins/`"
                 :underline="false"
                 target="_blank">Help Documentation</el-link> 。
      </template>
    </el-alert>
    <div class="sync-container">
      <el-button
        size="small"
        type="primary"
        plain
        @click="handleJenkinsaAdd"
        >Add To</el-button
      >
    </div>
    <div class="jeknins-container">
    <Etable :tableColumns="tableColumns" :tableData="tableData" id="id" />
    </div>

    <AddJenkins :getJenkins="getJenkins" ref="jenkinsref" />
  </div>
</template>
<script>
import Etable from '@/components/common/etable'
import AddJenkins from './components/addJenkins'
import { queryJenkins, deleteJenkins } from '@/api'
import _ from 'lodash'
export default {
  name: 'jenkins',
  components: {
    Etable,
    AddJenkins
  },
  data () {
    return {
      tableColumns: [
        {
          prop: 'url',
          label: 'Service Address'
        },
        {
          prop: 'username',
          label: 'Username'
        },
        {
          prop: 'password',
          label: 'API token',
          render: () => {
            return (<div>**********</div>)
          }
        },
        {
          label: 'Operate',
          width: '160px',
          render: (scope) => {
            return (
              <div>
                <el-button type="primary" size="mini" onClick={() => { this.handleJenkinsaEdit(scope.row) }} plain>
                  Edit
                </el-button>
                <el-button type="danger" size="mini" onClick={() => { this.handleJenkinsaDelete(scope.row) }} plain>
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
    async handleJenkinsaDelete (data) {
      this.$confirm('Are you sure you want to delete this configuration？', 'Confirm', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteJenkins(data).then(() => {
          this.$message.success('Successfully Deleted')
          this.getJenkins()
        })
      })
    },
    handleJenkinsaAdd () {
      this.$refs.jenkinsref.openDialog()
    },
    handleJenkinsaEdit (data) {
      this.$refs.jenkinsref.openDialog(_.cloneDeep(data))
    },
    async getJenkins () {
      const key = this.$utils.rsaEncrypt()
      const res = await queryJenkins(key).catch(error => console.log(error))
      if (res) {
        this.tableData = res
      }
    }
  },
  activated () {
    this.getJenkins()
  }
}
</script>
<style lang="less" scoped>
.integration-jenkins-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .sync-container {
    padding-top: 15px;
    padding-bottom: 15px;
  }
}
</style>
