<template>
    <div v-loading="loading"
         element-loading-text="Loading..."
         element-loading-spinner="iconfont iconfont-loading iconyingyongshezhi"
         class="setting-app-container">
      <!--apps-create-dialog-->
      <el-dialog title='New'
                 width="55%"
                 :close-on-click-modal="false"
                 custom-class="create-app-dialog"
                 :visible.sync="dialogAppCreateFormVisible">
        <el-form ref="createApp"
                 :rules="rules"
                 :model="createApp"
                 label-position="left"
                 label-width="100px">
          <el-form-item label="Name"
                        prop="name">
            <el-input size="small"
                      v-model="createApp.name"></el-input>
          </el-form-item>
          <el-form-item label="Version"
                        prop="version">
            <el-input size="small"
                      placeholder="E G 1.0.0"
                      v-model="createApp.version"></el-input>
          </el-form-item>
          <el-form-item label="Bin Path"
                        prop="bin_path">
            <el-input size="small"
                      placeholder="$HOME/install_pkg/bin"
                      v-model="createApp.bin_path"></el-input>
          </el-form-item>
          <el-form-item class="label-icon">
            <template #label>
              <span>Enable</span>
              <el-tooltip content="Controls whether to show in the package list，In Use Is Not Affected"
                          placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-checkbox v-model="createApp.enabled">Enable The Package</el-checkbox>
          </el-form-item>
          <el-form-item prop="download_path" class="label-icon">
            <template #label>
              <span>Installation package address</span>
              <el-tooltip content="The system automatically downloads the installation package from the configuration address and caches it，The installation package is available through ${FILEPATH} Variable Acquisition"
                          placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-input size="small"
                      placeholder="http://domain/install_pkg.tar.gz"
                      v-model="createApp.download_path"></el-input>
          </el-form-item>
          <el-form-item label="Install Script"
                        prop="scripts">
            <Editor v-model="createApp.scripts"
                    lang="sh"
                    theme="monokai"
                    :options="option"
                    width="100%"
                    height="220"></Editor>
          </el-form-item>
        </el-form>
        <div slot="footer"
             class="dialog-footer">
          <el-button size="small"
                     @click="dialogAppCreateFormVisible = false">Cancel</el-button>
          <el-button :plain="true"
                     type="success"
                     size="small"
                     @click="appOperation('add')">Save</el-button>
        </div>
      </el-dialog>
      <!--apps-create-dialog-->

      <!--apps-edit-dialog-->
      <el-dialog title='Modify The Package'
                 width="55%"
                 custom-class="create-app-dialog"
                 :close-on-click-modal="false"
                 :visible.sync="dialogAppEditFormVisible">
        <el-form ref="updateApp"
                 :rules="rules"
                 :model="swapApp"
                 label-position="left"
                 label-width="100px">
          <el-form-item v-if="(typeof swapApp.bin_path)!=='undefined'"
                        label="Bin Path"
                        prop="bin_path">
            <el-input size="small"
                      v-model="swapApp.bin_path"></el-input>
          </el-form-item>
          <el-form-item v-if="(typeof swapApp.enabled)!=='undefined'" class="label-icon">
            <template #label>
              <span>Enable</span>
              <el-tooltip content="Controls whether to show in the package list，In Use Is Not Affected"
                          placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-checkbox v-model="swapApp.enabled">Enable The Package</el-checkbox>
          </el-form-item>
          <el-form-item v-if="(typeof swapApp.download_path)!=='undefined'"
                        prop="download_path"
                        class="label-icon">
            <template #label>
              <span>Installation package address</span>
              <el-tooltip content="The system automatically downloads the installation package from the configuration address and caches it，The installation package is available through ${FILEPATH} Variable Acquisition"
                          placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-input size="small"
                      v-model="swapApp.download_path"></el-input>
          </el-form-item>
          <el-form-item label="Install Script"
                        prop="scripts">
            <Editor v-model="swapApp.scripts"
                    lang="sh"
                    theme="monokai"
                    width="100%"
                    height="220"></Editor>
          </el-form-item>
        </el-form>
        <div slot="footer"
             class="dialog-footer">
          <el-button size="small"
                     @click="dialogAppEditFormVisible = false">Cancel</el-button>
          <el-button size="small"
                     :plain="true"
                     type="success"
                     @click="appOperation('update')">Save</el-button>
        </div>
      </el-dialog>
      <!--apps-edit-dialog-->
      <div class="section">
        <el-alert type="info"
                  :closable="false">
          <template>
            When running build and test steps，Install the necessary software packages according to the actual business，For details, please refer to
            <el-link style="font-size: 14px; vertical-align: baseline;"
                     type="primary"
                     :href="`https://docs.koderover.com/zadig/settings/app/`"
                     :underline="false"
                     target="_blank">Help Documentation</el-link>
          </template>
        </el-alert>
        <div class="sync-container">
          <el-button :plain="true"
                     @click="dialogAppCreateFormVisible=true"
                     size="small"
                     type="success">New</el-button>
          <span class="switch-span"
                :style="{color: proxyInfo.enable_application_proxy?'#0066ff':'#303133'}">Enable Proxy</span>
          <el-switch size="small"
                     :value="proxyInfo.enable_application_proxy"
                     @change="changeProxy"></el-switch>
        </div>
        <div class="app-list">
          <template>
            <el-table :data="availableApps"
                      style="width: 100%;">
              <el-table-column label="Name">
                <template slot-scope="scope">
                  <span>{{scope.row.name}}</span>
                </template>
              </el-table-column>
              <el-table-column label="Version">
                <template slot-scope="scope">
                  <el-select v-model="defaultVersion[scope.row.name]"
                             size="small"
                             placeholder="Please Choose">
                    <el-option v-for="item in appBucket[scope.row.name]"
                               :key="item.version"
                               :label="item.version"
                               :value="item.version">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="Update Time">
                <template slot-scope="scope">
                  <i class="el-icon-time"></i>
                  <span style="margin-left: 10px;">{{
                  $utils.convertTimestamp(selectedApp(scope.row.name,defaultVersion[scope.row.name],"update_time"))
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Updater">
                <template slot-scope="scope">
                  <span style="margin-left: 10px;">{{
                  selectedApp(scope.row.name,defaultVersion[scope.row.name],"update_by") }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Operate">
                <template slot-scope="scope">
                  <el-button @click="appOperation('edit',selectedApp(scope.row.name,defaultVersion[scope.row.name]))"
                             type="primary"
                             size="mini" plain>Edit</el-button>
                  <el-popover v-model="showPopper[scope.row.name]"
                              trigger="click"
                              placement="top"
                              width="260"
                              style="display: inline-block;">
                    <p>Package removal may affect workflows in use，OK To Remove The Package {{scope.row.name}} Of
                      {{defaultVersion[scope.row.name]}} Version？</p>
                    <div style=" margin: 0; text-align: right;">
                      <el-button size="mini"
                                 @click="showPopper[scope.row.name]=false"
                                 type="text">Cancel</el-button>
                      <el-button type="primary"
                                 @click="appOperation('delete',selectedApp(scope.row.name,defaultVersion[scope.row.name]))"
                                 size="mini">Sure</el-button>
                    </div>
                    <div slot="reference">
                      <el-button size="mini"
                                 @click="showDeleteModal(scope.row.name)"
                                 type="danger" plain>Delete</el-button>
                    </div>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </div>
      </div>

    </div>
</template>

<script>

import Editor from 'vue2-ace-bind'
import { getAllAppsAPI, createAppAPI, updateAppAPI, deleteAppAPI, getProxyConfigAPI, updateProxyConfigAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      proxyInfo: {
        id: '',
        type: '',
        address: '',
        port: undefined,
        username: '',
        password: '',
        enable_repo_proxy: false,
        enable_application_proxy: false
      },
      createApp: {
        scripts: '# tar -C $HOME -xzf ' + '$' + `{FILEPATH}` + '\n',
        env: [],
        bin_path: '',
        name: '',
        version: '',
        download_path: '',
        enabled: true
      },
      swapApp: {
        scripts: '',
        env: [],
        bin_path: '',
        name: '',
        version: '',
        download_path: '',
        enabled: true
      },
      appBucket: {},
      defaultVersion: {},
      dialogAppCreateFormVisible: false,
      dialogAppEditFormVisible: false,
      dialogAppDelVisible: false,
      loading: true,
      availableApps: [],
      showPopper: {},
      rules: {
        name: [{ required: true, message: 'Please fill in the package name', trigger: 'blur' }],
        version: [{ required: true, message: 'Please fill in the package version', trigger: 'blur' }],
        scripts: [{ required: true, message: 'Please fill in the installation script', trigger: 'blur' }],
        bin_path: [{ required: true, message: 'Please fill in the package Bin Path', trigger: 'blur' }]
      }
    }
  },
  methods: {
    appOperation (operate, current_app) {
      if (operate === 'add') {
        this.$refs.createApp.validate((valid) => {
          if (valid) {
            this.dialogAppCreateFormVisible = false
            this.addApp(this.createApp)
          } else {
            return false
          }
        })
      } else if (operate === 'edit') {
        this.dialogAppEditFormVisible = true
        this.swapApp = current_app
      } else if (operate === 'update') {
        this.$refs.updateApp.validate((valid) => {
          if (valid) {
            const app = this.swapApp
            this.dialogAppEditFormVisible = false
            this.updateApp(app)
          } else {
            return false
          }
        })
      } else if (operate === 'delete') {
        this.deleteApp(current_app)
      } else if (operate === 'cancel') {
        this.getApps()
      }
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    addApp (data) {
      createAppAPI(data).then(res => {
        this.$message({
          message: 'Successfully added package',
          type: 'success'
        })
        this.getApps()
        this.createApp = {
          scripts: '',
          env: [],
          bin_path: '',
          name: '',
          version: '',
          download_path: '',
          enabled: true
        }
      }).catch(() => {
        this.$message({
          message: 'Failed To Add Package',
          type: 'error'
        })
      }).then(() => {
        this.resetForm('createApp')
      })
    },
    updateApp (data) {
      updateAppAPI(data).then(response => {
        this.$message({
          message: 'Update Package Succeeded',
          type: 'success'
        })
        this.getApps()
      }).catch(response => {
        this.$message({
          message: 'Failed To Update Package',
          type: 'error'
        })
      }).then(() => {
        this.resetForm('updateApp')
      })
    },
    showDeleteModal (name) {
      this.$set(this.showPopper, name, false)
    },
    deleteApp (data) {
      deleteAppAPI(data).then(response => {
        this.getApps()
        this.$message({
          message: 'Package Removed',
          type: 'success'
        })
      }).catch(response => {
        this.$message({
          message: 'Package Removal Failed',
          type: 'error'
        })
      })
    },
    selectedApp (name, _version, _prop) {
      let _app = null
      this.appBucket[name].forEach(app => {
        if (app.version === _version) {
          _app = app
        }
      })
      if (_prop) {
        return _app[_prop]
      } else {
        return _app
      }
    },
    getApps () {
      this.loading = true
      getAllAppsAPI().then(
        response => {
          this.loading = false
          const apps = this.$utils.sortVersion(response, 'version', 'asc')
          this.availableApps = []
          this.appBucket = {}
          apps.forEach((app, index) => {
            this.$set(this.appBucket, app.name, [])
            this.$set(this.showPopper, app.name, false)
            this.$set(this.defaultVersion, app.name, app.version)
          })
          apps.forEach((app, index) => {
            this.appBucket[app.name].push(app)
          })
          for (const app_name in this.appBucket) {
            if (Object.prototype.hasOwnProperty.call(this.appBucket, app_name)) {
              this.appBucket[app_name] = this.$utils.sortVersion(this.appBucket[app_name], 'version', 'asc')
            }
          }
          for (const key in this.appBucket) {
            if (Object.prototype.hasOwnProperty.call(this.appBucket, key)) {
              this.availableApps.push({
                name: key
              })
            }
          }
        }
      )
    },
    changeProxy (value) {
      if (!this.proxyInfo.id || this.proxyInfo.type === 'no') {
        this.proxyInfo.enable_application_proxy = false
        this.$message.error('Proxy Not Configured，Go To「System Configuration」->「Proxy Configuration」Configure The Proxy！')
        return
      }
      this.proxyInfo.enable_application_proxy = value
      updateProxyConfigAPI(this.proxyInfo.id, this.proxyInfo).then(response => {
        if (response.message === 'success') {
          const mess = value ? 'Proxy enabled successfully！' : 'Agent closed successfully！'
          this.$message({
            message: `${mess}`,
            type: 'success'
          })
        } else {
          this.$message.error(response.message)
        }
      }).catch(err => {
        this.proxyInfo.enable_application_proxy = !value
        this.$message.error(`Failed to modify configuration：${err}`)
      })
    },
    getProxyConfig () {
      getProxyConfigAPI().then(response => {
        if (response.length > 0) {
          this.proxyInfo = Object.assign({}, this.proxyInfo, response[0])
        }
      }).catch(error => {
        this.$message.error(`Failed to get proxy configuration：${error}`)
      })
    }
  },
  computed: {

  },
  created () {
    bus.$emit('set-topbar-title', { title: 'Package Management', breadcrumb: [] })
    this.getProxyConfig()
    this.getApps()
  },
  components: {
    Editor
  }
}
</script>

<style lang="less">
.setting-app-container {
  position: relative;
  flex: 1;
  height: 100%;
  padding: 15px 30px;
  overflow: auto;
  font-size: 13px;

  .create-app-dialog {
    .el-dialog__body {
      padding: 20px 5%;
    }
  }

  .section {
    margin-bottom: 56px;

    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;
      overflow: hidden;

      .switch-span {
        display: inline-block;
        height: 20px;
        margin-right: 5px;
        margin-left: 10px;
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        vertical-align: middle;
        transition: color 0.5s;
      }

      .el-button--success.is-plain {
        color: @themeColor;
        background: #fff;
        border-color: @themeColor;
      }

      .el-button--success.is-plain:hover {
        color: @themeColor;
        background: #fff;
        border-color: @themeColor;
      }
    }

    .app-list {
      padding-bottom: 30px;
    }
  }
}
</style>
