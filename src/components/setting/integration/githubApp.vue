<template>
  <div class="intergration-github-app-container">

    <!--start of edit github dialog-->
    <el-dialog title="GitHub App 配置-修改"
               :close-on-click-modal="false"
               custom-class="edit-form-dialog"
               :visible.sync="dialogGithubEditFormVisible">
      <el-form :model="githubAppEdit"
               @submit.native.prevent
               label-position="left"
               :rules="githubAppRules"
               label-width="100px"
               class="mg-t32"
               ref="githubAppEditForm">
        <el-form-item label="App ID"
                      prop="app_id">
          <el-input v-model.number="githubAppEdit.app_id"
                    placeholder="App ID"
                    autofocus
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="App Key"
                      prop="app_key">
          <el-input v-model="githubAppEdit.app_key"
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 4}"
                    placeholder="App Key"
                    autofocus
                    auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button type="primary"
                   native-type="submit"
                   size="small"
                   @click="updateGithubApp()"
                   class="start-create">确定</el-button>
        <el-button plain
                   native-type="submit"
                   size="small"
                   @click="handleGithubAppCancel()">取消</el-button>
      </div>
    </el-dialog>
    <!--end of edit github dialog-->

    <!--start of edit github dialog-->
    <el-dialog title="Github App 配置-添加"
               :close-on-click-modal="false"
               custom-class="edit-form-dialog"
               :visible.sync="dialogGithubAddFormVisible">
      <el-form :model="githubAppAdd"
               @submit.native.prevent
               :rules="githubAppRules"
               label-position="left"
               label-width="100px"
               class="mg-t32"
               ref="githubAppAddForm">
        <el-form-item label="App ID"
                      prop="app_id">
          <el-input v-model.number="githubAppAdd.app_id"
                    placeholder="创建的 GitHub App ID"
                    autofocus
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="App Key"
                      prop="app_key">
          <el-input v-model="githubAppAdd.app_key"
                    placeholder="创建的 GitHub App Key"
                    type="textarea"
                    :autosize="{ minRows: 2, maxRows: 4}"
                    autofocus
                    auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button type="primary"
                   native-type="submit"
                   size="small"
                   @click="createGithubApp()"
                   class="start-create">确定</el-button>
        <el-button plain
                   native-type="submit"
                   size="small"
                   @click="handleGithubAppCancel()">取消</el-button>
      </div>
    </el-dialog>
    <!--end of edit github dialog-->
    <div class="tab-container">

      <template>
        <el-alert type="info"
                  :closable="false">
          <template>
            支持集成 GitHub App，配置后可以在 GitHub - Checks 上追踪工作流状态，详情可参考
            <el-link style="font-size: 14px; vertical-align: baseline;"
                     type="primary"
                     :href="`https://docs.koderover.com/zadig/settings/webhook-config/`"
                     :underline="false"
                     target="_blank">帮助文档</el-link> 。
          </template>
        </el-alert>
      </template>
      <div class="sync-container">
        <el-button v-if="githubApp.length === 0"
                   size="small"
                   type="primary"
                   plain
                   @click="handleGithubAppAdd">添加</el-button>
      </div>
      <el-table :data="githubApp"
                style="width: 100%;">
        <el-table-column label="App ID">
          <template slot-scope="scope">
            {{scope.row.app_id}}
          </template>
        </el-table-column>
        <el-table-column label="App Key">
          <template>
            **********
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         width="160">
          <template slot-scope="scope">
            <el-button type="primary"
                       size="mini"
                       plain
                       @click="handleGithubAppEdit(scope.row)">编辑</el-button>
            <el-button type="danger"
                       size="mini"
                       @click="handleGithubAppDelete(scope.row)"
                       plain>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import {
  getGithubAppAPI, updateGithubAppAPI, deleteGithubAppAPI, createGithubAppAPI
} from '@api'
export default {
  data () {
    return {
      githubApp: [],
      githubAppAdd: {
        app_id: null,
        app_key: ''
      },
      githubAppEdit: {
        app_id: null,
        app_key: ''
      },
      githubAppRules: {
        app_id: {
          required: true,
          message: '请输入 App ID',
          type: 'number',
          trigger: ['blur', 'change']
        },
        app_key: {
          required: true,
          message: '请输入 App Key',
          trigger: ['blur', 'change']
        }
      },
      dialogGithubAddFormVisible: false,
      dialogGithubEditFormVisible: false
    }
  },
  methods: {
    clearValidate (ref) {
      this.$refs[ref].clearValidate()
    },
    getGithubApp () {
      getGithubAppAPI().then((res) => {
        if (!res.resultCode) {
          this.$set(this, 'githubApp', res)
        } else {
          this.$set(this, 'githubApp', [])
        }
      })
    },
    handleGithubAppAdd () {
      this.dialogGithubAddFormVisible = true
    },
    handleGithubAppEdit (row) {
      this.dialogGithubEditFormVisible = true
      this.githubAppEdit = this.$utils.cloneObj(row)
    },
    handleGithubAppDelete (row) {
      this.$confirm('确定要删除这个 GitHub App 配置吗？', '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const id = row.id
        deleteGithubAppAPI(id).then((res) => {
          this.getGithubApp()
          this.$message({
            message: 'GitHub App 配置删除成功',
            type: 'success'
          })
        })
      })
    },
    createGithubApp () {
      this.$refs.githubAppAddForm.validate((valid) => {
        if (valid) {
          const payload = this.githubAppAdd
          createGithubAppAPI(payload).then((res) => {
            this.getGithubApp()
            this.handleGithubAppCancel()
            this.$message({
              message: 'GitHub App 配置添加成功',
              type: 'success'
            })
          })
        } else {
          return false
        }
      })
    },
    updateGithubApp () {
      this.$refs.githubAppEditForm.validate((valid) => {
        if (valid) {
          const payload = this.githubAppEdit
          updateGithubAppAPI(payload).then((res) => {
            this.getGithubApp()
            this.handleGithubAppCancel()
            this.$message({
              message: 'GitHub App 配置修改成功',
              type: 'success'
            })
          })
        } else {
          return false
        }
      })
    },
    handleGithubAppCancel () {
      if (this.$refs.githubAppAddForm) {
        this.$refs.githubAppAddForm.resetFields()
        this.dialogGithubAddFormVisible = false
      }
      if (this.$refs.githubAppEditForm) {
        this.$refs.githubAppEditForm.resetFields()
        this.dialogGithubEditFormVisible = false
      }
    }

  },
  activated () {
    this.getGithubApp()
  }
}
</script>

<style lang="less">
.intergration-github-app-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .tab-container {
    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }

  .text-success {
    color: rgb(82, 196, 26);
  }

  .text-failed {
    color: #ff1949;
  }

  .edit-form-dialog {
    width: 550px;

    .el-dialog__header {
      padding: 15px;
      text-align: center;
      border-bottom: 1px solid #e4e4e4;

      .el-dialog__close {
        font-size: 10px;
      }
    }

    .el-dialog__body {
      padding: 0 20px;
      color: #606266;
      font-size: 14px;

      .el-form-item {
        margin-bottom: 15px;
      }
    }

    .el-select {
      width: 100%;
    }

    .el-input {
      display: inline-block;
    }
  }
}
</style>
