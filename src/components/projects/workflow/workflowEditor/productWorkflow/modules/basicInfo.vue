<template>
  <div class="product-basic-info">
    <el-card class="box-card">
      <div>
        <el-form :model="workflowInfo"
                 :rules="rules"
                 ref="workflowInfo"
                 label-position="top"
                 label-width="80px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item prop="name"
                            label="Workflow Name">
                <el-input v-model="workflowInfo.name"
                          :disabled="editMode"
                          style="width: 80%;"
                          placeholder="Please enter a workflow name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="product_tmpl_name"
                            label="Select Item">
                <el-select v-model="workflowInfo.product_tmpl_name"
                           style="width: 80%;"
                           @change="getEnvServices(workflowInfo.product_tmpl_name)"
                           placeholder="Please Select An Item"
                           :disabled="editMode || !!$route.query.projectName"
                           filterable>
                    <el-option v-for="pro in projects" :key="pro.value" :label="pro.label"
                               :value="pro.value">
                    </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="env_name">
                <template slot="label">
                  <span>Specify The Environment</span>
                  <el-tooltip effect="dark"
                              content="Supports workflows to be deployed to an environment by default"
                              placement="top">
                    <i class="pointer el-icon-question"></i>
                  </el-tooltip>
                </template>
                <el-select v-model="workflowInfo.env_name"
                           style="width: 80%;"
                           placeholder="Please select an environment"
                           clearable
                           filterable>
                    <el-option :label="env.name" v-for="(env,index) in filteredEnvs" :key="index"
                               :value="env.name">
                    </el-option>
                    <el-option v-if="filteredEnvs.length===0"
                               label=""
                               value="">
                      <router-link style="color: #909399;"
                                   :to="`/v1/projects/detail/${workflowInfo.product_tmpl_name}/envs/create`">
                        {{`(Environment does not exist，Click to create an environment)`}}
                      </router-link>
                    </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="Describe">
            <el-input type="input"
                      style="width: 100%;"
                      v-model="workflowInfo.description"></el-input>
          </el-form-item>
        </el-form>
        <div class="policy-title">Run Strategy</div>
        <el-form :model="workflowInfo"
                 :rules="rules"
                 ref="workflowInfoPolicy"
                 label-position="left"
                 label-width="120px">
          <el-form-item prop="is_parallel" class="label-icon">
            <template slot="label">
              <span>Run Concurrently </span>
              <el-tooltip effect="dark"
                          content="When updating multiple different services at the same time，The resulting multiple tasks will be executed concurrently，To improve workflow efficiency"
                          placement="top">
                <i class="pointer el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-switch v-model="workflowInfo.is_parallel"></el-switch>
          </el-form-item>
          <el-form-item prop="reset_image" class="label-icon" v-if="!isExternal">
            <template slot="label">
              <span>Mirror Version Rollback </span>
              <el-tooltip effect="dark"
                          content="When the task running status and test results meet the fallback policy settings，The mirror version will automatically roll back to the previous version"
                          placement="top">
                <i class="pointer el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-switch v-model="workflowInfo.reset_image" @change="workflowInfo.reset_image_policy = ''"></el-switch>
          </el-form-item>
          <el-form-item prop="reset_image_policy" label="Set Fallback Policy" v-if="workflowInfo.reset_image">
            <el-radio-group v-model="workflowInfo.reset_image_policy">
              <el-radio v-for="policy in resetPolicy" :key="policy.label" :label="policy.label">{{ policy.text }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script type="text/javascript">
import bus from '@utils/eventBus'
import { templatesAPI, listProductAPI } from '@api'

export default {
  data () {
    return {
      resetPolicy: [{
        label: 'taskCompleted',
        text: 'Task Execution Completed'
      }, {
        label: 'deployFailed',
        text: 'Deployment Result Failed'
      }, {
        label: 'testFailed',
        text: 'Test Result Failed'
      }],
      projects: [],
      projectList: [],
      filteredEnvs: [],
      rules: {
        name: [
          {
            type: 'string',
            required: true,
            validator: this.validatePipelineName,
            trigger: 'blur'
          }
        ],
        product_tmpl_name: [
          {
            type: 'string',
            required: true,
            message: 'Please Select An Item',
            trigger: 'blur'
          }
        ],
        reset_image_policy: {
          type: 'string',
          required: true,
          message: 'Please select a fallback strategy',
          trigger: 'blur'
        }
      }
    }
  },
  computed: {
    projectName () {
      return this.$route.query.projectName
    },
    isExternal () {
      const project = this.$store.getters.projectList.find(project => {
        return project.name === this.projectName
      })
      return project ? project.deployType === 'external' : false
    }
  },
  created () {
    if (this.$store.getters.projectList.length === 0) {
      this.$store.dispatch('getProjectList')
    }
  },
  methods: {
    validatePipelineName (rule, value, callback) {
      const result = this.$utils.validatePipelineName([], value)
      if (result === true) {
        callback()
      } else {
        callback(new Error(result))
      }
    },
    getEnvServices (projectName) {
      listProductAPI(projectName).then(res => {
        this.filteredEnvs = res
      })
    }
  },
  props: {
    workflowInfo: {
      required: true,
      type: Object
    },
    editMode: {
      required: true,
      type: Boolean
    }
  },
  watch: {
    workflowInfo: {
      immediate: true,
      handler: function () {
        if (this.$route.query.projectName) {
          this.workflowInfo.product_tmpl_name = this.$route.query.projectName
        }

        if (!this.$route.query.projectName && !this.editMode) {
          templatesAPI().then(res => {
            this.projects = res
          })
        }
        const projectName = this.workflowInfo.product_tmpl_name
        bus.$on('check-tab:basicInfo', () => {
          Promise.all([this.$refs.workflowInfo.validate(), this.$refs.workflowInfoPolicy.validate()]).then(valid => {
            bus.$emit('receive-tab-check:basicInfo', valid)
          })
        })
        if (projectName) {
          this.getEnvServices(projectName)
        }
      }
    }
  },
  beforeDestroy () {
    bus.$off('check-tab:basicInfo')
  }
}
</script>

<style lang="less">
.product-basic-info {
  .pointer {
    cursor: pointer;
  }

  .box-card {
    .el-card__header {
      text-align: center;
    }

    .el-form {
      .el-form-item {
        margin-bottom: 5px;
      }

      .pipe-schedule-container {
        .el-form-item__content {
          margin-left: 0 !important;
        }
      }
    }

    .policy-title {
      margin: 30px 0 10px;
      font-weight: 500;
      font-size: 16px;
    }

    .divider {
      width: 100%;
      height: 1px;
      margin: 13px 0;
      background-color: #dfe0e6;
    }
  }
}
</style>
