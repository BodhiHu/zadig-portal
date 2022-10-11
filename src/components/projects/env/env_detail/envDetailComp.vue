<template>
  <div class="env-detail-container" ref="envContainer">
    <PmHostList ref="pmHostList" :currentPmServiceData="currentPmServiceData" @success="refreshServiceList"></PmHostList>
    <el-dialog title="Upgrading Services via Workflow" :visible.sync="showStartProductBuild" custom-class="run-workflow" width="60%">
      <run-workflow
        v-if="showStartProductBuild"
        :workflows="currentServiceWorkflows"
        :currentServiceMeta="currentServiceMeta"
        @success="hideProductTaskDialog"
      ></run-workflow>
    </el-dialog>
    <div class="envs-container">
      <ChromeTabs v-model="envName" :tabList="envNameList" :label="'name'" :name="'name'">
        <template v-slot="{ tab }">
          <span>
            <i v-if="tab.source==='helm'" class="iconfont iconhelmrepo"></i>
            <i v-else-if="tab.source==='spock'" class="el-icon-cloudy"></i>
            {{ $utils.tailCut(tab.name,14) }}
            <el-tag v-if="tab.production" effect="light" size="mini" type="danger">Production</el-tag>
            <el-tag v-if="tab.source==='external'" effect="light" size="mini" type="primary">Hosting</el-tag>
            <el-tag v-if="!_.isNil(tab.share_env_is_base) && tab.share_env_is_base" effect="light" size="mini" type="primary">Baseline Environment</el-tag>
            <el-tag
              v-if="!tab.share_env_is_base && !_.isNil(tab.share_env_base_env) && tab.share_env_base_env !==''"
              effect="light"
              size="mini"
              type="primary"
            >Sub Environment</el-tag>
          </span>
        </template>
      </ChromeTabs>
    </div>
    <div class="banner">
      <el-alert v-if="productInfo.share_env_enable && productInfo.share_env_base_env!==''" :closable="false" type="warning">
        <span slot="title">
          Notice：Use the benchmark environment
          <span class="bold">{{`${productInfo.share_env_base_env} `}}</span>S Access Address，And On Request Header Plus
          <span class="bold">{{`x-env=${productInfo.env_name} `}}</span>To forward traffic to the current environment。
          <a href="https://docs.koderover.com/zadig/env/self-test-env/" target="_blank" rel="noopener noreferrer">How To Do It？</a>
        </span>
      </el-alert>
      <el-alert
        v-if="!_.isNil(shareEnvStatus) && !shareEnvStatus.is_ready"
        :title="`Notice：Self-test mode is running${shareEnvStatus.operation ==='enable'?'Turn On':'Closure'}，The service will restart during the process，A short period of time will affect the normal access of the service，Please Wait Patiently。`"
        :closable="false"
        type="warning"
      ></el-alert>
    </div>

    <div class="info-container">
      <!--start of basicinfo-->
      <div
        v-loading="envLoading"
        element-loading-text="Getting basic environment information"
        element-loading-spinner="el-icon-loading"
        class="common-parcel-block basic-info-content"
      >
        <el-tooltip v-if="envSource !== 'pm'" effect="dark" content="Change Log" placement="top">
          <el-button
            type="text"
            v-hasPermi="{projectName: projectName,action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}, isBtn:true}"
            icon="el-icon-document"
            class="change-log"
            @click="$router.push(`/v1/projects/detail/${projectName}/envs/${envName}/log`)"
          ></el-button>
        </el-tooltip>
        <el-row :gutter="10">
          <el-col v-if="!pmServiceList.length" :span="12">
            <div class="grid-title">K8s Cluster</div>
            <div v-if="productInfo.is_local" class="grid-content">Local Cluster</div>
            <div v-else class="grid-content">{{productInfo.is_prod?productInfo.cluster_name+' (Production Cluster)':productInfo.cluster_name +' (Test Cluster)'}}</div>
          </el-col>
          <el-col :span="12">
            <div class="grid-title">Update Time</div>
            <div class="grid-content">{{$utils.convertTimestamp(productInfo.update_time)}}</div>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12" v-if="!pmServiceList.length">
            <div class="grid-title">K8s Namespaces</div>
            <div class="grid-content">{{ envText }}</div>
          </el-col>
          <el-col :span="12">
            <div class="grid-title">Environmental Status</div>
            <div class="grid-content">{{getProdStatus(productInfo.status,productStatus.updatable)}}</div>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <!-- pm and hosting project don't show registry -->
          <el-col v-if="!isPmService" :span="12">
            <div class="grid-title">Mirror Repository</div>
            <div class="grid-content image-registry">
              <div v-if="editImageRegistry === false">
                <span>{{imageRegistryDesc}}</span>
                <i v-hasPermi="{projectName: projectName, action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}}" class="icon el-icon-edit icon-primary" @click="editImageRegistry = true"></i>
              </div>
              <div v-else>
                <el-select v-model="productInfo.editRegistryID" size="mini">
                  <el-option
                    v-for="registry in imageRegistry"
                    :key="registry.id"
                    :label="registry.namespace?`${registry.reg_addr}/${registry.namespace}`:registry.reg_addr"
                    :value="registry.id"
                  ></el-option>
                </el-select>
                <i class="icon el-icon-circle-close icon-gray" @click="editEnvImageRegistry('cancel')">Cancel</i>
                <i class="icon el-icon-circle-check icon-primary" @click="editEnvImageRegistry('update')">Save</i>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="grid-title">Basic Operation</div>
            <div class="grid-content operation">
              <el-tooltip
                v-if="checkEnvUpdate(productInfo.status) && productInfo.status!=='Disconnected' && (envSource===''||envSource==='spock'|| envSource==='helm')"
                content="Update variables referenced in the environment"
                effect="dark"
                placement="top"
              >
                <el-button
                  v-if="productInfo.status!=='Creating'"
                  v-hasPermi="{projectName: projectName,action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}, isBtn:true}"
                  type="primary"
                  @click="envSource==='helm' ? openUpdateHelmVar() : openUpdateK8sVar()"
                  size="mini"
                  plain
                >{{ envSource==='helm' ? 'Update Global Variable' : 'Update environment variables' }}</el-button>
              </el-tooltip>
              <template v-if="productInfo.share_env_enable && productInfo.share_env_is_base">
                <router-link
                  :to="`/v1/projects/detail/${projectName}/envs/create?createShare=true&baseEnvName=${productInfo.env_name}&clusterId=${productInfo.cluster_id}`"
                >
                  <el-button v-hasPermi="{projectName: projectName, action: isProd?'production:create_environment':'create_environment',isBtn:true}" type="primary" size="mini" plain>Create A Subenvironment</el-button>
                </router-link>
              </template>
              <template v-if="productInfo.status!=='Disconnected' && productInfo.status!=='Creating'">
                <el-dropdown v-if="envSource===''||envSource==='spock' || envSource==='helm'" trigger="click">
                  <el-button v-if="checkPermissionSyncMixin({projectName: projectName, action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}})" type="primary" plain>
                    Managed Services
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-button v-else class="permission-disabled" type="primary" plain>
                    Managed Services
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu v-if="checkPermissionSyncMixin({projectName: projectName, action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}})" slot="dropdown">
                    <el-dropdown-item @click.native="manageServices('add')">Add Service</el-dropdown-item>
                    <el-dropdown-item @click.native="manageServices('update')">Update Service</el-dropdown-item>
                    <el-dropdown-item @click.native="manageServices('delete')">Delete Service</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-tooltip
                  v-else-if="showUpdate(productInfo,productStatus) && (!productInfo.is_prod && envSource==='pm')"
                  content="Update according to the latest environment configuration，Including changes to service orchestration and service configuration"
                  effect="dark"
                  placement="top"
                >
                  <el-button v-hasPermi="{projectName: projectName, action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}, isBtn:true}" type="primary" @click="updateK8sEnv(productInfo)" size="mini" plain>Update Environment</el-button>
                </el-tooltip>
              </template>
              <template v-if="envSource==='' || envSource==='spock' || envSource === 'helm'">
                <el-dropdown trigger="click">
                  <el-button v-if="checkPermissionSyncMixin({projectName: projectName, action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}})" type="primary" plain>
                    Environment configuration
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-button v-else class="permission-disabled" type="primary" plain>
                    Environment configuration
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu v-if="checkPermissionSyncMixin({projectName: projectName, action: isProd?'production:config_environment':'config_environment'})"  slot="dropdown">
                    <el-dropdown-item @click.native="jumpEnvConfigPage('Ingress')">Ingress</el-dropdown-item>
                    <el-dropdown-item @click.native="jumpEnvConfigPage('ConfigMap')">ConfigMap</el-dropdown-item>
                    <el-dropdown-item @click.native="jumpEnvConfigPage('Secret')">Secret</el-dropdown-item>
                    <el-dropdown-item @click.native="jumpEnvConfigPage('PVC')">PVC</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
              <template v-if="productInfo.status!=='Disconnected' && productInfo.status!=='Creating'">
                <el-dropdown v-if="envSource===''||envSource==='spock'||envSource==='helm'" trigger="click">
                  <el-button type="primary" plain>
                    More
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-hasPermi="{projectName: projectName, action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}, isBtn:true}" v-if="!productInfo.share_env_enable" @click.native="shareEnv('enable')">Enable Self Test Mode</el-dropdown-item>
                    <el-dropdown-item
                      v-hasPermi="{projectName: projectName, action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}, isBtn:true}"
                      v-if="productInfo.share_env_enable && productInfo.share_env_is_base"
                      @click.native="shareEnv('disable')"
                    >Turn Off Self Test Mode</el-dropdown-item>
                    <el-dropdown-item
                      v-hasPermi="{projectName: projectName, action: isProd?'production:delete_environment':'delete_environment',resource:{name:envName,type:'env'}, isBtn:true}"
                      v-if="isShowDeleteEnv"
                      @click.native="deleteEnv(productInfo.product_name,productInfo.env_name)"
                    >Delete Environment</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <el-button
                  v-hasPermi="{projectName: projectName, action: isProd?'production:delete_environment':'delete_environment',resource:{name:envName,type:'env'}, isBtn:true}"
                  v-else-if="isShowDeleteEnv && (envSource==='helm'||envSource==='pm') "
                  type="primary"
                  @click="deleteEnv(productInfo.product_name,productInfo.env_name)"
                  size="mini"
                  plain
                >Delete Environment</el-button>
              </template>
              <template v-if="envSource==='external'">
                <el-button
                  v-hasPermi="{projectName: projectName, action: isProd?'production:config_environment':'config_environment',resource:{name:envName,type:'env'}, isBtn:true}"
                  @click="editExternalConfig(productInfo)"
                  type="primary"
                  size="mini"
                  plain
                >Configure Hosting</el-button>
                <el-button
                  v-hasPermi="{projectName: projectName, action: isProd?'production:delete_environment':'delete_environment',resource:{name:envName,type:'env'}, isBtn:true}"
                  type="primary"
                  @click="deleteHostingEnv(productInfo.product_name,productInfo.env_name)"
                  size="mini"
                  plain
                >Cancel Escrow</el-button>
              </template>
            </div>
          </el-col>
        </el-row>
        <div v-if="productInfo.error && productInfo.error!==''">
          <div class="grid-title">Error Message</div>
          <div class="grid-content error-info">{{productInfo.error}}</div>
        </div>
      </div>
      <!--end of basic info-->
      <div
        v-if="(envSource==='external'||envSource==='helm') && ingressList.length > 0"
        class="service-container"
        style="margin-bottom: 16px;"
      >
        <span class="service-count">Environmental Entrance</span>
        <div v-loading="serviceLoading" element-loading-text="Getting environmental information" element-loading-spinner="el-icon-loading" class="ingress-container">
          <el-table :data="ingressList">
            <el-table-column prop="name" label="Ingress Name"></el-table-column>
            <el-table-column label="Address">
              <template slot-scope="scope">
                <div v-if="scope.row.host_info && scope.row.host_info.length > 0">
                  <div v-for="host of scope.row.host_info" :key="host.host">
                    <a :href="`http://${host.host}`" class="host-url" target="_blank">{{ host.host }}</a>
                  </div>
                </div>
                <div v-else>None</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div v-loading="serviceLoading" element-loading-text="Getting service information" element-loading-spinner="el-icon-loading" class="service-container">
        <div class="service-title">
          <el-input
            size="mini"
            class="search-input"
            clearable
            v-model="serviceSearch"
            placeholder="Search Service"
            @keyup.enter.native="searchServicesByKeyword"
            @clear="searchServicesByKeyword"
          >
            <i class="el-icon-search el-input__icon" slot="prefix"></i>
          </el-input>
          <span v-show="!serviceLoading" class="service-count middle">
            Total Number Of Services
            <span class="service-number">{{ envTotal }}</span> Indivual
          </span>
          <el-button icon="el-icon-refresh" type="text" @click="refreshServiceList">Refresh</el-button>
        </div>
        <div class="env-service-list-content">
          <ChartList
            ref="chartListRef"
            class="left"
            v-if="envSource === 'helm'"
            :envSource="envSource"
            :fetchAllData="fetchAllData"
            :searchServicesByChart="searchServicesByChart"
            :isProd="isProd"
          />
          <ServiceList
            class="right"
            :containerServiceList="containerServiceList"
            :setRoute="setRoute"
            :serviceStatus="serviceStatus"
            :envSource="envSource"
            :updateService="updateService"
            :isPmService="isPmService"
            :upgradeServiceByWorkflow="upgradeServiceByWorkflow"
            :restartService="restartService"
            :setServiceConfigRoute="setServiceConfigRoute"
            :isProd="isProd"
          />
        </div>
        <el-table v-if="pmServiceList.length > 0" class="pm-service-container" :data="pmServiceList">
          <el-table-column label="Service Name" width="250px">
            <template slot-scope="scope">
              <router-link :to="setPmRoute(scope)">
                <span class="service-name">
                  <i v-if="scope.row.type==='pm'" class="iconfont service-icon iconwuliji"></i>
                  {{ scope.row.service_name }}
                </span>
              </router-link>
              <template v-if=" serviceStatus[scope.row.service_name] && serviceStatus[scope.row.service_name]['tpl_updatable']">
                <el-tooltip
                  v-hasPermi="{projectName: projectName, action: isProd ?'production:manage_environment':'manage_environment',resource:{name:envName,type:'env'} }"
                  effect="dark"
                  content="Update host resources and probe configuration"
                  placement="top"
                >
                  <i @click="updateService(scope.row)" class="iconfont icongengxin operation"></i>
                </el-tooltip>
              </template>
            </template>
          </el-table-column>
          <el-table-column align="left" label="State" width="130px">
            <template slot="header">
              State
              <el-tooltip effect="dark" placement="top">
                <div slot="content">Actual number of services up and running/Expected number of uptime services</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <span>{{calcPmServiceStatus(scope.row.env_statuses)}}</span>
            </template>
          </el-table-column>
          <el-table-column align="left" min-width="160px" label="Host Resources">
            <template slot-scope="scope">
              <template v-if="scope.row.env_statuses && scope.row.env_statuses.length>0">
                <div v-if="scope.row.serviceHostStatusArr[0]">
                  <span
                    class="pm-service-status"
                    :class="scope.row.serviceHostStatusArr[0]['color']"
                  >{{scope.row.serviceHostStatusArr[0].host}}</span>
                </div>
                <div v-if="scope.row.serviceHostStatusArr[1]">
                  <span
                    class="pm-service-status"
                    :class="scope.row.serviceHostStatusArr[1]['color']"
                  >{{scope.row.serviceHostStatusArr[1].host}}</span>
                </div>
                <el-popover
                  v-if="scope.row.serviceHostStatusArr.length > 2"
                  placement="right"
                  popper-class="pm-service-host-status-popover"
                  trigger="hover"
                >
                  <div v-for="(item,index) in _.drop(scope.row.serviceHostStatusArr,2)" :key="index">
                    <span class="pm-service-status" :class="item['color']">{{item.host}}</span>
                  </div>
                  <span slot="reference" class="add-host el-icon-more-outline"></span>
                </el-popover>
              </template>
              <div>
                <span v-if="checkPermissionSyncMixin({projectName: projectName, action: isProd ?'production:manage_environment':'manage_environment',resource:{name:envName,type:'env'} })" class="add-host el-icon-edit-outline" @click="editHost(scope.row)"></span>
                <el-tooltip
                  v-else
                  effect="dark"
                  content="Unauthorized Operation"
                  placement="top"
                >
                <span class="add-host el-icon-edit-outline permission-disabled"></span>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>

          <el-table-column align="center" label="Operate" width="150px">
            <template slot-scope="scope">
              <span class="operation">
                <el-tooltip
                 v-if="checkPermissionSyncMixin({projectName: projectName, action: isProd ?'production:manage_environment':'manage_environment',resource:{name:envName,type:'env'}})"
                  effect="dark"
                  content="Upgrading Services via Workflow"
                  placement="top"
                >
                  <i
                    @click="upgradeServiceByWorkflow(projectName,envName,scope.row.service_name,scope.row.type)"
                    class="iconfont iconshengji"
                  ></i>
                </el-tooltip>
                <el-tooltip
                 v-else
                  effect="dark"
                  content="Unauthorized Operation"
                  placement="top"
                >
                  <i
                    class="iconfont iconshengji permission-disabled"
                  ></i>
                </el-tooltip>
              </span>
              <span v-if="scope.row.status!=='Succeeded'" class="operation">
                <el-tooltip
                 v-if="checkPermissionSyncMixin({projectName: projectName, action: isProd ?'production:manage_environment':'manage_environment',resource:{name:envName,type:'env'},isBtn:true})"
                  effect="dark"
                  content="View service upgrade logs"
                  placement="top"
                >
                  <i @click="openPmServiceLog(envName,scope.row.service_name)" class="iconfont iconiconlog"></i>
                </el-tooltip>
                <el-tooltip
                  v-else
                  effect="dark"
                  content="Unauthorized Operation"
                  placement="top"
                >
                  <i  class="iconfont iconiconlog permission-disabled"></i>
                </el-tooltip>
              </span>
              <span class="operation">
                <el-tooltip
                 v-if="checkPermissionSyncMixin({projectName: projectName, action: isProd ?'production:manage_environment':'manage_environment',resource:{name:envName,type:'env'}})"
                  effect="dark"
                  content="View service configuration"
                  placement="top"
                >
                  <router-link :to="setPmServiceConfigRoute(scope)">
                    <i class="iconfont iconfuwupeizhi"></i>
                  </router-link>
                </el-tooltip>
                <el-tooltip
                  v-else
                  effect="dark"
                  content="Unauthorized Operation"
                  placement="top"
                >
                <span ><i class="iconfont iconfuwupeizhi permission-disabled"></i></span>
                </el-tooltip>
              </span>
            </template>
          </el-table-column>
        </el-table>
        <p v-if="!scrollGetFlag && !serviceLoading && !scrollFinish" class="scroll-finish-class">
          <i class="el-icon-loading"></i> Loading ~
        </p>
        <p v-if="scrollFinish && page > 2" class="scroll-finish-class">Data Has Been Loaded ~</p>
      </div>
    </div>
    <UpdateHelmVarDialog :fetchAllData="fetchAllData" ref="updateHelmVarDialog" :projectName="projectName" :envName="envName" />
    <UpdateK8sVarDialog :fetchAllData="fetchAllData" :productInfo="productInfo" ref="updateK8sVarDialog" />
    <PmServiceLog ref="pmServiceLog" />
    <ManageK8sServicesDialog :fetchAllData="fetchAllData" :productInfo="productInfo" ref="manageK8sServicesRef" />
    <ManageHelmServicesDialog
      :fetchAllData="fetchAllData"
      :productInfo="productInfo"
      ref="manageHelmServicesRef"
      :productStatus="productStatus"
    />
    <ShareEnvDialog
      :mode="shareEnvDialog.mode"
      :projectName="productInfo.product_name"
      :envName="productInfo.env_name"
      :clusterId="productInfo.cluster_id"
      @statusChange="shareEnvCallback"
      ref="shareEnvRef"
    />
    <el-dialog :title="`Sure You Want To Delete ${projectName} The Project ${envName} Surroundings?`" :visible.sync="envDeleteInfo.deleteDialogVisible" width="40%">
      <div style="padding: 0 10px;">
        <el-checkbox v-if="envSource !== 'pm'" v-model="envDeleteInfo.is_delete">At the same time delete the corresponding environment K8s Namespaces And Services</el-checkbox>
        <div style="margin: 16px 0 6px;">Please enter an environment name to confirm</div>
        <el-form ref="deleteForm" :model="envDeleteInfo" :rules="deleteRules" label-width="80px">
          <el-form-item label-width="0" prop="env_name">
            <el-input v-model="envDeleteInfo.env_name" placeholder="Enter Environment Name" size="small"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer">
        <el-button @click="envDeleteInfo.deleteDialogVisible = false" size="small">Cancel</el-button>
        <el-button type="danger" @click="identifyDeleteEnv()" size="small">Sure</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { translateEnvStatus, serviceTypeMap } from '@utils/wordTranslate'
import {
  envRevisionsAPI,
  getEnvInfoAPI,
  productServicesAPI,
  listProductAPI,
  updateServiceAPI,
  updateK8sEnvAPI,
  restartPmServiceAPI,
  restartServiceOriginAPI,
  deleteProjectEnvAPI,
  getSingleProjectAPI,
  getServicePipelineAPI,
  initSource,
  rmSource,
  getRegistryWhenBuildAPI,
  updateEnvImageRegistry,
  checkingShareEnvStatusAPI
} from '@api'
import _ from 'lodash'
import RunWorkflow from './runWorkflow.vue'
import PmServiceLog from './components/pmLogDialog.vue'
import PmHostList from './components/pmHostList.vue'
import ShareEnvDialog from './components/shareEnvDialog.vue'
import UpdateHelmVarDialog from './components/updateHelmVarDialog'
import UpdateK8sVarDialog from './components/updateK8sVarDialog'
import ManageK8sServicesDialog from './components/manageK8sServicesDialog.vue'
import ManageHelmServicesDialog from './components/manageHelmServicesDialog.vue'
import ChartList from './components/chartList.vue'
import ServiceList from './components/serviceList.vue'

const validateKey = (rule, value, callback) => {
  if (typeof value === 'undefined' || value === '') {
    callback(new Error('Please EnterKey'))
  } else {
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      callback(new Error('Key Only supports uppercase and lowercase letters and numbers，Special characters only support underscore'))
    } else {
      callback()
    }
  }
}

export default {
  data () {
    return {
      recycleDay: null,
      ctlCancel: null,
      envNameList: [],
      containerServiceList: [],
      pmServiceList: [],
      ingressList: [],
      currentServiceWorkflows: [],
      currentPmServiceData: {},
      selectVersion: '',
      selectVersionDialogVisible: false,
      updataK8sEnvVarLoading: false,
      updateK8sEnvVarDialogVisible: false,
      envLoading: false,
      serviceLoading: false,
      isPmService: false,
      isExternal: false,
      showStartProductBuild: false,
      helmChartDiffVisible: false,
      currentServiceMeta: null,
      serviceStatus: {},
      productInfo: {
        is_prod: false
      },
      productStatus: {
        updateble: false
      },
      shareEnvDialog: {
        title: 'Enable Self Test Mode',
        mode: 'enable'
      },
      keyCheckRule: {
        key: [
          {
            type: 'string',
            required: true,
            validator: validateKey,
            trigger: 'blur'
          }
        ],
        value: [
          {
            type: 'string',
            required: false,
            message: 'value',
            trigger: 'blur'
          }
        ]
      },
      serviceTypeMap: serviceTypeMap,
      serviceSearch: '',
      page: 1,
      perPage: 20,
      envTotal: 0,
      scrollGetFlag: true,
      scrollFinish: false,
      editImageRegistry: false,
      imageRegistry: [],
      shareEnvStatus: null,
      shareEnvStatusId: null,
      filterChartName: '*',
      envDeleteInfo: {
        deleteDialogVisible: false,
        is_delete: true,
        project_name: '',
        env_name: '',
        envType: ''
      },
      deleteRules: {
        env_name: [
          {
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('Please enter an environment name'))
              } else if (value !== this.envName) {
                callback(new Error('Environment names do not match'))
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
  computed: {
    isShowDeleteEnv () {
      const envSourceList = ['', 'spock', 'helm', 'pm']
      const productInfo = this.productInfo
      const status = productInfo.status
      return (
        ((status !== 'Disconnected' || status === 'NotFound') &&
          productInfo.cluster_id !== '' &&
          envSourceList.includes(this.envSource)) ||
        status === 'Unknown'
      )
    },
    isProd () {
      return this.productInfo.is_prod
    },
    nsIsExisted () {
      const env = this.envNameList.find(env => env.name === this.envName)
      return env ? env.is_existed : false
    },
    filteredProducts () {
      return _.uniqBy(
        _.orderBy(this.projectList, ['product_name', 'is_prod']),
        'product_name'
      )
    },
    envText () {
      return this.productInfo.namespace
    },
    envSource () {
      return this.productInfo.source || ''
    },
    projectName () {
      return this.$route.params.project_name
    },
    clusterId () {
      return this.productInfo.cluster_id ? this.productInfo.cluster_id : ''
    },
    _ () {
      return _
    },
    envName: {
      get: function () {
        if (this.$route.query.envName) {
          return this.$route.query.envName
        } else {
          return this.envNameList[0].envName
        }
      },
      set: function (newValue) {
        if (newValue === 'CREATE_NEW_ENV') {
          this.$router.push({
            path: `/v1/projects/detail/${this.projectName}/envs/create`,
            query: { outer: this.envBasePath.startsWith('/v1/envs/detail') }
          })
        } else if (newValue === 'ROLLBACK_NEW_ENV') {
          this.selectVersionDialogVisible = true
          this.selectVersion = ''
        } else {
          this.$router.push({
            path: `${this.envBasePath}`,
            query: { envName: newValue }
          })
        }
      }
    },
    usedInPolicy () {
      const env = this.envNameList.find(env => env.name === this.envName)
      return env ? env.base_refs : []
    },
    imageRegistryDesc () {
      let findImage = ''
      let defaultImage = ''
      const registryId = this.productInfo.registry_id
      this.imageRegistry.forEach(image => {
        if (image.id === registryId) {
          findImage = image.namespace
            ? `${image.reg_addr}/${image.namespace}`
            : image.reg_addr
        } else if (image.is_default) {
          defaultImage = image.namespace
            ? `${image.reg_addr}/${image.namespace}`
            : image.reg_addr
        }
      })
      return findImage || defaultImage
    }
  },
  methods: {
    jumpEnvConfigPage (configType) {
      this.$router.push(
        `/v1/projects/detail/${this.projectName}/envs/detail/${this.envName}/envConfig?type=${configType}`
      )
    },
    manageServices (type) {
      if (this.envSource === 'helm') {
        this.$refs.manageHelmServicesRef.openDialog(type)
      } else {
        this.$refs.manageK8sServicesRef.openDialog(type)
      }
    },
    async editEnvImageRegistry (flag) {
      if (flag === 'cancel') {
        this.productInfo.editRegistryID = this.productInfo.registry_id
      } else if (flag === 'update') {
        this.productInfo.registry_id = this.productInfo.editRegistryID
        if (!this.productInfo.registry_id) {
          this.$message.error(`Cannot update mirror repository is empty`)
          return
        }
        const payload = {
          registry_id: this.productInfo.registry_id
        }
        const res = await updateEnvImageRegistry(
          this.projectName,
          this.envName,
          payload
        ).catch(err => console.log(err))
        if (res) {
          this.$message.success(`The default mirror repository of the environment was updated successfully`)
        }
      }
      this.editImageRegistry = false
    },
    editHost (data) {
      this.currentPmServiceData = data
      this.$refs.pmHostList.editHostDialogVisible = true
    },
    editExternalConfig (envInfo) {
      const params = {
        step: 1,
        envName: envInfo.env_name,
        namespace: envInfo.namespace,
        productName: envInfo.product_name,
        clusterId: this.clusterId
      }
      this.$router.push({
        path: `/v1/projects/detail/${this.projectName}/envs/externalConfig`,
        query: params
      })
    },
    openUpdateHelmVar () {
      this.$refs.updateHelmVarDialog.openDialog()
    },
    openUpdateK8sVar () {
      this.$refs.updateK8sVarDialog.openDialog()
    },
    openPmServiceLog (envName, serviceName) {
      this.$refs.pmServiceLog.openDialog(envName, serviceName)
    },
    searchServicesByKeyword () {
      this.initPageInfo()
      this.getEnvServices('search')
    },
    searchServicesByChart (serviceName) {
      this.initPageInfo()
      this.filterChartName = serviceName
      this.getEnvServices('search')
    },
    onScroll (event) {
      if (!this.scrollGetFlag) {
        return
      }
      const target = event.target
      const scrollTop = target.scrollTop
      const scrollHeight = target.scrollHeight
      const clientHeight = target.clientHeight
      if (scrollTop + 1.5 * clientHeight > scrollHeight) {
        this.getEnvServices()
      }
    },
    refreshServiceList () {
      this.initPageInfo()
      // Helm: update chart list
      if (this.envSource === 'helm') {
        this.filterChartName = '*'
        this.$refs.chartListRef.getChartNames(this.envName)
      }
      this.getEnvServices('search')
      this.fetchEnvRevision()
    },
    initPageInfo () {
      this.removeListener()
      this.page = 1
      this.envTotal = 0
      this.scrollGetFlag = true
      this.scrollFinish = false
      this.containerServiceList = []
      this.pmServiceList = []
    },
    addListener () {
      this.$refs.envContainer &&
        this.$refs.envContainer.addEventListener('scroll', this.onScroll)
    },
    removeListener () {
      this.$refs.envContainer &&
        this.$refs.envContainer.removeEventListener('scroll', this.onScroll)
    },
    checkProjectFeature () {
      const projectName = this.projectName
      getSingleProjectAPI(projectName)
        .then(res => {
          if (res.product_feature) {
            if (res.product_feature.basic_facility === 'cloud_host') {
              this.isPmService = true
            } else if (res.product_feature.create_env_type === 'external') {
              this.isExternal = true
            }
          } else {
            this.isPmService = false
            this.isExternal = false
          }
        })
        .catch(err => {
          if (err === 'CANCEL') {
            console.log(err)
          }
        })
    },
    async checkingShareEnvStatus (operation) {
      const projectName = this.projectName
      const envName = this.envName
      if (operation) {
        const res = await checkingShareEnvStatusAPI(
          envName,
          projectName,
          operation
        ).catch(err => {
          console.log(err)
          clearTimeout(this.shareEnvStatusId)
        })
        if (res) {
          this.shareEnvStatus = res
          this.shareEnvStatus.operation = operation
          if (!res.is_ready) {
            this.shareEnvStatusId = setTimeout(() => {
              return this.checkingShareEnvStatus(operation)
            }, 2000)
          } else if (res.is_ready) {
            clearTimeout(this.shareEnvStatusId)
            this.shareEnvStatusId = null
            this.fetchAllData()
          }
        }
      }
    },
    fetchAllData () {
      try {
        this.editImageRegistry = false
        this.initPageInfo()
        this.getEnvNameList()
        this.getEnvServices()
        this.fetchEnvRevision()
        this.checkProjectFeature()
      } catch (err) {
        console.log('ERROR:' + err)
      }
    },
    fetchEnvRevision () {
      const projectName = this.projectName
      const envName = this.envName
      envRevisionsAPI(projectName, envName)
        .then(revisions => {
          const productStatus = revisions.find(element => {
            return (
              element.product_name === projectName &&
              element.env_name === this.envName
            )
          })
          if (productStatus.services) {
            productStatus.services.forEach(service => {
              this.$set(this.serviceStatus, service.service_name, {
                tpl_updatable: false,
                current_revision: 0,
                next_revision: 0
              })
              this.$set(this.serviceStatus, service.service_name, {
                tpl_updatable: !!(
                  service.updatable &&
                  service.deleted === false &&
                  service.new === false
                ),
                current_revision: service.current_revision,
                next_revision: service.next_revision,
                config: {
                  config_name:
                    service.configs && service.configs.length > 0
                      ? service.configs[0].config_name
                      : null,
                  current_revision:
                    service.configs && service.configs.length > 0
                      ? service.configs[0].current_revision
                      : null,
                  next_revision:
                    service.configs && service.configs.length > 0
                      ? service.configs[0].next_revision
                      : null,
                  updatable:
                    service.configs && service.configs.length > 0
                      ? service.configs[0].updatable
                      : null
                },
                raw: service
              })
            })
          }
          this.productStatus = productStatus
        })
        .catch(err => {
          if (err === 'CANCEL') {
            console.log(err)
          }
        })
    },
    async getEnvServices (flag) {
      const projectName = this.projectName
      const envName = this.envName
      try {
        let serviceGroup = []
        if (this.page === 1 && flag !== 'search') {
          await this.getProductEnvInfo(projectName, envName)
          if (this.envSource === 'helm') {
            this.filterChartName = '*'
            this.$refs.chartListRef.getChartNames(envName)
          }
        }
        this.scrollGetFlag = false
        if (this.page === 1) {
          this.addListener()
        }

        const serviceSearch =
          this.envSource === 'helm'
            ? `serviceName=${this.filterChartName},name=${this.serviceSearch}`
            : this.serviceSearch
        const res = await productServicesAPI(
          projectName,
          envName,
          this.envSource,
          serviceSearch,
          this.perPage,
          this.page
        )
        this.envTotal = res.headers['x-total']
          ? parseInt(res.headers['x-total'])
          : 0
        if (this.envSource === 'external' || this.envSource === 'helm') {
          serviceGroup = res.data.services
          this.ingressList = res.data.ingresses
        } else {
          serviceGroup = res.data
        }
        this.page++
        this.serviceLoading = false
        if (serviceGroup && serviceGroup.length) {
          const {
            containerServiceList,
            pmServiceList
          } = this.handleProductEnvServiceData(serviceGroup)
          this.scrollGetFlag = true
          this.containerServiceList = this.containerServiceList.concat(
            containerServiceList
          )
          this.pmServiceList = this.pmServiceList.concat(pmServiceList)
          this.containerServiceList = _.orderBy(
            this.containerServiceList,
            'service_name'
          )
          this.pmServiceList = _.orderBy(this.pmServiceList, 'service_name')
          if (
            this.envTotal ===
            this.containerServiceList.length + this.pmServiceList.length
          ) {
            this.removeListener()
            this.scrollGetFlag = false
            this.scrollFinish = true
          }
        } else {
          this.removeListener()
          this.scrollGetFlag = false
          this.scrollFinish = true
        }
      } catch (err) {
        this.scrollGetFlag = true
        if (err === 'CANCEL') {
          return
        }
        this.$notify.error({
          title: 'Failed to get environment information'
        })
      }
    },
    async getProductEnvInfo (projectName, envName) {
      this.envLoading = true
      this.serviceLoading = true
      const envInfo = await getEnvInfoAPI(projectName, envName)
      if (envInfo) {
        if (!envInfo.registry_id) {
          envInfo.registry_id = ''
        }
        envInfo.editRegistryID = envInfo.registry_id
        this.productInfo = envInfo
        this.envLoading = false
        this.recycleDay = envInfo.recycle_day ? envInfo.recycle_day : undefined
      }
    },
    async getEnvNameList () {
      const projectName = this.projectName
      const envNameList = await listProductAPI(projectName)
      envNameList.forEach(element => {
        element.envName = element.name
      })
      if (envNameList) {
        this.envNameList = _.sortBy(envNameList, item => {
          return item.production
        })
      }
    },
    handleProductEnvServiceData (serviceGroup) {
      const containerServiceList = this.$utils.deepSortOn(
        serviceGroup.filter(element => {
          return element.type === 'k8s'
        }),
        'service_name'
      )
      const pmServiceList = serviceGroup.filter(element => {
        return element.type === 'pm'
      })
      if (pmServiceList.length > 0) {
        pmServiceList.forEach(serviceItem => {
          if (serviceItem.env_statuses) {
            serviceItem.serviceHostStatus = {}
            serviceItem.env_statuses.forEach(hostItem => {
              const host = hostItem.address.split(':')[0]
              serviceItem.serviceHostStatus[host] = { status: [], color: '' }
              serviceItem.serviceHostStatus[host].status.push(hostItem.status)
              serviceItem.serviceHostStatus[host].color = checkStatus(
                serviceItem.serviceHostStatus[host].status
              )
            })
            serviceItem.serviceHostStatusArr = this.$utils.mapToArray(
              serviceItem.serviceHostStatus,
              'host'
            )
          }
        })
        function checkStatus (arr) {
          let successCount = 0
          let errorCount = 0
          for (let index = 0; index < arr.length; index++) {
            const element = arr[index]
            if (element === 'Running') {
              successCount = successCount + 1
            }
            if (element === 'Error') {
              errorCount = errorCount + 1
            }
          }
          if (successCount === arr.length) {
            return 'green'
          } else if (errorCount === arr.length) {
            return 'red'
          } else {
            return 'yellow'
          }
        }
      }
      return {
        containerServiceList,
        pmServiceList
      }
    },
    getProdStatus (status, updatable) {
      // k8s and helm don't show updatable status
      const hiddenUpdatable =
        this.envSource === '' ||
        this.envSource === 'spock' ||
        this.envSource === 'helm'
      return translateEnvStatus(status, hiddenUpdatable ? false : updatable)
    },
    rollbackToVersion () {
      this.$router.push(
        `/v1/projects/detail/${this.projectName}/envs/create?rollbackId=${this.selectVersion}`
      )
    },
    showUpdate (envInfo, envStatus) {
      return envStatus.updatable
    },
    updateK8sEnv (envInfo) {
      const content = `<p>Update Environment, Whether To Continue?</p>${
        this.nsIsExisted
          ? '<p style="color: #f56c6c; font-size: 13px;">Zadig Services defined in will override services of the same name in the selected namespace，Please proceed with caution！'
          : ''
      }</p>`
      this.$confirm(content, 'Renew', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        dangerouslyUseHTMLString: true,
        type: 'warning'
      }).then(() => {
        const projectName = envInfo.product_name
        const envName = envInfo.env_name
        const envType = this.isProd ? 'prod' : ''
        const payload = { vars: envInfo.vars }
        const force = false
        updateK8sEnvAPI(projectName, envName, payload, envType, force)
          .then(response => {
            this.fetchAllData()
            this.$message({
              message: 'Update environment succeeded，Please wait for service upgrade',
              type: 'success'
            })
          })
          .catch(error => {
            const description = error.response.data.description
            const res = description.match(
              'the following services are modified since last update'
            )
            if (res) {
              this.updateEnv(description, envInfo)
            }
          })
      })
    },
    updateEnv (res, envInfo) {
      const message = JSON.parse(res.match(/{.+}/g)[0])
      this.$confirm(
        `Your update operation will overwrite the environment in${message.name}Service Change，Confirm To Continue?`,
        'Hint',
        {
          confirmButtonText: 'Sure',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).then(() => {
        const projectName = envInfo.product_name
        const envName = envInfo.env_name
        const envType = this.isProd ? 'prod' : ''
        const payload = { vars: envInfo.vars }
        const force = true
        updateK8sEnvAPI(projectName, envName, payload, envType, force).then(
          response => {
            this.fetchAllData()
            this.$message({
              message: 'Update environment succeeded，Please wait for service upgrade',
              type: 'success'
            })
          }
        )
      })
    },
    upgradeServiceByWorkflow (projectName, envName, serviceName, serviceType) {
      getServicePipelineAPI(projectName, envName, serviceName, serviceType)
        .then(res => {
          this.currentServiceWorkflows = res.workflows || []
          this.currentServiceMeta = {
            projectName: projectName,
            envName: envName,
            serviceName: serviceName,
            serviceType: serviceType,
            targets: res.targets || [],
            ns: this.envText
          }
          this.showStartProductBuild = true
        })
        .catch(err => {
          if (err === 'CANCEL') {
            console.log(err)
          }
        })
    },
    hideProductTaskDialog () {
      this.showStartProductBuild = false
    },
    deleteHostingEnv (project_name, env_name) {
      if (this.usedInPolicy.length) {
        this.cantDelete(false)
        return
      }
      const envType = this.isProd ? 'prod' : ''
      this.$prompt(
        'Please enter an environment name to confirm',
        `Are you sure you want to cancel hosting ${project_name} The Project ${env_name} Surroundings?`,
        {
          confirmButtonText: 'Sure',
          cancelButtonText: 'Cancel',
          confirmButtonClass: 'el-button el-button--danger',
          inputValidator: input => {
            if (input === env_name) {
              return true
            } else if (input === '') {
              return 'Please enter an environment name'
            } else {
              return 'Project environment names do not match'
            }
          }
        }
      )
        .then(({ value }) => {
          deleteProjectEnvAPI(project_name, env_name, envType).then(res => {
            this.$notify({
              title: `Hosting environment is disconnecting，Please check the environment status later`,
              message: 'Successful Operation',
              type: 'success',
              offset: 50
            })
            const position = this.envNameList
              .map(e => {
                return e.envName
              })
              .indexOf(env_name)
            this.envNameList.splice(position, 1)
            if (this.envNameList.length > 0) {
              this.$router.push(
                `${this.envBasePath}?envName=${
                  this.envNameList[this.envNameList.length - 1].envName
                }`
              )
            } else {
              this.$router.push(
                `/v1/projects/detail/${this.projectName}/envs/create`
              )
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'warning',
            message: 'Cancel The Operation'
          })
        })
    },
    cantDelete (isDelete = true) {
      this.$alert(
        `Surroundings ${this.envName} Already in collaborative mode ${this.usedInPolicy.join(
          '、'
        )} Is defined as the baseline environment，If Needed${
          isDelete ? 'Delete' : 'Cancel Escrow'
        }Please modify the collaboration mode first！`,
        isDelete ? 'Delete Environment' : 'Cancel Escrow',
        {
          confirmButtonText: 'Sure',
          type: 'warning'
        }
      )
    },
    deleteEnv (project_name) {
      if (this.usedInPolicy.length) {
        this.cantDelete()
        return
      }
      this.envDeleteInfo = {
        deleteDialogVisible: true,
        is_delete: true,
        project_name: project_name,
        env_name: '',
        envType: this.isProd ? 'prod' : ''
      }
    },
    identifyDeleteEnv () {
      this.$refs.deleteForm.validate().then(() => {
        const envDeleteInfo = this.envDeleteInfo
        deleteProjectEnvAPI(
          envDeleteInfo.project_name,
          envDeleteInfo.env_name,
          envDeleteInfo.envType,
          envDeleteInfo.is_delete
        ).then(res => {
          this.envDeleteInfo = {
            deleteDialogVisible: false,
            is_delete: true,
            project_name: envDeleteInfo.project_name,
            env_name: '',
            envType: this.isProd ? 'prod' : ''
          }
          this.$notify({
            title: `Environment is being deleted，Please check the environment status later`,
            message: 'Successful Operation',
            type: 'success',
            offset: 50
          })
          const position = this.envNameList
            .map(e => {
              return e.envName
            })
            .indexOf(envDeleteInfo.env_name)
          this.envNameList.splice(position, 1)
          if (this.envNameList.length > 0) {
            this.$router.push(
              `${this.envBasePath}?envName=${
                this.envNameList[this.envNameList.length - 1].envName
              }`
            )
          } else {
            this.$router.push(
              `/v1/projects/detail/${this.projectName}/envs/create`
            )
          }
        })
      })
    },
    restartService (projectName, serviceName, envName) {
      this.$confirm('Are you sure you want to restart the service??', 'Reboot', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        const envType = this.isProd ? 'prod' : ''
        restartServiceOriginAPI(projectName, serviceName, envName, envType).then(
          res => {
            this.$message({
              message: 'Restart the service successfully',
              type: 'success'
            })
            this.initPageInfo()
            this.getEnvServices()
            this.fetchEnvRevision()
          }
        )
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Reboot Cancelled'
        })
      })
    },
    restartPmService (service, revisionMeta) {
      const payload = {
        product_name: service.product_name,
        service_name: service.service_name,
        revision: revisionMeta.current_revision,
        env_names: [this.envName]
      }
      restartPmServiceAPI(payload).then(res => {
        this.$message({
          message: 'Restart the service successfully',
          type: 'success'
        })
        this.initPageInfo()
        this.getEnvServices()
        this.fetchEnvRevision()
      })
    },
    checkEnvUpdate (status) {
      if (status === 'Deleting' || status === 'Creating') {
        return false
      } else {
        return true
      }
    },
    setRoute (scope) {
      if (typeof this.envName === 'undefined') {
        return `${this.envBasePath}/${scope.row.service_name}?projectName=${this.projectName}&namespace=${this.envText}&originProjectName=${scope.row.product_name}&isProd=${this.isProd}&clusterId=${this.clusterId}&envSource=${this.envSource}&workLoadType=${scope.row.workLoadType}`
      } else {
        return `${this.envBasePath}/${scope.row.service_name}?envName=${this.envName}&projectName=${this.projectName}&namespace=${this.envText}&originProjectName=${scope.row.product_name}&isProd=${this.isProd}&clusterId=${this.clusterId}&envSource=${this.envSource}&workLoadType=${scope.row.workLoadType}`
      }
    },
    setPmRoute (scope) {
      if (typeof this.envName === 'undefined') {
        return `${this.envBasePath}/${scope.row.service_name}/pm?projectName=${this.projectName}&namespace=${this.envText}&originProjectName=${scope.row.product_name}&isProd=${this.isProd}&clusterId=${this.clusterId}&envSource=${this.envSource}`
      } else {
        return `${this.envBasePath}/${scope.row.service_name}/pm?envName=${this.envName}&projectName=${this.projectName}&namespace=${this.envText}&originProjectName=${scope.row.product_name}&isProd=${this.isProd}&clusterId=${this.clusterId}&envSource=${this.envSource}`
      }
    },
    setServiceConfigRoute (scope) {
      if (this.envSource === 'external') {
        return `/v1/projects/detail/${scope.row.product_name}/services?envName=${this.envName}&serviceName=${scope.row.service_name}`
      }
      if (typeof this.envName === 'undefined') {
        return `${this.envBasePath}/${scope.row.service_name}/config?projectName=${this.projectName}&namespace=${this.envText}&originProjectName=${scope.row.product_name}&isProd=${this.isProd}&clusterId=${this.clusterId}&envSource=${this.envSource}`
      } else {
        return `${this.envBasePath}/${scope.row.service_name}/config?envName=${this.envName}&projectName=${this.projectName}&namespace=${this.envText}&originProjectName=${scope.row.product_name}&isProd=${this.isProd}&clusterId=${this.clusterId}&envSource=${this.envSource}`
      }
    },
    setPmServiceConfigRoute (scope) {
      return `/v1/projects/detail/${scope.row.product_name}/services?serviceName=${scope.row.service_name}`
    },
    updateService (service) {
      this.$message.info('Start Update Service')
      updateServiceAPI(
        this.projectName,
        service.service_name,
        service.type,
        this.envName,
        this.serviceStatus[service.service_name].raw
      ).then(res => {
        this.$message.success('The update is successful, please wait for the service upgrade')
        this.fetchAllData()
      })
    },
    updatePmService (service, revisionMeta) {
      const payload = {
        product_name: service.product_name,
        service_name: service.service_name,
        revision: revisionMeta.next_revision,
        env_names: [this.envName],
        updatable: true
      }
      this.$message.info('Start Update Service')
      restartPmServiceAPI(payload).then(res => {
        this.$message.success('The update is successful, please wait for the service upgrade')
        this.fetchAllData()
      })
    },
    calcPmServiceStatus (envStatus) {
      if (envStatus) {
        const runningCount = envStatus.filter(
          s => s.status === 'Running' || s.status === 'Succeeded'
        ).length
        return `${runningCount}/${envStatus.length}`
      } else {
        return 'N/A'
      }
    },
    shareEnv (operation) {
      if (operation === 'enable') {
        this.shareEnvDialog.mode = 'enable'
        this.$refs.shareEnvRef.openDialog()
      } else if (operation === 'disable') {
        this.shareEnvDialog.mode = 'disable'
        this.$refs.shareEnvRef.closeDialog()
      }
    },
    shareEnvCallback (operation) {
      this.checkingShareEnvStatus(operation)
    }
  },
  created () {
    getRegistryWhenBuildAPI(this.projectName).then(res => {
      this.imageRegistry = res
    })
  },
  beforeDestroy () {
    this.removeListener()
  },
  destroyed () {
    this.ctlCancel && this.ctlCancel.cancel('CANCEL_2')
    rmSource()
  },
  watch: {
    $route: {
      handler: function (to, from) {
        if (this.projectName !== '') {
          this.ctlCancel && this.ctlCancel.cancel('CANCEL_1')
          this.ctlCancel = initSource()
          this.fetchAllData()
        }
      },
      immediate: true
    },
    'envDeleteInfo.deleteDialogVisible' (val) {
      if (!val) {
        this.$refs.deleteForm.resetFields()
      }
    }
  },
  components: {
    RunWorkflow,
    PmServiceLog,
    PmHostList,
    UpdateHelmVarDialog,
    UpdateK8sVarDialog,
    ManageK8sServicesDialog,
    ManageHelmServicesDialog,
    ShareEnvDialog,
    ChartList,
    ServiceList
  },
  props: {
    envBasePath: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="less">
@import '~@assets/css/component/env-detail.less';

.image-registry {
  .icon {
    margin-left: 3px;
    cursor: pointer;

    &.icon-primary {
      color: @themeColor;
    }

    &.icon-gray {
      color: #9ea3a9;
    }
  }
}

.add-host {
  color: @themeColor;
  cursor: pointer;
}

.el-message-box__wrapper {
  .el-message-box__title {
    padding-right: 20px;
  }
}
</style>
