<template>
  <div class="build-config-container">
    <div class="section">
      <el-form ref="addConfigForm" :model="buildInfo" :rules="buildInfoRules" label-position="left" label-width="80px">
        <span class="item-title">Build Environment</span>
        <div class="divider item"></div>
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="System" prop="image_id" label-width="60px">
              <el-select size="mini" v-model="buildInfo.image_id" placeholder="Please Choose">
                <el-option v-for="(sys, index) in systems" :key="index" :label="sys.label" :value="sys.id">
                  <span>
                    {{ sys.label }}
                    <el-tag v-if="sys.image_from === 'custom'" type="info" size="mini" effect="light">Customize</el-tag>
                  </span>
                </el-option>
                <el-option value="">
                  <router-link to="/v1/system/imgs" style="color: #606266;">Create a new custom build image</router-link>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="Resource" label-width="50px">
              <el-select size="mini" v-model="buildInfo.res_req" placeholder="Please Choose">
                <el-option label="High | CPU: 16 Kernel Memory: 32 GB" value="high"></el-option>
                <el-option label="Middle | CPU: 8 Kernel Memory: 16 GB" value="medium"></el-option>
                <el-option label="Low | CPU: 4 Kernel Memory: 8 GB" value="low"></el-option>
                <el-option label="Lowest | CPU: 2 Kernel Memory: 2 GB" value="min"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-form ref="buildApp" :inline="true" :model="buildInfo" class="form-bottom-0" label-position="top" label-width="80px">
        <span class="item-title">Application List</span>
        <el-button v-if="buildInfo.install_items.length === 0" style="padding: 0;" @click="addFirstBuildApp()" size="mini" type="text">New</el-button>
        <div class="divider item"></div>
        <el-row v-for="(app, build_app_index) in buildInfo.install_items" :key="build_app_index">
          <el-col :span="12">
            <el-form-item
              :prop="'install_items.' + build_app_index + '.name'"
              :rules="{
                    required: true,
                    message: 'Application name cannot be empty',
                    trigger: 'blur',
                  }"
            >
              <el-select
                style="width: 100%;"
                v-model="buildInfo.install_items[build_app_index]"
                placeholder="Please select an application"
                size="mini"
                value-key="id"
                filterable
              >
                <el-option
                  v-for="(app, index) in allApps"
                  :key="index"
                  :label="`${app.name} ${app.version} `"
                  :value="{
                        name: app.name,
                        version: app.version,
                        id: app.name + app.version,
                      }"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <div class="app-operation">
                <el-button
                  v-if="buildInfo.install_items.length >= 1"
                  @click="deleteBuildApp(build_app_index)"
                  type="danger"
                  size="mini"
                  plain
                >Delete</el-button>
                <el-button
                  v-if="
                        build_app_index ===
                        buildInfo.install_items.length - 1
                      "
                  @click="addBuildApp(build_app_index)"
                  type="primary"
                  size="mini"
                  plain
                >New</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="section">
      <RepoSelect ref="repoSelect" :validObj="validRepoObj" :config="buildConfig" showDivider addBtnMini shortDescription showFirstLine/>
    </div>
    <div class="section">
      <el-form ref="cacheDir" :inline="true" :model="buildInfo" class="form-bottom-0" label-position="left" label-width="130px">
        <span class="item-title">Caching Strategy</span>
        <div class="divider item"></div>
        <el-form-item label="Use Workspace Cache">
          <el-switch v-model="buildInfo.job_ctx.clean_workspace" active-color="#0066ff"></el-switch>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Cache Custom Directory">
              <el-button
                v-if="
                        !this.buildInfo.job_ctx.caches ||
                        this.buildInfo.job_ctx.caches.length === 0
                      "
                style="padding: 0;"
                @click="addFirstCacheDir()"
                type="text"
              >New</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-for="(dir, index) in buildInfo.job_ctx.caches" :key="index">
          <el-col :span="14">
            <el-form-item :label="index === 0 ? '' : ''">
              <el-input v-model="buildInfo.job_ctx.caches[index]" style="width: 100%;" size="mini">
                <template slot="prepend">$WORKSPACE/</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item :label="index === 0 ? '' : ''">
              <div class="app-operation">
                <el-button v-if="buildInfo.job_ctx.caches.length >= 1" @click="deleteCacheDir(index)" type="danger" size="mini" plain>Delete</el-button>
                <el-button
                  v-if="index === buildInfo.job_ctx.caches.length - 1"
                  @click="addCacheDir(index)"
                  type="primary"
                  size="mini"
                  plain
                >New</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="section">
      <el-form ref="buildScript" :model="buildInfo" label-position="left" label-width="80px">
        <span class="item-title">Build Script</span>
        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">
            The currently available environment variables are as follows，Can be referenced in build scripts
            <br />$WORKSPACE&nbsp;&nbsp;Work List
            <br />$TASK_ID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Workflow Tasks ID
            <br />$IMAGE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Output Image Name
            <br />$SERVICE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Build Service Name
            <br />$SERVICE_MODULE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Build service component name
            <br />$DIST_DIR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Built Tar Destination directory of the package
            <br />$PKG_FILE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Built Tar Package Name
            <br />$ENV_NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Executed environment name
            <br />$BUILD_URL&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Build Task URL
            <br />$CI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            Value Is Equal To true，Indicates that the current environment is CI/CD Surroundings
            <br />$ZADIG&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Value Is Equal To
            true，Expressed In Zadig Execute the script on the system
            <br />&lt;REPO&gt;_PR Specify the code repository to use during the build process Pull Request Information
            <br />&lt;REPO&gt;_BRANCH Specifies the branch information used by the code repository during the build process
            <br />&lt;REPO&gt;_TAG Specify the code repository to use during the build process Tag Information
            <br />&lt;REPO&gt;_COMMIT_ID The code specified during the build process commit Information
          </div>
          <span class="variable">Variable</span>
        </el-tooltip>
        <div class="divider item"></div>
        <el-row>
          <el-col class="deploy-script" :span="24">
            <Resize :height="'150px'">
              <Editor v-model="buildInfo.job_ctx.build_steps[0].scripts" lang="sh" theme="xcode" width="100%" height="100%"></Editor>
            </Resize>
          </el-col>
        </el-row>
      </el-form>
      <el-form :model="buildInfo" ref="file_archive" class="stcov label-at-left">
        <div class="dashed-container">
          <span class="title">Deliverables Archive</span>
          <el-form-item label="Storage Path：">
            <el-input v-model="buildInfo.job_ctx.artifact_path" size="mini">
              <template slot="prepend">$WORKSPACE/</template>
            </el-input>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script>
import { getAllAppsAPI, getImgListAPI } from '@api'
import Editor from 'vue2-ace-bind'
import Resize from '@/components/common/resize.vue'
import Codemirror from '@/components/projects/common/codemirror.vue'
import ValidateSubmit from '@utils/validateAsync'
import { mapState } from 'vuex'
import { cloneDeep } from 'lodash'

const buildInfo = {
  enabled: true,
  type: 'buildv3',
  build_os: 'xenial',
  image_from: 'koderover',
  image_id: '',
  res_req: 'low',
  job_ctx: {
    clean_workspace: true,
    artifact_path: '',
    caches: [],
    build_steps: [
      {
        type: 'shell',
        scripts: '#!/bin/bash\nset -e'
      }
    ],
    builds: []
  },
  install_items: []
}

export default {
  props: {
    isEdit: Boolean,
    validObj: Object
  },
  data () {
    this.buildInfoRules = {
      image_id: [
        {
          type: 'string',
          required: true,
          message: 'Please select a build system',
          trigger: 'blur'
        }
      ]
    }
    return {
      buildInfo: cloneDeep(buildInfo),
      buildConfig: {
        repos: []
      },
      allApps: [],
      systems: [],
      validRepoObj: new ValidateSubmit()
    }
  },
  methods: {
    async validate () {
      const res = await this.validRepoObj.validateAll()
      if (!res[1]) {
        return Promise.reject(false)
      }
      const validList = [this.$refs.addConfigForm.validate()]
      if (this.$refs.buildApp) {
        validList.push(this.$refs.buildApp.validate())
      }
      if (this.$refs.cacheDir) {
        validList.push(this.$refs.cacheDir.validate())
      }
      return Promise.all(validList)
    },
    addFirstCacheDir () {
      if (
        !this.buildInfo.job_ctx.caches ||
        this.buildInfo.job_ctx.caches.length === 0
      ) {
        this.$set(this.buildInfo.job_ctx, 'caches', [])
        this.buildInfo.job_ctx.caches.push('')
      }
    },
    addCacheDir (index) {
      this.$refs.cacheDir.validate(valid => {
        if (valid) {
          this.buildInfo.job_ctx.caches.push('')
        } else {
          return false
        }
      })
    },
    deleteCacheDir (index) {
      this.buildInfo.job_ctx.caches.splice(index, 1)
    },
    addBuildApp (index) {
      this.$refs.buildApp.validate(valid => {
        if (valid) {
          this.buildInfo.install_items.push({
            name: '',
            version: '',
            id: ''
          })
        } else {
          return false
        }
      })
    },
    addFirstBuildApp () {
      this.buildInfo.install_items.push({
        name: '',
        version: '',
        id: ''
      })
    },
    deleteBuildApp (index) {
      this.buildInfo.install_items.splice(index, 1)
    },
    async loadPage () {
      getAllAppsAPI().then(response => {
        const apps = this.$utils.sortVersion(response, 'name', 'asc')
        this.allApps = apps.map((app, index) => {
          return {
            name: app.name,
            version: app.version,
            id: app.name + app.version
          }
        })
      })
      getImgListAPI().then(response => {
        this.systems = response
        if (!this.isEdit) {
          this.buildInfo.image_id = this.systems[0].id
        }
      })
    },
    getRestoredBuild () {
      const { buildv3 } = cloneDeep(this.commonInfo)
      this.buildInfo = { ...cloneDeep(buildInfo), ...buildv3 }
      this.buildConfig.repos = buildv3.job_ctx ? buildv3.job_ctx.builds : []
    },
    updateCommonInfo () {
      const system = this.systems.find(system => system.id === this.buildInfo.image_id)
      this.buildInfo.image_from = system.image_from
      this.buildInfo.build_os = system.value
      this.buildInfo.job_ctx.builds = this.buildConfig.repos
      this.$store.commit('UPDATE_COMMON_INFO', { buildv3: this.buildInfo })
    }
  },
  components: {
    Editor,
    Resize,
    Codemirror
  },
  computed: {
    ...mapState({
      commonInfo: state => state.commonWorkflow.commonInfo
    })
  },
  created () {
    this.loadPage()
  },
  activated () {
    this.getRestoredBuild()
    this.validObj.addValidate({
      name: 'Construct',
      valid: this.validate
    })
  },
  deactivated () {
    this.updateCommonInfo()
  }
}
</script>
<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

.deploy-script {
  margin-top: 10px;
  margin-bottom: 10px;

  .ace_editor.ace-xcode {
    &:hover {
      .scrollBar();
    }
  }
}

.build-config-container {
  flex: 1;
  height: 100%;
  padding: 15px;
  overflow: auto;
  font-size: 13px;

  .divider {
    width: 100%;
    height: 1px;
    margin: 5px 0 15px 0;
    background-color: #dfe0e6;

    &.item {
      width: 30%;
    }
  }

  .section {
    margin-bottom: 15px;
  }

  .el-form {
    .item-title {
      font-size: 15px;
    }

    .variable {
      color: #06f;
      font-size: 13px;
      cursor: pointer;
    }
  }

  .form-bottom-0 {
    .el-form-item {
      margin-bottom: 0;
    }
  }

  .app-operation {
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>
