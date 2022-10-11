<template>
  <div>
    <el-form ref="buildEnvRef" :inline="true" :model="preEnvs" class="variable-form" label-position="top" label-width="80px">
      <span v-if="!isJenkins" class="item-title" :style="{'margin-bottom': fromWhere.origin === 'test' ? '12px' : '0px'}">Customize{{ fromWhere.title }}Variable</span>
      <el-button
        v-if="preEnvs.envs && preEnvs.envs.length===0 && !isJenkins"
        @click="addFirstBuildEnv()"
        type="primary"
        size="mini"
        plain
      >New</el-button>
      <el-row v-for="(app,build_env_index) in preEnvs.envs" :key="build_env_index" :gutter="2">
        <el-col :span="4">
          <el-form-item class="display-flex">
            <el-select
              v-model="preEnvs.envs[build_env_index].type"
              placeholder="Type"
              size="small"
              :class="{'partial-width': preEnvs.envs[build_env_index].type !== 'string'}"
              style="margin-right: 6px;"
              @change="changeEnvType(build_env_index)"
            >
              <el-option label="String" value="string"></el-option>
              <el-option label="Enumerate" value="choice"></el-option>
            </el-select>
            <i
              v-show="preEnvs.envs[build_env_index].type === 'choice'"
              class="el-icon-edit edit-icon"
              @click="updateParams(build_env_index)"
            ></i>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item :prop="'envs.' + build_env_index + '.key'" :rules="{required: true, message: 'Key Cannot Be Empty', trigger: 'blur'}">
            <el-input placeholder="Key" v-model="preEnvs.envs[build_env_index].key" size="small" :disabled="preEnvs.envs[build_env_index].disabledKey"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <el-select
              v-if="preEnvs.envs[build_env_index].command !== 'other'&&preEnvs.envs[build_env_index].type==='choice'"
              v-model="preEnvs.envs[build_env_index].value"
              placeholder="Defaults"
              size="small"
              style="max-width: 176px;"
            >
              <el-option v-for="option in preEnvs.envs[build_env_index].choice_option" :key="option" :label="option" :value="option"></el-option>
            </el-select>
            <el-input
              v-if="preEnvs.envs[build_env_index].type==='string' && preEnvs.envs[build_env_index].command !== 'other'"
              :disabled="isJenkins&&preEnvs.envs[build_env_index].auto_generate"
              placeholder="Value"
              v-model="preEnvs.envs[build_env_index].value"
              size="small"
            ></el-input>
            <el-select v-if="preEnvs.envs[build_env_index].command === 'other'" v-model="preEnvs.envs[build_env_index].value" filterable placeholder="Please Choose" size="small"  style="max-width: 176px;">
              <el-option v-for="(item,index) in envs" :key="index" :label="item" :value="item">{{item}}</el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="1" v-if="envs.length > 0" class="mg-t16">
          <EnvTypeSelect v-model="preEnvs.envs[build_env_index].command" isFixed isRuntime isOther/>
        </el-col>
        <el-col :span="12" v-if="isJenkins&&preEnvs.envs[build_env_index].name==='IMAGE'" class="tip">
          <el-checkbox v-model="preEnvs.envs[build_env_index].auto_generate"></el-checkbox>
          <span>Use system built-in variables $IMAGE，For Details See</span>
          <router-link
                       :to="`/v1/projects/detail/${$route.params.project_name}/services?service_name=${serviceName.length>0?serviceName[0].service_name : ''}&rightbar=policy`">
          Image Name Rules
          </router-link>
        </el-col>
        <el-col :span="mini ? 4 : 3" v-show="preEnvs.envs[build_env_index].type!=='choice'" v-if="!isJenkins">
          <el-form-item prop="is_credential">
            <el-checkbox v-model="preEnvs.envs[build_env_index].is_credential">
              Sensitive Information
              <el-tooltip effect="dark" content="After setting it as a sensitive information variable，The system will encrypt the variable，Decrypt When Used，Also not visible in the workflow run log" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </el-checkbox>
          </el-form-item>
        </el-col>
        <el-col :span="8" v-if="!isJenkins">
          <el-form-item style="margin-right: 0;">
            <div class="app-operation">
              <el-button v-if="preEnvs.envs.length >= 1" @click="deleteBuildEnv(build_env_index)" type="danger" size="small" plain>Delete</el-button>
              <el-button v-if="build_env_index===preEnvs.envs.length-1" @click="addBuildEnv()" type="primary" size="small" plain>New</el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-dialog :visible.sync="dialogVisible" title="Enumerate" width="600px" :close-on-click-modal="false" :show-close="false" append-to-body>
      <el-form ref="form" :model="currentVars" label-width="90px">
        <el-form-item label="Variable Name">
          <el-input v-model="currentVars.key" size="small"></el-input>
        </el-form-item>
        <el-form-item label="Optional Value">
          <el-input type="textarea" v-model="currentVars.choice_option" placeholder="English between optional values “,” Separated" size="small" rows="4"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" @click="saveVariable" size="small">Sure</el-button>
      </div>
    </el-dialog>
    <section class="inner-variable" v-if="!isJenkins">
      <div @click="showBuildInEnvVar = !showBuildInEnvVar" class="item-title inner-title">
        Built In{{ fromWhere.title }}Variable
        <i
          style="margin-left: 10px;"
          :class="[showBuildInEnvVar ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
        ></i>
      </div>
      <div v-show="showBuildInEnvVar" class="inner-variable-content">
        <div v-for="variable in fromWhere.vars" :key="variable.variable" class="var-content">
          <span class="var-variable" v-if="variable.variable">{{ variable.variable }}</span>
          <span class="var-desc">
            {{ variable.desc }}
            <el-button
              v-if="variable.link && fromServicePage"
              type="text"
              size="small"
              @click="variable.link.handler()"
            >{{ variable.link.label }}</el-button>
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import EnvTypeSelect from '../workflow/workflowEditor/customWorkflow/components/envTypeSelect.vue'

export default {
  components: { EnvTypeSelect },
  props: {
    preEnvs: Object,
    isTest: {
      type: Boolean,
      default: false
    },
    mini: {
      type: Boolean,
      default: false
    },
    validObj: {
      required: false,
      type: Object,
      default: null
    },
    fromServicePage: {
      type: Boolean,
      default: false
    },
    isJenkins: {
      type: Boolean,
      default: false
    },
    serviceName: {
      type: Array,
      default: () => [{ service_name: '' }]
    },
    fromWhere: {
      type: Object,
      default: () => {
        return {
          origin: 'build',
          title: 'Construct',
          vars: []
        }
      }
    },
    envs: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      dialogVisible: false,
      currentVars: {},
      showBuildInEnvVar: false,
      buildVars: [
        {
          variable: '$WORKSPACE',
          desc: 'Work List'
        },
        {
          variable: '$TASK_ID',
          desc: 'Workflow Tasks ID'
        },
        {
          variable: '$IMAGE',
          desc: 'Output Image Name',
          link: {
            label: 'Update image naming rules',
            handler: () => {
              this.$router.replace({
                query: Object.assign({}, this.$route.query, {
                  rightbar: 'policy'
                })
              })
            }
          }
        },
        {
          variable: '$PKG_FILE',
          desc: 'Built Tar Package Name',
          link: {
            label: 'Renew Tar Package naming convention',
            handler: () => {
              this.$router.replace({
                query: Object.assign({}, this.$route.query, {
                  rightbar: 'policy'
                })
              })
            }
          }
        },
        {
          variable: '$SERVICE',
          desc: 'Build Service Name'
        },
        {
          variable: '$SERVICE_MODULE',
          desc: 'Build service component name'
        },
        {
          variable: '$DIST_DIR',
          desc: 'Built Tar Destination directory of the package'
        },
        {
          variable: '$ENV_NAME',
          desc: 'Executed environment name'
        },
        {
          variable: '$BUILD_URL',
          desc: 'Build Task URL'
        },
        {
          variable: '$CI',
          desc: 'Value Is Equal To true，Indicates that the current environment is CI/CD Surroundings'
        },
        {
          variable: '$ZADIG',
          desc: 'Value Is Equal To true，Expressed In Zadig Execute the script on the system'
        },
        {
          // eslint-disable-next-line no-template-curly-in-string
          variable: '$REPONAME_<index>',
          desc: 'Specify <index> The Name Of The Codebase，In <index> The location of the code in the build configuration，The Initial Value Is 0'
        },
        {
          // eslint-disable-next-line no-template-curly-in-string
          variable: '$REPO_<index>',
          desc: 'Specify <index> The Name Of The Codebase（Can be used for code information related variable names，Underscore in repository name "-" Replace With Underscore"_"），In <index> The location of the code in the build configuration，The Initial Value Is 0'
        },
        {
          // eslint-disable-next-line no-template-curly-in-string
          variable: '$<REPO>_PR',
          // eslint-disable-next-line no-template-curly-in-string
          desc: 'Code Used When Building Pull Request Information，In <REPO> Is the specific code repository name，When using, you can fill in the warehouse name or combine $REPO_<index> Variable Usage，For Example By eval PR=\\${${REPO_0}_PR} Way to get the first codebase Pull Request Information'
        },
        {
          // eslint-disable-next-line no-template-curly-in-string
          variable: '$<REPO>_BRANCH',
          // eslint-disable-next-line no-template-curly-in-string
          desc: 'Code branch information used when building，In <REPO> Is the specific code repository name，When using, you can fill in the warehouse name or combine $REPO_index Variable Usage，For Example By eval BRANCH=\\${${REPO_0}_BRANCH} Way to get the branch information of the first code base'
        },
        {
          // eslint-disable-next-line no-template-curly-in-string
          variable: '$<REPO>_TAG',
          // eslint-disable-next-line no-template-curly-in-string
          desc: 'Build With Code Tag Information，In <REPO> Is the specific code repository name，When using, you can fill in the warehouse name or combine $REPO_index Variable Usage，For Example By eval TAG=\\${${REPO_0}_TAG} Way to get the branch information of the first code base'
        },
        {
          // eslint-disable-next-line no-template-curly-in-string
          variable: '$<REPO>_COMMIT_ID',
          // eslint-disable-next-line no-template-curly-in-string
          desc: 'Build With Code Commit Information，In <REPO> Is the specific code repository name，When using, you can fill in the warehouse name or combine $REPO_index]Variable Usage，For Example By eval COMMITID=\\${${REPO_0}_COMMIT_ID} Way to get the first codebase COMMIT Information'
        },
        {
          // eslint-disable-next-line no-template-curly-in-string
          variable: '',
          // eslint-disable-next-line no-template-curly-in-string
          desc: 'If other code sources are used，$<REPO>_PR And $<REPO>_COMMIT_ID Variable Not Supported'
        }
      ],
      testVars: [
        {
          variable: '$WORKSPACE',
          desc: 'Work List'
        },
        {
          variable: '$LINKED_ENV',
          desc: 'Namespace Under Test'
        },
        {
          variable: '$ENV_NAME',
          desc: 'Test Environment Name'
        },
        {
          variable: '$TEST_URL',
          desc: 'Test Task URL'
        },
        {
          variable: '$SERVICES',
          desc:
            'Service group updated by workflow task，Service Name Starts With “,” Separate，Shaped Like service1,service2,service3。Recommended Use array=(${SERVICES//,/ ' +
            '} Way Into An Array'
        },
        {
          variable: '$CI',
          desc: 'Value Is Equal To true，Indicates that the current environment is CI/CD Surroundings'
        },
        {
          variable: '$ZADIG',
          desc: 'Value Is Equal To true，Expressed In ZADIG Execute the script on the system'
        }
      ]
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    addFirstBuildEnv () {
      this.preEnvs.envs.push({
        key: '',
        value: '',
        type: 'string',
        is_credential: false
      })
    },
    validate () {
      return this.$refs.buildEnvRef.validate()
    },
    addBuildEnv () {
      this.validate().then(valid => {
        this.preEnvs.envs.push({
          key: '',
          value: '',
          type: 'string',
          is_credential: false
        })
      })
    },
    deleteBuildEnv (index) {
      this.preEnvs.envs.splice(index, 1)
    },
    changeEnvType (index) {
      const current = this.preEnvs.envs[index]
      current.value = ''
      if (current.type === 'string') {
        current.is_credential = true
      } else {
        current.is_credential = false
        this.updateParams(index)
      }
    },
    updateParams (index) {
      this.dialogVisible = true
      const current = this.preEnvs.envs[index]
      this.currentVars = cloneDeep({
        index,
        ...current,
        choice_option: current.choice_option
          ? current.choice_option.join(',')
          : ''
      })
    },
    saveVariable () {
      this.dialogVisible = false
      const index = this.currentVars.index
      const env = this.preEnvs.envs[index]
      const choice_option = this.currentVars.choice_option.split(',')
      env.choice_option = choice_option
      env.key = this.currentVars.key
      if (!choice_option.includes(env.value)) {
        env.value = ''
      }
    }
  },
  watch: {
    preEnvs: {
      handler (newValue, oldValue) {
        newValue.envs.forEach(e => {
          if (!e.type) {
            this.$set(e, 'type', 'string')
          }
        })
        this.$forceUpdate()
      },
      deep: true
    }
  },
  created () {
    this.validObj &&
      this.validObj.addValidate({
        name: 'envVariable',
        valid: this.validate
      })
    const origin = this.fromWhere.origin
    if (origin === 'build') {
      this.fromWhere.vars = this.buildVars
    } else if (origin === 'test') {
      this.fromWhere.vars = this.testVars
    }
  }
}
</script>

<style lang="less" scoped>
@secondaryColor: #888888;
@primaryColor: #000;

.item-title {
  display: inline-block;
  width: 117px;
  color: @secondaryColor;
  font-weight: 300;
  font-size: 14px;
  line-height: 28px;

  &.inner-title {
    margin-top: 6px;
    cursor: pointer;
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

.divider {
  width: 100%;
  height: 1px;
  margin: 5px 0 15px 0;
  background-color: #dfe0e6;

  &.item {
    width: 30%;
  }
}

.app-operation {
  .el-button + .el-button {
    margin-left: 2px;
  }
}

.display-flex {
  /deep/.el-form-item__content {
    display: flex;
    align-items: center;

    .el-select.partial-width {
      width: 80%;
    }
  }

  .edit-icon {
    color: @themeColor;
    cursor: pointer;
  }
}

.variable-form {
  /deep/.el-form-item {
    width: 100%;
    margin-bottom: 8px;
  }

  .tip {
    height: 42px;
    color: @secondaryColor;
    font-size: 14px;
    line-height: 42px;

    .link {
      margin-top: -3px;
    }
  }
}
</style>
