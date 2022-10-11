<template>
  <div class="webhook">
    <el-button type="primary" size="mini" icon="el-icon-plus" plain @click="addWebhook">Add To</el-button>
    <el-row :gutter="20" class="webhook-row" v-for="(item,index) in webhooks" :key="index">
      <el-col :span="2">
        <div class="content">
          <el-switch v-model="item.enabled" active-color="#13ce66" @change="changeWebhookStatus(item)"></el-switch>
        </div>
      </el-col>
      <el-col :span="1">
        <div class="content">
          <span class="iconfont icongit"></span>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="content">
          <div class="cate">
            <span class="title">Name：</span>
            <span class="desc">{{item.name}}</span>
          </div>
          <div class="cate">
            <span class="title">Code Library：</span>
            <span class="desc">{{item.main_repo.repo_name + '/' + item.main_repo.branch}}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="9">
        <div class="content">
          <div class="cate">
            <span class="title">Target Branch：</span>
            <span class="desc">{{item.main_repo.branch}}</span>
          </div>
          <div class="cate">
            <span class="title">Trigger Event：</span>
            <span class="desc">
              <div v-if="item.main_repo.events.length">
                <span v-for="(event,index) in item.main_repo.events" :key="index">
                  <span
                    v-if="item.main_repo.source === 'gerrit'"
                  >{{ triggerMethods.gerrit.find(tri => tri.value === event)?triggerMethods.gerrit.find(tri => tri.value === event).label: 'N/A' }}</span>
                  <span
                    v-else
                  >{{ triggerMethods.git.find(tri => tri.value === event)?triggerMethods.git.find(tri => tri.value === event).label: 'N/A' }}</span>
                  <span v-if="index !== item.main_repo.events.length - 1">,</span>
                </span>
              </div>
              <span v-else>{{ 'N/A' }}</span>
            </span>
          </div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="content">
          <div class="cate">
            <span class="title">Describe：</span>
          </div>
          <div class="cate">
            <span class="desc">{{item.description}}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="2">
        <div class="content">
          <div class="operation">
            <span class="el-icon-edit" @click="editWebhook(item)"></span>
            <span class="el-icon-delete" @click="removeWebhook(index,item.name)"></span>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-dialog :visible.sync="dialogVisible" :title="editMode?'Edit Trigger':'Add Trigger'" width="700px" :close-on-click-modal="false" append-to-body>
      <el-form ref="webhookForm" :model="currentWebhook" label-width="90px" :rules="rules">
        <el-form-item label="Name" prop="name">
          <el-input size="small" autofocus ref="webhookNamedRef" :disabled="editMode" v-model="currentWebhook.name" placeholder="Please Enter A Name"></el-input>
        </el-form-item>
        <el-form-item label="Describe" prop="description">
          <el-input size="small" type="textarea" v-model="currentWebhook.description" placeholder="Please enter a description"></el-input>
        </el-form-item>
        <el-form-item label="Code Library" prop="repo">
          <el-select
            style="width: 100%;"
            v-model="currentWebhook.repo"
            size="small"
            @change="changeRepo"
            filterable
            allow-create
            clearable
            value-key="key"
            placeholder="Please Choose"
          >
            <el-option v-for="(repo,index) in webhookRepos" :key="index" :label="repo.repo_owner+'/'+repo.repo_name" :value="repo"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Target Branch" prop="main_repo.branch">
          <el-select
            style="width: 100%;"
            v-model="currentWebhook.main_repo.branch"
            size="small"
            filterable
            allow-create
            clearable
            placeholder="Please Select A Branch"
          >
            <el-option
              v-for="(branch,index) in webhookBranches[currentWebhook.repo.repo_name]"
              :key="index"
              :label="branch.name"
              :value="branch.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="currentWebhook.repo.source==='gerrit'" label="Trigger Event" prop="main_repo.events">
          <el-checkbox-group v-model="currentWebhook.main_repo.events">
            <el-checkbox style="display: block;" label="change-merged">Change merged</el-checkbox>
            <el-checkbox style="display: block;" label="patchset-created">
              <span>Patchset created</span>
              <template v-if="currentWebhook.main_repo.events.includes('patchset-created')">
                <span style="color: #606266;">Rating Label</span>
                <el-input size="mini" style="width: 250px;" v-model="currentWebhook.main_repo.label" placeholder="Code-Review"></el-input>
              </template>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-else-if="currentWebhook.repo.source!=='gerrit'" label="Trigger Event" prop="main_repo.events">
          <el-checkbox-group v-model="currentWebhook.main_repo.events">
            <el-checkbox v-for="tri in triggerMethods.git" :key="tri.value" :label="tri.value">{{ tri.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Trigger Strategy" prop="auto_cancel">
          <el-checkbox v-model="currentWebhook.auto_cancel">
            <span>Cancel Automatically</span>
            <el-tooltip effect="dark" content="If you wish to build only the latest commit，Then using this option will automatically cancel the task in the queue" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-checkbox>
          <el-checkbox v-if="currentWebhook.repo.source==='gerrit'" v-model="currentWebhook.check_patch_set_change">
            <span>Workflow is not triggered when no code changes</span>
            <el-tooltip effect="dark" content="Exceptions：When the target repository is configured as Gerrit In The Case Of，Limited By API Ability，It is also not triggered when a single line of code changes" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </el-checkbox>
        </el-form-item>
        <template v-if="currentWebhook.main_repo.source!=='gerrit'">
          <el-form-item label="File Directory" prop="main_repo.match_folders">
            <el-input
              :autosize="{ minRows: 4, maxRows: 10}"
              type="textarea"
              v-model="currentWebhook.main_repo.match_folders"
              placeholder="When entering a directory，Please separate multiple directories with carriage return and line feed"
            ></el-input>
          </el-form-item>
          <ul style="padding-left: 120px; color: #909399; font-size: 12px; line-height: 20px;">
            <li>When entering a directory，Please separate multiple directories with carriage return and line feed</li>
            <li>"/" Represents all files in the codebase</li>
            <li>Use "!" The corresponding file can be excluded at the beginning of the symbol</li>
          </ul>
        </template>
      </el-form>
      <div>
        <span>Workflow Execution Variables</span>
        <WebhookRunConfig
          :workflowName="workflowName"
          :projectName="projectName"
          :cloneWorkflow="currentWebhook.workflow_arg"
          :webhookSelectedRepo="currentWebhook.repo"
        />
      </div>
      <div slot="footer">
        <el-button @click="dialogVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" @click="saveWebhook" size="small">Sure</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { cloneDeep, isEqual } from 'lodash'
import WebhookRunConfig from './webhookRunConfig.vue'
import {
  getBranchInfoByIdAPI,
  addCustomWebhookAPI,
  getCustomWebhooksAPI,
  removeCustomWebhookAPI,
  updateCustomWebhookAPI,
  getCustomWebhookPresetAPI
} from '@api'
const validateName = (rule, value, callback) => {
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9_\-\.]*[a-zA-Z0-9])?$/.test(value)) {
    callback(
      new Error(
        "Trigger names only support numeric characters、'-'、'_'、'.' And start and end can only be numeric characters"
      )
    )
  } else {
    callback()
  }
}
const validateRepo = (rule, value, callback) => {
  if (Object.keys(value).length === 0) {
    callback(new Error('Please select a repository'))
  } else {
    callback()
  }
}
const webhookInfo = {
  check_patch_set_change: false, // gerrit Type codehost Needs To Be Configured，Whether to skip without code changes
  name: '',
  auto_cancel: false,
  enabled: true,
  description: '',
  repos: [],
  main_repo: {
    source: '',
    repo_owner: '',
    repo_namespace: '',
    repo_name: '',
    branch: '',
    tag: '',
    label: '', // gerrit Type codehost，event Include patchset-created Needs To Be Configured
    committer: '',
    match_folders: '/\n!.md',
    codehost_id: null,
    is_regular: false, // Is It A Regular Match
    events: [
      // # gerrit Type codehost: patchset-created,change-merged,Remaining Type codehost: push, pull_request,tag
    ]
  },
  repo: {},
  workflow_arg: {}
}
export default {
  data () {
    return {
      dialogVisible: false,
      editMode: true,
      webhooks: [],
      currentWebhook: cloneDeep(webhookInfo),
      webhookBranches: {},
      webhookRepos: [],
      triggerMethods: {
        git: [
          {
            value: 'push',
            label: 'Push commits'
          },
          {
            value: 'pull_request',
            label: 'Pull requests'
          },
          {
            value: 'tag',
            label: 'Push tags'
          }
        ],
        gerrit: [
          {
            value: 'change-merged',
            label: 'Change merged'
          },
          {
            value: 'patchset-created',
            label: 'Patchset created'
          }
        ]
      },
      rules: {
        name: [{ trigger: 'change', required: true, validator: validateName }],
        repo: [{ trigger: 'change', required: true, validator: validateRepo }],
        'main_repo.branch': [
          {
            required: true,
            message: 'Please select the target branch',
            trigger: ['blur', 'change']
          }
        ],
        'main_repo.events': [
          {
            required: true,
            message: 'Please select a trigger event',
            trigger: ['blur', 'change']
          }
        ],
        'main_repo.match_folders': [
          {
            required: true,
            message: 'Please enter the file directory',
            trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({})
    },
    isEdit: {
      type: String,
      required: true,
      default: ''
    },
    isShowDrawer: {
      type: Boolean,
      required: true,
      default: false
    },
    originalWorkflow: {
      required: true,
      type: Object,
      default: null
    },
    validObj: {
      required: false,
      type: Object,
      default: null
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    workflowName () {
      return this.config.name
    }
  },
  methods: {
    validate () {
      return this.$refs.buildEnvRef.validate()
    },
    changeWebhookStatus (webhook) {
      const projectName = this.projectName
      const workflowName = this.workflowName
      updateCustomWebhookAPI(projectName, workflowName, webhook).then(() => {
        this.$message.success(
          `${webhook.name} Already${webhook.enabled ? 'Enable' : 'Disabled'}`
        )
        this.getWebhooks()
      })
    },
    async getWebhooks () {
      this.webhooks = await getCustomWebhooksAPI(this.projectName, this.workflowName)
    },
    async addWebhook () {
      const projectName = this.projectName
      const workflowName = this.workflowName
      this.currentWebhook = cloneDeep(webhookInfo)
      const preset = await getCustomWebhookPresetAPI(projectName, workflowName)
      if (preset) {
        this.$set(
          this.currentWebhook,
          'workflow_arg',
          cloneDeep(preset.workflow_arg)
        )
        if (preset.repos && preset.repos.length > 0) {
          this.webhookRepos = preset.repos.map(item => {
            item.key = `${item.repo_owner}/${item.repo_name}`
            delete item.branch
            return item
          })
        } else {
          this.webhookRepos = []
        }

        this.editMode = false
        this.dialogVisible = true
      }
    },
    async editWebhook (item) {
      const projectName = this.projectName
      const workflowName = this.workflowName
      this.editMode = true
      const currentWebhook = cloneDeep(item)
      const triggerName = currentWebhook.name
      const preset = await getCustomWebhookPresetAPI(projectName, workflowName, triggerName)
      if (preset) {
        if (preset.repos && preset.repos.length > 0) {
          this.webhookRepos = preset.repos.map(item => {
            item.key = `${item.repo_owner}/${item.repo_name}`
            delete item.branch
            return item
          })
        } else {
          this.webhookRepos = []
        }
        this.$set(
          currentWebhook,
          'workflow_arg',
          cloneDeep(preset.workflow_arg)
        )
      }
      if (
        currentWebhook.main_repo.codehost_id &&
        currentWebhook.main_repo.repo_namespace &&
        currentWebhook.main_repo.repo_name
      ) {
        this.getBranchInfoById(
          currentWebhook.main_repo.codehost_id,
          currentWebhook.main_repo.repo_namespace,
          currentWebhook.main_repo.repo_name
        )
      }
      currentWebhook.repo = {
        key: `${currentWebhook.main_repo.repo_owner}/${currentWebhook.main_repo.repo_name}`,
        source: currentWebhook.main_repo.source,
        repo_namespace: currentWebhook.main_repo.repo_namespace,
        repo_name: currentWebhook.main_repo.repo_name,
        repo_owner: currentWebhook.main_repo.repo_owner,
        codehost_id: currentWebhook.main_repo.codehost_id
      }
      currentWebhook.main_repo.match_folders = currentWebhook.main_repo
        .match_folders
        ? currentWebhook.main_repo.match_folders.join('\n')
        : '/\n!.md'
      this.currentWebhook = currentWebhook
      this.dialogVisible = true
    },
    removeWebhook (index, triggerName) {
      const projectName = this.projectName
      const workflowName = this.workflowName
      removeCustomWebhookAPI(projectName, workflowName, triggerName).then(res => {
        this.$message.success('Successfully Deleted')
        this.getWebhooks()
      })
    },
    saveWebhook () {
      this.$refs.webhookForm.validate(async valid => {
        if (valid) {
          const payload = cloneDeep(this.currentWebhook)
          payload.main_repo.match_folders = payload.main_repo.match_folders.split(
            '\n'
          )
          payload.main_repo = Object.assign(payload.main_repo, payload.repo)
          delete payload.repo
          const workflowName = this.workflowName
          const projectName = this.projectName
          payload.workflow_arg.stages.forEach(stage => {
            stage.jobs.forEach(job => {
              job.spec.service_and_builds = job.pickedTargets
              delete job.pickedTargets
              if (
                job.spec.service_and_images &&
            job.spec.service_and_images.length > 0
              ) {
                job.spec.service_and_images.forEach(item => {
                  delete item.images
                })
              }
              if (
                job.spec.service_and_builds &&
            job.spec.service_and_builds.length > 0
              ) {
                job.spec.service_and_builds.forEach(item => {
                  if (item.repos) {
                    item.repos.forEach(repo => {
                      if (repo.branchOrTag) {
                        if (repo.branchOrTag.type === 'branch') {
                          repo.branch = repo.branchOrTag.name
                        }
                        if (repo.branchOrTag.type === 'tag') {
                          repo.tag = repo.branchOrTag.name
                        }
                      }
                    })
                  }
                })
              }
              if (job.type === 'freestyle') {
                job.spec.steps.forEach(step => {
                  if (step.type === 'git') {
                    step.spec.repos.forEach(repo => {
                      if (repo.branchOrTag) {
                        if (repo.branchOrTag.type === 'branch') {
                          repo.branch = repo.branchOrTag.name
                        }
                        if (repo.branchOrTag.type === 'tag') {
                          repo.tag = repo.branchOrTag.name
                        }
                      }
                    })
                  }
                })
              }
              if (job.type === 'zadig-deploy') {
                job.spec.service_and_images = job.spec.service_and_builds
                delete job.spec.service_and_builds
              }
            })
          })
          if (this.editMode) {
            const result = await updateCustomWebhookAPI(projectName, workflowName, payload)
            if (result) {
              this.$message.success('Successfully Modified')
              this.$refs.webhookForm.resetFields()
              this.dialogVisible = false
              this.getWebhooks()
            }
          } else {
            const result = await addCustomWebhookAPI(projectName, workflowName, payload)
            if (result) {
              this.$message.success('Added Successfully')
              this.$refs.webhookForm.resetFields()
              this.dialogVisible = false
              this.getWebhooks()
            }
          }
        } else {
          return false
        }
      })
    },
    getBranchInfoById (id, namespace, repoName) {
      if (!namespace) return
      getBranchInfoByIdAPI(id, namespace, repoName).then(res => {
        this.$set(this.webhookBranches, repoName, res)
      })
    },
    changeRepo (currentRepo) {
      this.getBranchInfoById(
        currentRepo.codehost_id,
        currentRepo.repo_namespace,
        currentRepo.repo_name
      )
    },
    checkingBuildStageChanged (newConfig, oldConfig) {
      if (!isEqual(newConfig, oldConfig)) {
        this.$confirm('Triggers cannot be configured until the current workflow configuration is saved?', 'Confirm', {
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.$emit('closeDrawer')
            this.$emit('saveWorkflow')
          })
          .catch(() => {
            this.$emit('closeDrawer')
          })
      }
    }
  },
  watch: {
    config: {
      handler (newValue, oldValue) {
        if (newValue) {
          this.$forceUpdate()
        }
      },
      deep: true
    },
    isShowDrawer: {
      async handler (newValue, oldValue) {
        if (newValue) {
          if (!this.isEdit) {
            this.$confirm('Triggers cannot be configured until the current workflow configuration is saved?', 'Confirm', {
              confirmButtonText: 'Save',
              cancelButtonText: 'Cancel',
              type: 'warning'
            })
              .then(() => {
                this.$emit('closeDrawer')
                this.$emit('saveWorkflow')
              })
              .catch(() => {
                this.$emit('closeDrawer')
              })
          }
          if (this.isEdit) {
            this.webhooks = await getCustomWebhooksAPI(
              this.projectName,
              this.workflowName
            )
            this.checkingBuildStageChanged(
              cloneDeep(this.config),
              cloneDeep(this.originalWorkflow)
            )
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    this.validObj &&
      this.validObj.addValidate({
        name: 'webhook',
        valid: this.validate
      })
  },
  components: {
    WebhookRunConfig
  }
}
</script>

<style lang="less" scoped>
@secondaryColor: #b1b1b2;
@primaryColor: #000;

.webhook {
  .webhook-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 6px 0;
    border-bottom: 1px solid #ccc;

    &:last-child {
      border-bottom: none;
    }

    .content {
      display: flex;
      flex-direction: column;

      .cate {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 6px;

        &:last-child {
          margin-bottom: 0;
        }

        .title {
          color: @secondaryColor;
          font-weight: 400;
          font-size: 12px;
        }

        .desc {
          color: @primaryColor;
          font-weight: normal;
          font-size: 12px;
        }
      }

      .operation {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .el-icon-edit {
          color: @themeColor;
          cursor: pointer;
        }

        .el-icon-delete {
          color: #ff1949;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
