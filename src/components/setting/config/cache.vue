<template>
  <div class="config-cache-container">

    <template>
      <el-alert type="info"
                :closable="false">
        <template>
          Support cleaning the image cache in the system，For details, please refer to
          <el-link style="font-size: 14px; vertical-align: baseline;"
                   type="primary"
                   :href="`https://docs.koderover.com/zadig/settings/system-settings/#Cache Cleaning`"
                   :underline="false"
                   target="_blank">Help Documentation</el-link>
        </template>
      </el-alert>
    </template>
    <div class="cache-container">
      <span class="item">Image Cache Cleaning</span>
      <el-button size="mini"
                 type="danger"
                 @click="cleanCache"
                 :disabled="cleanStatus && cleanStatus.status === 'cleaning'"
                 plain
                 round>One Click Cleanup</el-button>
      <div class="timing">
        <span>Regular Cleaning</span>
        <el-switch v-model="cleanStatus.cron_enabled"></el-switch>
        <span v-if="cleanStatus.cron_enabled">
          <el-input style="width: 200px;" size="small" v-model="cleanStatus.cron"  placeholder="Cron Expression"></el-input>
          <el-button size="mini" type="primary" @click="timingClean" plain round>Save</el-button>
        </span>
      </div>
      <template v-if="cleanStatus">
        <div class="desc">
          <span class="title">State：</span>
          <el-tag size="mini"
                  :type="tagTypeMap[cleanStatus.status]">{{statusMap[cleanStatus.status]}}
          </el-tag>
        </div>
        <div v-if="cleanStatus.status!=='failed'"
             class="desc">
          <span class="title">{{descMap[cleanStatus.status]}}</span>
          <span
                v-if="cleanStatus.status!=='unStart'">{{convertTimestamp(cleanStatus.update_time)}}</span>
        </div>
        <div v-if="cleanStatus.status==='failed'"
             class="desc">
          <el-row>
            <el-col :span="1"> <span class="title">Reason：</span></el-col>
            <el-col :span="23">
              <div v-for="(pod,index) in cleanStatus.dind_clean_infos"
                   :key="index">
                <span class="pod-name">{{pod.pod_name}}</span>
                <span class="error-msg">{{pod.error_message}}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-else-if="cleanStatus.status==='success' && cleanStatus.dind_clean_infos.length > 0"
             class="desc">
          <el-row>
            <el-col :span="1"> <span class="title">Information：</span></el-col>
            <el-col :span="23">
              <div v-for="(pod,index) in cleanStatus.dind_clean_infos"
                   :key="index">
                <span class="pod-name">{{pod.pod_name}}</span>
                <span class="info-msg">{{pod.clean_info}}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </template>
      <el-divider></el-divider>
    </div>
  </div>
</template>
<script>
import { cleanCacheAPI, getCleanCacheStatusAPI, timingCleanAPI } from '@api'
import moment from 'moment'
export default {
  data () {
    return {
      cleanStatus: {
        cron_enabled: false,
        cron: ''
      },
      timerId: null,
      finishedReq: false,
      statusMap: {
        cleaning: 'Cleaning Up',
        success: 'Clean Up',
        failed: 'Cleanup Failed',
        unStart: 'No Cleanup Performed'
      },
      tagTypeMap: {
        cleaning: '',
        success: 'success',
        failed: 'danger',
        unStart: 'info'
      },
      descMap: {
        cleaning: 'Starting Time：',
        success: 'Complete Time：'
      }
    }
  },
  methods: {
    async getCleanStatus () {
      this.cleanStatus = await getCleanCacheStatusAPI()
      if (this.cleanStatus.status !== 'cleaning') {
        return
      };
      if (!this.finishedReq) {
        this.timerId = setTimeout(this.getCleanStatus, 3000)
      }
    },
    cleanCache () {
      this.$confirm('Stopped Container、All networks not used by containers、Useless images and build cache images will be removed，Confirm Cleanup？', 'Hint', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        cleanCacheAPI().then(response => {
          this.getCleanStatus()
          this.$message({
            type: 'info',
            message: 'Cache cleaning in progress'
          })
        }).catch(() => {
          this.$message.error('Cache Cleaning Failed')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Cleanup Cancelled'
        })
      })
    },
    timingClean () {
      const { cron, cron_enabled } = this.cleanStatus
      const params = {
        cron, cron_enabled
      }
      if (cron_enabled && !cron) {
        this.$message({
          type: 'warning',
          message: 'Please Fill In Cron Expression'
        })
        return
      }
      timingCleanAPI(params).then(res => {
        this.$message({
          type: 'success',
          message: 'Set Successfully'
        })
      })
    },
    convertTimestamp (value) {
      return moment.unix(value).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  watch: {
    'cleanStatus.cron_enabled' (newVal, oldVal) {
      if (!newVal) {
        this.timingClean()
      }
    }
  },
  activated () {
    this.getCleanStatus()
  },
  beforeDestroy () {
    this.finishedReq = true
    clearTimeout(this.timerId)
  }
}
</script>

<style lang="less">
.config-cache-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .cache-container {
    padding-top: 15px;
    padding-bottom: 15px;

    .item {
      color: #303133;
      font-size: 16px;
    }

    .timing {
      height: 46px;
      margin: 16px 0;
      line-height: 46px;
    }

    .desc {
      margin-top: 10px;
    }

    span.title {
      color: #909399;
    }

    span.error-msg {
      color: #ff1949;
    }

    span.info-msg {
      color: #303133;
    }
  }
}
</style>
