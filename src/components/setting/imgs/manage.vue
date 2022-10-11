<template>
  <div v-loading="loading"
       element-loading-text="Loading..."
       element-loading-spinner="iconfont iconfont-loading iconjingxiang"
       class="setting-img-container">
    <!--imgs-create-dialog-->
    <el-dialog title='Add Mirror'
               width="40%"
               :close-on-click-modal="false"
               custom-class="create-img-dialog"
               :visible.sync="dialogImgCreateFormVisible">
      <el-form ref="createImg"
               :rules="rules"
               :model="createImg"
               label-width="125px">
        <el-form-item label="Label"
                      prop="label">
          <el-input size="small"
                    v-model="createImg.label"></el-input>
        </el-form-item>
        <el-form-item label="Image Name"
                      prop="value">
          <el-input size="small"
                    placeholder="Warehouse Address/Namespaces/Mirror Name:Label"
                    v-model.trim="createImg.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="small"
                   @click="dialogImgCreateFormVisible = false">Cancel</el-button>
        <el-button :plain="true"
                   type="success"
                   size="small"
                   @click="addImg">Save</el-button>
      </div>
    </el-dialog>
    <!--imgs-create-dialog-->

    <!--imgs-edit-dialog-->
    <el-dialog title='Modify The Image'
               custom-class="create-img-dialog"
               :close-on-click-modal="false"
               :visible.sync="dialogImgEditFormVisible">
      <el-form ref="updateImg"
               :rules="rules"
               :model="swapImg"
               label-width="125px">
        <el-form-item label="Label"
                      prop="label">
          <el-input size="small"
                    disabled
                    v-model="swapImg.label"></el-input>
        </el-form-item>
        <el-form-item label="Image Name"
                      prop="value">
          <el-input size="small"
                    v-model.trim="swapImg.value"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="small"
                   @click="dialogImgEditFormVisible = false">Cancel</el-button>
        <el-button size="small"
                   :plain="true"
                   @click="updateImg"
                   type="success">Save</el-button>
      </div>
    </el-dialog>
    <!--imgs-edit-dialog-->
    <div class="section">
      <el-alert type="info"
                :closable="false">
        <template slot>
          <span>The build and test of the project can use the build image as the base environment image，Some necessary packages need to be added to the build image，For details, please refer to
            <el-link style="vertical-align: baseline;"
                     type="primary"
                     href="https://docs.koderover.com/zadig/settings/custom-image/"
                     :underline="false"
                     target="_blank">Help Documentation</el-link>
          </span><br>
        </template>
      </el-alert>
      <div class="sync-container">
        <el-button :plain="true"
                   @click="dialogImgCreateFormVisible=true"
                   size="small"
                   type="success">Add To</el-button>
      </div>
      <div class="img-list">
        <template>
          <el-table :data="imgs"
                    style="width: 100%;">
            <el-table-column label="Label">
              <template slot-scope="scope">
                <span>{{scope.row.label}}</span>
              </template>
            </el-table-column>
            <el-table-column label="Image Name">
              <template slot-scope="scope">
                <span>{{scope.row.value}}</span>
              </template>
            </el-table-column>
            <el-table-column label="Operate">
              <template slot-scope="scope">
                <el-button @click="editImg(scope.row)"
                           type="primary"
                           size="mini" plain>Edit</el-button>
                <el-button size="mini"
                           @click="deleteImg(scope.row)"
                           type="danger" plain>Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </div>
  </div>
</template>

<script>

import { getImgListAPI, addImgAPI, deleteImgAPI, updateImgAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      dialogImgCreateFormVisible: false,
      dialogImgEditFormVisible: false,
      loading: false,
      createImg: {
        label: '',
        value: '',
        image_from: 'custom'
      },
      swapImg: {
        label: '',
        value: '',
        image_from: 'custom'
      },
      imgs: [],
      rules: {
        label: [{ required: true, message: 'Please fill in the mirror tag', trigger: 'blur' }],
        value: [{ required: true, message: 'Please fill in the mirror name', trigger: 'blur' }]
      }
    }
  },
  methods: {
    editImg (data) {
      this.dialogImgEditFormVisible = true
      this.swapImg = this.$utils.cloneObj(data)
    },
    deleteImg (data) {
      this.$confirm(`Sure You Want To Delete ${data.label} Is This Mirror？`, 'Delete mirror confirmation', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteImgAPI(data.id).then(
          res => {
            this.getImgList()
            this.$message({
              message: 'Mirror deleted successfully',
              type: 'success'
            })
          }
        )
      })
    },
    addImg () {
      this.$refs.createImg.validate((valid) => {
        if (valid) {
          const payload = this.$utils.cloneObj(this.createImg)
          addImgAPI(payload).then(
            res => {
              this.dialogImgCreateFormVisible = false
              this.$refs.createImg.resetFields()
              this.getImgList()
              this.$message({
                message: 'Added mirror successfully',
                type: 'success'
              })
            }
          )
        } else {
          return false
        }
      })
    },
    updateImg () {
      this.$refs.updateImg.validate((valid) => {
        if (valid) {
          const payload = this.$utils.cloneObj(this.swapImg)
          const id = payload.id
          updateImgAPI(id, payload).then(
            res => {
              this.dialogImgEditFormVisible = false
              this.$refs.updateImg.resetFields()
              this.getImgList()
              this.$message({
                message: 'Mirror updated successfully',
                type: 'success'
              })
            }
          )
        } else {
          return false
        }
      })
    },
    getImgList () {
      this.loading = true
      getImgListAPI('custom').then(
        res => {
          this.loading = false
          this.imgs = res
        }
      )
    }
  },
  computed: {

  },
  created () {
    bus.$emit(`set-topbar-title`, { title: 'Build Image Management', breadcrumb: [] })

    this.getImgList()
  },
  components: {
  }
}
</script>

<style lang="less">
.setting-img-container {
  position: relative;
  flex: 1;
  height: 100%;
  padding: 15px 30px;
  overflow: auto;
  font-size: 13px;

  .section {
    margin-bottom: 56px;

    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;
      overflow: hidden;

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

    .img-list {
      padding-bottom: 30px;
    }

    .create-img-dialog {
      .el-dialog__body {
        padding: 0 20px;
      }

      .el-form-item {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
