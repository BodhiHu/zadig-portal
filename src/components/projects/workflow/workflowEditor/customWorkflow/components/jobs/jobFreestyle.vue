<template>
  <section class="pipeline-build-container job-freestyle">
    <el-form ref="ruleForm" label-width="120px" :model="job" class="mg-t24 mg-b24" size="small" label-position="left">
      <el-form-item label="任务名称" prop="name" :rules="{required: true,validator:validateJobName, trigger: ['blur', 'change']}">
        <el-input v-model="job.name" size="small" style="width: 400px;"></el-input>
      </el-form-item>
      <section class="common-parcel-block">
        <div class="section">
          <BuildEnv ref="buildEnvRef" :opeConfig="job.spec.properties" :installApp="steps.tools" :isCreate="isCreate"></BuildEnv>
        </div>
        <div class="section">
          <RepoSelect ref="repoSelectRef" :config="steps.git" :validObj="validObj" class="build-secondary-form" :showFirstLine="isCreate"></RepoSelect>
        </div>
        <section>
          <div class="primary-title not-first-child">变量</div>
          <EnvVariable :preEnvs="job.spec.properties" :validObj="validObj" :fromWhere="fromWhere" :envs="globalEnv"></EnvVariable>
        </section>
      </section>
      <div>
        <section>
          <OtherSteps ref="otherStepsRef" :steps="job.spec.steps" :validObj="validObj"></OtherSteps>
        </section>
        <section>
          <div style="margin-bottom: 8px;">
            <el-button type="primary" size="small" plain @click="advanced_setting_modified = !advanced_setting_modified">
              高级配置
              <i :class="[advanced_setting_modified ? 'el-icon-arrow-up' : 'el-icon-arrow-down']" style="margin-left: 8px;"></i>
            </el-button>
          </div>
          <AdvancedConfig
            v-if="advanced_setting_modified"
            ref="advancedConfigRef"
            class="common-parcel-block"
            :isCreate="isCreate"
            :buildConfig="job.spec"
            :secondaryProp="`properties`"
            :validObj="validObj"
            @validateFailed="advanced_setting_modified = true"
            hiddenCache
          ></AdvancedConfig>
        </section>
      </div>
    </el-form>
  </section>
</template>

<script>
import ValidateSubmit from '@utils/validateAsync'
import Editor from 'vue2-ace-bind'
import Resize from '@/components/common/resize.vue'
import BuildEnv from '../buildEnv.vue'
import EnvVariable from '@/components/projects/build/envVariable.vue'
import AdvancedConfig from '@/components/projects/build/advancedConfig.vue'
import OtherSteps from '../otherSteps.vue'
import { buildEnvs, validateJobName } from '../../config.js'

import { getCodeSourceMaskedAPI } from '@api'

export default {
  name: 'JobFreestyle',
  data () {
    return {
      validateJobName,
      validObj: new ValidateSubmit(),
      advanced_setting_modified: false,
      fromWhere: {
        origin: 'commonBuild',
        title: '',
        vars: buildEnvs
      },
      allCodeHosts: []
    }
  },
  props: {
    job: {
      type: Object,
      default: () => ({})
    },
    workflowInfo: {
      type: Object,
      default: () => ({})
    },
    globalEnv: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    steps () {
      const steps = this.job.spec.steps
      return steps.reduce((obj, step) => {
        obj[step.name] = step.spec
        return obj
      }, {})
    },
    isCreate () {
      return this.job.isCreate
    }
  },
  methods: {
    initOpe () {
      this.$refs.otherStepsRef.initStepStatus(this.steps)
    },
    async validate () {
      const valid = []
      const res = await this.validObj.validateAll()
      if (!res[1]) {
        valid.push(Promise.reject())
      }
      return this.$refs.ruleForm.validate().then(val => {
        if (val) {
          return Promise.all(valid).then(() => {
            const payload = this.$utils.cloneObj(this.job)
            const git = this.job.spec.steps.find(step => step.name === 'git')
            if (git) {
              git.spec.repos.forEach(repo => {
                this.allCodeHosts.forEach(codehost => {
                  if (repo.codehost_id === codehost.id) {
                    repo.source = codehost.type
                  }
                })
              })
            }
            return payload
          })
        }
      })
    }
  },
  created () {
    const key = this.$utils.rsaEncrypt()
    getCodeSourceMaskedAPI(key).then(response => {
      this.allCodeHosts = response
    })
  },
  components: {
    Editor,
    Resize,
    BuildEnv,
    EnvVariable,
    AdvancedConfig,
    OtherSteps
  }
}
</script>

<style lang="less" scoped>
.job-freestyle {
  .common-parcel-block {
    padding: 0;
  }
}
</style>
