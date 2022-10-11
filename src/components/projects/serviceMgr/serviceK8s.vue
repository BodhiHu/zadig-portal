<template>
    <div class="projects-service-mgr">
      <el-drawer title="Code Source Integration"
                 :visible.sync="integrationCodeDrawer"
                 direction="rtl">
        <IntegrationCode @cancel="integrationCodeDrawer = false"/>
      </el-drawer>
      <el-dialog title="Whether to update the corresponding environment？"
                 custom-class="dialog-upgrade-env"
                 :visible.sync="updateEnvDialogVisible"
                 width="40%">
        <div class="title">
          <el-alert title="Check the environment that needs to be updated，After Clicking OK，The service will automatically be updated in the corresponding environment"
                    :closable="false"
                    type="warning">
          </el-alert>
          <el-checkbox-group v-model="checkedEnvList">
            <el-checkbox v-for="(env,index) in envNameList"
                         :key="index"
                         :label="env">{{env.name}}</el-checkbox>
          </el-checkbox-group>
          <div v-show="checkedEnvList.find(env => env.is_existed)" class="tip-desc">Zadig Services defined in will override services of the same name in the selected namespace，Please proceed with caution！</div>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button size="small"
                     type="primary"
                     @click="autoUpgradeEnv">Sure</el-button>
          <el-button size="small"
                     @click="updateEnvDialogVisible=false">Jump Over</el-button>

        </span>
      </el-dialog>
      <el-dialog :title="`Choose ${service.service_name} Environment To Join？`"
                 custom-class="dialog-upgrade-env"
                 :visible.sync="joinToEnvDialogVisible"
                 width="40%">
        <div class="title">
          <el-checkbox-group v-model="checkedEnvList" @change="changeUpgradeEnv">
            <el-checkbox v-for="(env,index) in deployableEnvListWithVars"
                         :key="index"
                         :label="env">{{env.name}}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div v-if="checkedEnvList.length > 0 && checkedEnvList[0] && checkedEnvList[0].vars &&checkedEnvList[0].vars.length > 0" class="env-tabs">
          <span class="desc">The service has usage variables，Please confirm the corresponding variable values of the service in different environments</span>
          <el-tabs v-model="activeEnvTabName" type="card">
            <el-tab-pane v-for="(env,index) in checkedEnvList"  :key="index" :label="env.name" :name="env.name">
              <el-table :data="env.vars" style="width: 100%;">
                  <el-table-column label="Key">
                    <template slot-scope="scope">
                      <span>{{ scope.row.key }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Value">
                    <template slot-scope="scope">
                      <el-input
                        size="small"
                        v-model="scope.row.value"
                        type="textarea"
                        :autosize="{ minRows: 1, maxRows: 4}"
                        placeholder="Please Enter Content"
                      ></el-input>
                    </template>
                  </el-table-column>
                </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
        <span slot="footer"
              class="dialog-footer">
          <el-button size="small"
                     @click="joinToEnvDialogVisible = false">Cancel</el-button>
          <el-button size="small"
                     type="primary"
                     @click="joinToEnv">Sure</el-button>

        </span>
      </el-dialog>
      <div class="service-wrap">
        <div class="service-container">
          <Multipane class="vertical-panes"
                     layout="vertical">
            <div class="service-tree-container">
              <ServiceTree :services="services"
                           :projectInfo="projectInfo"
                           :currentServiceYamlKinds="currentServiceYamlKinds"
                           :sharedServices="sharedServices"
                           :basePath="`/v1/projects/detail/${projectName}/services`"
                           :showNext.sync="showNext"
                           :yamlChange="yamlChange"
                           ref="serviceTree"
                           @onAddCodeSource="addCodeSource"
                           @onJumpToKind="jumpToKind"
                           @onRefreshProjectInfo="checkProjectFeature"
                           @onRefreshService="getServices"
                           @onDeleteService="deleteService"
                           @onRefreshSharedService="getSharedServices"
                           @onSelectServiceChange="onSelectServiceChange"
                           @onShowJoinToEnvBtn="showJoinToEnvBtnEvent"
                           @updateYaml="updateYaml($event)" />
            </div>
            <template v-if="service.service_name  &&  services.length >0">
                <MultipaneResizer/>
                <div class="service-editor-container"
                     :style="{ minWidth: '300px', width: '500px' }">
                  <ServiceEditor ref="serviceEditor"
                                    :serviceInTree="service"
                                    :showNext.sync="showNext"
                                    :yamlChange.sync="yamlChange"
                                    :isOnboarding="isOnboarding"
                                    :showJoinToEnvBtn.sync="showJoinToEnvBtn"
                                    @onGetTemplateId="getTemplateId"
                                    @onParseKind="getYamlKind"
                                    @onRefreshService="getServices"
                                    @onRefreshSharedService="getSharedServices"
                                    @onUpdateService="onUpdateService"
                                    @showJoinToEnvDialog="showJoinToEnvDialog"
                                    class="service-editor-content" />
                </div>
                <MultipaneResizer/>
                <aside class="service-aside service-aside-right"
                       :style="{ flexGrow: 1 }">
                  <ServiceAside :service="service"
                                :services="services"
                                :detectedEnvs="detectedEnvs"
                                :detectedServices="detectedServices"
                                :systemEnvs="systemEnvs"
                                :buildBaseUrl="isOnboarding?`/v1/projects/create/${projectName}/k8s/service`:`/v1/projects/detail/${projectName}/services`"
                                @getServiceModules="getServiceModules"/>
                </aside>

            </template>
            <div v-else
                 class="no-content">
              <img src="@assets/icons/illustration/editorNoService.svg"
                   alt="">
              <p v-if="services.length === 0">No Service，Click <el-button size="mini"
                           icon="el-icon-plus"
                           @click="createService()"
                           plain
                           circle>
                </el-button> Create Service</p>
              <p v-else-if="service.service_name==='Service List' && services.length >0">Please select the service you want to edit on the left</p>
              <p v-else-if="!service.service_name && services.length >0">Please select the service you want to edit on the left</p>
            </div>
          </Multipane>
        </div>
      </div>
      <div v-if="isOnboarding" class="controls__wrap">
          <div class="controls__right">
            <el-button type="primary"
                       size="small"
                       @click="showOnboardingNext">Next Step</el-button>
          </div>
      </div>
    </div>
</template>
<script>
import mixin from '@/mixin/serviceModuleMixin'
import ServiceAside from './k8s/serviceAside.vue'
import ServiceEditor from './k8s/serviceEditor.vue'
import ServiceTree from './common/serviceTree.vue'
import IntegrationCode from './common/integrationCode.vue'
import { sortBy, cloneDeep } from 'lodash'
import { getSingleProjectAPI, getServiceTemplatesAPI, getServicesTemplateWithSharedAPI, serviceTemplateWithConfigAPI, autoUpgradeEnvAPI, listProductAPI, getServiceDeployableEnvsAPI } from '@api'
import { Multipane, MultipaneResizer } from 'vue-multipane'
export default {
  props: {
    isOnboarding: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      projectInfo: {},
      service: {},
      services: [],
      sharedServices: [],
      detectedEnvs: [],
      detectedServices: [],
      systemEnvs: [],
      checkedEnvList: [],
      currentServiceYamlKinds: {},
      showNext: false,
      showJoinToEnvBtn: false,
      yamlChange: false,
      updateEnvDialogVisible: false,
      integrationCodeDrawer: false,
      joinToEnvDialogVisible: false,
      envNameList: [],
      deployableEnvs: [],
      activeEnvTabName: '',
      deletedService: ''
    }
  },
  methods: {
    addCodeSource () {
      if (!this.$utils.roleCheck('admin')) {
        this.$message('Private image repositories are not integrated，Please contact your system administrator to go to「System Settings -> Mirror Repository」To Integrate！')
      } else {
        this.integrationCodeDrawer = true
      }
    },
    createService () {
      this.$refs.serviceTree.createService('platform')
    },
    upgradeEnv () {
      this.updateEnvDialogVisible = true
    },
    onSelectServiceChange (service) {
      this.$set(this, 'service', service)
    },
    getServices () {
      const projectName = this.projectName
      this.$set(this, 'service', {})
      getServiceTemplatesAPI(projectName).then((res) => {
        this.services = sortBy((res.data.map(service => {
          service.idStr = `${service.service_name}/${service.type}`
          service.status = 'added'
          return service
        })), 'service_name')
      })
    },
    getSharedServices () {
      const projectName = this.projectName
      getServicesTemplateWithSharedAPI(projectName).then((res) => {
        this.sharedServices = sortBy((res.map(service => {
          service.status = 'added'
          service.type = 'k8s'
          return service
        })), 'service_name')
      })
    },
    getServiceModules () {
      const serviceName = this.service.service_name
      const projectName = this.projectName
      serviceTemplateWithConfigAPI(serviceName, projectName).then(res => {
        this.detectedEnvs = res.custom_variable ? res.custom_variable : []
        this.detectedServices = res.service_module ? res.service_module : []
        this.systemEnvs = res.system_variable ? res.system_variable : []
      })
    },
    showJoinToEnvDialog () {
      this.checkedEnvList = []
      this.getServiceDeployableEnvs()
      this.joinToEnvDialogVisible = true
    },
    changeUpgradeEnv (val) {
      if (this.checkedEnvList[0].vars.length > 0) {
        this.activeEnvTabName = val[val.length - 1].name
      }
    },
    onUpdateService ({ serviceName, serviceStatus, res }) {
      this.showNext = true
      this.$router.replace({
        query: Object.assign(
          {},
          {},
          {
            service_name: serviceName,
            rightbar: 'var',
            status: serviceStatus
          })
      })
      if (serviceStatus === 'named') {
        this.getServices()
        this.$refs.serviceTree.getServiceGroup()
        this.getSharedServices()
      }
      this.detectedEnvs = res.custom_variable ? res.custom_variable : []
      this.detectedServices = res.service_module ? res.service_module : []
      this.systemEnvs = res.system_variable ? res.system_variable : []
    },
    updateYaml (switchNode) {
      this.$refs.serviceEditor.updateService().then(() => {
        if (switchNode) {
          this.$refs.serviceTree.selectAndSwitchTreeNode()
        }
      })
    },
    getYamlKind (payload) {
      this.currentServiceYamlKinds = payload
    },
    getTemplateId (payload) {
      if (payload) {
        this.services.forEach(service => {
          if (service.service_name === payload.service_name) {
            this.$set(service, 'template_id', payload.template_id)
          }
        })
      }
    },
    jumpToKind (payload) {
      this.$nextTick(() => {
        this.$refs.serviceEditor.jumpToWord(`kind: ${payload.kind}`)
      })
    },
    async checkProjectFeature () {
      const projectName = this.projectName
      this.projectInfo = await getSingleProjectAPI(projectName)
    },
    showJoinToEnvBtnEvent () {
      this.showJoinToEnvBtn = true
    },
    joinToEnv () {
      const payload = this.checkedEnvList.map(item => {
        return {
          env_name: item.name,
          service_names: item.vars.length > 0 ? item.vars[0].services : [this.service.service_name],
          vars: item.vars
        }
      })
      const projectName = this.projectName
      const force = false
      autoUpgradeEnvAPI(projectName, payload, force).then((res) => {
        this.joinToEnvDialogVisible = false
        this.$message({
          message: 'Update environment succeeded',
          type: 'success'
        })
      }).catch(error => {
        const description = error.response.data.description
        const res = description.match('the following services are modified since last update')
        if (res) {
          this.updateEnvByForce(payload, description)
        }
      })
    },
    deleteService (serviceName) {
      this.deletedService = serviceName
      this.updateEnvDialogVisible = true
    },
    autoUpgradeEnv () {
      const payload = this.checkedEnvList.map(item => {
        return {
          env_name: item.name,
          service_names: [this.deletedService]
        }
      })
      const projectName = this.projectName
      const force = false
      autoUpgradeEnvAPI(projectName, payload, force).then((res) => {
        this.updateEnvDialogVisible = false
        this.$message({
          message: 'Update environment succeeded',
          type: 'success'
        })
      }).catch(error => {
        const description = error.response.data.description
        const res = description.match('the following services are modified since last update')
        if (res) {
          this.updateEnvupdateEnvByForce(payload, description)
        }
      })
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
          this.updateEnvDialogVisible = false
          this.joinToEnvDialogVisible = false
          this.$message({
            message: 'Update environment succeeded',
            type: 'success'
          })
        })
      })
    },
    async getEnvNameList () {
      const projectName = this.projectName
      const envNameList = await listProductAPI(projectName)
      if (envNameList.length) {
        this.envNameList = envNameList.map(env => {
          return {
            name: env.name,
            is_existed: env.is_existed || false
          }
        })
      }
    },
    getServiceDeployableEnvs () {
      const projectName = this.projectName
      const serviceName = this.service.service_name
      getServiceDeployableEnvsAPI(projectName, serviceName).then(res => {
        this.deployableEnvs = res.map(env => {
          return {
            name: env
          }
        })
      })
    },
    showOnboardingNext () {
      this.$router.push(`/v1/projects/create/${this.projectName}/k8s/runtime?serviceName=${this.serviceName}`)
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    serviceName () {
      return this.$route.query.service_name
    },
    deployableEnvListWithVars () {
      return this.deployableEnvs.map(env => {
        env.vars = cloneDeep(this.detectedEnvs.filter(item => item.services.includes(this.service.service_name)))
        return env
      })
    }
  },
  mounted () {
    this.getEnvNameList()
    this.checkProjectFeature()
    this.getServices()
    this.getSharedServices()
  },
  components: {
    ServiceAside,
    ServiceEditor,
    ServiceTree,
    Multipane,
    MultipaneResizer,
    IntegrationCode
  },
  mixins: [mixin]
}
</script>

<style lang="less">
@import "~@assets/css/component/service-mgr.less";
</style>
