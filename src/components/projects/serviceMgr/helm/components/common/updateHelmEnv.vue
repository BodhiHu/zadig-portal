<template>
  <el-dialog :title="dialogTitle" :visible.sync="updateHelmEnvDialogVisible" width="60%">
    <div class="content">
      <el-checkbox-group v-model="checkedEnvList">
        <el-checkbox v-for="(env, index) in envList" :key="index" :label="env">{{env.name}}</el-checkbox>
      </el-checkbox-group>
      <ChartValues
        v-if="chartInfo.type !== 'delete' && chartInfo.chartNames.length"
        class="chart-value"
        ref="chartValuesRef"
        :envNames="checkedEnvList.map(env => env.name)"
        :chartNames="chartInfo.chartNames"
        showEnvTabs
        :showServicesTab="false"
        :envScene="`updateEnv`"
      ></ChartValues>
    </div>
    <div class="overwrite-warning" v-show="checkedEnvList.find(env => env.is_existed)">
      <p>Zadig Services defined in will override services of the same name in the selected namespace，Please proceed with caution！</p>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" :disabled="!checkedEnvList.length" type="primary" @click="autoUpgradeEnv">Sure</el-button>
      <el-button size="small" @click="skipUpdate">Jump Over</el-button>
    </span>
  </el-dialog>
</template>
<script>
import ChartValues from '@/components/projects/env/env_detail/common/updateHelmEnvChart.vue'
import { updateHelmEnvAPI, getServiceDeployableEnvsAPI } from '@api'

export default {
  name: 'updateHelmEnv',
  props: {
    value: Boolean,
    chartInfo: Object
  },
  data () {
    return {
      checkedEnvList: [],
      envList: []
    }
  },
  methods: {
    async autoUpgradeEnv () {
      const payload = {
        envNames: this.checkedEnvList.map(env => env.name),
        replacePolicy: 'notUseEnvImage',
        chartValues: [],
        deletedServices: []
      }
      if (this.chartInfo.type !== 'delete') {
        const res = await this.$refs.chartValuesRef.validate().catch(err => {
          console.log(err)
        })
        if (!res) {
          return
        }
        payload.chartValues = this.$refs.chartValuesRef.getAllChartNameInfo()
      } else {
        payload.deletedServices = [this.chartInfo.actionServiceName]
      }
      this.$store.commit('CHART_NAMES', [
        {
          serviceName: this.chartInfo.actionServiceName,
          type: 'clear'
        }
      ])
      const projectName = this.projectName

      updateHelmEnvAPI(projectName, payload).then(res => {
        this.updateHelmEnvDialogVisible = false
        this.$router.push(`/v1/projects/detail/${projectName}/envs`)
        this.$message({
          message: 'Environment updated successfully',
          type: 'success'
        })
      })
    },
    skipUpdate () {
      this.updateHelmEnvDialogVisible = false
    },
    async getEnvNameList () {
      const serviceName = this.chartInfo.actionServiceName
      const projectName = this.projectName
      const envNameList = await getServiceDeployableEnvsAPI(projectName, serviceName)
      if (envNameList.length) {
        this.envList = envNameList.map(env => {
          return {
            name: env,
            is_existed: false
          }
        })
      }
    }
  },
  computed: {
    updateHelmEnvDialogVisible: {
      get: function () {
        if (!this.value) {
          this.checkedEnvList = []
        }
        return this.value
      },
      set: function (val) {
        this.$emit('input', val)
      }
    },
    projectName () {
      return this.$route.params.project_name
    },
    dialogTitle () {
      if (this.chartInfo.type === 'delete') {
        return `Select To Be ${this.chartInfo.actionServiceName} Service deleted environment`
      } else {
        return `Select To Be ${this.chartInfo.actionServiceName} The environment in which the service joins`
      }
    }
  },
  watch: {
    updateHelmEnvDialogVisible: {
      handler: function (val) {
        if (val) {
          this.getEnvNameList()
        }
      },
      immediate: true
    }
  },
  components: {
    ChartValues
  }
}
</script>

<style lang="less" scoped>
/deep/.el-dialog {
  .el-dialog__body {
    padding-top: 10px;

    .title {
      margin-bottom: 20px;
    }

    .content {
      .chart-value {
        margin-top: 12px;
      }
    }
  }

  .overwrite-warning {
    color: #f56c6c;
    font-size: 13px;
  }
}
</style>
