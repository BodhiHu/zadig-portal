<template>
  <div v-loading="loading"
       element-loading-text="Loading..."
       element-loading-spinner="iconfont iconfont-loading iconduixiangcunchu"
       class="setting-storage-container">
    <!--storage-create-dialog-->
    <el-dialog title='Add To'
               :visible.sync="dialogStorageCreateFormVisible"
               custom-class="dialog-style"
               :close-on-click-modal="false"
               width="35%">
      <el-form ref="storage"
               :rules="rules"
               label-width="120px"
               label-position="left"
               :model="storage">
        <el-form-item label="Provider"
                      prop="provider">
          <el-select v-model="storage.provider"
                     style="width: 100%;"
                     size="small"
                     placeholder="Please select an object storage provider">
            <el-option :value="1"
                       label="Ali Cloud OSS">
              <i class="iconfont iconaliyun"></i> <span>Ali Cloud OSS</span>
            </el-option>

            <el-option :value="2"
                       label="Tencent Cloud COS">
              <i class="iconfont icontengxunyun"></i> <span>Tencent Cloud COS</span>
            </el-option>
            <el-option :value="3"
                       label="Seven Niuyun Kodo">
              <i class="iconfont iconqiniu"></i> <span>Seven Niuyun Kodo</span>
            </el-option>
            <el-option :value="4"
                       label="HUAWEI CLOUD OBS">
              <i class="iconfont iconhuawei"></i> <span>HUAWEI CLOUD OBS</span>
            </el-option>
            <el-option :value="0"
                       label="Other">
              <i class="iconfont iconqita"></i> <span>Other</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Access Point Address"
                      prop="endpoint">
          <el-input size="small"
                    v-model="storage.endpoint"
                    placeholder="Please enter the access point address"></el-input>
        </el-form-item>
        <el-form-item label="AK"
                      prop="ak">
          <el-input size="small"
                    v-model="storage.ak"
                    placeholder="Please Enter Access Key"></el-input>
        </el-form-item>
        <el-form-item label="SK"
                      prop="sk">
          <el-input size="small"
                    show-password
                    v-if="dialogStorageCreateFormVisible"
                    type="password"
                    v-model="storage.sk"
                    placeholder="Please Enter Secret Key"></el-input>
        </el-form-item>
        <el-form-item label="Bucket"
                      prop="bucket">
          <el-input size="small"
                    v-model="storage.bucket"
                    placeholder="Please Enter Bucket"></el-input>
        </el-form-item>
        <el-form-item label="Store Relative Path"
                      prop="subfolder">
          <el-input size="small"
                    v-model="storage.subfolder"
                    placeholder="Please enter storage relative path"></el-input>
        </el-form-item>
        <el-form-item label="Protocol"
                      prop="insecure">
          <el-radio v-model="storage.insecure"
                    :label="true">HTTP</el-radio>
          <el-radio v-model="storage.insecure"
                    :label="false">HTTPS</el-radio>
        </el-form-item>
        <el-form-item label="Use By Default"
                      prop="is_default">
          <el-checkbox size="small"
                       v-model="storage.is_default"></el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="small"
                   @click="dialogStorageCreateFormVisible = false">Cancel</el-button>
        <el-button size="small"
                   :plain="true"
                   type="success"
                   @click="storageOperation('add')">Save</el-button>
      </div>
    </el-dialog>
    <!--storage-create-dialog-->

    <!--storage-edit-dialog-->
    <el-dialog title='Revise'
               :visible.sync="dialogStorageEditFormVisible"
               custom-class="dialog-style"
               :close-on-click-modal="false"
               width="35%">
      <el-form ref="swapStorage"
               :rules="rules"
               label-width="120px"
               label-position="left"
               :model="swapStorage">
        <el-form-item label="Provider"
                      prop="provider">
          <el-select v-model="swapStorage.provider"
                     style="width: 100%;"
                     size="small"
                     placeholder="Please select an object storage provider">
            <el-option :value="1"
                       label="Ali Cloud OSS">
              <i class="iconfont iconaliyun"></i> <span>Ali Cloud OSS</span>
            </el-option>

            <el-option :value="2"
                       label="Tencent Cloud COS">
              <i class="iconfont icontengxunyun"></i> <span>Tencent Cloud COS</span>
            </el-option>
            <el-option :value="3"
                       label="Seven Niuyun Kodo">
              <i class="iconfont iconqiniu"></i> <span>Seven Niuyun Kodo</span>
            </el-option>
            <el-option :value="4"
                       label="HUAWEI CLOUD OBS">
              <i class="iconfont iconhuawei"></i> <span>HUAWEI CLOUD OBS</span>
            </el-option>
            <el-option :value="0"
                       label="Other">
              <i class="iconfont iconqita"></i> <span>Other</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Access Point Address"
                      prop="endpoint">
          <el-input size="small"
                    v-model="swapStorage.endpoint"
                    placeholder="Please enter the access point address"></el-input>
        </el-form-item>
        <el-form-item label="AK"
                      prop="ak">
          <el-input size="small"
                    v-model="swapStorage.ak"
                    placeholder="Please Enter Access Key"></el-input>
        </el-form-item>
        <el-form-item label="SK"
                      prop="sk">
          <el-input size="small"
                    v-model="swapStorage.sk"
                    type="passsword"
                    show-password
                    v-if="dialogStorageEditFormVisible"
                    placeholder="Please Enter Secret Key"></el-input>
        </el-form-item>
        <el-form-item label="Bucket"
                      prop="bucket">
          <el-input size="small"
                    v-model="swapStorage.bucket"
                    placeholder="Please Enter Bucket"></el-input>
        </el-form-item>
        <el-form-item label="Store Relative Path"
                      prop="subfolder">
          <el-input size="small"
                    v-model="swapStorage.subfolder"
                    placeholder="Please enter storage relative path"></el-input>
        </el-form-item>
        <el-form-item label="Protocol"
                      prop="insecure">
          <el-radio v-model="swapStorage.insecure"
                    :label="true">HTTP</el-radio>
          <el-radio v-model="swapStorage.insecure"
                    :label="false">HTTPS</el-radio>
        </el-form-item>
        <el-form-item label="Use By Default"
                      prop="is_default">
          <el-checkbox size="small"
                       v-model="swapStorage.is_default"></el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="small"
                   @click="dialogStorageEditFormVisible = false">Cancel</el-button>
        <el-button size="small"
                   :plain="true"
                   type="success"
                   @click="storageOperation('update')">Save</el-button>
      </div>
    </el-dialog>
    <!--storage-edit-dialog-->
    <div class="section">
      <el-alert type="info"
                :closable="false">
        <template>
          Support integration with Alibaba Cloud OSS、Tencent Cloud COS、HUAWEI CLOUD OBS、Seven Niuyun KODO And So On Amazon S3(Amazon Simple Storage Service) Object Storage for Protocols，For details, please refer to
          <el-link style="font-size: 14px; vertical-align: baseline;"
                   type="primary"
                   :href="`https://docs.koderover.com/zadig/settings/object-storage/`"
                   :underline="false"
                   target="_blank">Help Documentation</el-link>
        </template>
      </el-alert>
      <div class="sync-container">
        <el-button :plain="true"
                   size="small"
                   @click="dialogStorageCreateFormVisible=true"
                   type="success">New</el-button>
      </div>
      <div class="storage-list">
        <template>
          <el-table :data="allStorage"
                    style="width: 100%;">
            <el-table-column label="Provider/Access Point Address">
              <template slot-scope="scope">
                <i :class="getProviderMap(scope.row.provider,'icon')"></i>
                <span>{{scope.row.endpoint}}</span>
              </template>
            </el-table-column>
            <el-table-column label="Bucket">
              <template slot-scope="scope">
                <span>{{scope.row.bucket}}</span>
              </template>
            </el-table-column>
            <el-table-column label="Relative Path">
              <template slot-scope="scope">
                <span v-if="scope.row.subfolder">{{scope.row.subfolder}}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column width="80"
                             label="HTTPS">
              <template slot-scope="scope">
                <span>{{!scope.row.insecure?'Yes':'No'}}</span>
              </template>
            </el-table-column>

            <el-table-column width="100"
                             label="Use By Default">
              <template slot-scope="scope">
                <el-tag size="small"
                        v-if="scope.row.is_default">Use By Default</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column width="220px"
                             label="Change The Time">
              <template slot-scope="scope">
                <i class="el-icon-time"></i>
                <span>{{ $utils.convertTimestamp(scope.row.update_time) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Last Review">
              <template slot-scope="scope">
                <span>{{ scope.row.updated_by}}</span>
              </template>
            </el-table-column>

            <el-table-column width="180px"
                             label="Operate">
              <template slot-scope="scope">
                <el-button @click="storageOperation('edit',scope.row)"
                           size="mini"
                           type="primary"
                           plain>Edit</el-button>
                <el-button @click="storageOperation('delete',scope.row)"
                           size="mini"
                           type="danger"
                           plain>Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </div>

  </div>
</template>

<script>

import { getStorageListAPI, createStorageAPI, updateStorageAPI, deleteStorageAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      allStorage: [],
      storage: {
        provider: null,
        ak: '',
        sk: '',
        endpoint: '',
        bucket: '',
        subfolder: '',
        insecure: true,
        is_default: true
      },
      swapStorage: {
        provider: null,
        ak: '',
        sk: '',
        endpoint: '',
        bucket: '',
        subfolder: '',
        insecure: true,
        is_default: true
      },
      providerMap: {
        0: {
          icon: 'iconfont logo iconqita',
          name: 'Other'
        },

        1: {
          icon: 'iconfont logo iconaliyun ',
          name: 'Ali Cloud OSS'
        },
        2: {
          icon: 'iconfont logo icontengxunyun',
          name: 'Tencent Cloud COS'
        },
        3: {
          icon: 'iconfont logo iconqiniu',
          name: 'Seven Niuyun Kodo'
        },
        4: {
          icon: 'iconfont logo iconhuawei',
          name: 'HUAWEI CLOUD OBS'
        }
      },
      dialogStorageCreateFormVisible: false,
      dialogStorageEditFormVisible: false,
      loading: true,
      rules: {
        provider: [{ required: true, message: 'Please Select A Provider', trigger: 'blur' }],
        ak: [{ required: true, message: 'Please Enter Access Key', trigger: 'blur' }],
        sk: [{ required: true, message: 'Please Enter Secret Key', trigger: 'blur' }],
        endpoint: [{
          required: true,
          message: 'Please enter the access point address',
          trigger: 'blur'
        }],
        bucket: [{ required: true, message: 'Please Enter Bucket', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getProviderMap (name, type) {
      if (name && type) {
        return this.providerMap[name][type]
      } else {
        return this.providerMap[0].icon
      }
    },
    storageOperation (operate, current_storage) {
      if (operate === 'add') {
        this.$refs.storage.validate(valid => {
          if (valid) {
            const payload = this.storage
            this.dialogStorageCreateFormVisible = false
            this.addStorage(payload)
          } else {
            return false
          }
        })
      } else if (operate === 'edit') {
        this.swapStorage = this.$utils.cloneObj(current_storage)
        this.dialogStorageEditFormVisible = true
      } else if (operate === 'update') {
        this.$refs.swapStorage.validate(valid => {
          if (valid) {
            const id = this.swapStorage.id
            const payload = this.swapStorage
            this.dialogStorageEditFormVisible = false
            this.updateStorage(id, payload)
          } else {
            return false
          }
        })
      } else if (operate === 'delete') {
        const id = current_storage.id
        this.$confirm(`Sure You Want To Delete ${current_storage.endpoint} ?`, 'Confirm', {
          confirmButtonText: 'Sure',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(({ value }) => {
          deleteStorageAPI(id).then((res) => {
            this.getStorage()
            this.$message({
              message: 'Successfully Deleted',
              type: 'success'
            })
          })
        })
      }
    },
    addStorage (payload) {
      createStorageAPI(payload).then((res) => {
        this.$refs.storage.resetFields()
        this.getStorage()
        this.storage = {
          ak: '',
          sk: '',
          endpoint: '',
          bucket: '',
          subfolder: '',
          insecure: true,
          is_default: true
        }
        this.$message({
          type: 'success',
          message: 'Added Successfully'
        })
      })
    },
    updateStorage (id, payload) {
      updateStorageAPI(id, payload).then((res) => {
        this.$refs.swapStorage.resetFields()
        this.getStorage()
        this.$message({
          type: 'success',
          message: 'Update Completed'
        })
      })
    },
    getStorage () {
      this.loading = true
      const key = this.$utils.rsaEncrypt()
      getStorageListAPI(key).then((res) => {
        this.loading = false
        res.forEach(item => {
          item.sk = this.$utils.aesDecrypt(item.sk)
        })
        this.allStorage = res
      })
    }
  },
  computed: {

  },
  created () {
    bus.$emit('set-topbar-title', { title: 'Object Storage', breadcrumb: [] })

    this.getStorage()
  }
}
</script>

<style lang="less">
.setting-storage-container {
  position: relative;
  flex: 1;
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

    .storage-list {
      padding-bottom: 30px;

      .logo {
        font-size: 20px;
      }
    }
  }

  .dialog-style {
    .el-dialog__body {
      padding: 0 20px;
    }
  }
}
</style>
