<template>
  <div class="create-helm-version">
    <h4>Create Version</h4>

    <el-steps :active="activeStep" finish-status="success" align-center>
      <el-step title="Fill in the basic information"></el-step>
      <el-step title="Check Configuration"></el-step>
      <el-step title="Push Repository"></el-step>
    </el-steps>

    <keep-alive>
      <component ref="versionComp" class="step-content" :is="isComp" :releaseInfo="deliveryRelease"></component>
    </keep-alive>

    <footer class="footer">
      <el-button size="small" v-show="activeStep !== 0" @click="activeStep -= 1" :disabled="createLoading">Previous</el-button>
      <el-button size="small" type="primary" @click="nextStep" :loading="createLoading">{{activeStep - 2 ? 'Next Step' : 'Finish' }}</el-button>
      <el-button size="small" type="text" @click="cancel">Cancel</el-button>
    </footer>
  </div>
</template>

<script>
import bus from '@utils/eventBus'
import Info from './createVersion/info.vue'
import Config from './createVersion/config.vue'
import Push from './createVersion/push.vue'

import { createHelmVersionAPI } from '@api'

import { cloneDeep } from 'lodash'

export default {
  data () {
    return {
      activeStep: 0,
      deliveryRelease: {
        productName: '',
        version: '',
        retry: false, // true: use for retry
        labels: '', // []string api will convert to array
        desc: '',
        envName: '',
        chartDatas: [], // {serviceName, version, valuesYamlContent} and lastVersion but not post
        globalVariables: '',
        chartRepoName: '', // repo name
        imageRegistryID: '', // image registry ID
        options: {} // enableOfflineDist, s3StorageID
      },
      createLoading: false
    }
  },
  computed: {
    isComp () {
      let comp = null
      switch (this.activeStep) {
        case 0:
          comp = Info
          break
        case 1:
          comp = Config
          break
        case 2:
          comp = Push
          break
      }
      return comp
    }
  },
  methods: {
    async nextStep () {
      const res = await this.$refs.versionComp
        .validate()
        .catch(error => console.log(error))
      if (res) {
        if (this.activeStep === 2) {
          this.createHelmVersion()
        } else {
          this.activeStep += 1
        }
      }
    },
    async createHelmVersion () {
      const deliveryRelease = cloneDeep(this.deliveryRelease)
      deliveryRelease.chartDatas.forEach(chart => {
        delete chart.lastVersion
      })
      deliveryRelease.labels = deliveryRelease.labels
        ? deliveryRelease.labels.split(',').map(label => label.trim())
        : []
      this.createLoading = true
      const res = await createHelmVersionAPI(
        deliveryRelease.productName,
        deliveryRelease
      ).catch(err => console.log(err))
      this.createLoading = false
      if (res) {
        this.$message.success(
          `${this.deliveryRelease.productName} Create Version ${this.deliveryRelease.version} Success！`
        )
        this.activeStep = 0
        this.cancel()
      }
    },
    cancel () {
      this.$router.push({
        path: `/v1/projects/detail/${this.$route.params.project_name}/version`
      })
    }
  },
  created () {
    const projectName = this.$route.params.project_name
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: 'Project', url: `/v1/projects` },
        {
          title: projectName,
          url: `/v1/projects/detail/${projectName}/detail`
        },
        {
          title: 'Version Management',
          url: `/v1/projects/detail/${projectName}/version`
        },
        { title: 'Create Version', url: `` }
      ]
    })
  },
  mounted () {
    this.deliveryRelease.productName = this.$route.params.project_name
  }
}
</script>

<style lang="less" scoped>
.create-helm-version {
  min-width: 820px;
  height: calc(~'100% - 100px');
  padding: 20px 30px;

  h4 {
    margin-top: 5px;
  }

  /deep/.el-step__title {
    font-size: 15px;
    line-height: 32px;
  }

  /deep/.el-step__icon {
    width: 24px;
    height: 24px;
    font-size: 16px;
  }

  .el-button--text {
    color: #606266;
  }

  .step-content {
    min-height: calc(~'100% - 200px');
    padding: 30px 8% 20px;
  }

  .footer {
    margin: 40px 8% 0 0;
    text-align: right;
  }
}
</style>
