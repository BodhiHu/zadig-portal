<template>
  <div class="integration-code-container">
    <!--start of edit code dialog-->
    <el-dialog title="Code Management-Edit"
               custom-class="edit-form-dialog"
               :close-on-click-modal="false"
               :visible.sync="dialogCodeEditFormVisible">
      <template>
        <el-alert v-if="codeEdit.type === 'codehub'"
                  type="info"
                  :closable="false">
          <slot>
            <span class="tips">- For specific configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       href="https://docs.koderover.com/zadig/settings/codehost/codehub/"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-if="codeEdit.type === 'gerrit'"
                  type="info"
                  :closable="false">
          <slot>
            <span class="tips">- For specific configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       href="https://docs.koderover.com/zadig/settings/codehost/gerrit/"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-else-if="codeEdit.type === 'gitlab'"
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
            <span class="tips">- For more configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/gitlab/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-else-if="codeEdit.type === 'gitee'"
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
            <span class="tips">- Please tick the application permission：projects、groups、pull_requests、hook</span>
            <span class="tips">- For more configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/gitee/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-else-if="codeEdit.type === 'github'"
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
            <span class="tips">- For more configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/github/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-else-if="codeEdit.type === 'other'"
                  type="info"
                  :closable="false">
          <slot>
            <span class="tips">- Support Standard Git Code source for the protocol</span>
            <span class="tips">- After Integration，Construct/Test templates can pull code from this code source</span>
            <span class="tips">- For more configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/others/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
      </template>
      <el-form :model="codeEdit"
               :rules="codeRules"
               status-icon
               class="mg-t32"
               label-width="140px"
               label-position="left"
               ref="codeUpdateForm">
        <el-form-item label="Code Source"
                      prop="type">
          <el-select v-model="codeEdit.type"
                     disabled>
            <el-option label="Gitlab"
                       value="gitlab"></el-option>
            <el-option label="GitHub"
                       value="github"></el-option>
            <!-- <el-option label="CodeHub"
                       value="codehub"></el-option> -->
            <el-option label="Gerrit"
                       value="gerrit"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Code source identification" prop="alias">
          <el-input v-model="codeEdit.alias" placeholder="Code source identification"></el-input>
        </el-form-item>
        <template v-if="codeEdit.type==='gitlab'||codeEdit.type==='github'">
          <el-form-item v-if="codeEdit.type==='gitlab'"
                        label="GitLab Serve URL"
                        prop="address">
            <el-input v-model="codeEdit.address"
                      placeholder="GitLab Serve URL"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :label="codeEdit.type==='gitlab'?'Application ID':'Client ID'"
                        prop="application_id">
            <el-input v-model="codeEdit.application_id"
                      :placeholder="codeEdit.type==='gitlab'?'Application ID':'Client ID'"
                      auto-complete="off"></el-input>
          </el-form-item>
          <!-- v-if dialogCodeEditFormVisibleIt's to make the little eyes close every time the pop-up window is opened -->
          <el-form-item :label="codeEdit.type==='gitlab'?'Secret':'Client Secret'"
                        prop="client_secret">
            <el-input v-model="codeEdit.client_secret"
                      show-password v-if='dialogCodeEditFormVisible'
                      type="password"
                      :placeholder="codeEdit.type==='gitlab'?'Secret':'Client Secret'"
                      auto-complete="off"></el-input>
          </el-form-item>
        </template>
        <template v-else-if="codeEdit.type==='gerrit'">
          <el-form-item label="Gerrit Serve URL"
                        prop="address">
            <el-input v-model="codeEdit.address"
                      placeholder="Gerrit Serve URL"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Username"
                        prop="username">
            <el-input v-model="codeEdit.username"
                      placeholder="Username"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Password"
                        prop="password">
            <el-input v-model="codeEdit.password"
                      placeholder="Password"
                      show-password
                      v-if='dialogCodeEditFormVisible'
                      type="password"
                      auto-complete="off"></el-input>
          </el-form-item>
        </template>
        <template v-else-if="codeEdit.type==='gitee'">
          <el-form-item label="Client ID"
                        prop="application_id">
            <el-input v-model="codeEdit.application_id"
                      placeholder="Client ID"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Client Secret"
                        prop="client_secret">
            <el-input v-model="codeEdit.client_secret"
                      show-password v-if='dialogCodeEditFormVisible'
                      type="password"
                      placeholder="Client Secret"
                      auto-complete="off"></el-input>
          </el-form-item>
        </template>
        <template v-else-if="codeEdit.type==='codehub'">
          <el-form-item label="CodeHub Serve URL"
                        prop="address">
            <el-input v-model="codeEdit.address"
                      placeholder="CodeHub Serve URL"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Area"
                        prop="region">
            <el-input v-model="codeEdit.region"
                      placeholder="Area"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :rules="{required: true,message: 'Please Fill Out Access Key',trigger: ['blur']}"
                        label="Access Key"
                        prop="application_id">
            <el-input v-model="codeEdit.application_id"
                      placeholder="Access Key"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :rules="{required: true,message: 'Please Fill Out Secret Key',trigger: ['blur']}"
                        label="Secret Key"
                        prop="client_secret">
            <el-input v-model="codeEdit.client_secret"
                      show-password v-if='dialogCodeEditFormVisible'
                      type="password"
                      placeholder="Secret Key"
                      auto-complete="off"></el-input>
          </el-form-item>

          <el-form-item :rules="{required: true,message: 'Please enter your username',trigger: ['blur']}"
                        label="Username"
                        prop="username">
            <el-input v-model="codeEdit.username"
                      placeholder="Username"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :rules="{required: true,message: 'Please fill in the password',trigger: ['blur']}"
                        label="Password"
                        prop="password">
            <el-input v-model="codeEdit.password"
                      placeholder="Password"
                      auto-complete="off"></el-input>
          </el-form-item>

        </template>
        <template v-else-if="codeEdit.type==='other'">
          <el-form-item label="Authentication Method" prop="auth_type">
            <el-select v-model="codeEdit.auth_type" filterable allow-create>
              <el-option label="SSH" value="SSH"></el-option>
              <el-option label="Access Token" value="PrivateAccessToken"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Code Source URL" prop="address" :rules="{ validator: (codeEdit.auth_type === 'SSH' ? validateSSH : validateGitURL), trigger: ['change', 'blur'] }">
            <el-input v-model="codeEdit.address" :placeholder="codeEdit.auth_type === 'SSH' ? 'git@example.com' : 'http(s)://example.com'"></el-input>
          </el-form-item>
          <el-form-item v-if="codeEdit.auth_type === 'SSH'"
                        label="SSH Key"
                        prop="ssh_key">
            <el-input v-model="codeEdit.ssh_key"
                      placeholder="SSH Key"
                      type="textarea"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="codeEdit.auth_type === 'PrivateAccessToken'"
                        label="Access Token"
                        prop="private_access_token">
            <el-input v-model="codeEdit.private_access_token"
                      placeholder="Access Token"
                      show-password
                      v-if='dialogCodeEditFormVisible'
                      type="password"
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
                   @click="updateCodeConfig">
          {{(codeEdit.type==='gerrit'||codeEdit.type==='codehub'||codeEdit.type==='other')?'Sure':'Go To Authorization'}}</el-button>
        <el-button plain
                   native-type="submit"
                   size="small"
                   @click="dialogCodeEditFormVisible = false">Cancel</el-button>
      </div>
    </el-dialog>
    <!--end of edit code dialog-->

    <!--start of add code dialog-->
    <el-dialog title="Code Management-Add To"
               custom-class="edit-form-dialog"
               :close-on-click-modal="false"
               :visible.sync="dialogCodeAddFormVisible">
      <template>
        <el-alert v-if="codeAdd.type === 'codehub'"
                  type="info"
                  :closable="false">
          <slot>
            <span class="tips">- For specific configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       href="https://docs.koderover.com/zadig/settings/codehost/codehub/"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-if="codeAdd.type === 'gerrit'"
                  type="info"
                  :closable="false">
          <slot>
            <span class="tips">- For specific configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       href="https://docs.koderover.com/zadig/settings/codehost/gerrit/"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-else-if="codeAdd.type === 'gitlab'"
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
            <span class="tips">- For more configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/gitlab/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-else-if="codeAdd.type === 'gitee'"
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
            <span class="tips">- Please tick the application permission：projects、groups、pull_requests、hook</span>
            <span class="tips">- For more configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/gitee/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-else-if="codeAdd.type === 'github'"
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
            <span class="tips">- For more configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/github/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
        <el-alert v-else-if="codeAdd.type === 'other'"
                  type="info"
                  :closable="false">
          <slot>
            <span class="tips">- Support Standard Git Code source for the protocol</span>
            <span class="tips">- After Integration，Construct/Test templates can pull code from this code source</span>
            <span class="tips">- For more configuration, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/others/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link>
            </span>
          </slot>
        </el-alert>
      </template>
      <el-form :model="codeAdd"
               :rules="codeRules"
               status-icon
               label-width="140px"
               label-position="left"
               class="mg-t32"
               ref="codeForm">
        <el-form-item label="Code Source"
                      prop="type">
          <el-select v-model="codeAdd.type" filterable allow-create>
            <el-option label="GitLab"
                       value="gitlab"></el-option>
            <el-option label="GitHub"
                       value="github"></el-option>
            <!-- <el-option label="CodeHub"
                       value="codehub"></el-option> -->
            <el-option label="Gerrit"
                       value="gerrit"></el-option>
            <el-option label="Gitee"
                       value="gitee"></el-option>
            <el-option label="Other"
                       value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Code source identification" prop="alias">
          <el-input v-model="codeAdd.alias" placeholder="Code source identification"></el-input>
        </el-form-item>
        <template v-if="codeAdd.type==='gitlab' || codeAdd.type ==='github'">
          <el-form-item v-if="codeAdd.type==='gitlab'"
                        :label="codeAdd.type==='gitlab'?'GitLab Serve URL':'Serve URL'"
                        prop="address">
            <el-input v-model="codeAdd.address"
                      :placeholder="codeAdd.type==='gitlab'?'GitLab Serve URL':'Serve URL'"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :label="codeAdd.type==='gitlab'?'Application ID':'Client ID'"
                        prop="application_id">
            <el-input v-model="codeAdd.application_id"
                      :placeholder="codeAdd.type==='gitlab'?'Application ID':'Client ID'"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :label="codeAdd.type==='gitlab'?'Secret':'Client Secret'"
                        prop="client_secret">
            <el-input v-model="codeAdd.client_secret"  show-password v-if='dialogCodeAddFormVisible'
                      type="password"
                      :placeholder="codeAdd.type==='gitlab'?'Secret':'Client Secret'"
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
        <template v-else-if="codeAdd.type==='gitee'">
          <el-form-item label="Client ID"
                        prop="application_id">
            <el-input v-model="codeAdd.application_id"
                      placeholder="Client ID"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Client Secret"
                        prop="client_secret">
            <el-input v-model="codeAdd.client_secret"
                      placeholder="Client Secret"
                      show-password v-if='dialogCodeAddFormVisible'
                      type="password"
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
                        prop="application_id">
            <el-input v-model="codeAdd.application_id"
                      placeholder="Access Key"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :rules="{required: true,message: 'Please Fill Out Secret Key',trigger: ['blur']}"
                        label="Secret Key"
                        prop="client_secret">
            <el-input v-model="codeAdd.client_secret"
                      placeholder="Secret Key"
                      show-password v-if='dialogCodeAddFormVisible'
                      type="password"
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
        <template v-else-if="codeAdd.type==='other'">
          <el-form-item label="Authentication Method" prop="auth_type">
            <el-select v-model="codeAdd.auth_type" filterable allow-create>
              <el-option label="SSH" value="SSH"></el-option>
              <el-option label="Access Token" value="PrivateAccessToken"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="codeAdd.auth_type" label="Code Source URL" prop="address" :rules="{ validator: (codeAdd.auth_type === 'SSH' ? validateSSH : validateGitURL), trigger: ['change', 'blur'] }">
            <el-input v-model="codeAdd.address" :placeholder="codeAdd.auth_type === 'SSH' ? 'git@example.com' : 'http(s)://example.com'"></el-input>
          </el-form-item>
          <el-form-item v-if="codeAdd.auth_type === 'SSH'"
                        label="SSH Key"
                        prop="ssh_key">
            <el-input v-model="codeAdd.ssh_key"
                      placeholder="SSH Key"
                      type="textarea"
                      auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="codeAdd.auth_type === 'PrivateAccessToken'"
                        label="Access Token"
                        prop="private_access_token">
            <el-input v-model="codeAdd.private_access_token"
                      placeholder="Access Token"
                      show-password v-if='dialogCodeAddFormVisible'
                      type="password"
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
          {{(codeAdd.type==='gerrit'||codeAdd.type==='codehub'||codeAdd.type==='other')?'Sure':'Go To Authorization'}}</el-button>
        <el-button plain
                   native-type="submit"
                   size="small"
                   @click="dialogCodeAddFormVisible = false">Cancel</el-button>
      </div>
    </el-dialog>
    <!--end of add code dialog-->
    <div class="tab-container">
      <div>
        <template>
          <el-alert type="info"
                    :closable="false">
            <template>
              Support integrated code source，Support GitLab、GitHub、Gerrit、Gitee Integrated，For details, please refer to
              <el-link style="font-size: 14px; vertical-align: baseline;"
                       type="primary"
                       :href="`https://docs.koderover.com/zadig/settings/codehost/gitlab/`"
                       :underline="false"
                       target="_blank">Help Documentation</el-link> 。
            </template>
          </el-alert>
        </template>
        <div class="sync-container">
          <el-button type="primary"
                     size="small"
                     @click="handleCodeAdd"
                     plain>Add To</el-button>
        </div>
        <el-table :data="code"
                  style="width: 100%;">
          <el-table-column label="Code Source">
            <template slot-scope="scope">
              <span>{{scope.row.type}}({{scope.row.alias}})</span>
            </template>
          </el-table-column>
          <el-table-column label="URL">
            <template slot-scope="scope">
              {{scope.row.address}}
            </template>
          </el-table-column>
          <el-table-column label="Authorization information">
            <template slot-scope="scope">
              <span
                    :class="scope.row.is_ready?'text-success':'text-failed'">{{scope.row.is_ready === '2'?'Authorization Succeeded':'Authorization Failed'}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Latest Update">
            <template slot-scope="scope">
              {{$utils.convertTimestamp(scope.row.updated_at)}}
            </template>
          </el-table-column>
          <el-table-column label="Enable Proxy"
                           width="100">
            <el-switch slot-scope="scope"
                       size="small"
                       v-model="scope.row.enable_proxy"
                       @change="updateRepoProxySettings(scope.row)"></el-switch>
          </el-table-column>
          <el-table-column label="Operate"
                           width="160">
            <template slot-scope="scope">
              <el-button type="primary"
                         size="mini"
                         plain
                         @click="handleCodeEdit(scope.row)">Edit</el-button>
              <el-button type="danger"
                         size="mini"
                         @click="handleCodeDelete(scope.row)"
                         plain>Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getCodeProviderAPI, deleteCodeSourceAPI, updateCodeSourceAPI, createCodeSourceAPI, getProxyConfigAPI
} from '@api'
const validateGitURL = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please Enter Service URL'))
  } else {
    const reg = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/
    if (!reg.test(value)) {
      callback(new Error('Please Enter The Correct URL，Include Agreement'))
    } else {
      callback()
    }
  }
}
const validateSSH = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please Enter Service URL'))
  } else {
    const reg = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z0-9]{2,14}(:[1-9]\d{0,4})?/
    if (!reg.test(value)) {
      callback(new Error('Please enter the correct format'))
    } else {
      callback()
    }
  }
}
export default {
  data () {
    return {
      proxyInfo: {
        id: '',
        type: '',
        address: '',
        port: null,
        username: '',
        password: '',
        enable_repo_proxy: false,
        enable_application_proxy: false
      },
      code: [],
      dialogCodeAddFormVisible: false,
      dialogCodeEditFormVisible: false,
      codeEdit: {
        name: '',
        region: '',
        type: '',
        address: '',
        access_token: '',
        application_id: '',
        client_secret: '',
        enable_proxy: false,
        alias: '',
        auth_type: ''
      },
      codeAdd: {
        name: '',
        region: '',
        type: 'gitlab',
        address: '',
        access_token: '',
        application_id: '',
        client_secret: '',
        alias: '',
        auth_type: ''
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
        region: {
          required: true,
          message: 'Please Fill In The Area',
          trigger: ['blur']
        },
        access_token: {
          required: true,
          message: 'Please Fill Out Access Token',
          trigger: ['blur']
        },
        application_id: {
          required: true,
          message: 'Please Fill Out Id',
          trigger: ['blur']
        },
        client_secret: {
          required: true,
          message: 'Please Fill Out Secret',
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
        },
        alias: {
          required: true,
          message: 'Please fill in the code source ID',
          trigger: ['blur']
        },
        auth_type: {
          required: true,
          message: 'Please select an authentication method',
          trigger: ['blur', 'change']
        }
      },
      validateSSH,
      validateGitURL
    }
  },
  methods: {
    updateRepoProxySettings (row) {
      if (!this.proxyInfo.id || this.proxyInfo.type === 'no') {
        row.enable_proxy = false
        this.$message.error('Proxy Not Configured，Please Go First「System Configuration」->「Proxy Configuration」Configure The Proxy！')
        return
      }
      const codehostID = row.id
      updateCodeSourceAPI(codehostID, row).then((res) => {
        this.$message({
          message: row.enable_proxy ? 'Proxy Enabled' : 'Proxy Turned Off',
          type: 'success'
        })
      }).catch(err => {
        row.enable_proxy = !row.enable_proxy
        this.$message.error(`Proxy modification failed：${err}`)
      })
    },
    handleCodeAdd () {
      this.dialogCodeAddFormVisible = true
    },
    handleCodeDelete (row) {
      this.$confirm(`Are you sure you want to delete this code source？`, 'Confirm', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteCodeSourceAPI(row.id).then((res) => {
          this.getCodeConfig()
          this.$message({
            message: 'Code source deleted successfully',
            type: 'success'
          })
        })
      })
    },
    handleCodeEdit (row) {
      this.dialogCodeEditFormVisible = true
      this.codeEdit = this.$utils.cloneObj(row)
    },
    handleCodeCancel () {
      if (this.$refs.codeForm) {
        this.$refs.codeForm.resetFields()
      } else if (this.$refs.codeUpdateForm) {
        this.$refs.codeUpdateForm.resetFields()
      }
      this.dialogCodeEditFormVisible = false
      this.dialogCodeAddFormVisible = false
    },
    clearValidate (ref) {
      this.$refs[ref].clearValidate()
    },
    createCodeConfig () {
      this.$refs.codeForm.validate((valid) => {
        if (valid) {
          const payload = this.codeAdd
          const redirectUrl = window.location.href.split('?')[0]
          const provider = this.codeAdd.type
          if (provider === 'github') {
            payload.address = 'https://github.com'
          } else if (provider === 'gitee') {
            payload.address = 'https://gitee.com'
          }
          createCodeSourceAPI(payload).then((res) => {
            const codehostId = res.id
            this.getCodeConfig()
            this.$message({
              message: 'Code source added successfully',
              type: 'success'
            })
            if (payload.type === 'gitlab' || payload.type === 'gitee' || payload.type === 'github') {
              this.goToCodeHostAuth(codehostId, redirectUrl)
            }
            this.handleCodeCancel()
          })
        } else {
          return false
        }
      })
    },
    updateCodeConfig () {
      this.$refs.codeUpdateForm.validate((valid) => {
        if (valid) {
          const payload = this.codeEdit
          const codehostId = this.codeEdit.id
          const redirectUrl = window.location.href.split('?')[0]
          const provider = this.codeEdit.type
          if (provider === 'github') {
            payload.address = 'https://github.com'
          } else if (provider === 'gitee') {
            payload.address = 'https://gitee.com'
          }
          updateCodeSourceAPI(codehostId, payload).then((res) => {
            this.getCodeConfig()
            if (payload.type === 'gitlab' || payload.type === 'gitee' || payload.type === 'github') {
              this.$message({
                message: 'Code source modified successfully，Going To Authorize',
                type: 'success'
              })
              this.goToCodeHostAuth(codehostId, redirectUrl)
            } else {
              this.handleCodeCancel()
              this.$message({
                message: 'Code source modified successfully',
                type: 'success'
              })
            }
          })
        } else {
          return false
        }
      })
    },
    getCodeConfig () {
      const key = this.$utils.rsaEncrypt()
      getCodeProviderAPI(key).then((res) => {
        res.forEach(item => {
          item.client_secret = this.$utils.aesDecrypt(item.client_secret)
          if (item.password) {
            item.password = this.$utils.aesDecrypt(item.password)
          }
          if (item.private_access_token) {
            item.private_access_token = this.$utils.aesDecrypt(item.private_access_token)
          }
          if (item.ssh_key) {
            item.ssh_key = this.$utils.aesDecrypt(item.ssh_key)
          }
        })
        this.code = res
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
  watch: {
    'codeAdd.type' (val) {
      this.$refs.codeForm.clearValidate()
    }
  },
  activated () {
    this.getProxyConfig()
    this.getCodeConfig()
  }
}
</script>

<style lang="less">
.integration-code-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .tab-container {
    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;

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
    }
  }

  .text-success {
    color: rgb(82, 196, 26);
  }

  .text-failed {
    color: #ff1949;
  }

  .edit-form-dialog {
    width: 580px;

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
}
</style>
