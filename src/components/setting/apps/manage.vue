<template>
    <div v-loading="loading"
         element-loading-text="加载中..."
         element-loading-spinner="iconfont iconfont-loading iconyingyongshezhi"
         class="setting-app-container">
      <!--apps-create-dialog-->
      <el-dialog title='新建'
                 width="55%"
                 :close-on-click-modal="false"
                 custom-class="create-app-dialog"
                 :visible.sync="dialogAppCreateFormVisible">
        <el-form ref="createApp"
                 :rules="rules"
                 :model="createApp"
                 label-position="left"
                 label-width="100px">
          <el-form-item label="名称"
                        prop="name">
            <el-input size="small"
                      v-model="createApp.name"></el-input>
          </el-form-item>
          <el-form-item label="版本"
                        prop="version">
            <el-input size="small"
                      placeholder="例如 1.0.0"
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
              <span>启用</span>
              <el-tooltip content="控制软件包列表中是否展示，正在使用中的不受影响"
                          placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-checkbox v-model="createApp.enabled">启用该软件包</el-checkbox>
          </el-form-item>
          <el-form-item prop="download_path" class="label-icon">
            <template #label>
              <span>安装包地址</span>
              <el-tooltip content="系统自动从配置地址下载安装包并做缓存，安装包可通过 ${FILEPATH} 变量获取"
                          placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-input size="small"
                      placeholder="http://domain/install_pkg.tar.gz"
                      v-model="createApp.download_path"></el-input>
          </el-form-item>
          <el-form-item label="安装脚本"
                        prop="scripts">
            <Editor v-model="createApp.scripts"
                    lang="sh"
                    theme="monokai"
                    width="100%"
                    height="220"></Editor>
          </el-form-item>
        </el-form>
        <div slot="footer"
             class="dialog-footer">
          <el-button size="small"
                     @click="dialogAppCreateFormVisible = false">取 消</el-button>
          <el-button :plain="true"
                     type="success"
                     size="small"
                     @click="appOperation('add')">保存</el-button>
        </div>
      </el-dialog>
      <!--apps-create-dialog-->

      <!--apps-edit-dialog-->
      <el-dialog title='修改软件包'
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
              <span>启用</span>
              <el-tooltip content="控制软件包列表中是否展示，正在使用中的不受影响"
                          placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-checkbox v-model="swapApp.enabled">启用该软件包</el-checkbox>
          </el-form-item>
          <el-form-item v-if="(typeof swapApp.download_path)!=='undefined'"
                        prop="download_path"
                        class="label-icon">
            <template #label>
              <span>安装包地址</span>
              <el-tooltip content="系统自动从配置地址下载安装包并做缓存，安装包可通过 ${FILEPATH} 变量获取"
                          placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <el-input size="small"
                      v-model="swapApp.download_path"></el-input>
          </el-form-item>
          <el-form-item label="安装脚本"
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
                     @click="dialogAppEditFormVisible = false">取 消</el-button>
          <el-button size="small"
                     :plain="true"
                     type="success"
                     @click="appOperation('update')">保存</el-button>
        </div>
      </el-dialog>
      <!--apps-edit-dialog-->
      <div class="section">
        <el-alert type="info"
                  :closable="false">
          <template>
            运行构建及测试步骤时，根据实际业务去安装必要的软件包，详情可参考
            <el-link style="font-size: 14px; vertical-align: baseline;"
                     type="primary"
                     :href="`https://docs.koderover.com/zadig/settings/app/`"
                     :underline="false"
                     target="_blank">帮助文档</el-link>
          </template>
        </el-alert>
        <div class="sync-container">
          <el-button :plain="true"
                     @click="dialogAppCreateFormVisible=true"
                     size="small"
                     type="success">新建</el-button>
          <span class="switch-span"
                :style="{color: proxyInfo.enable_application_proxy?'#0066ff':'#303133'}">启用代理</span>
          <el-switch size="small"
                     :value="proxyInfo.enable_application_proxy"
                     @change="changeProxy"></el-switch>
        </div>
        <div class="app-list">
          <template>
            <el-table :data="availableApps"
                      style="width: 100%;">
              <el-table-column label="名称">
                <template slot-scope="scope">
                  <span>{{scope.row.name}}</span>
                </template>
              </el-table-column>
              <el-table-column label="版本">
                <template slot-scope="scope">
                  <el-select v-model="defaultVersion[scope.row.name]"
                             size="small"
                             placeholder="请选择">
                    <el-option v-for="item in appBucket[scope.row.name]"
                               :key="item.version"
                               :label="item.version"
                               :value="item.version">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="更新时间">
                <template slot-scope="scope">
                  <i class="el-icon-time"></i>
                  <span style="margin-left: 10px;">{{
                  $utils.convertTimestamp(selectedApp(scope.row.name,defaultVersion[scope.row.name],"update_time"))
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="更新人">
                <template slot-scope="scope">
                  <span style="margin-left: 10px;">{{
                  selectedApp(scope.row.name,defaultVersion[scope.row.name],"update_by") }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button @click="appOperation('edit',selectedApp(scope.row.name,defaultVersion[scope.row.name]))"
                             type="primary"
                             size="mini" plain>编辑</el-button>
                  <el-popover v-model="showPopper[scope.row.name]"
                              trigger="click"
                              placement="top"
                              width="260"
                              style="display: inline-block;">
                    <p>软件包删除可能会影响正在使用的工作流，确定删除软件包 {{scope.row.name}} 的
                      {{defaultVersion[scope.row.name]}} 版本吗？</p>
                    <div style=" margin: 0; text-align: right;">
                      <el-button size="mini"
                                 @click="showPopper[scope.row.name]=false"
                                 type="text">取消</el-button>
                      <el-button type="primary"
                                 @click="appOperation('delete',selectedApp(scope.row.name,defaultVersion[scope.row.name]))"
                                 size="mini">确定</el-button>
                    </div>
                    <div slot="reference">
                      <el-button size="mini"
                                 @click="showDeleteModal(scope.row.name)"
                                 type="danger" plain>删除</el-button>
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
        name: [{ required: true, message: '请填写软件包名称', trigger: 'blur' }],
        version: [{ required: true, message: '请填写软件包版本', trigger: 'blur' }],
        scripts: [{ required: true, message: '请填写安装脚本', trigger: 'blur' }],
        bin_path: [{ required: true, message: '请填写软件包 Bin Path', trigger: 'blur' }]
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
          message: '新增软件包成功',
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
          message: '新增软件包失败',
          type: 'error'
        })
      }).then(() => {
        this.resetForm('createApp')
      })
    },
    updateApp (data) {
      updateAppAPI(data).then(response => {
        this.$message({
          message: '更新软件包成功',
          type: 'success'
        })
        this.getApps()
      }).catch(response => {
        this.$message({
          message: '更新软件包失败',
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
          message: '软件包已删除',
          type: 'success'
        })
      }).catch(response => {
        this.$message({
          message: '软件包删除失败',
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
      const showAvailable = false
      getAllAppsAPI(showAvailable).then(
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
        this.$message.error('未配置代理，请前往「系统配置」->「代理配置」配置代理！')
        return
      }
      this.proxyInfo.enable_application_proxy = value
      updateProxyConfigAPI(this.proxyInfo.id, this.proxyInfo).then(response => {
        if (response.message === 'success') {
          const mess = value ? '启用代理成功！' : '成功关闭代理！'
          this.$message({
            message: `${mess}`,
            type: 'success'
          })
        } else {
          this.$message.error(response.message)
        }
      }).catch(err => {
        this.proxyInfo.enable_application_proxy = !value
        this.$message.error(`修改配置失败：${err}`)
      })
    },
    getProxyConfig () {
      getProxyConfigAPI().then(response => {
        if (response.length > 0) {
          this.proxyInfo = Object.assign({}, this.proxyInfo, response[0])
        }
      }).catch(error => {
        this.$message.error(`获取代理配置失败：${error}`)
      })
    }
  },
  computed: {

  },
  created () {
    bus.$emit('set-topbar-title', { title: '软件包管理', breadcrumb: [] })
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
