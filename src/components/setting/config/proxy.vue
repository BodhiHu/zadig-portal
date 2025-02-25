<template>
  <div class="config-proxy-container">
    <!-- 这里是代理配置的内容-->
    <template>
      <el-alert type="info"
                :closable="false">
        <template>
         支持配置系统代理，配置后可以在「代码源集成」和「软件包管理」中选择使用代理，详情可参考
          <el-link style="font-size: 14px; vertical-align: baseline;"
                   type="primary"
                   :href="`https://docs.koderover.com/zadig/settings/system-settings/#代理配置`"
                   :underline="false"
                   target="_blank">帮助文档</el-link>
        </template>
      </el-alert>
    </template>
    <div class="sync-container form-container">
      <h1>代理配置</h1>
      <el-form :model="proxyInfo"
               label-position="left"
               label-width="80px"
               :rules="rules"
               ref="proxyForm"
               validateField="function(xx)">
        <el-form-item prop="type"
                      label="类型">
          <el-select v-model="proxyInfo.type"
                     size="small"
                     @change="changeProxy">
            <el-option label="不使用代理"
                       value="no"></el-option>
            <el-option label="HTTP 代理"
                       value="http"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="proxyInfo.type !== 'no'">
          <el-form-item label="服务器"
                        required
                        class="address-container">
            <el-form-item prop="address">
              <el-input v-model="proxyInfo.address"
                        size="small"
                        placeholder="IP 地址"></el-input>
            </el-form-item>
            <span>&nbsp;&nbsp;:&nbsp;&nbsp;</span>
            <el-form-item prop="port">
              <el-input size="small"
                        placeholder="端口"
                        v-model.number="proxyInfo.port"
                        class="second-input"></el-input>
            </el-form-item>
          </el-form-item>
          <el-form-item prop="need_password">
            <el-checkbox v-model="proxyInfo.need_password"
                         label="true"
                         size="small">代理服务器需要密码</el-checkbox>
          </el-form-item>
          <template v-if="proxyInfo.need_password">
            <el-form-item prop="username"
                          label="用户名"
                          required>
              <el-input v-model="proxyInfo.username"
                        size="small"></el-input>
            </el-form-item>
            <el-form-item prop="password"
                          label="密码"
                          required>
              <el-input v-model="proxyInfo.password"
                        size="small"
                        show-password></el-input>
            </el-form-item>
          </template>
          <el-form-item class="margin-top-higher">
            <el-button @click="validateServer"
                       size="mini"
                       :loading='testDisabled'>测试</el-button>
            <span v-if="testPass>0"
                  :style="{color:testPass===1?'green':'red'}">{{testPass===1?'测试通过':'测试失败'}}</span>
          </el-form-item>
        </template>
        <el-form-item class="margin-top-higher">
          <el-button @click="ifSetting('proxyForm')"
                     size="small"
                     type="primary"
                     :disabled="noPost">确定</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { checkProxyAPI, getProxyConfigAPI, createProxyConfigAPI, updateProxyConfigAPI } from '@api'
export default {
  data () {
    const checkPort = (rule, value, callback) => {
      if (value <= 0 || value >= 65535) {
        return callback(new Error('端口号应在 1 - 65535 之间'))
      } else {
        callback()
      }
    }
    return {
      proxyInfo: {
        id: '',
        type: 'no',
        address: '',
        port: undefined,
        need_password: false,
        username: '',
        password: '',
        enable_repo_proxy: false,
        enable_application_proxy: false,
        usage: ''
      },
      // 0:not show  1：success   2：failed
      testPass: 0,
      testDisabled: false,
      existedProxy: false,
      noPost: true,
      rules: {
        address: [{ required: true, message: '请输入代理地址', trigger: ['blur', 'change'] }],
        port: [{ required: true, message: '请输入端口号', trigger: 'blur' },
          { type: 'number', message: '端口号应为数字', trigger: 'blur' },
          { validator: checkPort, trigger: 'blur' }],
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    validateServer () {
      this.testPass = 0
      this.testDisabled = true
      checkProxyAPI(this.proxyInfo).then(res => {
        if (res.message === 'success') {
          this.testPass = 1
        } else {
          this.testPass = 2
        }
        this.testDisabled = false
      }).catch(() => {
        this.testPass = 2
        this.testDisabled = false
      })
    },
    ifSetting (proxyForm) {
      this.$refs[proxyForm].validate((valid) => {
        if (valid) {
          this.noPost = true
          if (this.proxyInfo.type === 'no') {
            this.proxyInfo.address = ''
            this.proxyInfo.port = undefined
            this.proxyInfo.need_password = false
            this.proxyInfo.enable_repo_proxy = false
            this.proxyInfo.enable_application_proxy = false
            this.proxyInfo.usage = ''
          }
          if (!this.proxyInfo.need_password) {
            this.proxyInfo.username = ''
            this.proxyInfo.password = ''
          }
          if (this.existedProxy) {
            updateProxyConfigAPI(this.proxyInfo.id, this.proxyInfo).then(response => {
              this.noPost = false
              if (response.message === 'success') {
                this.$message({
                  message: '配置修改成功！',
                  type: 'success'
                })
              } else {
                this.$message.error(response.message)
              }
            }).catch(err => {
              this.noPost = false
              this.proxyInfo.enable_repo_proxy = !value
              this.$message.error(`修改配置失败：${err}`)
            })
          } else {
            createProxyConfigAPI(this.proxyInfo).then(res => {
              if (res.message === 'success') {
                this.existedProxy = true
                this.$message({
                  message: '代理配置保存成功！',
                  type: 'success'
                })
                this.getProxyConfig()
              } else {
                this.$message.error(res.message)
              }
            }).catch(() => {
              this.$message.error('代理配置保存失败！')
              this.noPost = false
            })
          }
        }
      })
    },
    getProxyConfig () {
      getProxyConfigAPI().then(response => {
        this.noPost = false
        if (response.length > 0) {
          this.existedProxy = true
          this.proxyInfo = Object.assign({}, this.proxyInfo, response[0])
        }
      }).catch(error => {
        this.noPost = false
        this.$message.error(`获取代理配置失败：${error}`)
      })
    },
    // if proxy is unset, then turn off repo proxy
    // otherwise repo proxy is ALWAYS on
    changeProxy () {
      if (this.proxyInfo.type === 'no') {
        this.proxyInfo.enable_repo_proxy = false
      } else {
        this.proxyInfo.enable_repo_proxy = true
      }
    }
  },
  activated () {
    this.getProxyConfig()
  }
}
</script>

<style lang="less">
.config-proxy-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .sync-container {
    padding-top: 15px;
    padding-bottom: 15px;

    &.form-container {
      width: auto;
      margin-top: 15px;
      padding: 20px 20px 0;
      border: 1px solid #eee;
      border-radius: 5px;

      .margin-top-higher {
        margin-top: 15px;
      }

      .el-form-item {
        margin-bottom: 7px;

        .el-form-item__error {
          padding-top: 0;
        }
      }

      .address-container {
        .el-form-item {
          display: inline-block;
        }
      }

      & > h1 {
        font-size: 1rem;
        line-height: 1;
      }

      & > .el-form {
        padding: 20px;

        .el-input {
          width: auto;

          .el-input__inner {
            width: 160px;
          }

          &.second-input .el-input__inner {
            width: 80px;
          }
        }
      }
    }
  }
}
</style>
