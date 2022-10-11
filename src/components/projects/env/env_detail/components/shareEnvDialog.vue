<template>
  <el-dialog :title="mode ==='enable'?'Enable Self Test Mode':'Turn Off Self Test Mode'" :visible.sync="shareEnvDialogVisible" width="750px" class="share-env-dialog">
    <div v-if="mode === 'enable' " class>
      <span class="title">The environment self-test mode can be turned on when the following two conditions are met</span>
      <ul class="requirements">
        <li>
          Service Used Tracing
          <span class="desc">Unable To Detect，Please Make Sure，Otherwise, the function will not be available after opening</span>
        </li>
        <li>
          The cluster where the environment is located has been installed Istio
          <span class="result">
            <i v-if="checkIstioResult === 'success'" class="success el-icon-circle-check"></i>
            <i v-if="checkIstioResult === 'failed'" class="failed el-icon-circle-close"></i>
            <i v-if="checkIstioLoading" class="el-icon-loading"></i>
          </span>
          <span class="recheck" @click="checkingClusterIstio">Test Again</span>
        </li>
        <li>
          Service call chain detection
          <span class="result">
            <i v-if="checkWorkloadsResult === 'success'" class="success el-icon-circle-check"></i>
            <el-tooltip v-if="checkWorkloadsResult === 'failed'" placement="top">
              <div slot="content">
                Serve {{ serviceWithoutWorkloads.join(',') }} No K8s Service，Please Refer To
                <a
                  href="https://docs.koderover.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >Documentation</a>
                ，Confirm whether the conditions for enabling self-test mode are met
              </div>
              <i class="warning el-icon-warning-outline"></i>
            </el-tooltip>
            <i v-if="checkWorkloadsLoading" class="el-icon-loading"></i>
          </span>
          <span class="recheck" @click="checkingWorkloads">Test Again</span>
        </li>
      </ul>
      <div v-if="checkIstioResult === 'failed'">
        <el-alert show-icon :closable="false" type="error">
          <span slot="title">
            Not detected in the environment Istio Components，Use The Following Method istioctl Quick installation of tools Istio，Istio For related knowledge, please refer to
            <a
              href="https://istio.io/latest/docs/setup/install/"
              target="_blank"
              rel="noopener noreferrer"
            >Istio Documentation</a>
          </span>
        </el-alert>
        <div class="command">
          istioctl install --set profile=demo -y
          <span
            v-clipboard:copy="`istioctl install --set profile=demo -y`"
            v-clipboard:success="copyCommandSuccess"
            v-clipboard:error="copyCommandError"
            class="el-icon-document-copy copy"
          ></span>
        </div>
      </div>
    </div>
    <div v-if="mode === 'disable'">
      <span class="desc">Closure {{envName}} Self-test mode for the environment，Subenvironments will all be deleted，Please Confirm</span>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="shareEnvDialogVisible = false">Cancel</el-button>
      <el-button
        v-if="mode === 'enable'"
        size="small"
        :disabled="checkIstioResult===''|| checkIstioResult==='failed'"
        @click="enableShareEnv"
        type="primary"
      >Confirm</el-button>
      <el-button v-else-if="mode === 'disable'" @click="disableShareEnv" size="small" type="primary">Confirm</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {
  checkingClusterIstioAPI,
  checkingK8sServiceWorkloadsAPI,
  enableShareEnvAPI,
  disableShareEnvAPI
} from '@/api'
export default {
  name: 'shareEnvDialog',
  props: {
    projectName: String,
    envName: String,
    clusterId: String,
    mode: {
      type: String,
      default: 'enable'
    }
  },
  data () {
    return {
      shareEnvDialogVisible: false,
      checkIstioLoading: false,
      checkWorkloadsLoading: false,
      checkIstioResult: '',
      checkWorkloadsResult: '',
      serviceWithoutWorkloads: []
    }
  },
  methods: {
    openDialog () {
      this.shareEnvDialogVisible = true
      this.checkingClusterIstio()
      this.checkingWorkloads()
    },
    closeDialog () {
      this.shareEnvDialogVisible = true
    },
    async checkingClusterIstio () {
      this.checkIstioLoading = true
      this.checkIstioResult = ''
      const clusterId = this.clusterId
      const result = await checkingClusterIstioAPI(clusterId).catch(err => {
        this.checkIstioLoading = false
        console.log(err)
      })
      this.checkIstioLoading = false
      if (result) {
        this.checkIstioResult = 'success'
      } else {
        this.checkIstioResult = 'failed'
      }
    },
    async checkingWorkloads () {
      this.checkWorkloadsLoading = true
      this.serviceWithoutWorkloads = []
      this.checkWorkloadsResult = ''
      const projectName = this.projectName
      const envName = this.envName
      const result = await checkingK8sServiceWorkloadsAPI(
        envName,
        projectName
      ).catch(err => {
        this.checkWorkloadsLoading = false
        this.serviceWithoutWorkloads = []
        console.log(err)
      })
      this.checkWorkloadsLoading = false
      if (result && result.length === 0) {
        this.checkWorkloadsResult = 'success'
      } else {
        this.checkWorkloadsResult = 'failed'
        this.serviceWithoutWorkloads = result.map(item => item.split('/')[0])
      }
    },
    async enableShareEnv () {
      const projectName = this.projectName
      const envName = this.envName
      const res = await enableShareEnvAPI(envName, projectName).catch(err => {
        console.log(err)
        this.shareEnvDialogVisible = false
      })
      if (res) {
        this.$message({
          type: 'success',
          message: 'Self-test mode turned on successfully'
        })
        this.$emit('statusChange', 'enable')
        this.shareEnvDialogVisible = false
      }
    },
    async disableShareEnv () {
      const projectName = this.projectName
      const envName = this.envName
      const res = await disableShareEnvAPI(envName, projectName).catch(err => {
        this.shareEnvDialogVisible = false
        console.log(err)
      })
      if (res) {
        this.$message({
          type: 'success',
          message: 'Self-test mode closed successfully'
        })
        this.$emit('statusChange', 'disable')
        this.shareEnvDialogVisible = false
      }
    },
    copyCommandSuccess (event) {
      this.$message({
        message: 'Command successfully copied to clipboard',
        type: 'success'
      })
    },
    copyCommandError (event) {
      this.$message({
        message: 'Command Copy Failed',
        type: 'error'
      })
    }
  }
}
</script>

<style lang="less" scoped>
.share-env-dialog {
  /deep/ .el-dialog__header {
    padding: 15px;
    text-align: center;
    border-bottom: 1px solid #e4e4e4;
  }

  /deep/.el-dialog__body {
    padding: 30px 40px;

    .el-alert {
      padding: 8px 8px;
    }

    .title {
      color: #000;
      font-weight: 400;
      font-size: 18px;
    }

    .requirements {
      margin-top: 20px;
      margin-bottom: 20px;

      li {
        margin-bottom: 10px;
        list-style: inside;

        .result {
          font-size: 18px;

          .success {
            color: #67c23a;
          }

          .failed {
            color: #f56c6c;
          }

          .warning {
            color: #e6a23c;
          }
        }

        .recheck {
          display: inline-block;
          margin-left: 12px;
          color: @themeColor;
          font-size: 13px;
          cursor: pointer;

          &:hover {
            color: #3385ff;
          }
        }

        .desc {
          color: #999;
          font-size: 12px;
        }
      }
    }

    .command {
      margin-top: 5px;
      padding: 5px 10px;
      font-size: 16px;
      background: #f5f7fa;
      border-radius: 3px;

      .copy {
        color: @themeColor;
        cursor: pointer;
      }
    }
  }
}
</style>
