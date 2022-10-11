<template>
  <div class="integration-other-container">
    <el-dialog title="Other External Systems" :close-on-click-modal="false" :visible.sync="dialogExternalVisible">
      <el-form :model="externalEdit" @submit.native.prevent :rules="externalRules" ref="externalForm" label-width="100px">
        <el-form-item label="System Name" prop="name">
          <el-input v-model="externalEdit.name" placeholder="Enter System Name" size="small"></el-input>
        </el-form-item>
        <el-form-item label="Address" prop="server">
          <el-input v-model="externalEdit.server" placeholder="Enter the system access address" size="small"></el-input>
        </el-form-item>
        <el-form-item label="API Token" prop="api_token">
          <el-input v-model="externalEdit.api_token" show-password v-if="dialogExternalVisible" type="password" placeholder="Enter API Token" size="small"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" native-type="submit" size="small" @click="updateExternalConfig" class="start-create">Sure</el-button>
        <el-button plain native-type="submit" size="small" @click="dialogExternalVisible = false">Cancel</el-button>
      </div>
    </el-dialog>

    <div class="tab-container">
      <template>
        <el-alert type="info" :closable="false">
          <template>
            Support for integration with other external systems，Workflows can call external systems after configuration API，For details, please refer to
            <el-link
              style="font-size: 14px; vertical-align: baseline;"
              type="primary"
              :href="`https://docs.koderover.com/zadig/settings/others/`"
              :underline="false"
              target="_blank"
            >Help Documentation</el-link>。
          </template>
        </el-alert>
      </template>
      <div class="sync-container">
        <el-button size="small" type="primary" plain @click="dialogExternalVisible = true">Add To</el-button>
      </div>
      <el-table :data="external" style="width: 100%;">
        <el-table-column label="System Name" prop="name"></el-table-column>
        <el-table-column label="Address" prop="server"></el-table-column>
        <el-table-column label="API Token">
          <template>**********</template>
        </el-table-column>
        <el-table-column label="Operate" width="160">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" plain @click="handleExternalEdit(row)">Edit</el-button>
            <el-button type="danger" size="mini" @click="handleExternalDelete(row.id)" plain>Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import {
  getExternalSystemsAPI,
  getExternalSystemByIdAPI,
  updateExternalSystemAPI,
  deleteExternalSystemAPI,
  createExternalSystemAPI
} from '@api'
import { cloneDeep } from 'lodash'
const externalInfo = {
  id: '',
  name: '',
  server: '',
  api_token: ''
}

const validateURL = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter the system access address'))
  } else {
    if (value.endsWith('/')) {
      callback(new Error('URL Cannot contain at the end /'))
    } else {
      callback()
    }
  }
}

export default {
  data () {
    this.externalRules = {
      name: {
        required: true,
        message: 'Please enter a system name',
        trigger: ['blur', 'change']
      },
      server: [
        {
          type: 'url',
          message: 'Please Enter The Correct URL，Include Agreement',
          trigger: ['blur', 'change']
        },
        {
          required: true,
          trigger: ['blur', 'change'],
          validator: validateURL
        }
      ]
    }

    return {
      external: [],
      externalEdit: cloneDeep(externalInfo),
      dialogExternalVisible: false
    }
  },
  watch: {
    dialogExternalVisible (val) {
      if (!val) {
        this.handleExternalCancel()
      }
    }
  },
  methods: {
    getExternalConfig () {
      const key = this.$utils.rsaEncrypt()
      getExternalSystemsAPI(key).then(res => {
        res.external_system.forEach(item => {
          item.api_token = this.$utils.aesDecrypt(item.api_token)
        })
        this.external = res.external_system
      })
    },
    handleExternalEdit (row) {
      this.dialogExternalVisible = true
      this.externalEdit = cloneDeep(row)
      getExternalSystemByIdAPI(row.id).then(res => {
        if (this.externalEdit.id === res.id) {
          this.externalEdit = res
        }
      })
    },
    handleExternalDelete (id) {
      this.$confirm(`Are you sure you want to delete this external system configuration？`, 'Confirm', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteExternalSystemAPI(id).then(res => {
          this.getExternalConfig()
          this.$message({
            message: 'The external system configuration was deleted successfully',
            type: 'success'
          })
        })
      })
    },
    updateExternalConfig () {
      this.$refs.externalForm.validate(valid => {
        if (valid) {
          const id = this.externalEdit.id
          const payload = {
            name: this.externalEdit.name,
            server: this.externalEdit.server,
            api_token: this.externalEdit.api_token
          }
          const fn = id
            ? updateExternalSystemAPI(id, payload)
            : createExternalSystemAPI(payload)
          fn.then(res => {
            this.getExternalConfig()
            this.dialogExternalVisible = false
            this.$message({
              message: `External system configuration${id ? 'Revise' : 'Create'}Success`,
              type: 'success'
            })
          })
        }
      })
    },
    handleExternalCancel () {
      this.externalEdit = cloneDeep(externalInfo)
      this.$nextTick(() => {
        this.$refs.externalForm.clearValidate()
      })
    }
  },
  activated () {
    this.getExternalConfig()
  }
}
</script>

<style lang="less" scoped>
.integration-other-container {
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

  /deep/.el-dialog {
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
      color: #606266;
      font-size: 14px;

      .el-form-item {
        margin-bottom: 15px;
      }
    }
  }
}
</style>
