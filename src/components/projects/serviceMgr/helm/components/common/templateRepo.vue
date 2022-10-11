<template>
  <div class="template-repo-container">
    <el-form ref="tempForm" :model="tempData" label-width="140px" :rules="rules">
      <h4 class="flex-center" style="padding-left: 40px;">
        <el-button type="text" @click="triggerSubstantial(substantial)" :disabled="isUpdate">{{substantial ? 'Turn Off Batch Creation' : 'Bulk Creation'}}</el-button>
      </h4>
      <el-form-item label="Service Name" prop="serviceName" v-if="!substantial">
        <el-input v-model="tempData.serviceName" placeholder="Please enter a service name" size="small" :disabled="isUpdate"></el-input>
      </el-form-item>
      <el-form-item v-else label="Service Name">
        <span style="line-height: 41px;">The name of the service created in batch is values File Name</span>
      </el-form-item>
      <el-form-item label="Choose A Template" prop="moduleName">
        <el-select v-model="tempData.moduleName" placeholder="Please Select A Template" size="small" :disabled="isUpdate" @change="getHelmTemplateVariable">
          <el-option disabled value="NEWMODULE">
            <router-link to="/v1/template/charts" class="module-link">
              <i class="el-icon-circle-plus-outline" style="margin-right: 3px;"></i>
              New Template
            </router-link>
          </el-option>
          <el-option :label="chart.name" :value="chart.name" v-for="chart in tempCharts" :key="chart.name"></el-option>
        </el-select>
      </el-form-item>
      <div v-if="!substantial" style="padding-left: 40px;">
        <div class="custom-variable" v-if="!substantial && variables.length">
          <h4 class="var-title">Variable</h4>
          <div class="variable-row" v-for="vars in variables" :key="vars.key">
            <div class="row-left">{{ vars.key }}</div>
            <div class="row-right">
              <el-input v-model="vars.value" :placeholder="vars.value" size="small"></el-input>
            </div>
          </div>
        </div>
        <el-button v-if="importRepoInfo.yamlSource === 'default'" type="text" @click="importRepoInfo.yamlSource = 'freeEdit'">Advanced Settings</el-button>
        <CommonImportValues v-else ref="importValues" :importRepoInfo.sync="importRepoInfo" showDelete></CommonImportValues>
      </div>
      <ImportValues v-else ref="importValues" :importRepoInfo.sync="importRepoInfo"></ImportValues>
      <el-form-item prop="auto_sync">
        <span slot="label">
          <span>Auto Sync</span>
           <el-tooltip effect="dark" content="After Opening，When applying a template library operation to a service，The service configuration will be automatically synchronized based on the template content。" placement="top">
              <i class="pointer el-icon-question"></i>
           </el-tooltip>
        </span>
        <el-switch v-model="tempData.auto_sync" />
      </el-form-item>
      <el-form-item style="text-align: right;">
        <el-button size="small" @click="commitDialogVisible(false)">Cancel</el-button>
        <el-button type="primary" size="small" @click="importTempRepo" :loading="importLoading">Import</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import CommonImportValues from '@/components/projects/common/importValues/index.vue'
import ImportValues from './templateRepo/importValues.vue'
import {
  createTemplateServiceAPI,
  updateTemplateServiceAPI,
  createTemplateMultiServiceAPI,
  getChartTemplatesAPI,
  getHelmTemplateVariableAPI
} from '@api'
import { mapState } from 'vuex'

const rules = {
  serviceName: [{ required: true, message: 'Please enter a service name', trigger: 'blur' }],
  moduleName: [{ required: true, message: 'Please Select A Template', trigger: ['blur', 'change'] }]
}

// const createTemplateForm = {
//   source: 'chartTemplate',
//   name: '',
//   createFrom: {
//     templateName: '',
//     valuesYAML: '',  // Backend Transport Field，Used Here Is overrideYaml
//     valuesPaths: [],
//     codehostID: null,
//     owner: '',
//     repo: '',
//     branch: ''
//   }
// }

export default {
  name: 'TemplateRepo',
  data () {
    this.rules = rules
    return {
      tempCharts: [],
      tempData: {
        serviceName: '',
        moduleName: '',
        auto_sync: false
      },
      importRepoInfo: {
        yamlSource: 'default',
        overrideYaml: '',
        gitRepoConfig: null
      },
      substantial: false,
      importLoading: false,
      isUpdate: false,
      variables: []
    }
  },
  props: {
    currentSelect: String
  },
  computed: {
    ...mapState({
      currentService: state => state.serviceManage.currentService
    }),
    projectName () {
      return this.$route.params.project_name
    }

  },
  watch: {
    currentService: {
      handler (val) {
        if (this.currentSelect === 'chartTemplate' && val) {
          const createFrom = val.create_from
          this.tempData = {
            serviceName: createFrom.service_name,
            moduleName: createFrom.template_name,
            auto_sync: val.auto_sync
          }
          if (createFrom.yaml_data) {
            this.importRepoInfo = {
              yamlSource: createFrom.yaml_data.yaml_content
                ? 'freeEdit'
                : 'default',
              overrideYaml: createFrom.yaml_data.yaml_content
            }
            if (createFrom.yaml_data.source_detail) {
              this.importRepoInfo.gitRepoConfig = {
                branch: createFrom.yaml_data.source_detail.git_repo_config.branch,
                codehostID: createFrom.yaml_data.source_detail.git_repo_config.codehost_id,
                owner: createFrom.yaml_data.source_detail.git_repo_config.owner,
                repo: createFrom.yaml_data.source_detail.git_repo_config.repo,
                valuesPaths: [createFrom.yaml_data.source_detail.load_path],
                namespace: createFrom.yaml_data.source_detail.git_repo_config.namespace
              }
            } else {
              this.importRepoInfo.gitRepoConfig = {
                branch: '',
                codehostID: null,
                owner: '',
                repo: '',
                autoSync: false,
                valuesPaths: []
              }
            }
          }
          this.variables = createFrom.variables || []
          this.isUpdate = true
        } else {
          this.isUpdate = false
        }
      },
      immediate: true
    }
  },
  methods: {
    getHelmTemplateVariable (value) {
      getHelmTemplateVariableAPI(value)
        .then(res => {
          this.variables = res
        })
        .catch(err => {
          console.log(err)
          this.variables = []
        })
    },
    commitDialogVisible (value) {
      this.$store.commit('SERVICE_DIALOG_VISIBLE', value)
    },
    triggerSubstantial (substantial) {
      this.closeSelectRepo()
      this.substantial = !substantial
    },
    closeSelectRepo () {
      this.tempData = {
        serviceName: '',
        moduleName: '',
        auto_sync: false
      }
      this.variables = []
      this.importRepoInfo = {
        yamlSource: 'default',
        overrideYaml: '',
        gitRepoConfig: null
      }
      this.substantial = false
      this.$refs.tempForm.clearValidate()
    },
    getTemplateCharts () {
      const projectName = this.projectName
      return getChartTemplatesAPI(projectName).then(res => {
        this.tempCharts = res.chartTemplates
      })
    },
    async createTemplateService () {
      const projectName = this.projectName
      const payload = {
        source: 'chartTemplate',
        name: this.tempData.serviceName,
        auto_sync: this.tempData.auto_sync,
        createFrom: {
          templateName: this.tempData.moduleName,
          valuesYAML:
            this.importRepoInfo.yamlSource === 'default'
              ? ''
              : this.importRepoInfo.overrideYaml,
          variables: this.variables
        },
        valuesData: {
          yamlSource: 'repo',
          gitRepoConfig: this.importRepoInfo.gitRepoConfig
        }
      }
      if (this.importRepoInfo.gitRepoConfig && this.importRepoInfo.gitRepoConfig.autoSync) {
        payload.valuesData.autoSync = this.importRepoInfo.gitRepoConfig.autoSync
      }
      const reqApi = this.isUpdate ? updateTemplateServiceAPI : createTemplateServiceAPI
      const res = await reqApi(projectName, payload).catch(
        err => {
          console.log(err)
        }
      )
      this.importLoading = false
      if (res) {
        if (res.successServices.length) {
          this.$message.success(
            `${this.isUpdate ? 'Renew' : 'New'}Serve ${payload.name} Success`
          )
        } else {
          this.$message.error(res.failedServices[0].error)
        }
        this.commitDialogVisible(false)
        this.$store.dispatch('queryService', {
          projectName: this.projectName,
          showServiceName: payload.name
        })

        this.$store.commit('CHART_NAMES', res.successServices.map(service => {
          return {
            serviceName: service,
            type: 'create'
          }
        }))
      }
    },
    async createTemplateMultiService () {
      const projectName = this.projectName
      const payload = {
        source: 'chartTemplate',
        auto_sync: this.tempData.auto_sync,
        createFrom: { templateName: this.tempData.moduleName },
        valuesData: {
          yamlSource: 'repo',
          gitRepoConfig: this.importRepoInfo.gitRepoConfig
        }
      }
      if (this.importRepoInfo.gitRepoConfig && this.importRepoInfo.gitRepoConfig.autoSync) {
        payload.valuesData.autoSync = this.importRepoInfo.gitRepoConfig.autoSync
      }
      const sId = setTimeout(() => {
        this.$message.info('Too Much Service，Please Wait Patiently！')
      }, 5000)
      const res = await createTemplateMultiServiceAPI(
        projectName,
        payload
      ).catch(err => {
        console.log(err)
      })
      clearTimeout(sId)
      this.importLoading = false
      if (res) {
        this.commitDialogVisible(false)
        this.$store.dispatch('queryService', {
          projectName: this.projectName,
          showServiceName: res.successServices[0]
        })

        this.$store.commit('CHART_NAMES', res.successServices.map(service => {
          return {
            serviceName: service,
            type: 'create'
          }
        }))

        if (res.failedServices.length) {
          this.$message.success(`Successfully created some services`)
          let message = ``
          res.failedServices.forEach(fail => {
            message += `<div style="margin-bottom: 10px;"><span style="color: #e6a23c;">${fail.path}</span>: ${fail.error}</div>`
          })
          this.$notify.error({
            dangerouslyUseHTMLString: true,
            message,
            duration: 0,
            title: 'Create a list of failed services in batches'
          })
        } else {
          this.$message.success(`Create service successfully`)
        }
      }
    },
    async importTempRepo () {
      let valid1 = true
      if (this.$refs.importValues) {
        valid1 = await this.$refs.importValues
          .validate()
          .catch(err => console.log(err))
      }
      const valid2 = await this.$refs.tempForm.validate().catch(err => {
        console.log(err)
      })
      if (!valid1 || !valid2) {
        return
      }
      this.importLoading = true
      if (this.substantial) {
        this.createTemplateMultiService()
      } else {
        this.createTemplateService()
      }
    }
  },
  components: {
    CommonImportValues,
    ImportValues
  },
  created () {
    this.getTemplateCharts()
  }
}
</script>

<style lang="less" scoped>
.template-repo-container {
  h4 {
    margin: 0;
  }

  .flex-center {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: -16px;
  }

  /deep/.el-form {
    .el-form-item {
      margin-bottom: 15px;

      .el-select {
        width: 100%;
      }
    }
  }

  .custom-variable {
    margin-bottom: 20px;

    .var-title {
      margin: 7px 0;
      color: #606266;
      font-size: 14px;
    }

    .variable-row {
      display: flex;
      align-items: center;
      padding: 5px 0;

      .row-left {
        width: 78px;
        padding-right: 12px;
        text-align: right;
      }

      .row-right {
        flex: 1;
      }
    }
  }
}

.module-link {
  display: inline-block;
  width: 100%;
  height: calc(~'100% - 1px');
  color: #606266;
  border-bottom: 1px solid #d2d7dc;
}
</style>
