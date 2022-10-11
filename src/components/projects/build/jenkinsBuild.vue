<template>
  <section class="jenkins-build-container" :class="{'small-padding': mini}">
    <el-form ref="jenkinsForm" :model="jenkinsBuild" label-position="left" class="primary-form" label-width="120px" inline-message>
      <slot name="origin"></slot>
      <el-form-item label="Jenkins Choose">
        <el-select v-model="jenkinsBuild.jenkins_build.jenkins_id" size="small" value-key="key" filterable>
          <el-option
            v-for="(item,index) in jenkinsList"
            :key="index"
            :label="item.url"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="Build Name"
        prop="name"
        :rules="[
              { required: true, message: 'Build name cannot be empty', trigger: ['blur', 'change'] },
              { validator: validName, trigger: ['blur', 'change'] }
            ]"
      >
        <el-input v-model="jenkinsBuild.name" placeholder="Build Name" autofocus size="small" :disabled="!isCreate" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item label="Service Selection">
        <el-select v-model="jenkinsBuild.targets" multiple size="small" value-key="key" filterable>
          <el-option
            v-for="(service,index) in serviceTargets"
            :key="index"
            :label="`${service.service_module}(${service.service_name})`"
            :value="service"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Jenkins Job" prop="jenkins_build.job_name" :rules="[{ required: true, trigger: 'change', message: 'jobsCan Not Be Empty' }]">
        <el-select v-model="jenkinsBuild.jenkins_build.job_name" size="small" value-key="key" @change="changeJobName" filterable>
          <el-option v-for="(item,index) in jenkinsJobList" :key="index" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Build Timeout">
        <el-input-number size="mini" :min="1" v-model="jenkinsBuild.timeout"></el-input-number>
        <span>Minute</span>
      </el-form-item>
      <span class="item-title">Build Parameters</span>
      <el-alert
        class="description"
        show-icon
        title="Jenkins Build Parameters Must Exist In“IMAGE”Variable，As the name of the build image，Jenkins After successfully building the image，The deployment phase will use this image to update the service"
        :closable="false"
        type="warning"
      ></el-alert>
      <div class="divider item"></div>
      <EnvVariable :preEnvs="jenkinsBuild.jenkins_build" :serviceName="jenkinsBuild.targets" isJenkins :mini="mini"></EnvVariable>
    </el-form>
  </section>
</template>

<script>
import { queryJenkinsJob, queryJenkinsParams } from '@api'
import EnvVariable from './envVariable.vue'

const validName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter a build name'))
  } else {
    if (!/^[a-z0-9-]+$/.test(value)) {
      callback(new Error('The name only supports lowercase letters and numbers，Special characters only support underscores'))
    } else {
      callback()
    }
  }
}
export default {
  props: {
    jenkinsBuildData: Object,
    isCreate: Boolean,
    serviceTargets: Array,
    mini: Boolean,
    jenkinsList: Array
  },
  components: { EnvVariable },
  data () {
    return {
      jenkinsJobList: [],
      validName,
      initJenkinsBuild: {
        name: '',
        desc: '',
        targets: [],
        timeout: 60,
        jenkins_build: {
          jenkins_id: '',
          job_name: '',
          jenkins_build_params: [],
          envs: []
        },
        pre_build: {
          res_req: 'low'
        }
      }
    }
  },
  computed: {
    jenkinsBuild () {
      return Object.assign(this.initJenkinsBuild, this.jenkinsBuildData)
    }
  },
  watch: {
    jenkinsBuild (newVal, oldVal) {
      if (!newVal.jenkins_build.envs) {
        this.transformParams(newVal.jenkins_build.jenkins_build_params)
      }
    },
    jenkinsList: {
      handler (val) {
        if (val.length > 0) {
          this.initJenkinsBuild.jenkins_build.jenkins_id = this.jenkinsList[0].id
          this.getJenkinsJob()
        }
      },
      immediate: true
    }
  },
  methods: {
    validate () {
      if (
        !this.jenkinsBuild.jenkins_build.jenkins_build_params.find(
          item => item.name === 'IMAGE'
        )
      ) {
        this.$message.error(
          'Jenkins Build Parameters Must Exist In“IMAGE”Variable，As the name of the build image，Jenkins After successfully building the image，The deployment phase will use this image to update the service'
        )
        return Promise.reject()
      }
      return this.$refs.jenkinsForm.validate().then(() => {
        return this.$utils.cloneObj(this.jenkinsBuild)
      })
    },
    async getJenkinsJob () {
      const res = await queryJenkinsJob(this.initJenkinsBuild.jenkins_build.jenkins_id).catch(error => console.log(error))
      if (res) {
        this.jenkinsJobList = res
      }
    },
    async changeJobName (value) {
      const res = await queryJenkinsParams(this.initJenkinsBuild.jenkins_build.jenkins_id, value).catch(error =>
        console.log(error)
      )
      if (res) {
        this.transformParams(res)
      }
    },
    // Variable component requiredenvsParameter ConversionenvsParameter
    transformParams (jenkins_build_params) {
      this.jenkinsBuild.jenkins_build.jenkins_build_params = jenkins_build_params.map(item => {
        item.key = item.name
        this.$set(item, 'auto_generate', item.auto_generate || false)
        return item
      })
      this.jenkinsBuild.jenkins_build.envs = this.jenkinsBuild.jenkins_build.jenkins_build_params
    }
  }
}
</script>

<style lang="less" scoped>
@secondaryColor: #888888;
@primaryColor: #000;

.jenkins-build-container {
  margin-bottom: 16px;
  padding: 0 40px 16px;
  background-color: #fff;
  border-end-start-radius: 6px;
  border-end-end-radius: 6px;

  &.small-padding {
    padding: 0 10px 16px;
  }

  .item-title {
    color: @primaryColor;
    font-weight: 300;
    font-size: 14px;
    line-height: 28px;
  }

  /deep/.el-form-item.form-item {
    .el-form-item__label {
      color: @secondaryColor;
    }
  }
}
</style>
