<template>
  <div class="build-env">
    <el-form :label-width="formLabelWidth" :model="form" ref="ruleForm">
      <el-form-item label="Surroundings" required>
        <el-form-item prop="env" v-if="!form.envType ||form.envType === 'runtime'" class="form-item">
          <el-select v-model="form.env" placeholder="Please Choose" size="small">
            <el-option v-for="item in envList" :key="item.id" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          prop="env"
          required
          v-if="form.envType === 'fixed'"
          class="form-item"
          :rules="{required: true, message: 'Please select an environment', trigger: ['blur', 'change']}"
        >
          <el-select v-model="form.env" placeholder="Please Choose" size="small">
            <el-option v-for="item in envList" :key="item.id" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          prop="env"
          required
          v-if="form.envType === 'other'"
          class="form-item"
          :rules="{required: true, message: 'Please select an environment', trigger: ['blur', 'change']}"
        >
          <el-select v-model="form.env" placeholder="Please Choose" filterable size="small">
            <el-option v-for="(item,index) in globalEnv" :key="index" :label="item" :value="item">{{item}}</el-option>
          </el-select>
        </el-form-item>
        <EnvTypeSelect v-model="form.envType" isFixed isRuntime isOther style="display: inline-block;" />
      </el-form-item>
      <el-form-item label="Serve" required>
        <el-form-item
          prop="service_and_images"
          v-if="!form.serviceType || form.serviceType === 'runtime'"
          class="form-item"
        >
          <el-select size="small" v-model="form.service_and_images" multiple filterable clearable value-key="value">
            <el-option
              v-for="(service,index) in originServiceAndBuilds"
              :key="index"
              :value="service"
              :label="`${service.service_name}/${service.service_module}`"
            >{{`${service.service_name}/${service.service_module}`}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          prop="job_name"
          v-if="form.serviceType === 'other'"
          required
          class="form-item"
          :rules="{required: true, message: 'Please Select A Service', trigger: ['blur', 'change']}"
        >
          <el-select v-model="form.job_name" placeholder="Please Choose" size="small">
            <el-option v-for="(item,index) in allJobList" :key="index" :label="item.name" :value="item.name">{{item.name}}</el-option>
          </el-select>
        </el-form-item>
        <EnvTypeSelect v-model="form.serviceType" isRuntime isOther isService style="display: inline-block;" />
      </el-form-item>
      <el-form-item label="Service Status Detection" class="status-check">
          <span slot="label" >
            Service Status Detection
          <el-tooltip effect="dark" content="After Opening，The deployment task polls the service running status，Waiting for the service to run normally，Task status is successful。" placement="top">
              <i class="el-icon-question" style="cursor: pointer;"></i>
          </el-tooltip>
        </span>
        <el-form-item
          prop="skip_check_run_status"
          class="form-item"
          :rules="{required: false}"
        >
        <el-switch v-model="form.skip_check_run_status"  :active-value="false" :inactive-value="true"  active-color="#0066ff"></el-switch>
        </el-form-item>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { listProductAPI } from '@/api'
import EnvTypeSelect from './envTypeSelect.vue'

export default {
  name: 'BuildEnv',
  props: {
    projectName: {
      type: String,
      default: ''
    },
    value: {
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
    },
    originServiceAndBuilds: {
      type: Array,
      default: () => []
    }
  },
  components: {
    EnvTypeSelect
  },
  data () {
    return {
      formLabelWidth: '90px',
      envList: []
    }
  },
  computed: {
    form: {
      get () {
        return this.value.spec
      },
      set (val) {
        this.$emit('input', val)
      }
    },
    allJobList () {
      const allJobList = this.workflowInfo.stages
        .map(stage => {
          return stage.jobs
        })
        .flat()
      return allJobList.filter(job => job.name !== this.value.name)
    }
  },
  created () {
    this.getEnvList()
  },
  methods: {
    getEnvList () {
      const projectName = this.projectName
      listProductAPI(projectName).then(res => {
        this.envList = res
      })
    },
    getData () {
      this.value.spec.service_and_images.forEach(item => {
        delete item.module_builds
      })
      return this.value
    },
    validate () {
      return this.$refs.ruleForm.validate()
    }
  }
}
</script>
<style lang="less" scoped>
.build-env {
  .form-item {
    display: inline-block;
    width: 220px;
  }

  .status-check {
    /deep/ .el-form-item__label {
      line-height: 20px;
    }
  }
}
</style>
