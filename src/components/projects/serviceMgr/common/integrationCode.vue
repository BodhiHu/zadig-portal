<template>
  <div class="add-code-container">
    <el-alert title="It is detected that the code source has not been integrated, please integrate the code source before adding the build operation"
              :closable="false"
              type="warning">
    </el-alert>
    <el-alert v-if="codeAdd.type === 'codehub'"
              type="info"
              :closable="false">
      <slot>
        <span class="tips">Click
          <el-link style="font-size: 14px; vertical-align: baseline;"
                   type="primary"
                   href="https://support.huaweicloud.com/devg-apisign/api-sign-provide-aksk.html"
                   :underline="false"
                   target="_blank">Help</el-link> See How To Get Access Key And Secret Key
        </span>
        <span class="tips">Click
          <el-link style="font-size: 14px; vertical-align: baseline;"
                   type="primary"
                   href="https://support.huaweicloud.com/usermanual-codehub/codehub_ug_8003.html"
                   :underline="false"
                   target="_blank">Help</el-link> See how to get username and password
        </span>
      </slot>
    </el-alert>
    <el-alert v-else
              type="info"
              :closable="false">
      <slot>
        <span class="tips">{{`- Please fill in the callback address of application authorization:`}}</span>
        <span class="tips code-line">
          {{`${$utils.getOrigin()}/api/directory/codehosts/callback`}}
          <span v-clipboard:copy="`${$utils.getOrigin()}/api/directory/codehosts/callback`"
                v-clipboard:success="copyCommandSuccess"
                v-clipboard:error="copyCommandError"
                class="el-icon-document-copy copy"></span>
        </span>
        <span class="tips">- Please tick the application permission：api、read_user、read_repository</span>
        <span class="tips">- Other configurations can be clicked
          <el-link style="font-size: 13px;"
                   type="primary"
                   :href="`https://docs.koderover.com/zadig/settings/codehost/gitlab/`"
                   :underline="false"
                   target="_blank">Help</el-link> View sample configuration
        </span>
      </slot>
    </el-alert>
    <el-form :model="codeAdd"
             :rules="codeRules"
             status-icon
             label-position="top"
             ref="codeForm">
      <el-form-item label="Code Source"
                    prop="type">
        <el-select style="width: 100%;"
                   v-model="codeAdd.type">
          <el-option label="GitLab"
                     value="gitlab"></el-option>
          <el-option label="GitHub"
                     value="github"></el-option>
          <el-option label="CodeHub"
                     value="codehub"></el-option>
          <el-option label="Gerrit"
                     value="gerrit"></el-option>
        </el-select>
      </el-form-item>
      <template v-if="codeAdd.type==='gitlab'||codeAdd.type==='github'">
        <el-form-item v-if="codeAdd.type==='gitlab'"
                      label="GitLab Serve URL"
                      prop="address">
          <el-input v-model="codeAdd.address"
                    placeholder="GitLab Serve URL"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="codeAdd.type==='gitlab'?'Application ID':'Client ID'"
                      prop="applicationId">
          <el-input v-model="codeAdd.applicationId"
                    :placeholder="codeAdd.type==='gitlab'?'Application ID':'Client ID'"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="codeAdd.type==='gitlab'?'Secret':'Client Secret'"
                      prop="clientSecret">
          <el-input v-model="codeAdd.clientSecret"
                    :placeholder="codeAdd.type==='gitlab'?'Secret':'Client Secret'"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="codeAdd.type==='github'"
                      label="Organization"
                      prop="namespace">
          <el-input v-model="codeAdd.namespace"
                    placeholder="Organization"
                    auto-complete="off"></el-input>
        </el-form-item>
      </template>
      <template v-else-if="codeAdd.type==='gerrit'">
        <el-form-item label="Gerrit Serve URL"
                      prop="address">
          <el-input v-model="codeAdd.address"
                    placeholder="Gerrit Serve URL"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Username"
                      prop="username">
          <el-input v-model="codeAdd.username"
                    placeholder="Username"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Password"
                      prop="password">
          <el-input v-model="codeAdd.password"
                    placeholder="Password"
                    auto-complete="off"></el-input>
        </el-form-item>
      </template>
      <template v-else-if="codeAdd.type==='codehub'">
        <el-form-item label="CodeHub Serve URL"
                      prop="address">
          <el-input v-model="codeAdd.address"
                    placeholder="CodeHub Serve URL"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Area"
                      prop="region">
          <el-input v-model="codeAdd.region"
                    placeholder="Area"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :rules="{required: true,message: 'Please Fill Out Access Key',trigger: ['blur']}"
                      label="Access Key"
                      prop="applicationId">
          <el-input v-model="codeAdd.applicationId"
                    placeholder="Access Key"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :rules="{required: true,message: 'Please Fill Out Secret Key',trigger: ['blur']}"
                      label="Secret Key"
                      prop="clientSecret">
          <el-input v-model="codeAdd.clientSecret"
                    placeholder="Secret Key"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :rules="{required: true,message: 'Please enter your username',trigger: ['blur']}"
                      label="Username"
                      prop="username">
          <el-input v-model="codeAdd.username"
                    placeholder="Username"
                    auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :rules="{required: true,message: 'Please fill in the password',trigger: ['blur']}"
                      label="Password"
                      prop="password">
          <el-input v-model="codeAdd.password"
                    placeholder="Password"
                    auto-complete="off"></el-input>
        </el-form-item>

      </template>
    </el-form>
    <div slot="footer"
         class="dialog-footer">
      <el-button type="primary"
                 native-type="submit"
                 size="small"
                 class="start-create"
                 @click="createCodeConfig">
        {{(codeAdd.type==='gerrit'||codeAdd.type==='codehub')?'Sure':'Go To Authorization'}}</el-button>
      <el-button plain
                 native-type="submit"
                 size="small"
                 @click="cancel">Cancel</el-button>
    </div>
  </div>
</template>
<script>
import {
  createCodeSourceAPI
} from '@api'
const validateGitURL = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please Enter Service URL'))
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
    return {
      codeAdd: {
        name: '',
        namespace: '',
        region: '',
        type: 'gitlab',
        address: '',
        accessToken: '',
        applicationId: '',
        clientSecret: ''
      },
      codeRules: {
        type: {
          required: true,
          message: 'Please select a code source type',
          trigger: ['blur']
        },
        address: [{
          type: 'url',
          message: 'Please Enter The Correct URL，Include Agreement',
          trigger: ['blur', 'change']
        }, {
          required: true,
          trigger: 'change',
          validator: validateGitURL
        }],
        accessToken: {
          required: true,
          message: 'Please Fill Out Access Token',
          trigger: ['blur']
        },
        applicationId: {
          required: true,
          message: 'Please Fill Out Id',
          trigger: ['blur']
        },
        clientSecret: {
          required: true,
          message: 'Please Fill Out Secret',
          trigger: ['blur']
        },
        region: {
          required: true,
          message: 'Please Fill In The Area',
          trigger: ['blur']
        },
        namespace: {
          required: true,
          message: 'Please Fill Out Org',
          trigger: ['blur']
        },
        username: {
          required: true,
          message: 'Please Fill Out Username',
          trigger: ['blur']
        },
        password: {
          required: true,
          message: 'Please Fill Out Password',
          trigger: ['blur']
        }
      }
    }
  },
  methods: {
    clearValidate (ref) {
      this.$refs[ref].clearValidate()
    },
    cancel () {
      this.$emit('cancel', true)
    },
    createCodeConfig () {
      this.$refs.codeForm.validate((valid) => {
        if (valid) {
          const payload = this.codeAdd
          const redirectUrl = window.location.href.split('?')[0]
          const provider = this.codeAdd.type
          if (provider === 'github') {
            payload.address = 'https://github.com'
          }
          createCodeSourceAPI(payload).then((res) => {
            const codehostId = res.id
            this.$message({
              message: 'Code source added successfully',
              type: 'success'
            })
            if (payload.type === 'gitlab' || payload.type === 'github') {
              this.goToCodeHostAuth(codehostId, redirectUrl)
            }
            this.handleCodeCancel()
          })
        } else {
          return false
        }
      })
    },
    goToCodeHostAuth (codehostId, redirectUrl) {
      window.location.href = `/api/v1/codehosts/${codehostId}/auth?redirect_url=${redirectUrl}`
    },
    copyCommandSuccess (event) {
      this.$message({
        message: 'Address successfully copied to clipboard',
        type: 'success'
      })
    },
    copyCommandError (event) {
      this.$message({
        message: 'Address Copy Failed',
        type: 'error'
      })
    }
  },
  watch: {
    'codeAdd.type' (val) {
      this.$refs.codeForm.clearValidate()
    }
  }
}
</script>
<style lang="less">
.add-code-container {
  padding: 10px 15px;
  font-size: 13px;

  .tips {
    display: block;

    &.code-line {
      display: inline-block;
      padding-left: 10px;
      color: #ecf0f1;
      font-size: 14px;
      word-wrap: break-word;
      word-break: break-all;
      background-color: #334851;
      border-radius: 2px;

      .copy {
        font-size: 16px;
        cursor: pointer;

        &:hover {
          color: @themeColor;
        }
      }
    }
  }
}
</style>
