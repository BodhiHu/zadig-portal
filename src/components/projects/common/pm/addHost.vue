<template>
  <div>
    <el-alert type="warning" :closable="false">
      <template>
        Host resources are used for host service resource configuration
        <br />The specified host port is used for the host TCP Exploration And SSH Log In
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
    <el-form ref="host" :rules="rules" label-width="120px" label-position="left" :model="host" class="host-form">
      <el-form-item label="Hostname" prop="name">
        <el-input size="small" v-model="host.name" placeholder="Please Enter A Hostname"></el-input>
      </el-form-item>
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
      <el-form-item label="Username" prop="user_name">
        <el-input size="small" v-model="host.user_name" placeholder="Please Enter User Name"></el-input>
      </el-form-item>
      <el-form-item label="Host Address" prop="ip">
        <el-row :gutter="10" style="margin-left: 0;" class="ip-host-row">
          <el-col :span="16" style="padding-left: 0;">
            <el-form-item prop="ip" required>
              <el-input size="small" v-model.trim="host.ip" placeholder="Please enter host address"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="1" style="text-align: center;">:</el-col>
          <el-col :span="7">
            <el-form-item prop="port">
              <el-input size="small" v-model.number="host.port" placeholder="Please Enter The Port"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="Label" prop="label">
        <el-input size="small" v-model="host.label" placeholder="Please Enter A Label"></el-input>
      </el-form-item>
      <el-form-item label="Whether To Produce" prop="is_prod">
        <el-radio-group v-model="host.is_prod">
          <el-radio :label="true">Yes</el-radio>
          <el-radio :label="false">No</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Private Key" prop="private_key">
        <el-input size="small" type="textarea" v-model="host.private_key" placeholder="Please Enter Private Key"></el-input>
      </el-form-item>
      <div>
        <el-button type="text" @click="showAdvanced = !showAdvanced">
          Advanced Settings
          <i :class="[showAdvanced ? 'el-icon-arrow-down' : 'el-icon-arrow-right']"></i>
        </el-button>
      </div>
      <div v-show="showAdvanced" class="advanced-config-content">
        <div class="advanced-title">Host Detection</div>
        <el-form-item label="Protocol">
          <el-select v-model="host.probe.probe_type" placeholder="Choose An Agreement" size="small">
            <el-option label="TCP" value="tcp"></el-option>
            <el-option label="HTTP" value="http"></el-option>
            <el-option label="HTTPS" value="https"></el-option>
          </el-select>
          <span v-if="host.probe.probe_type === 'tcp'">By default, the configured host address is used as the probe address.</span>
        </el-form-item>
        <div v-show="host.probe.probe_type !== 'tcp'">
          <el-form-item label="Port" prop="probe.http_probe.port">
            <el-input v-model.number="host.probe.http_probe.port" size="small" placeholder="1 ~ 65535"></el-input>
          </el-form-item>
          <el-form-item label="Path">
            <el-input v-model="host.probe.http_probe.path" placeholder="example.com/healthz" size="small"></el-input>
          </el-form-item>
          <el-form-item label="Request Header">
            <el-button
              v-if="!host.probe.http_probe.http_headers.length"
              type="text"
              icon="el-icon-plus"
              @click="actionHttpHeaders('add')"
            >Add To</el-button>
            <div v-for="(header, index) in host.probe.http_probe.http_headers" :key="index">
              <el-input v-model="header.name" size="small" placeholder="Header Name"></el-input>
              <el-input v-model="header.value" size="small" placeholder="Header Value"></el-input>
              <el-button type="text" icon="el-icon-minus" @click="actionHttpHeaders('delete', index)"></el-button>
              <el-button
                v-if="host.probe.http_probe.http_headers.length-1 === index"
                type="text"
                icon="el-icon-plus"
                @click="actionHttpHeaders('add')"
              ></el-button>
            </div>
          </el-form-item>
          <el-form-item label="Response Timed Out" prop="probe.http_probe.timeout_second">
            <el-input v-model.number="host.probe.http_probe.timeout_second" size="small" style="margin-right: 5px;"></el-input>Second
          </el-form-item>
          <el-form-item label="Host Online Conditions">
            <div>
              <el-checkbox :value="true" disabled></el-checkbox>
              <span style="display: inline-block; margin-left: 5px;">The Return Code Is 2xx</span>
            </div>
            <div>
              <el-checkbox
                v-model="host.probe.http_probe.response_flag"
                @change="(value) => { if(!value){host.probe.http_probe.response_success_flag = ''}}"
              ></el-checkbox>
              <span style="display: inline-block; margin-left: 5px;">The response structure contains</span>
              <el-input
                v-model="host.probe.http_probe.response_success_flag"
                size="small"
                :disabled="!host.probe.http_probe.response_flag"
                placeholder="String"
              ></el-input>
            </div>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import {
  createHostAPI,
  createProjectHostAPI,
  updateHostAPI,
  updateProjectHostAPI
} from '@api'
import { cloneDeep } from 'lodash'
const shellKeywords = [
  'alias',
  'bg',
  'bind',
  'break',
  'builtin',
  'caller',
  'case',
  'cd',
  'command',
  'compgen',
  'complete',
  'continue',
  'declare',
  'dirs',
  'disown',
  'echo',
  'enable',
  'eval',
  'exec',
  'exit',
  'export',
  'false',
  'fc',
  'fg',
  'for',
  'function',
  'getopts',
  'hash',
  'help',
  'history',
  'if',
  'then',
  'elif',
  'else',
  'jobs',
  'kill',
  'let',
  'local',
  'logout',
  'popd',
  'printf',
  'pushd',
  'pwd',
  'read',
  'readonly',
  'return',
  'select',
  'set',
  'shift',
  'shopt',
  'source',
  'suspend',
  'test',
  'time',
  'times',
  'trap',
  'true',
  'type',
  'typeset',
  'ulimit',
  'umask',
  'unalias',
  'unset',
  'until',
  'wait',
  'while'
]
export default {
  props: {
    host: {
      type: Object,
      default () {
        return {
          name: '',
          provider: null,
          label: '',
          ip: '',
          port: 22,
          is_prod: false,
          user_name: '',
          private_key: '',
          probe: {
            probe_type: 'tcp',
            http_probe: {
              path: '',
              port: 22, // 1~65535
              timeout_second: 1, // 1~10
              response_flag: false, // delete
              response_success_flag: '',
              http_headers: []
            }
          }
        }
      }
    }
  },
  data () {
    const validateKey = (rule, value, callback) => {
      if (!value) {
        callback(new Error('Please Enter A Hostname'))
      } else if (shellKeywords.includes(value)) {
        callback(new Error('Hostname Not Supported bash Keywords'))
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
        callback(
          new Error(
            'The host name only supports English letters、Number、Underscore and the first character does not start with a digit'
          )
        )
      } else {
        callback()
      }
    }
    return {
      showAdvanced: false,
      rules: {
        name: [
          {
            type: 'string',
            required: true,
            trigger: 'change',
            validator: validateKey
          }
        ],
        provider: [
          { required: true, message: 'Please Select A Provider', trigger: 'blur' }
        ],
        label: [
          {
            type: 'string',
            required: false,
            message: 'Please Enter Host Tag',
            trigger: 'change'
          }
        ],
        user_name: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter User Name'
          }
        ],
        ip: [
          {
            type: 'string',
            required: true,
            message: 'Please enter host address'
          }
        ],
        port: [
          {
            type: 'number',
            required: true,
            message: 'Please Enter The Port'
          }
        ],
        private_key: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter Private Key'
          }
        ],
        'probe.http_probe.port': {
          required: true,
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error('Please Enter The Port'))
            } else if (isNaN(value) || value > 65535 || value < 1) {
              callback(new Error('Port Range 1 ~ 65535'))
            } else {
              callback()
            }
          }
        },
        'probe.http_probe.timeout_second': {
          required: true,
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error('Please Enter A Timeout'))
            } else if (isNaN(value) || value > 10 || value < 1) {
              callback(new Error('Overtime Time 1 ~ 10s'))
            } else {
              callback()
            }
          }
        }
      }
    }
  },
  methods: {
    actionHttpHeaders (action, index) {
      if (action === 'add') {
        this.host.probe.http_probe.http_headers.push({
          name: '',
          value: ''
        })
      } else if (action === 'delete') {
        this.host.probe.http_probe.http_headers.splice(index, 1)
      }
    },
    saveHost () {
      return this.$refs.host.validate().then(async () => {
        const payload = cloneDeep(this.host)
        payload.private_key = window.btoa(payload.private_key)
        const projectName = this.$route.params.project_name
        if (projectName) {
          payload.project_name = projectName
        }
        if (payload.probe.probe_type === 'tcp') {
          delete payload.probe.http_probe
        } else {
          delete payload.probe.http_probe.response_flag
        }
        let res = {}
        if (projectName) {
          res = await createProjectHostAPI(projectName, payload).catch(err => {
            console.log(err)
          })
        } else {
          res = await createHostAPI(payload).catch(err => {
            console.log(err)
          })
        }
        this.showAdvanced = false
        if (res) {
          this.$message({
            type: 'success',
            message: 'Add host information successfully'
          })
          this.resetFields()
        } else {
          return Promise.reject()
        }
      })
    },
    updateHost () {
      return this.$refs.host.validate().then(async () => {
        const id = this.host.id
        const payload = cloneDeep(this.host)
        const projectName = this.$route.params.project_name
        if (projectName) {
          payload.project_name = projectName
        }
        payload.private_key = window.btoa(payload.private_key)
        delete payload.origin_private_key
        if (payload.probe.probe_type === 'tcp') {
          delete payload.probe.http_probe
        } else {
          delete payload.probe.http_probe.response_flag
        }
        let res = {}
        if (projectName) {
          res = await updateProjectHostAPI(id, projectName, payload).catch(
            err => {
              console.log(err)
            }
          )
        } else {
          res = await updateHostAPI(id, payload).catch(err => {
            console.log(err)
          })
        }
        this.showAdvanced = false
        if (res) {
          this.$message({
            type: 'success',
            message: 'Update host information successfully'
          })
          this.resetFields()
        } else {
          return Promise.reject()
        }
      })
    },
    resetFields () {
      this.$refs.host.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.host-form {
  padding: 30px 20px;

  .ip-host-row {
    .el-form-item {
      margin-bottom: 0;
    }
  }

  .advanced-config-content {
    .advanced-title {
      margin: 10px 0 8px;
      font-weight: 500;
    }

    /deep/.el-input {
      width: 40%;
    }

    /deep/.el-select {
      width: 40%;

      .el-input {
        width: 100%;
      }
    }
  }
}
</style>
