<template>
  <el-dialog :title="`Please enter a project name ${projectName} Confirm Deletion`" :visible.sync="deleteDialogVisible" width="40%">
    <div class="delete-project-content">
      <template v-if="projectDeleteInfo.deploy_type === 'external'">
        <div style="margin-bottom: 4px;">
          The following resources under this project will be unhosted，
          <span style="color: red;">Please proceed with caution！！</span>
        </div>
        <div>
          <span style="font-weight: 500;">Serve：</span>
          <span>{{ services.join(', ') || 'None' }}</span>
        </div>
        <div>
          <span style="font-weight: 500;">Surroundings：</span>
          <span>{{ envNames.join(', ') || 'None' }}</span>
        </div>
        <div style="margin: 12px 0 4px;">
          The following resources under this project will be deleted at the same time，
          <span style="color: red;">Please proceed with caution！！</span>
        </div>
        <div>
          <span style="font-weight: 500;">Construct：</span>
          <span>{{ buildConfigs.join(', ') || 'None' }}</span>
        </div>
        <div>
          <span style="font-weight: 500;">Workflow：</span>
          <span>{{ workflows.join(', ') || 'None' }}</span>
        </div>
      </template>
      <template v-else>
        <div>
          The resources under this project will be deleted at the same time
          <span style="color: red;">Please proceed with caution！！</span>
        </div>
        <div>
          <span style="font-weight: 500;">Serve：</span>
          <span>{{ services.join(', ') || 'None' }}</span>
        </div>
        <div>
          <span style="font-weight: 500;">Surroundings：</span>
          <span>{{ envNames.join(', ') || 'None' }}</span>
        </div>
        <div>
          <span style="font-weight: 500;">Construct：</span>
          <span>{{ buildConfigs.join(', ') || 'None' }}</span>
        </div>
        <div>
          <span style="font-weight: 500;">Workflow：</span>
          <span>{{ workflows.join(', ') || 'None' }}</span>
        </div>
      </template>
      <div style="margin: 16px 0 6px;">
        <el-checkbox
          v-if="['k8s', 'helm'].includes(projectDeleteInfo.deploy_type)"
          v-model="projectDeleteInfo.is_delete"
        >At the same time delete the corresponding environment K8s Namespaces And Services</el-checkbox>
      </div>
      <el-form ref="deleteForm" :model="projectDeleteInfo" :rules="deleteRules" label-width="80px">
        <el-form-item label-width="0" prop="project_name">
          <el-input v-model="projectDeleteInfo.project_name" placeholder="Enter Project Name" size="small"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer">
      <el-button @click="deleteDialogVisible = false" size="small">Cancel</el-button>
      <el-button type="danger" @click="identifyDeleteProject" size="small">Sure</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  getServiceTemplatesAPI,
  getProductWorkflowsInProjectAPI,
  getBuildConfigsAPI,
  getEnvironmentsAPI,
  deleteProjectAPI
} from '@api'

export default {
  props: {
    followUpFn: Function
  },
  data () {
    return {
      deleteDialogVisible: false,
      projectName: '',
      services: [],
      envNames: [],
      buildConfigs: [],
      workflows: [],
      projectDeleteInfo: {
        is_delete: true,
        project_name: '',
        deploy_type: ''
      },
      deleteRules: {
        project_name: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('Please enter a project name'))
              } else if (value !== this.projectName) {
                callback(new Error('Project name does not match'))
              } else {
                callback()
              }
            },
            trigger: 'change'
          }
        ]
      }
    }
  },
  methods: {
    async openDialog (projectName) {
      this.projectName = projectName
      this.deleteDialogVisible = true
      this.services = []
      this.envNames = []
      this.buildConfigs = []
      this.workflows = []
      this.projectDeleteInfo = {
        is_delete: true,
        project_name: '',
        deploy_type: this.$store.getters.projectDeployType(projectName)
      }
      this.$nextTick(() => {
        this.$refs.deleteForm.resetFields()
      })
      this.initDeleteProject()
    },
    async initDeleteProject () {
      const projectName = this.projectName
      const result = await Promise.all([
        getServiceTemplatesAPI(projectName),
        getProductWorkflowsInProjectAPI(projectName),
        getBuildConfigsAPI(projectName),
        getEnvironmentsAPI(projectName)
      ])
      this.services = result[0].data.map(element => {
        return element.service_name
      })
      this.workflows = result[1].map(element => {
        return element.name
      })
      this.buildConfigs = result[2].map(element => {
        return element.name
      })
      this.envNames = result[3].map(element => {
        return element.name
      })
    },
    identifyDeleteProject () {
      this.$refs.deleteForm.validate((valid) => {
        if (valid) {
          deleteProjectAPI(
            this.projectName,
            this.projectDeleteInfo.is_delete
          ).then(() => {
            this.$message({
              type: 'success',
              message: 'Item deleted successfully'
            })
            this.deleteDialogVisible = false
            this.followUpFn && this.followUpFn()
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.delete-project-content {
  margin: -10px 10px;
  line-height: 22px;
}
</style>
