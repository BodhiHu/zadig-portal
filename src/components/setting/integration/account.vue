<template>
  <div class="integration-account-container">
    <el-dialog :title="'Account system management-'+(userAccount.mode === 'add'?'Add To':'Edit')" :close-on-click-modal="false" custom-class="user-form-dialog" :visible.sync="dialogUserAccountFormVisible">
      <el-form class="mg-t32" :model="userAccount" @submit.native.prevent :rules="userAccountRules" status-icon ref="userAccountForm" label-position="left" label-width="120px">
        <el-form-item label="Account System Type" prop="type">
          <el-select v-model="userAccount.name" @change="clearValidate()" :disabled="userAccount.mode ==='edit'">
            <el-option label="Microsoft Active Directory" value="Microsoft Active Directory"></el-option>
            <el-option label="OpenLDAP" value="OpenLDAP"></el-option>
            <el-option label="GitHub" value="GitHub"></el-option>
            <el-option label="OAuth" value="OAuth"></el-option>
            <el-option label="Customize" value="custom"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template v-if="userAccount.name ==='GitHub'">
        <el-form
          :model="userAccountGitHub.config"
          @submit.native.prevent
          :rules="userAccountGitHubRules"
          ref="userAccountGitHubForm"
          label-position="left"
          label-width="120px"
        >
          <el-alert type="info" :closable="false" style="margin-bottom: 15px;">
            <slot>
              <span class="tips">{{`Authorization Callback URL Please Fill Out`}}</span>
              <span class="tips code-line">
                {{`${$utils.getOrigin()}/dex/callback`}}
                <span
                  v-clipboard:copy="`${$utils.getOrigin()}/dex/callback`"
                  v-clipboard:success="copyCommandSuccess"
                  v-clipboard:error="copyCommandError"
                  class="el-icon-copy-document copy"
                ></span>
              </span>
            </slot>
          </el-alert>
          <el-form-item label="Client ID" prop="clientID">
            <el-input
              v-model="userAccountGitHub.config.clientID"
              placeholder="Enter OAuth App Client ID"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Client Secret" prop="clientSecret">
            <el-input
              v-model="userAccountGitHub.config.clientSecret"
              placeholder="Enter OAuth App Client Secret"
              autofocus
              show-password
              type="password"
              clearable
              v-if="dialogUserAccountFormVisible"
              auto-complete="off"
            ></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="userAccount.name ==='Microsoft Active Directory'">
        <el-form
          :model="userAccountAD.config"
          @submit.native.prevent
          :rules="userAccountADRules"
          ref="userAccountADForm"
          label-width="185px"
          label-position="left"
        >
          <h4>Basic Configuration</h4>
          <el-form-item label="Host Address" prop="addr">
            <el-col :span="14">
              <el-form-item prop="addr">
                <el-input v-model="userAccountAD.config.addr" placeholder="AD Address" autofocus clearable auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col style="text-align: center;" :span="1">:</el-col>
            <el-col :span="5">
              <el-form-item prop="port">
                <el-input v-model="userAccountAD.config.port" placeholder="Port" autofocus clearable auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="Administrator Account" prop="bindDN">
            <el-input
              v-model="userAccountAD.config.bindDN"
              placeholder="AD Administrator，Example：cn=user,dc=domain,dc=name"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Administrator Password" prop="bindPW">
            <el-input v-model="userAccountAD.config.bindPW"   show-password v-if="dialogUserAccountFormVisible && userAccount.name ==='Microsoft Active Directory'"
                      type="password" placeholder="Administrator Password" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item prop="startTLS" label="Use SSL">
            <el-checkbox v-model="userAccountAD.config.startTLS"></el-checkbox>
          </el-form-item>
          <h4>User Rules</h4>
          <el-form-item label="Base DN" prop="userSearch.baseDN">
            <el-input
              v-model="userAccountAD.config.userSearch.baseDN"
              placeholder="Search user from root node，E G：cn=users,dc=example.com,dc=com"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="User Filter" prop="userSearch.filter">
            <el-input v-model="userAccountAD.config.userSearch.filter" placeholder="userSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Username Property（For Login）" prop="userSearch.username">
            <el-input v-model="userAccountAD.config.userSearch.username" placeholder="cn" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="User Nickname Attribute" prop="userSearch.nameAttr">
            <el-input v-model="userAccountAD.config.userSearch.nameAttr" label="User Mailbox" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="User Mailbox Properties" prop="userSearch.emailAttr">
            <el-input v-model="userAccountAD.config.userSearch.emailAttr" label="User Mailbox" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <h4>Group Rules</h4>
          <el-form-item label="Group Basis DN" prop="groupSearch.baseDN">
            <el-input
              v-model="userAccountAD.config.groupSearch.baseDN"
              placeholder="Search for user groups from root node，E G：cn=group,dc=example.com,dc=com"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Group Filter" prop="groupSearch.filter">
            <el-input v-model="userAccountAD.config.groupSearch.filter" placeholder="groupSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <!-- todo userMatchers: -->
          <el-form-item label="Group Name Attribute" prop="groupSearch.nameAttr">
            <el-input v-model="userAccountAD.config.groupSearch.nameAttr" placeholder="groupSearch.nameAttr" autofocus auto-complete="off"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="userAccount.name ==='OpenLDAP'">
        <el-form
          :model="userAccountLDAP.config"
          @submit.native.prevent
          :rules="userAccountLDAPRules"
          ref="userAccountLDAPForm"
          label-width="185px"
          label-position="left"
        >
          <h4>Basic Configuration</h4>
          <el-form-item label="Host Address" prop="addr">
            <el-col :span="14">
              <el-form-item prop="addr">
                <el-input v-model="userAccountLDAP.config.addr" placeholder="LDAP Address" autofocus clearable auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col style="text-align: center;" :span="1">:</el-col>
            <el-col :span="5">
              <el-form-item prop="port">
                <el-input v-model="userAccountLDAP.config.port" placeholder="Port" autofocus clearable auto-complete="off"></el-input>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item label="Administrator Account" prop="bindDN">
            <el-input
              v-model="userAccountLDAP.config.bindDN"
              placeholder="LDAP Administrator，Example：cn=user,dc=domain,dc=name"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Administrator Password" prop="bindPW">
            <el-input v-model="userAccountLDAP.config.bindPW"  show-password v-if="dialogUserAccountFormVisible && userAccount.name ==='OpenLDAP'"
                      type="password" placeholder="Administrator Password" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item prop="startTLS" label="Use SSL">
            <el-checkbox v-model="userAccountLDAP.config.startTLS"></el-checkbox>
          </el-form-item>
          <h4>User Rules</h4>
          <el-form-item label="Base DN" prop="userSearch.baseDN">
            <el-input
              v-model="userAccountLDAP.config.userSearch.baseDN"
              placeholder="Search user from root node，E G：cn=users,dc=example.com,dc=com"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="User Filter" prop="userSearch.filter">
            <el-input v-model="userAccountLDAP.config.userSearch.filter" placeholder="userSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Username Property（For Login）" prop="userSearch.username">
            <el-input v-model="userAccountLDAP.config.userSearch.username" placeholder="cn" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="User Nickname Attribute" prop="userSearch.nameAttr">
            <el-input v-model="userAccountLDAP.config.userSearch.nameAttr" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="User Mailbox Properties" prop="userSearch.emailAttr">
            <el-input v-model="userAccountLDAP.config.userSearch.emailAttr" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <h4>Group Rules</h4>
          <el-form-item label="Group Basis DN" prop="groupSearch.baseDN">
            <el-input
              v-model="userAccountLDAP.config.groupSearch.baseDN"
              placeholder="Search for user groups from root node，E G：cn=group,dc=example.com,dc=com"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Group Filter" prop="groupSearch.filter">
            <el-input v-model="userAccountLDAP.config.groupSearch.filter" placeholder="groupSearch.filter" autofocus auto-complete="off"></el-input>
          </el-form-item>
          <!-- todo userMatchers: -->
          <el-form-item label="Group Name Attribute" prop="groupSearch.nameAttr">
            <el-input
              v-model="userAccountLDAP.config.groupSearch.nameAttr"
              placeholder="groupSearch.nameAttr"
              autofocus
              auto-complete="off"
            ></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="userAccount.name ==='OAuth'">
        <el-form
          :model="userAccountOAuth.config"
          @submit.native.prevent
          :rules="userAccountOAuthRules"
          ref="userAccountOAuthForm"
          label-width="185px"
          label-position="left"
        >
          <el-alert type="info" :closable="false" style="margin-bottom: 15px;">
            <slot>
              <span class="tips">{{`Authorization Callback URL Please Fill Out`}}</span>
              <span class="tips code-line">
                {{`${$utils.getOrigin()}/dex/callback`}}
                <span
                  v-clipboard:copy="`${$utils.getOrigin()}/dex/callback`"
                  v-clipboard:success="copyCommandSuccess"
                  v-clipboard:error="copyCommandError"
                  class="el-icon-copy-document copy"
                ></span>
              </span>
            </slot>
          </el-alert>
          <el-form-item label="Client ID" prop="clientID">
            <el-input v-model="userAccountOAuth.config.clientID" placeholder="Enter OAuth Client ID" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Client Secret" prop="clientSecret">
            <el-input
              v-if="dialogUserAccountFormVisible"
              v-model="userAccountOAuth.config.clientSecret"
              show-password
              type="password"
              placeholder="Enter OAuth Client Secret"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Authorization URL" prop="authorizationURL">
            <el-input
              v-model="userAccountOAuth.config.authorizationURL"
              placeholder="Enter Authorization URL"
              autofocus
              clearable
              auto-complete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="Token URL" prop="tokenURL">
            <el-input v-model="userAccountOAuth.config.tokenURL" placeholder="Enter Token URL" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="User Info URL" prop="userInfoURL">
            <el-input v-model="userAccountOAuth.config.userInfoURL" placeholder="User Info URL" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Username Property（For Login）" prop="userIDKey">
            <el-input v-model="userAccountOAuth.config.userIDKey" placeholder="user_id" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="User Nickname Attribute" prop="claimMapping.userNameKey">
            <el-input v-model="userAccountOAuth.config.claimMapping.userNameKey" placeholder="user_name" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="User Mailbox Properties" prop="claimMapping.emailKey">
            <el-input v-model="userAccountOAuth.config.claimMapping.emailKey" placeholder="email" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Scopes" prop="scopes">
            <el-select v-model="userAccountOAuth.config.scopes"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="Please Enter Scopes">
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="userAccount.name ==='custom'">
        <el-form
          :model="userAccountCustom"
          @submit.native.prevent
          :rules="userAccountCustomRules"
          ref="userAccountCustomForm"
          label-position="left"
          label-width="140px"
        >
          <el-form-item label="Account System Type" prop="type">
            <el-input v-model="userAccountCustom.type" :disabled="userAccount.mode ==='edit'" placeholder="Enter custom account system type" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Account System Name" prop="name">
            <el-input v-model="userAccountCustom.name" placeholder="Enter the account system name" autofocus clearable auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="YAML Configure" prop="yaml">
            <span slot="label">
              YAML Configure
              <HelpLink :inline="true" :keyword="{location:'Account System',key:'custom'}" />
            </span>
          </el-form-item>
        </el-form>
        <div class="yaml-editor">
          <codemirror class="codemirror" ref="yamlEditor" v-model="userAccountCustom.yaml" :options="editorOptions"></codemirror>
        </div>
      </template>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-if="userAccount.mode==='add'"
          :disabled="userAccount.name === ''"
          type="primary"
          native-type="submit"
          size="small"
          @click="createAccountUser()"
          class="start-create"
        >Sure</el-button>
        <el-button
          v-else-if="userAccount.mode==='edit'"
          :disabled="userAccount.name === ''"
          type="primary"
          native-type="submit"
          size="small"
          @click="updateAccountUser()"
          class="start-create"
        >Save</el-button>
        <el-button plain native-type="submit" size="small" @click="handleUserAccountCancel">Cancel</el-button>
      </div>
    </el-dialog>
    <!--end of add account dialog-->

    <div class="tab-container">
      <template>
        <el-alert type="info" :closable="false">
          <template>
            Support Integration Microsoft Active Directory、OpenLDAP、GitHub As Well As OAuth Integration with other external account systems，For details, please refer to
            <el-link
              style="font-size: 14px; vertical-align: baseline;"
              type="primary"
              :href="`https://docs.koderover.com/zadig/settings/account/ldap/`"
              :underline="false"
              target="_blank"
            >Help Documentation</el-link>。
          </template>
        </el-alert>
      </template>
      <div class="sync-container">
        <el-button size="small" type="primary" plain @click="addAccount()">Add To</el-button>
      </div>
      <el-table :data="accounts" style="width: 100%;"  @cell-mouse-enter="enter" @cell-mouse-leave="leave">
        <el-table-column label="Account System Name">
          <template slot-scope="scope">
            <span>{{scope.row.name}}</span>
             <el-tag size="mini" type="primary" plain  class="btn" v-show="scope.row.is_default">Default</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="right">
          <span slot-scope="scope"  style="display: none;" :ref="'popover' + scope.row.id">
            <el-checkbox  :value="scope.row.is_default"  @change="setDefaultAccount(scope.row)">Set as default account system</el-checkbox >
          </span>
        </el-table-column>
        <el-table-column label="Operate" width="300">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" plain @click="handleUserAccountEdit(scope.row)">Edit</el-button>
            <el-button type="danger" size="mini" @click="handleUserAccountDelete(scope.row)" plain>Delete</el-button>
            <el-button
              v-if="scope.row.name === 'OpenLDAP' || scope.row.name === 'Microsoft Active Directory'"
              type="primary"
              size="mini"
              :loading="syncAccountUserLoading"
              @click="syncAccountUser(scope.row)"
              plain
            >Synchronize</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import {
  getConnectorsAPI,
  deleteConnectorAPI,
  updateConnectorAPI,
  createConnectorAPI,
  syncLDAPAPI,
  setDefaultAccountAPI
} from '@api'
import { cloneDeep, omit } from 'lodash'
import { codemirror } from 'vue-codemirror'
import jsyaml from 'js-yaml'
import HelpLink from '../../profile/common/helpLink.vue'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/theme/neo.css'
export default {
  data () {
    return {
      accounts: [],
      dialogUserAccountFormVisible: false,
      syncAccountUserLoading: false,
      editorOptions: {
        mode: 'yaml',
        theme: 'neo',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        indentWithTabs: false,
        autofocus: true,
        extraKeys: {
          'Ctrl-Space': 'autocomplete'
        }
      },
      userAccount: {
        name: '',
        mode: 'add'
      },
      userAccountAD: {
        type: 'ldap',
        id: 'ad',
        name: 'Microsoft Active Directory',
        config: {
          host: '',
          addr: '',
          port: '',
          insecureNoSSL: true,
          insecureSkipVerify: true,
          startTLS: false,
          // rootCA: '/etc/dex/ldap.ca',
          // rootCAData:'',
          bindDN: '',
          bindPW: '',
          usernamePrompt: 'AD Username',
          userSearch: {
            baseDN: '',
            filter: '(cn=*)',
            username: 'cn',
            idAttr: '',
            emailAttr: '',
            nameAttr: 'cn'
          },
          groupSearch: {
            baseDN: '',
            filter: '(cn=*)',
            // userMatchers: [
            //   {
            //     userAttr: 'uid',
            //     groupAttr: 'member'
            //   }
            // ],
            nameAttr: 'ou'
          }
        }
      },
      userAccountLDAP: {
        type: 'ldap',
        id: 'ldap',
        name: 'OpenLDAP',
        config: {
          host: '',
          addr: '',
          port: '',
          insecureNoSSL: true,
          insecureSkipVerify: true,
          startTLS: false,
          // rootCA: '/etc/dex/ldap.ca',
          // rootCAData:'',
          bindDN: '',
          bindPW: '',
          usernamePrompt: 'LDAP Username',
          userSearch: {
            baseDN: '',
            filter: '(cn=*)',
            username: 'cn',
            idAttr: '',
            emailAttr: '',
            nameAttr: '',
            preferredUsernameAttr: ''
          },
          groupSearch: {
            baseDN: '',
            filter: '(cn=*)',
            // userMatchers: [
            //   {
            //     userAttr: 'uid',
            //     groupAttr: 'member'
            //   }
            // ],
            nameAttr: 'ou'
          }
        }
      },
      userAccountGitHub: {
        type: 'github',
        id: 'github',
        name: 'GitHub',
        config: {
          clientID: '',
          clientSecret: '',
          redirectURI: '',
          // orgs: [
          //   {
          //     name: 'my-organization'
          //   },
          //   {
          //     name: 'my-organization-with-teams',
          //     teams: ['red-team', 'blue-team']
          //   }
          // ],
          loadAllGroups: false,
          teamNameField: 'slug',
          useLoginAsID: false
        }
      },
      userAccountOAuth: {
        type: 'oauth',
        id: 'oauth',
        name: 'OAuth',
        config: {
          authorizationURL: '',
          claimMapping: {
            emailKey: '',
            emailVerifiedKey: '',
            groupsKey: '',
            preferredUsernameKey: '',
            userNameKey: ''
          },
          clientID: '',
          clientSecret: '',
          insecureSkipVerify: true,
          redirectURI: '',
          scopes: [],
          tokenURL: '',
          userIDKey: '',
          userInfoURL: ''
        }
      },
      userAccountCustom: {
        type: '',
        id: '',
        name: '',
        yaml: '',
        config: {}
      },
      userAccountCustomRules: {
        type: {
          required: true,
          message: 'Please fill in the custom account system type',
          trigger: ['blur', 'change']
        },
        name: {
          required: true,
          message: 'Please Fill In The Name',
          trigger: ['blur', 'change']
        },
        yaml: {
          required: true,
          message: 'Please Enter YAML Configure',
          trigger: ['blur', 'change']
        }
      },
      userAccountRules: {},
      userAccountADRules: {
        addr: {
          required: true,
          message: 'Please Enter AD Address',
          trigger: ['blur', 'change']
        },
        port: {
          required: true,
          message: 'Please Enter The Port',
          trigger: ['blur', 'change']
        },
        bindDN: {
          required: true,
          message: 'Please enter an administrator account',
          trigger: ['blur', 'change']
        },
        bindPW: {
          required: true,
          message: 'Please enter administrator password',
          trigger: ['blur', 'change']
        },
        'userSearch.baseDN': {
          required: true,
          message: 'Please Enter The Base DN',
          trigger: ['blur', 'change']
        },
        'userSearch.filter': {
          required: true,
          message: 'Please Enter User Filter',
          trigger: ['blur', 'change']
        },
        'userSearch.username': {
          required: true,
          message: 'Please enter user attributes',
          trigger: ['blur', 'change']
        },
        'userSearch.emailAttr': {
          required: true,
          message: 'Please enter user email properties',
          trigger: ['blur', 'change']
        },
        'groupSearch.baseDN': {
          required: true,
          message: 'Please Enter Group Basis DN',
          trigger: ['blur', 'change']
        },
        'groupSearch.nameAttr': {
          required: true,
          message: 'Please enter a group name attribute',
          trigger: ['blur', 'change']
        },
        'groupSearch.filter': {
          required: true,
          message: 'Please enter a group filter',
          trigger: ['blur', 'change']
        }
      },
      userAccountLDAPRules: {
        addr: {
          required: true,
          message: 'Please Enter LDAP Address',
          trigger: ['blur', 'change']
        },
        port: {
          required: true,
          message: 'Please Enter The Port',
          trigger: ['blur', 'change']
        },
        bindDN: {
          required: true,
          message: 'Please enter an administrator account',
          trigger: ['blur', 'change']
        },
        bindPW: {
          required: true,
          message: 'Please enter administrator password',
          trigger: ['blur', 'change']
        },
        'userSearch.baseDN': {
          required: true,
          message: 'Please Enter The Base DN',
          trigger: ['blur', 'change']
        },
        'userSearch.filter': {
          required: true,
          message: 'Please Enter User Filter',
          trigger: ['blur', 'change']
        },
        'userSearch.username': {
          required: true,
          message: 'Please enter user attributes',
          trigger: ['blur', 'change']
        },
        'userSearch.emailAttr': {
          required: true,
          message: 'Please enter user email properties',
          trigger: ['blur', 'change']
        },
        'groupSearch.baseDN': {
          required: true,
          message: 'Please Enter Group Basis DN',
          trigger: ['blur', 'change']
        },
        'groupSearch.nameAttr': {
          required: true,
          message: 'Please enter a group name attribute',
          trigger: ['blur', 'change']
        },
        'groupSearch.filter': {
          required: true,
          message: 'Please enter a group filter',
          trigger: ['blur', 'change']
        }
      },
      userAccountGitHubRules: {
        clientID: {
          required: true,
          message: 'Please Fill Out Client ID',
          trigger: ['blur', 'change']
        },
        clientSecret: {
          required: true,
          message: 'Please Fill Out Client Secret',
          trigger: ['blur', 'change']
        }
      },
      userAccountOAuthRules: {
        clientID: {
          required: true,
          message: 'Please Fill Out Client ID',
          trigger: ['blur', 'change']
        },
        clientSecret: {
          required: true,
          message: 'Please Fill Out Client Secret',
          trigger: ['blur', 'change']
        },
        authorizationURL: {
          required: true,
          message: 'Please Fill Out Authorization URL',
          trigger: ['blur', 'change']
        },
        tokenURL: {
          required: true,
          message: 'Please Fill Out Token URL',
          trigger: ['blur', 'change']
        },
        userInfoURL: {
          required: true,
          message: 'Please Fill Out User Info URL',
          trigger: ['blur', 'change']
        },
        userIDKey: {
          required: true,
          message: 'Please fill in the username attribute',
          trigger: ['blur', 'change']
        },
        'claimMapping.userNameKey': {
          required: true,
          message: 'Please fill in the user nickname attribute',
          trigger: ['blur', 'change']
        },
        'claimMapping.emailKey': {
          required: true,
          message: 'Please fill in the user email properties',
          trigger: ['blur', 'change']
        },
        scopes: {
          required: true,
          message: 'Please Enter Scopes',
          trigger: ['blur', 'change']
        }
      }
    }
  },
  computed: {
    name () {
      return this.userAccount.name
    }
  },
  methods: {
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
    clearValidate () {
      if (this.$refs.userAccountGitHubForm) {
        this.$refs.userAccountGitHubForm.clearValidate()
      } else if (this.$refs.userAccountLDAPForm) {
        this.$refs.userAccountLDAPForm.clearValidate()
      } else if (this.$refs.userAccountOauthForm) {
        this.$refs.userAccountOauthForm.clearValidate()
      } else if (this.$refs.userAccountCustomForm) {
        this.$refs.userAccountCustomForm.clearValidate()
      }
    },
    addAccount () {
      this.dialogUserAccountFormVisible = true
      this.userAccount = {
        name: '',
        mode: 'add'
      }
    },
    handleUserAccountEdit (row) {
      const name = row.name
      this.userAccount = {
        name: name,
        mode: 'edit'
      }
      this.dialogUserAccountFormVisible = true
      if (name === 'OpenLDAP') {
        row.config.addr = row.config.host.split(':')[0]
        row.config.port = row.config.host.split(':')[1]
        row.config.userSearch.idAttr = row.config.userSearch.username
        row.config.userSearch.preferredUsernameAttr = row.config.userSearch.username
        this.userAccountLDAP = cloneDeep(row)
      } else if (name === 'Microsoft Active Directory') {
        row.config.userSearch.idAttr = row.config.userSearch.username
        row.config.userSearch.preferredUsernameAttr = row.config.userSearch.username
        row.config.addr = row.config.host.split(':')[0]
        row.config.port = row.config.host.split(':')[1]
        this.userAccountAD = cloneDeep(row)
      } else if (name === 'GitHub') {
        this.userAccountGitHub = cloneDeep(row)
      } else if (name === 'OAuth') {
        this.userAccountOAuth = cloneDeep(row)
      } else {
        this.userAccount.name = 'custom'
        row.yaml = jsyaml.dump(row.config)
        this.userAccountCustom = cloneDeep(row)
      }
    },
    handleUserAccountCancel () {
      if (this.$refs.userAccountGitHubForm) {
        this.userAccountGitHub = {
          type: 'github',
          id: 'github',
          name: 'GitHub',
          config: {
            clientID: '',
            clientSecret: '',
            redirectURI: '',
            // orgs: [
            //   {
            //     name: 'my-organization'
            //   },
            //   {
            //     name: 'my-organization-with-teams',
            //     teams: ['red-team', 'blue-team']
            //   }
            // ],
            loadAllGroups: false,
            teamNameField: 'slug',
            useLoginAsID: false
          }
        }
      }
      if (this.$refs.userAccountLDAPForm) {
        this.userAccountLDAP = {
          type: 'ldap',
          id: 'ldap',
          name: 'OpenLDAP',
          config: {
            host: '',
            addr: '',
            port: '',
            insecureNoSSL: true,
            insecureSkipVerify: true,
            startTLS: false,
            // rootCA: '/etc/dex/ldap.ca',
            // rootCAData:'',
            bindDN: '',
            bindPW: '',
            usernamePrompt: 'LDAP Username',
            userSearch: {
              baseDN: '',
              filter: '(cn=*)',
              username: 'cn',
              idAttr: '',
              emailAttr: '',
              nameAttr: 'cn'
            },
            groupSearch: {
              baseDN: '',
              filter: '(cn=*)',
              // userMatchers: [
              //   {
              //     userAttr: 'uid',
              //     groupAttr: 'member'
              //   }
              // ],
              nameAttr: 'ou'
            }
          }
        }
      }
      if (this.$refs.userAccountADForm) {
        this.userAccountAD = {
          type: 'ad',
          id: 'ad',
          name: 'Microsoft Active Directory',
          config: {
            host: '',
            addr: '',
            port: '',
            insecureNoSSL: true,
            insecureSkipVerify: true,
            startTLS: false,
            // rootCA: '/etc/dex/ldap.ca',
            // rootCAData:'',
            bindDN: '',
            bindPW: '',
            usernamePrompt: 'AD Username',
            userSearch: {
              baseDN: '',
              filter: '(cn=*)',
              username: 'cn',
              idAttr: '',
              emailAttr: '',
              nameAttr: ''
            },
            groupSearch: {
              baseDN: '',
              filter: '(cn=*)',
              // userMatchers: [
              //   {
              //     userAttr: 'uid',
              //     groupAttr: 'member'
              //   }
              // ],
              nameAttr: 'ou'
            }
          }
        }
      }
      if (this.$refs.userAccountOAuthForm) {
        this.userAccountOAuth = {
          type: 'oauth',
          id: 'oauth',
          name: 'OAuth',
          config: {
            authorizationURL: '',
            claimMapping: {
              emailKey: '',
              emailVerifiedKey: '',
              groupsKey: '',
              preferredUsernameKey: '',
              userNameKey: ''
            },
            clientID: '',
            clientSecret: '',
            insecureSkipVerify: true,
            redirectURI: '',
            scopes: [],
            tokenURL: '',
            userIDKey: '',
            userInfoURL: ''
          }
        }
      }
      if (this.$refs.userAccountCustomForm) {
        this.userAccountCustom = {
          type: '',
          id: '',
          name: '',
          yaml: '',
          config: {}
        }
      }
      this.dialogUserAccountFormVisible = false
    },
    handleUserAccountDelete (row) {
      this.$confirm(`Sure You Want To Delete ${row.name} Is This Account System？`, 'Confirm', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteConnectorAPI(row.id).then(res => {
          this.getAccountConfig()
          this.$message({
            message: 'Successfully Deleted',
            type: 'success'
          })
        })
      })
    },
    getAccountConfig () {
      const key = this.$utils.rsaEncrypt()
      getConnectorsAPI(key).then(res => {
        res.forEach(item => {
          if (item.config.bindPW) {
            item.config.bindPW = this.$utils.aesDecrypt(item.config.bindPW)
          }
          if (item.config.clientSecret) {
            item.config.clientSecret = this.$utils.aesDecrypt(item.config.clientSecret)
          }
        })
        this.$set(this, 'accounts', res)
      })
    },
    syncAccountUser (row) {
      const id = row.id
      this.syncAccountUserLoading = true
      syncLDAPAPI(id).then(
        res => {
          this.syncAccountUserLoading = false
          this.$message({
            message: 'Synchronize LDAP Data Success',
            type: 'success'
          })
        },
        () => {
          this.syncAccountUserLoading = false
        }
      )
    },
    createAccountUser () {
      if (this.name === 'OpenLDAP') {
        this.$refs.userAccountLDAPForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountLDAP
            payload.config.host = `${payload.config.addr}:${payload.config.port}`
            payload.config.userSearch.idAttr = payload.config.userSearch.username
            payload.config.userSearch.preferredUsernameAttr = payload.config.userSearch.username
            omit(payload.config, ['addr', 'port'])
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system added successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'Microsoft Active Directory') {
        this.$refs.userAccountADForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountAD
            payload.config.host = `${payload.config.addr}:${payload.config.port}`
            payload.config.userSearch.idAttr = payload.config.userSearch.username
            payload.config.userSearch.preferredUsernameAttr = payload.config.userSearch.username
            omit(payload.config, ['addr', 'port'])
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system added successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'GitHub') {
        this.$refs.userAccountGitHubForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountGitHub
            payload.config.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system added successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'OAuth') {
        this.$refs.userAccountOAuthForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountOAuth
            payload.config.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            payload.config.claimMapping.preferredUsernameKey = payload.config.userIDKey
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system added successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else {
        this.$refs.userAccountCustomForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountCustom
            payload.id = payload.type
            payload.config = jsyaml.load(payload.yaml)
            omit(payload, ['yaml'])
            createConnectorAPI(payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system added successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      }
    },
    updateAccountUser () {
      if (this.name === 'OpenLDAP') {
        this.$refs.userAccountLDAPForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountLDAP
            payload.config.host = `${payload.config.addr}:${payload.config.port}`
            payload.config.userSearch.idAttr = payload.config.userSearch.username
            omit(payload.config, ['addr', 'port'])
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system modified successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'Microsoft Active Directory') {
        this.$refs.userAccountADForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountAD
            payload.host = `${payload.config.addr}:${payload.config.port}`
            omit(payload, ['addr', 'port'])
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system modified successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'GitHub') {
        this.$refs.userAccountGitHubForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountGitHub
            payload.config.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system modified successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else if (this.name === 'OAuth') {
        this.$refs.userAccountOAuthForm.validate(valid => {
          if (valid) {
            const payload = this.userAccountOAuth
            payload.config.redirectURI = `${this.$utils.getOrigin()}/dex/callback`
            payload.config.claimMapping.preferredUsernameKey = payload.config.userIDKey
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system modified successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      } else {
        this.$refs.userAccountCustomForm.validate(valid => {
          if (valid) {
            let payload = this.userAccountCustom
            payload.config = jsyaml.load(payload.yaml)
            payload = omit(payload, ['yaml'])
            updateConnectorAPI(payload.id, payload).then(res => {
              this.getAccountConfig()
              this.handleUserAccountCancel()
              this.$message({
                message: 'Account system modified successfully',
                type: 'success'
              })
            })
          } else {
            return false
          }
        })
      }
    },
    enter (row) {
      if (row.type !== 'github') {
        this.$refs['popover' + row.id].style.display = 'inline'
      }
    },
    leave (row) {
      this.$refs['popover' + row.id].style.display = 'none'
    },
    setDefaultAccount (row) {
      const params = {
        default_login: !row.is_default ? row.id : 'local'
      }
      if (!row.is_default) {
        const confirmInfo = `<p>After Setting，The system default login page is the default account system login page。</p>
                    <p style='color: red' v-if="row.is_default">Please make sure that the configured account system is available，Otherwise, the system will not be able to log in。</p>`
        const cancelInfo = ``
        this.$confirm(row.is_default ? cancelInfo : confirmInfo, `Sure${row.is_default ? 'Cancel' : 'Set Up'}Default Account System?`, {
          confirmButtonText: 'Sure',
          cancelButtonText: 'Cancel',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(res => {
          setDefaultAccountAPI(params).then(res => {
            this.$message({
              type: 'success',
              message: 'Set default account system successfully'
            })
            this.getAccountConfig()
          })
        })
      } else {
        setDefaultAccountAPI(params).then(res => {
          this.$message({
            type: 'success',
            message: 'Cancel the default account system successfully'
          })
          this.getAccountConfig()
        })
      }
    }
  },
  components: {
    codemirror, HelpLink
  },
  mounted () {
    this.getAccountConfig()
  }
}
</script>

<style lang="less">
.integration-account-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .tips {
    display: block;

    &.code-line {
      display: inline-block;
      font-size: 14px;
      word-wrap: break-word;
      word-break: break-all;
      border-radius: 2px;

      .copy {
        color: @themeColor;
        font-size: 16px;
        cursor: pointer;
      }
    }
  }

  .user-form-dialog {
    width: 600px;

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
      padding-bottom: 0;
      color: #606266;
      font-size: 14px;

      .yaml-editor {
        border: 1px solid #ccc;
        border-radius: 2px;
      }
    }

    .el-select {
      width: 100%;
    }

    .el-input {
      display: inline-block;
    }
  }

  .btn {
    display: inline-block;
    margin-left: 16px;
  }
}
</style>
