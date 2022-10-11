<template>
  <div class="code-scanner-edit-container" v-loading="loading">
    <section class="common-parcel-block">
      <el-form
        ref="scannerFormRef"
        :model="scannerConfig"
        :rules="createRules"
        label-width="120px"
        class="primary-form"
        label-position="left"
        inline-message
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="scannerConfig.name" placeholder="Please enter code scan name" autofocus size="small" :disabled="isEdit" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="scannerConfig.description" placeholder="Please enter a description" autofocus size="small" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Scan Tool">
          <el-select v-model="scannerConfig.scanner_type" placeholder="Select Scanning Tool" size="small" @change="getImageList">
            <el-option label="SonarQube" value="sonarQube"></el-option>
            <el-option label="Other" value="other"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Scan The Environment" prop="image_id">
          <el-select v-model="scannerConfig.image_id" placeholder="Select Scanning Environment" size="small">
            <el-option v-for="(sys,index) in systems" :key="index" :label="sys.label" :value="sys.id">
              {{sys.label}}
            </el-option>
            <el-option disabled value="NEWCUSTOM" v-if="scannerConfig.scanner_type !== 'sonarQube'">
              <router-link to="/v1/system/imgs" class="env-link">
                <i class="el-icon-circle-plus-outline" style="margin-right: 3px;"></i>
                Create a new scan environment
              </router-link>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Sonar Address" v-if="scannerConfig.scanner_type === 'sonarQube'" prop="sonar_id">
          <el-select v-model="scannerConfig.sonar_id" placeholder="Choose Sonar Address" size="small">
            <el-option v-for="(item, index) in sonarList" :key="index" :label="item.server_address" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- Only supports one codebase -->
      <div class="section">
        <RepoSelect
          ref="repoSelectRef"
          :config="scannerConfig"
          :validObj="validObj"
          class="scanner-secondary-form"
          showFirstLine
          showJustOne
        />
      </div>

      <section v-if="scannerConfig.scanner_type === 'sonarQube'">
        <div class="primary-title not-first-child">
          <span>Parameter Configuration</span>
          <el-tooltip effect="dark" content="sonar Address And token Automatically inject at execution time" placement="right">
            <i class="el-icon-warning"></i>
          </el-tooltip>
        </div>
        <div class="deploy-script">
          <Resize :resize="'both'">
            <Editor v-model="scannerConfig.parameter"></Editor>
          </Resize>
        </div>
      </section>

      <section v-else-if="scannerConfig.scanner_type === 'other'">
        <div class="primary-title not-first-child">Scan Script</div>
        <div class="deploy-script">
          <Resize :resize="'both'">
            <Editor v-model="scannerConfig.script"></Editor>
          </Resize>
        </div>
      </section>
    </section>

    <section>
      <div style="margin-bottom: 8px;">
        <el-button
          type="primary"
          size="small"
          plain
          @click="scannerConfig.advanced_setting_modified = !scannerConfig.advanced_setting_modified"
        >
          Advanced Configuration
          <i :class="[scannerConfig.advanced_setting_modified ? 'el-icon-arrow-up' : 'el-icon-arrow-down']" style="margin-left: 8px;"></i>
        </el-button>
      </div>

      <AdvancedConfig
        v-show="scannerConfig.advanced_setting_modified"
        class="common-parcel-block test-advanced-config"
        ref="advancedConfigRef"
        :scannerConfig="scannerConfig"
        :allCodeHosts="allCodeHosts"
        :validObj="validObj"
        @validateFailed="scannerConfig.advanced_setting_modified = true"
      ></AdvancedConfig>
    </section>

    <footer class="create-footer">
      <router-link :to="`/v1/projects/detail/${projectName}/scanner`">
        <el-button style="margin-right: 15px;" type="primary" :disabled="saveLoading" plain>Cancel</el-button>
      </router-link>
      <el-button v-hasPermi="{projectName: projectName, action: isEdit?'edit_scan':'create_scan',isBtn:true}" @click="saveScanner" type="primary" :loading="saveLoading">{{ isEdit ? 'Confirm The Changes' : 'Create Now' }}</el-button>
    </footer>
  </div>
</template>

<script>
import Editor from 'vue2-ace-bind'
import Resize from '@/components/common/resize.vue'

import AdvancedConfig from './common/advancedConfig.vue'
import ValidateSubmit from '@utils/validateAsync'

import {
  getCodeSourceMaskedAPI,
  getImgListAPI,
  querySonarAPI,
  createCodeScannerAPI,
  updateCodeScannerAPI,
  getCodeScannerDetailAPI
} from '@api'

import bus from '@utils/eventBus'

import { cloneDeep } from 'lodash'

const validateName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter code scan name'))
  } else {
    if (!/^[a-z0-9-]+$/.test(value)) {
      callback(new Error('The name only supports lowercase letters and numbers，Special characters only support underscores'))
    } else {
      callback()
    }
  }
}

export default {
  data () {
    return {
      loading: false,
      createRules: {
        name: [
          {
            type: 'string',
            required: true,
            validator: validateName,
            trigger: ['blur', 'change']
          }
        ],
        image_id: {
          required: true,
          message: 'Scanning environment cannot be empty',
          trigger: ['blur', 'change']
        },
        sonar_id: {
          required: true,
          message: 'Sonar Address Cannot Be Empty',
          trigger: ['blur', 'change']
        }
      },
      scannerConfig: {
        name: '',
        project_name: '',
        description: '',
        scanner_type: 'sonarQube',
        image_id: '', // scanner environment
        sonar_id: '',
        repos: [],
        parameter: '# Sonar Parameter\n', // sonar parameters
        script: '#!/bin/bash\nset -e', // for other type
        advanced_settings: {
          timeout: 60,
          cluster_id: '',
          res_req: 'low',
          res_req_spec: {
            cpu_limit: 1000,
            memory_limit: 512
          },
          hook_ctl: {
            enabled: true,
            items: []
          }
          // schedules: { // for timing trigger
          //   enabled: false,
          //   items: []
          // },
          // notify_ctl: {  // for notify
          //   enabled: false,
          //   weChat_webHook: '',
          //   notify_type: []
          // }
        },
        advanced_setting_modified: false
      },
      validObj: new ValidateSubmit(),
      saveLoading: false,
      allCodeHosts: [],
      systems: [],
      sonarList: []
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    scannerId () {
      return this.$route.query.id
    },
    isEdit () {
      return !!this.scannerId
    }
  },
  methods: {
    saveScanner () {
      this.validate().then(async () => {
        const payload = cloneDeep(this.scannerConfig)
        delete payload.advanced_setting_modified
        payload.advanced_settings.hook_ctl.items = payload.advanced_settings.hook_ctl.items.map(
          item => item.main_repo
        )
        payload.repos = payload.repos.map(repo => {
          return {
            codehost_id: repo.codehost_id,
            repo_name: repo.repo_name,
            repo_owner: repo.repo_owner,
            branch: repo.branch,
            source: repo.source,
            remote_name: repo.remote_name,
            submodules: repo.submodules,
            checkout_path: repo.checkout_path,
            repo_namespace: repo.repo_namespace
          }
        })
        this.saveLoading = true
        const res = await (this.isEdit
          ? updateCodeScannerAPI(this.scannerId, payload)
          : createCodeScannerAPI(payload)
        ).catch(error => {
          console.log(error)
        })
        this.saveLoading = false
        if (res) {
          this.$message.success(
            `${this.isEdit ? 'Renew' : 'New'} ${payload.name} Success！`
          )
          this.$router.push(`/v1/projects/detail/${this.projectName}/scanner`)
        }
      })
    },
    async validate () {
      const valid = []
      const res = await this.validObj.validateAll()
      if (!res[1]) {
        valid.push(Promise.reject())
      }
      valid.push(this.$refs.scannerFormRef.validate())
      return Promise.all(valid)
    },
    changeImage (key, value) {
      const imageSys = this.systems.find(item => {
        return item[key] === value
      })
      if (imageSys) {
        this.currentEnv.image_id = imageSys.id
        this.currentEnv.image_from = imageSys.image_from
        this.currentEnv.build_os = imageSys.value
      }
    },
    getImageList (scannerType, initConfig = true) {
      const imageFrom = scannerType === 'sonarQube' ? 'sonar' : ''
      getImgListAPI('', imageFrom).then(res => {
        this.systems = res
        if (initConfig && res.length) {
          this.scannerConfig.image_id = res[0].id
        }
      })
    }
  },
  created () {
    this.loading = true
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: 'Project', url: `/v1/projects` },
        {
          title: this.projectName,
          isProjectName: true,
          url: `/v1/projects/detail/${this.projectName}`
        },
        {
          title: 'Code Scan',
          url: `/v1/projects/detail/${this.projectName}/scanner`
        },
        {
          title: this.isEdit ? this.$route.params.scanner_name : 'Add To',
          url: ''
        }
      ]
    })
    this.scannerConfig.project_name = this.projectName

    const key = this.$utils.rsaEncrypt()
    const projectName = this.projectName
    getCodeSourceMaskedAPI(key).then(response => {
      this.allCodeHosts = response
    })

    this.getImageList(this.scannerConfig.scanner_type, !this.isEdit)

    querySonarAPI(key, projectName).then(res => {
      this.sonarList = res
      if (!this.isEdit && res.length) {
        this.scannerConfig.sonar_id = res[0].id
      }
    })

    if (this.isEdit) {
      getCodeScannerDetailAPI(this.scannerId, this.projectName).then(res => {
        res.advanced_settings.hook_ctl.items = res.advanced_settings.hook_ctl.items.map(
          item => {
            return {
              main_repo: item
            }
          }
        )
        res.advanced_setting_modified = true
        this.scannerConfig = res
        this.getImageList(this.scannerConfig.scanner_type, !this.isEdit)
        this.loading = false
      })
    } else {
      this.loading = false
    }
  },
  components: {
    Editor,
    Resize,
    AdvancedConfig
  }
}
</script>

<style lang="less" scoped>
.code-scanner-edit-container {
  box-sizing: border-box;
  height: 100%;
  padding: 16px 40px 60px;
  overflow: auto;
  background: @globalBackgroundColor;

  /deep/.el-form.scanner-secondary-form {
    .el-form-item {
      margin-bottom: @ItemBottom;
    }

    .el-form-item__label {
      color: @secondaryColor;
      font-weight: @itemWeight;
    }
  }

  .create-footer {
    position: fixed;
    right: calc(~'50% - 200px');
    bottom: 0;
    z-index: 1;
    padding: 10px 10px 10px 10px;
  }
}
</style>
