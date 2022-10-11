<template>
  <div class="import-hosts-container">
    <el-alert type="warning" class="tip" :closable="false">
      <template>
        Host resources are used for host service resource configuration
        <br />For detailed configuration, please refer to
        <el-link
          style="font-size: 14px; vertical-align: baseline;"
          type="primary"
          :href="`https://docs.koderover.com/zadig/settings/vm-management/`"
          :underline="false"
          target="_blank"
        >Help Documentation</el-link>
      </template>
    </el-alert>
    <el-form ref="importHosts" :rules="rules" label-width="100px" label-position="left" :model="host" class="host-form">
      <el-form-item label="Hosting Provider" prop="provider">
        <el-select v-model="host.provider" style="width: 100%;" size="small" placeholder="Please select a hosting provider">
          <el-option :value="1" label="Ali Cloud">
            <i class="iconfont iconaliyun"></i>
            <span>Ali Cloud</span>
          </el-option>

          <el-option :value="2" label="Tencent Cloud">
            <i class="iconfont icontengxunyun"></i>
            <span>Tencent Cloud</span>
          </el-option>
          <el-option :value="3" label="HUAWEI CLOUD">
            <i class="iconfont iconhuawei"></i>
            <span>HUAWEI CLOUD</span>
          </el-option>
          <el-option :value="0" label="Other">
            <i class="iconfont iconwuliji"></i>
            <span>Other</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Download Template" prop="download">
        <el-button style="width: 50%;" size="small" type="primary" @click="downloadTemplate" plain>Download Template</el-button>
      </el-form-item>
      <el-form-item label="Upload Files" prop="upload">
        <el-upload
          ref="file-uploader"
          class="upload-file"
          accept=".xls, .xlsx"
          action="#"
          :limit="1"
          :auto-upload="false"
          :on-change="handleChange"
          :before-upload="beforeUpload"
          :file-list="fileList"
          :on-remove="onRemoveFile"
        >
          <el-button :disabled="uploadBtnDisabled" style="width: 50%;" size="small" type="primary" plain>Upload Files</el-button>
          <div slot="tip" class="el-upload__tip" v-html="host.msg"></div>
        </el-upload>
      </el-form-item>
      <el-form-item label="Import Options" prop="option">
        <el-radio-group v-model="host.option">
          <el-radio label="increment">
            Incremental
            <el-tooltip effect="dark" content="Entries in the existing host management list will not be reimported，Only add host information newly added in the file" placement="top">
              <i class="pointer el-icon-question"></i>
            </el-tooltip>
          </el-radio>
          <el-radio label="patch">
            Overwrite an existing host
            <el-tooltip effect="dark" content="Re-import the entries in the existing host management list and add the newly added host information in the file" placement="top">
              <i class="pointer el-icon-question"></i>
            </el-tooltip>
          </el-radio>
          <!-- <el-radio label="override">
            Full Coverage
            <el-tooltip effect="dark" content="Entries in the existing host management list are no longer preserved，Full import of host information in the file" placement="top">
              <i class="pointer el-icon-question"></i>
            </el-tooltip>
          </el-radio>-->
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import XLSX from 'xlsx'
import { importHostAPI, importProjectHostAPI } from '@api'
export default {
  name: 'ImportHosts',
  props: {
    originHosts: {
      type: Array,
      required: true,
      default () {
        return []
      }
    },
    type: {
      type: String,
      default: 'system'
    }
  },
  data () {
    return {
      template: [
        {
          Hostname: '',
          IP: '',
          PORT: 22,
          Username: '',
          Label: '',
          'SSH Private Key': '',
          'Whether to produce machines(y/n)': '',
          'Host Detection': JSON.stringify({
            probe_type: '',
            http_probe: {
              path: '',
              port: 80,
              http_headers: [],
              timeout_second: 0,
              response_success_flag: ''
            }
          })
        }
      ],
      host: {
        provider: '',
        option: 'increment',
        msg: 'Upload Only xls/xlsx Document'
      },
      rules: {
        provider: [{ required: true, message: 'Please Select A Provider', trigger: 'blur' }]
      },
      fileList: [],
      uploadBtnDisabled: false,
      fileJson: []
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    async handleChange (file) {
      this.fileJson = []
      this.uploadBtnDisabled = true
      const data = await file.raw.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const fileJson = XLSX.utils.sheet_to_json(worksheet)
      if (fileJson.length > 1) {
        const invalidItems = []
        fileJson.forEach((element, index) => {
          if (
            !element['Hostname'] ||
            !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(element['Hostname'])
          ) {
            invalidItems.push(index + 2)
          }
        })
        if (invalidItems.length > 0) {
          this.host.msg = `The host name only supports English letters、Number、Underscore and the first character does not start with a digit <br> The First ${invalidItems.join(
            ','
          )} Line hostname does not meet requirements，Please Check`
        } else {
          this.host.msg = 'Upload Only xls/xlsx Document'
        }
      } else {
        this.host.msg = 'Template file does not have entry，Please Check'
      }
      this.fileJson = fileJson
    },
    onRemoveFile () {
      this.uploadBtnDisabled = false
      this.fileJson = []
    },
    beforeUpload (file) {
      if (
        file.type === 'application/vnd.ms-excel' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        return true
      } else {
        this.$message.error = 'Please Upload xls Or xlsx Type File'
        return false
      }
    },
    downloadTemplate () {
      const worksheet = XLSX.utils.json_to_sheet(this.template)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Zadig Host Template')
      XLSX.writeFile(workbook, 'Zadig Host Template.xlsx')
    },
    importHost () {
      return this.$refs.importHosts.validate().then(async () => {
        const fileJson = this.fileJson
        const provider = this.host.provider
        const option = this.host.option
        const result = fileJson.map(item => {
          return {
            name: item['Hostname'],
            provider: provider,
            label: item['Label'],
            ip: item.IP,
            port: item.PORT ? parseInt(item.PORT) : 22,
            is_prod: item['Whether to produce machines(y/n)'] === 'y',
            user_name: item['Username'],
            private_key: window.btoa(item['SSH Private Key']),
            probe: item['Host Detection'] ? JSON.parse(item['Host Detection']) : null
          }
        })
        const payload = {
          option: option,
          data: result
        }
        let res = {}
        if (this.type === 'project') {
          res = await importProjectHostAPI(this.projectName, payload).catch(err => {
            console.log(err)
          })
        } else {
          res = await importHostAPI('', payload).catch(err => {
            console.log(err)
          })
        }

        if (res) {
          this.host = {
            provider: '',
            option: 'increment',
            msg: 'Upload Only xls/xlsx Document'
          }
          this.$message({
            type: 'success',
            message: 'Import host information successfully'
          })
          this.$refs['file-uploader'].clearFiles()
          this.uploadBtnDisabled = false
        } else {
          return Promise.reject()
        }
      })
    }
  }
}
</script>
<style lang="less">
.import-hosts-container {
  .tip {
    margin: 15px 0;
  }

  .upload-file {
    width: 100%;

    .el-upload {
      width: 100%;
      text-align: left;
    }

    .el-upload__tip {
      line-height: 1.5;
    }

    .el-upload-list {
      .el-icon-close {
        right: 50px;
        display: inline-block;
        color: @themeColor;
      }
    }
  }
}
</style>
