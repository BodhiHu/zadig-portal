<template>
  <div class="version-push">
    <el-form ref="pushRef" :rules="rules" :model="releaseInfo" label-width="160px">
      <el-form-item label="Choose a mirror repository" prop="imageRegistryID">
        <el-select v-model="releaseInfo.imageRegistryID" placeholder="Choose a mirror repository" size="small">
          <el-option :label="image.namespace ? `${image.reg_addr}/${image.namespace}` : image.reg_addr" :value="image.id" v-for="image in imageRegistryList" :key="image.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Choose Chart Storehouse" prop="chartRepoName">
        <el-select v-model="releaseInfo.chartRepoName" placeholder="Please Choose Chart Storehouse" size="small" @change="updateSelectedChart">
          <el-option :label="repo.repo_name" :value="repo.repo_name" v-for="repo in helmRepoList" :key="repo.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Fill In Chart Version Number"></el-form-item>
      <div v-for="(chart, index) in releaseInfo.chartDatas" :key="chart.serviceName">
        <el-form-item
          :label="chart.serviceName"
          :prop="`chartDatas[${index}].version`"
          :rules="[{
          required: true, message: `Please Enter Chart ${chart.serviceName} Version Number`, trigger: ['change', 'blur']
        }]"
        >
          <el-input v-model="chart.version" placeholder="Please Enter Chart Version Number" size="small"></el-input>
          <span class="last-version">Last Version：{{chart.lastVersion || 'None'}}</span>
          <span class="config-btn" @click="showAdvancedConfig(chart.serviceName,index)">
            Configure Mirroring Tag
            <i v-if="advancedConfigVisible[chart.serviceName]" class="icon el-icon-arrow-up"></i>
            <i v-else-if="!advancedConfigVisible[chart.serviceName]" class="icon el-icon-arrow-down"></i>
          </span>
        </el-form-item>
        <div v-if="advancedConfigVisible[chart.serviceName]" class="advanced-config">
          <span class="title">Configure Mirroring Tag</span>
          <el-row v-for="(service,chartServiceImgIndex) in chart.imageData" :key="chartServiceImgIndex" class="img-row">
            <el-col :span="1">
              <el-tooltip effect="dark" content="After Selected，The corresponding mirror will be restarted tag And push it to the mirror repository" placement="top">
                <el-checkbox v-model="service.selected" style="line-height: 34px;"></el-checkbox>
              </el-tooltip>
            </el-col>
            <el-col :span="4">
              <span class="service-name">{{service.imageName}}</span>
            </el-col>
            <el-col :span="15">
              <el-input v-model="service.imageTag" placeholder="Please Enter Mirror Tag" size="small" clearable></el-input>
              <span v-if="chartServiceImgIndex === 0" @click="applyInputTagToAll(service.imageTag,chart.imageData)" class="config-btn">Apply All</span>
            </el-col>
          </el-row>
        </div>
      </div>

      <!-- <div>
        <el-button type="text" @click="showEnhanced = !showEnhanced">
          Advanced Features
          <i :class="{'el-icon-arrow-right': !showEnhanced, 'el-icon-arrow-down': showEnhanced}"></i>
        </el-button>
      </div>
      <div v-if="showEnhanced">
        <el-form-item label="Offline package distribution">
          <el-switch v-model="releaseInfo.options.enableOfflineDist"></el-switch>
          <span class="desc">Mirror the selected service and Chart Package and upload object storage</span>
        </el-form-item>
        <el-form-item label="Object Storage" prop="options.s3StorageID">
          <el-select v-model="releaseInfo.options.s3StorageID" placeholder="Please select Object Storage" size="small">
            <el-option :label="`${storage.bucket}(${storage.endpoint})`" :value="storage.id" v-for="storage in storageList" :key="storage.id"></el-option>
          </el-select>
        </el-form-item>
      </div>-->
    </el-form>
  </div>
</template>

<script>
import {
  getStorageListAPI,
  getHelmRepoAPI,
  getRegistryWhenBuildAPI,
  getChartLastVersionAPI,
  getChartServiceImgsAPI
} from '@api'
import { keyBy } from 'lodash'

export default {
  props: {
    releaseInfo: Object
  },
  data () {
    this.rules = {
      imageRegistryID: {
        required: true,
        message: 'Please select a mirror repository',
        trigger: ['change', 'blur']
      },
      chartRepoName: {
        required: true,
        message: 'Please Choose Chart Storehouse',
        trigger: ['change', 'blur']
      },
      'options.s3StorageID': {
        required: true,
        message: 'Please select Object Storage',
        trigger: ['change', 'blur']
      }
    }
    return {
      showEnhanced: false,
      helmRepoList: [],
      storageList: [],
      imageRegistryList: [],
      chartServiceImgs: {},
      advancedConfigVisible: {}
    }
  },
  methods: {
    validate () {
      return this.$refs.pushRef.validate()
    },
    getStorageList () {
      const key = this.$utils.rsaEncrypt()
      getStorageListAPI(key).then(res => {
        this.storageList = res
      })
    },
    getHelmRepo () {
      const key = this.$utils.rsaEncrypt()
      getHelmRepoAPI(key).then(res => {
        this.helmRepoList = res
      })
    },
    getRegistryList () {
      getRegistryWhenBuildAPI().then(res => {
        this.imageRegistryList = res
      })
    },
    updateSelectedChart () {
      const chartRepoName = this.releaseInfo.chartRepoName
      if (!chartRepoName) {
        return
      }
      const chartName = this.releaseInfo.chartDatas.map(chart => {
        chart.lastVersion = ''
        chart.version = ''
        return chart.serviceName
      })
      getChartLastVersionAPI(
        this.releaseInfo.productName,
        chartRepoName,
        chartName
      ).then(res => {
        const resObj = keyBy(res, 'chartName')
        this.releaseInfo.chartDatas.forEach(chart => {
          chart.lastVersion = resObj[chart.serviceName].chartVersion
          chart.version = resObj[chart.serviceName].nextChartVersion
        })
      })
    },
    getChartServiceImgs (chartName, chartIndex) {
      const projectName = this.releaseInfo.productName
      const envName = this.releaseInfo.envName
      getChartServiceImgsAPI(projectName, envName, chartName).then(res => {
        if (res.serviceImages && res.serviceImages.length > 0) {
          this.$set(
            this.releaseInfo.chartDatas[chartIndex],
            'imageData',
            res.serviceImages[0].imageData
          )
        } else {
          this.$set(this.releaseInfo.chartDatas[chartIndex], 'imageData', [])
        }
      })
    },
    showAdvancedConfig (chartName, chartIndex) {
      this.$set(
        this.advancedConfigVisible,
        chartName,
        !this.advancedConfigVisible[chartName]
      )
      if (this.advancedConfigVisible[chartName]) {
        this.getChartServiceImgs(chartName, chartIndex)
      }
    },
    applyInputTagToAll (input, imageData) {
      imageData.forEach(img => {
        img.imageTag = input
      })
    }
  },
  created () {
    this.getHelmRepo()
    this.getStorageList()
    this.getRegistryList()
  },
  activated () {
    this.updateSelectedChart()
  }
}
</script>

<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

.version-push {
  box-sizing: border-box;
  height: calc(~'100% - 200px');
  padding-bottom: 20px;
  overflow: auto;
  .blockScrollBar();

  .last-version {
    display: inline-block;
    color: #606266;
    font-size: 12px;
  }

  .config-btn {
    display: inline-block;
    margin-left: 10px;
    color: @themeColor;
    font-size: 12px;
    cursor: pointer;
  }

  .advanced-config {
    margin-bottom: 22px;
    margin-left: 160px;
    padding: 10px 20px;
    background: #fff;
    border-radius: 6px;

    .title {
      display: inline-block;
      margin-bottom: 5px;
      color: #303133;
      font-size: 14px;
    }

    .img-row {
      margin-bottom: 10px;

      .service-name {
        color: #606266;
        font-size: 13px;
        line-height: 30px;
      }
    }
  }

  /deep/.el-input,
  .el-textarea,
  .el-select {
    width: calc(~'100% - 200px');
  }

  /deep/.el-select > .el-input {
    width: 100%;
  }

  .desc {
    display: inline-block;
    margin-left: 10px;
    color: #606266;
    font-size: 12px;
  }
}
</style>
