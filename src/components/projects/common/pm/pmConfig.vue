<template>
  <div class="pm-service-config-container" v-loading="loading" @scroll="onScroll">
    <div class="anchor-container">
      <el-tabs v-model="anchorTab" @tab-click="goToAnchor" tab-position="right">
        <el-tab-pane label="Basic Information"></el-tab-pane>
        <el-tab-pane v-if="isOnboarding" label="Resource Configuration"></el-tab-pane>
        <el-tab-pane label="Deployment Configuration"></el-tab-pane>
        <el-tab-pane label="Probe Configuration"></el-tab-pane>
      </el-tabs>
    </div>
    <ZadigBuild id="Basic Information" class="scroll" ref="zadigFormRef" :isCreate="!isEdit" :buildConfigData="buildConfig" usedToHost>
      <template v-slot:buildName>
        <el-form-item label="Build Name" prop="name">
          <el-select
            v-model="currentBuildConfig.name"
            @change="syncBuild"
            size="small"
            placeholder="Please Choose"
            filterable
            :allow-create="!isEdit"
          >
            <el-option v-for="item in builds" filterable :key="item.id" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
      </template>
      <template v-slot:serviceName>
        <el-form-item
          prop="service_name"
          label="Service Name"
          :rules="{
            type: 'string',
            required: true,
            validator: validateServiceName,
            trigger: 'change'
          }"
        >
          <el-input
            v-model="currentBuildConfig.service_name"
            placeholder="Service Name"
            autofocus
            size="small"
            :disabled="isEdit"
            auto-complete="off"
          ></el-input>
        </el-form-item>
      </template>
    </ZadigBuild>
    <div v-show="isOnboarding" id="Resource Configuration" class="common-parcel-block scroll">
      <el-form :model="pmService" ref="envConfigRef" label-width="120px" label-position="top" class="secondary-form" inline-message>
        <span class="primary-title">Resource Configuration</span>
        <el-row v-for="(item,item_index) in pmService.env_configs" class="env-config" :key="item_index">
          <el-col :span="3">
            <el-form-item
              :label="item_index===0?'Surroundings':''"
              :prop="'env_configs.'+item_index+'.env_name'"
              :rules="{required: false, message: 'Please select a deployment environment', trigger: 'blur'}"
            >
              <div class="env-name">{{ item.env_name }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <div class>
              <el-form-item
                :label="item_index===0?'Host':''"
                :prop="'env_configs.'+item_index+'.host_ids'"
                :rules="{required: false, message: 'Please Select A Host', trigger: 'blur'}"
              >
                <el-button
                  v-if="isEmptyHost"
                  @click="$router.push('/v1/system/host')"
                  type="text"
                >Create Host</el-button>
                <el-select v-else size="mini" multiple filterable v-model="item.host_ids" placeholder="Please Select A Host">
                  <el-option-group v-for="group in allHost" :key="group.label" :label="group.label">
                    <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-option-group>
                </el-select>
              </el-form-item>
            </div>
          </el-col>
          <el-col v-if="!isOnboarding" :span="8">
            <el-form-item :label="item_index===0?'Operate':''">
              <div class="app-operation">
                <el-button
                  v-if="item.showDelete"
                  @click="deleteEnvConfig(item_index)"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                ></el-button>
                <el-tooltip v-else effect="dark" content="Environment already exists，Undeletable configuration" placement="top">
                  <span>
                    <i class="el-icon-question"></i>
                  </span>
                </el-tooltip>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div id="Deployment Configuration" class="common-parcel-block deploy-config scroll">
      <el-form ref="deployEnvRef" :inline="true" :model="currentBuildConfig" class="primary-form" label-position="left" inline-message>
        <span class="item-title">Deployment Configuration</span>
        <div class="deploy-method">
          <el-radio-group v-model="useSshKey" class="radio-group">
            <el-radio :label="false">
              On-premises direct deployment
              <el-tooltip placement="top">
                <div slot="content">On-premises direct deployment：Make sure that the system can connect or access the host address in the script(Including This Machine)</div>
                <i class="icon el-icon-question"></i>
              </el-tooltip>
            </el-radio>
            <br />
            <el-radio :label="true" class="ssh-radio">
              Use SSH Agent Remote Deployment
              <el-tooltip placement="top">
                <div slot="content">Use SSH Agent Remote Deployment：Securely log in to the target machine，Perform a deployment operation，Available in system settings-Configuration in host management</div>
                <i class="icon el-icon-question"></i>
              </el-tooltip>
              <el-form-item
                v-if="useSshKey"
                prop="sshs"
                :rules="{required: true, type: 'array', message: 'Host Cannot Be Empty', trigger: ['blur', 'change']}"
              >
                <el-select v-model="currentBuildConfig.sshs" size="mini" multiple placeholder="Please Select A Host">
                  <el-option-group v-for="group in allHost" :key="group.label" :label="group.label">
                    <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-option-group>
                </el-select>
              </el-form-item>
            </el-radio>
          </el-radio-group>
        </div>
        <section class="inner-variable">
          <div @click="showBuildInEnvVar = !showBuildInEnvVar" class="item-title inner-title">
            Built-in deployment variables
            <i style="margin-left: 10px;" :class="[showBuildInEnvVar ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"></i>
          </div>
          <div v-show="showBuildInEnvVar" class="inner-variable-content">
            <div v-for="(variable, index) in deployVars" :key="index" class="var-content">
              <span v-if="variable.variable" class="var-variable">{{ variable.variable }}</span>
              <span class="var-desc">{{ variable.desc }}</span>
            </div>
          </div>
        </section>
        <div class="deploy-script">
          <Editor v-model="currentBuildConfig.pm_deploy_scripts" lang="sh" theme="xcode" width="100%" height="250px"></Editor>
        </div>
      </el-form>
    </div>
    <div id="Probe Configuration" class="common-parcel-block check-config scroll">
      <div class="primary-title">
        <span class="check-title">Probe Configuration</span>
        <el-switch v-model="checkStatusEnabled"></el-switch>
      </div>
      <template v-if="checkStatusEnabled">
        <el-form :model="pmService" ref="healthCheckRef" label-width="120px" label-position="left" class="secondary-form" inline-message>
          <div class="health-check-block" v-for="(item,item_index) in pmService.health_checks" :key="item_index">
            <div class="health-check-title">
              <el-button type="danger" class="delete-btn" icon="el-icon-delete" plain size="mini" @click="deleteCheck(item_index)" circle></el-button>
            </div>
            <el-form-item
              label="Protocol"
              :prop="'health_checks.'+item_index+'.protocol'"
              :rules="{required: true, message: 'Please select an agreement', trigger: 'blur'}"
            >
              <el-select v-model="item.protocol" size="small" placeholder="Please select an agreement">
                <el-option label="HTTP" value="http"></el-option>
                <el-option label="HTTPS" value="https"></el-option>
                <el-option label="TCP" value="tcp"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="item.protocol==='http'||item.protocol==='https'"
              label="Path"
              :rules="{type: 'string',message: 'Please Fill In The Path',required: false,trigger: ['blur', 'change']}"
              :prop="'health_checks.'+item_index+'.path'"
            >
              <el-input v-model="item.path" placeholder="example.com/index.html" size="small"></el-input>
            </el-form-item>
            <el-form-item
              label="Port"
              :rules="{type: 'number',required: false,validator: validateHealthCheckPort,trigger: ['blur', 'change']}"
              :prop="'health_checks.'+item_index+'.port'"
            >
              <el-input v-model.number="item.port" placeholder="1-65535" size="small"></el-input>
            </el-form-item>
            <el-form-item
              label="Response Timed Out"
              :rules=" {type: 'number',required: true,validator: validateHealthCheckTimeout,trigger: ['blur', 'change']}"
              :prop="'health_checks.'+item_index+'.time_out'"
            >
              <el-input v-model.number="item.time_out" placeholder="2(2-60) Second" size="small"></el-input>
            </el-form-item>
            <el-button
              type="primary"
              size="mini"
              round
              plain
              :icon="showCheckStatusAdvanced[item_index]?'el-icon-arrow-up':'el-icon-arrow-down'"
              @click="changeAdvancedShow(item_index)"
            >Advanced Settings</el-button>
            <template v-if="showCheckStatusAdvanced[item_index]">
              <el-form-item
                label="Detection Interval"
                :rules="{type: 'number',required: false,validator: validateHealthCheckInterval,trigger: ['blur', 'change']}"
                :prop="'health_checks.'+item_index+'.interval'"
              >
                <el-input v-model.number="item.interval" placeholder="2(2-60) Second" size="small"></el-input>
              </el-form-item>
              <el-form-item
                label="Health Threshold"
                :rules="{ type: 'number',required: false,validator: validateHealthCheckThreshold,trigger: ['blur', 'change']}"
                :prop="'health_checks.'+item_index+'.healthy_threshold'"
                class="label-icon"
              >
                <span slot="label">
                  Health Threshold
                  <el-tooltip effect="dark" placement="top">
                    <div slot="content">Number of consecutive probes from unhealthy to healthy</div>
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </span>
                <el-input v-model.number="item.healthy_threshold" placeholder="2(2-10) Second Rate" size="small"></el-input>
              </el-form-item>
              <el-form-item
                label="Unhealthy Threshold"
                :rules=" {type: 'number',required: false,validator: validateHealthCheckThreshold,trigger: ['blur', 'change']}"
                :prop="'health_checks.'+item_index+'.unhealthy_threshold'"
                class="label-icon"
              >
                <span slot="label">
                  Unhealthy Threshold
                  <el-tooltip effect="dark" placement="top">
                    <div slot="content">Number of consecutive probes from healthy to unhealthy</div>
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </span>
                <el-input v-model.number="item.unhealthy_threshold" placeholder="2(2-10) Second Rate" size="small"></el-input>
              </el-form-item>
            </template>
          </div>
          <div class="add-check">
            <el-button type="primary" icon="el-icon-circle-plus-outline" plain size="mini" @click="addCheck()" circle></el-button>
          </div>
        </el-form>
      </template>
    </div>
    <div class="save-btn">
      <el-button
        v-hasPermi="{projectName: projectName, action: isEdit?'edit_service':'create_service',isBtn:true}"
        size="small"
        type="primary"
        @click="savePmService"
      >Save</el-button>
    </div>
  </div>
</template>
<script>
import {
  listProductAPI,
  serviceTemplateAPI,
  getBuildConfigsAPI,
  getBuildConfigDetailAPI,
  createPmServiceAPI,
  updatePmServiceAPI,
  getHostListAPI,
  getProjectHostListAPI,
  getHostLabelListAPI
} from '@api'
import Editor from 'vue2-ace-bind'
import { cloneDeep } from 'lodash'

import ZadigBuild from '@/components/projects/build/zadigBuild.vue'

const validateServiceName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter a service name'))
  } else {
    if (!/^[a-z0-9-]+$/.test(value)) {
      callback(new Error('The name only supports lowercase letters and numbers，Special characters only support underscores'))
    } else {
      callback()
    }
  }
}
const pm_deploy_scripts = '#!/bin/bash\nset -e'
export default {
  props: {
    isEdit: Boolean,
    serviceName: String,
    changeUpdateEnvDisabled: Function
  },
  data () {
    this.deployVars = [
      {
        variable: '',
        desc: 'Variables in the build script are available，Other built-in available variables are as follows'
      },
      {
        variable: '$ENV_NAME',
        desc: 'Environment Name，Used to distinguish different environments，System built-in environment：dev，qa'
      },
      {
        variable: '$<AGENT_NAME>_PK',
        desc:
          'Pass SSH Agent The private key used by the remote login server id_rsa，In <AGENT_NAME> For SSH Agent Name，When using, you need to fill it out by yourself'
      },
      {
        variable: '$<AGENT_NAME>_USERNAME',
        desc: 'Pass SSH Agent Username for telnet to the server'
      },
      {
        variable: '$<AGENT_NAME>_IP',
        desc: 'SSH Agent Target Servers IP Address'
      },
      {
        variable: '$<AGENT_NAME>_PORT',
        desc: 'SSH Agent Target Server Port'
      },
      {
        variable: '$<ENV>_HOST_IPs',
        desc: 'Variable support to get all hosts associated with the specified environment IP'
      },
      {
        variable: '$ARTIFACT',
        desc: 'Deployed Deliverables，This variable is used to get the deliverable package'
      },
      {
        variable: '$<ENV>_HOST_NAMEs',
        desc: 'Get all hostnames associated with the specified environment'
      },
      {
        variable: '$<HOST_NAME>_PK',
        desc: 'Get Host Key'
      },
      {
        variable: '$<HOST_NAME>_USERNAME',
        desc: 'Get Host Username'
      },
      {
        variable: '$<HOST_NAME>_IP',
        desc: 'Get Host IP'
      },
      {
        variable: '$<HOST_NAME>_PORT',
        desc: 'Get Host Port'
      },
      {
        variable: '',
        desc:
          "When Deploying Remotely，Can be done by using the command `ssh -i $<AGENT_NAME>_PK $<AGENT_NAME>_USERNAME@$<AGENT_NAME>_IP 'Custom Script'` Do a deployment operation"
      }
    ]
    return {
      showBuildInEnvVar: false,
      loading: false,
      anchorTab: '',
      builds: [],
      useSshKey: false,
      isEmptyHost: false,
      host: {
        name: '',
        label: '',
        ip: '',
        user_name: '',
        private_key: ''
      },
      pmService: {
        service_name: '',
        health_checks: [
          {
            protocol: 'http',
            path: '',
            time_out: null,
            interval: null,
            healthy_threshold: null,
            unhealthy_threshold: null
          }
        ],
        env_configs: []
      },
      buildConfig: null,
      currentBuildConfig: {
        service_name: '',
        name: '',
        pm_deploy_scripts: pm_deploy_scripts,
        sshs: null
      },
      checkStatusEnabled: false,
      showCheckStatusAdvanced: {},
      allHost: [],
      allHostLabels: [],
      envNameList: [],
      validateServiceName,
      addHostRules: {
        name: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter A Hostname',
            trigger: 'change'
          }
        ],
        label: [
          {
            type: 'string',
            required: false,
            message: 'Please Enter Host Tag',
            trigger: 'change'
          }
        ],
        user_name: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter User Name'
          }
        ],
        ip: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter Host IP'
          }
        ],
        private_key: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter Private Key'
          }
        ]
      }
    }
  },
  methods: {
    jumpProject (projectName) {
      if (!this.isOnboarding) {
        this.$router.push(`/v1/projects/detail/${projectName}/services`)
        return
      }
      this.$confirm(
        'After confirming to jump out, do not enter again onboarding Process。',
        'Confirm Jump Out of Product Delivery Wizard？',
        {
          confirmButtonText: 'Sure',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(() => {
          this.saveOnboardingStatus(this.projectName, 0)
            .then(res => {
              this.$router.push(`/v1/projects/detail/${projectName}/services`)
            })
            .catch(() => {
              this.$message.info('Jump Failed')
            })
        })
        .catch(() => {
          this.$message.info('Cancel Jump')
        })
    },
    onScroll (e) {
      const scrollItems = document.querySelectorAll('.scroll')
      for (let i = scrollItems.length - 1; i >= 0; i--) {
        // Determine whether the scrolling distance of the scroll bar is greater than the scrollable distance of the current scroll item
        const judge =
          e.target.scrollTop >=
          scrollItems[i].offsetTop - scrollItems[0].offsetTop - 150
        if (judge) {
          this.anchorTab = i.toString()
          break
        }
      }
    },
    goToAnchor (id) {
      this.$nextTick(() => {
        document.querySelector(`#${id.label}`).scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      })
    },
    syncBuild (val) {
      if (val) {
        const findItem = this.builds.find(element => {
          return element.name === val
        })
        if (findItem) {
          this.syncBuildConfig(val, this.projectName)
        }
      }
    },
    syncBuildConfig (buildName, projectName) {
      getBuildConfigDetailAPI(buildName, projectName).then(res => {
        res.pre_build.installs.forEach(element => {
          element.id = element.name + element.version
        })
        let originServiceName = ''
        if (!this.isEdit) {
          originServiceName = this.currentBuildConfig.service_name
        } else if (this.isEdit) {
          originServiceName = this.pmService.service_name
        }
        this.buildConfig = res
        if (originServiceName) {
          this.$set(this.buildConfig, 'service_name', originServiceName)
        }
        if (!this.buildConfig.timeout) {
          this.$set(this.buildConfig, timeout, 0)
        }

        if (
          this.buildConfig.sshs &&
          (this.buildConfig.sshs.length !== 0 || this.buildConfig.sshs === [])
        ) {
          this.useSshKey = true
        } else {
          this.useSshKey = false
        }

        this.currentBuildConfig = {
          service_name: this.buildConfig.service_name,
          name: this.buildConfig.name,
          pm_deploy_scripts: this.buildConfig.pm_deploy_scripts,
          sshs: cloneDeep(this.buildConfig.sshs)
        }

        this.$refs.zadigFormRef.initData(this.buildConfig)
      })
    },
    initEnvConfig () {
      this.pmService.env_configs = [
        {
          env_name: 'dev',
          host_ids: []
        },
        {
          env_name: 'qa',
          host_ids: []
        }
      ]
    },
    changeAdvancedShow (index) {
      if (this.showCheckStatusAdvanced[index]) {
        this.$set(this.showCheckStatusAdvanced, index, false)
      } else {
        this.$set(this.showCheckStatusAdvanced, index, true)
      }
    },
    deleteCheck (index) {
      this.pmService.health_checks.splice(index, 1)
    },
    addCheck (index) {
      this.$refs.healthCheckRef.validate(valid => {
        if (valid) {
          this.pmService.health_checks.push({
            protocol: 'http',
            path: '',
            time_out: null,
            interval: null,
            healthy_threshold: null,
            unhealthy_threshold: null
          })
        } else {
          return false
        }
      })
    },
    validateHealthCheckTimeout (rule, value, callback) {
      const reg = /^[0-9]+.?[0-9]*/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('Time Should Be A Number'))
        } else {
          if (value >= 2 && value <= 60) {
            callback()
          } else {
            callback(new Error('Please enter the correct time range（2-60）'))
          }
        }
      } else {
        callback(new Error('Please enter the correct time range（2-60）'))
      }
    },
    validateHealthCheckThreshold (rule, value, callback) {
      const reg = /^[0-9]+.?[0-9]*/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('Threshold should be a number'))
        } else {
          if (value >= 2 && value <= 60) {
            callback()
          } else {
            callback(new Error('Please enter the correct threshold range（2-10）'))
          }
        }
      } else if (value === 0) {
        callback(new Error('Please enter the correct threshold range（2-10）'))
      } else {
        callback()
      }
    },
    validateHealthCheckInterval (rule, value, callback) {
      const reg = /^[0-9]+.?[0-9]*/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('Time Should Be A Number'))
        } else {
          if (value >= 2 && value <= 60) {
            callback()
          } else {
            callback(new Error('Please enter the correct time range'))
          }
        }
      } else if (value === 0) {
        callback(new Error('Please enter the correct time range'))
      } else {
        callback()
      }
    },
    validateHealthCheckPort (rule, value, callback) {
      const reg = /^[0-9]+.?[0-9]*/
      if (value) {
        if (!reg.test(value)) {
          callback(new Error('Port Should Be Numeric'))
        } else {
          if (value >= 1 && value <= 65535) {
            callback()
          } else {
            callback(new Error('Please enter the correct port range'))
          }
        }
      } else if (value === 0) {
        callback(new Error('Please enter the correct port range'))
      } else {
        callback()
      }
    },
    addEnvConfig (index) {
      this.$refs.envConfigRef.validate(valid => {
        if (valid) {
          this.pmService.env_configs.push({
            env_name: '',
            host_ids: []
          })
        } else {
          return false
        }
      })
    },
    addFirstEnvConfig () {
      this.pmService.env_configs.push({
        env_name: '',
        host_ids: []
      })
    },
    deleteEnvConfig (index) {
      this.pmService.env_configs.splice(index, 1)
    },
    checkEnvConfig (val) {
      if (val) {
        if (
          this.pmService.env_configs.length === 0 ||
          this.pmService.env_configs[0].host_ids.length === 0
        ) {
          this.$message({
            type: 'error',
            message: 'Please associate a host for the deployment environment first，Reconfigure The Probe'
          })
          this.checkStatusEnabled = false
        }
      }
    },
    async savePmService () {
      const refs = [this.$refs.zadigFormRef]
      if (!this.isEdit) {
        refs.push(this.$refs.envConfigRef)
      }
      if (this.checkStatusEnabled) {
        refs.push(this.$refs.healthCheckRef)
      }
      if (this.useSshKey) {
        refs.push(this.$refs.deployEnvRef)
      }
      const res = await Promise.all(refs.map(r => r.validate())).catch(err => {
        const errDiv = document.querySelector('.is-error')
        errDiv.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
        errDiv.querySelector('input').focus()
        console.log(err)
      })
      if (res) {
        let buildConfigPayload = await this.$refs.zadigFormRef.validate()
        let pmServicePayload = {}
        if (this.isEdit) {
          if (!this.checkStatusEnabled) {
            delete this.pmService.health_checks
          }
          if (!this.useSshKey) {
            this.currentBuildConfig.sshs = []
          }
          pmServicePayload = this.$utils.cloneObj(this.pmService)
          pmServicePayload.build_name = this.currentBuildConfig.name
          buildConfigPayload = {
            ...buildConfigPayload,
            ...this.currentBuildConfig
          }
        } else {
          buildConfigPayload = {
            ...buildConfigPayload,
            ...this.currentBuildConfig,
            targets: [
              {
                product_name: this.projectName,
                service_name: this.currentBuildConfig.service_name,
                service_module: this.currentBuildConfig.service_name
              }
            ]
          }

          pmServicePayload = {
            product_name: this.projectName,
            service_name: this.currentBuildConfig.service_name,
            visibility: 'private',
            type: 'pm',
            build_name: this.currentBuildConfig.name,
            health_checks: this.checkStatusEnabled
              ? this.pmService.health_checks
              : [],
            env_configs: this.pmService.env_configs
          }
        }
        this.handlePmService(buildConfigPayload, pmServicePayload)
      }
    },
    async handlePmService (buildConfigPayload, pmServicePayload) {
      buildConfigPayload.product_name = this.projectName
      const hostIds = this.allHost
        .map(item => {
          return item.options.map(option => option.id)
        })
        .flat()
      // Handling Host Labels
      pmServicePayload.env_configs.forEach(element => {
        element.labels = element.host_ids.filter(item => {
          return hostIds.indexOf(item) < 0
        })
        element.host_ids = element.host_ids.filter(item => {
          return hostIds.indexOf(item) >= 0
        })
      })
      const combinePayload = {
        pm_service_tmpl: pmServicePayload,
        build: buildConfigPayload
      }

      const buildName = this.currentBuildConfig.name
      const findItem = this.builds.find(element => {
        return element.name === buildName
      })
      if (!findItem) {
        delete combinePayload.build.id
      }

      ;(this.isEdit ? updatePmServiceAPI : createPmServiceAPI)(
        this.projectName,
        combinePayload
      ).then(
        () => {
          if (this.changeUpdateEnvDisabled) {
            this.changeUpdateEnvDisabled()
          }
          this.$router.push({
            query: { serviceName: this.currentBuildConfig.service_name }
          })
          this.$emit('listenCreateEvent', 'success')
          this.$message({
            type: 'success',
            message: this.isEdit ? 'Modify the host service successfully' : 'Create host service successfully'
          })
        },
        () => {
          this.$emit('listenCreateEvent', 'failed')
          return false
        }
      )
    },
    addNewService (obj) {
      this.currentBuildConfig = {
        service_name: obj.service_name,
        name: '',
        pm_deploy_scripts: pm_deploy_scripts,
        sshs: null
      }
      this.buildConfig = {
        name: obj.service_name + '-build'
      }
      this.pmService.health_checks = [
        {
          protocol: 'http',
          path: '',
          time_out: null,
          interval: null,
          healthy_threshold: null,
          unhealthy_threshold: null
        }
      ]
      this.checkStatusEnabled = false
      this.pmService.env_configs.forEach(item => {
        item.host_ids = []
      })
      this.$nextTick(() => {
        this.$refs.zadigFormRef.initData()
      })
    },
    loadPage () {
      const projectName = this.projectName
      getBuildConfigsAPI(projectName).then(res => {
        this.builds = res
      })
      if (!this.isEdit) {
        listProductAPI(projectName).then(res => {
          res.forEach(element => {
            if (element.projectName === this.projectName) {
              this.pmService.env_configs.push({
                env_name: element.name,
                host_ids: []
              })
            }
          })
        })
      }
      getHostLabelListAPI().then(res => {
        this.allHostLabels = res
      })
      const key = this.$utils.rsaEncrypt()
      Promise.all([
        getProjectHostListAPI(key, projectName),
        getHostListAPI(key)
      ]).then(res => {
        const projectOptions = res[0].map(item => {
          item.label = item.name
          item.value = item.id
          return item
        })
        const systemOptions = res[1].map(item => {
          item.label = item.name
          item.value = item.id
          return item
        })
        this.isEmptyHost = projectOptions.length + systemOptions.length === 0
        this.allHost = [
          {
            label: 'Project Resources',
            options: projectOptions
          },
          {
            label: 'System Resource',
            options: systemOptions
          }
        ]
      })
    }
  },
  watch: {
    'currentBuildConfig.service_name': {
      handler (val, old_val) {
        if (!this.isEdit && val) {
          this.currentBuildConfig.name = val + '-build'
        }
      }
    },
    async serviceName (value) {
      // edit
      if (value) {
        // TODO: the reason of page show error is uncertain
        // this.loading = true
        const pmServiceName = this.serviceName
        const projectName = this.projectName
        const env_configs = []
        let envNameList = []

        if (this.envNameList.length) {
          envNameList = this.envNameList
        } else {
          const resList = await listProductAPI(projectName).catch(error =>
            console.log(error)
          )
          if (resList) {
            resList.forEach(element => {
              envNameList.push(element.name)
            })
          }
          this.envNameList = envNameList
        }

        const res = await serviceTemplateAPI(
          pmServiceName,
          'pm',
          projectName
        ).catch(error => console.log(error))
        if (res) {
          this.pmService = res
          if (
            this.pmService.health_checks &&
            this.pmService.health_checks.length > 0
          ) {
            this.checkStatusEnabled = true
          } else if (!this.pmService.health_checks) {
            this.checkStatusEnabled = false
            this.$set(this.pmService, 'health_checks', [
              {
                protocol: 'http',
                path: '',
                time_out: null,
                interval: null,
                healthy_threshold: null,
                unhealthy_threshold: null
              }
            ])
          }
          if (res.env_configs && res.env_configs.length > 0) {
            this.pmService.env_configs.forEach(confItem => {
              confItem.host_ids = confItem.host_ids.concat(confItem.labels)
              if (envNameList.indexOf(confItem.env_name) === -1) {
                this.$set(confItem, 'showDelete', true)
              }
            })
            envNameList.forEach(envItem => {
              if (
                !(
                  this.pmService.env_configs.filter(e => e.env_name === envItem)
                    .length > 0
                )
              ) {
                env_configs.push({
                  env_name: envItem,
                  host_ids: []
                })
              }
            })
          } else {
            envNameList.forEach(envItem => {
              env_configs.push({
                env_name: envItem,
                host_ids: []
              })
            })
            this.$set(this.pmService, 'env_configs', env_configs)
          }
          if (this.pmService.build_name) {
            this.syncBuildConfig(this.pmService.build_name, projectName)
          } else {
            this.$set(
              this.currentBuildConfig,
              'service_name',
              this.pmService.service_name
            )
          }
          // this.loading = false
        }
      }
    }
  },

  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    isOnboarding () {
      return !!this.$route.path.includes(
        `/v1/projects/create/${this.projectName}/pm/config`
      )
    }
  },
  created () {
    this.loadPage()
  },
  components: {
    Editor,
    ZadigBuild
  }
}
</script>
<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

.pm-service-config-container {
  width: calc(~'100% - 250px');
  padding: 0 10px 30px 10px;
  overflow-x: hidden;
  overflow-y: auto;

  .anchor-container {
    position: absolute;
    right: 20px;
    margin-top: 50px;
  }

  .deploy-config {
    margin-top: 16px;

    .deploy-method {
      line-height: 28px;

      .radio-group {
        margin-left: 10px;

        .el-radio {
          color: #888;
          font-weight: 300;
          font-size: 14px;
          line-height: 28px;

          &.ssh-radio {
            /deep/.el-form-item {
              display: block;
              margin-bottom: 0;
              margin-left: 25px;
            }
          }

          .el-input {
            margin-left: 8px;
          }
        }
      }
    }

    .inner-variable {
      .item-title.inner-title {
        margin-top: 6px;
        color: @themeColor;
        cursor: pointer;
      }

      .inner-variable-content {
        margin-top: 8px;
        color: @primaryColor;
        font-weight: 300;
        font-size: 14px;
        line-height: 22px;

        .var-content {
          display: flex;

          .var-variable {
            flex: 0 0 200px;
          }
        }
      }
    }

    .deploy-script {
      // width: calc(~'100% - 120px');
      margin-top: 10px;
      margin-bottom: 10px;
      border: 1px solid @borderGray;

      .ace_editor.ace-xcode {
        &:hover {
          .scrollBar();
        }
      }
    }
  }

  .env-name {
    color: @secondaryColor;
  }

  .check-config {
    .primary-title {
      display: flex;
      align-items: center;
      margin-bottom: 0;

      .check-title {
        flex: 0 0 120px;
      }
    }

    .health-check-block {
      margin-bottom: 8px;
      padding: 0 0 10px 20px;
      border: 1px solid @borderGray;
      border-radius: 6px;

      &:first-child {
        margin-top: 14px;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .health-check-title {
        text-align: right;

        .delete-btn {
          margin: 10px;
        }
      }
    }

    .add-check {
      margin-top: 10px;
    }
  }

  .app-operation {
    .el-button + .el-button {
      margin-left: 0;
    }
  }

  .save-btn {
    position: absolute;
    bottom: 20px;
  }
}
</style>
