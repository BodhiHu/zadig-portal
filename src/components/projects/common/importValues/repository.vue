<template>
  <div class="value-repo-container">
    <el-form
      :model="source"
      :rules="sourceRules"
      ref="repoForm"
      status-icon
      label-position="right"
      :label-width="hiddenLabel ? '0px' : '140px'"
      class="value-repo-form"
      :class="{'hidden-label': hiddenLabel}"
    >
      <el-form-item prop="codehostID" label="Code Source" :show-message="false">
        <el-select
          v-model="source.codehostID"
          size="small"
          style="width: 100%;"
          placeholder="Please select a code source"
          @change="queryRepoOwnerById(source.codehostID)"
          filterable
          clearable
        >
          <el-option
            v-for="(host, index) in allCodeHosts"
            :key="index"
            :label="host.address + '('+host.alias+')'"
            :value="host.id"
            :disabled="host.type === 'gitee'"
          >{{ host.address + '('+host.alias+')'}}</el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="owner" label="Organization Name/Username" :show-message="false">
        <el-select
          v-model="source.owner"
          size="small"
          style="width: 100%;"
          @change="getRepoNameById(source.codehostID, source.owner)"
          placeholder="Please select an organization name/Username"
          filterable
          clearable
        >
          <el-option v-for="(repo, index) in codeInfo['repoOwners']" :key="index" :label="repo.path" :value="repo.path"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="repo" label="Code Library" :show-message="false">
        <el-select
          @change="
                  getBranchInfoById(
                    source.codehostID,
                    source.owner,
                    source.repo
                  )
                "
          v-model.trim="source.repo"
          remote
          :remote-method="searchProject"
          style="width: 100%;"
          allow-create
          clearable
          size="small"
          placeholder="Please select a repository"
          filterable
        >
          <el-option v-for="(repo, index) in codeInfo['repos']" :key="index" :label="repo.name" :value="repo.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="branch" label="Branch" :show-message="false">
        <el-select v-model.trim="source.branch" placeholder="Please Select A Branch" style="width: 100%;" size="small" filterable allow-create clearable>
          <el-option v-for="(branch, branch_index) in codeInfo['branches']" :key="branch_index" :label="branch.name" :value="branch.name"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="valuesPaths">
        <template slot="label">
          <template v-if="fileType === 'valuesYaml'">
            <el-tooltip v-if="!substantial" effect="dark" content="Select in order of coverage values Document，The file selected later will overwrite the file selected earlier。" placement="top">
              <span>File Path</span>
            </el-tooltip>
            <span v-else>File Path</span>
          </template>
          <template v-else-if="fileType === 'k8sYaml'">
            <span>Select The File</span>
          </template>
        </template>
        <div v-show="source.valuesPaths.length" class="overflow-auto">
          <div v-for="(path, index) in source.valuesPaths" :key="index">
            <span style="line-height: 18px;">{{path}}</span>
            <el-button v-if="!substantial" type="text" icon="el-icon-close" @click="deletePath(index)" style="padding: 1px 0 1px 0.5rem;"></el-button>
          </div>
        </div>
        <el-button
          :disabled="canSelectFile"
          type="primary"
          :round="fileType === 'valuesYaml'"
          :circle="fileType === 'k8sYaml'"
          plain
          size="mini"
          @click="showFileSelectDialog = true"
        >
          <span v-if="fileType === 'valuesYaml'">Choose values Document</span>
          <i v-else-if="fileType === 'k8sYaml'" class="el-icon-plus"></i>
        </el-button>
      </el-form-item>
      <el-form-item v-if="showAutoSync" prop="autoSync" label="Auto Sync" :show-message="false">
        <span slot="label">
          <span>Auto Sync</span>
          <el-tooltip effect="dark" content="After Opening，Zadig The configuration files are regularly pulled from the codebase and automatically updated to the environment，Currently Only Supported GitHub/GitLab" placement="top">
            <i class="pointer el-icon-question"></i>
          </el-tooltip>
        </span>
        <el-switch v-model="source.autoSync"></el-switch>
      </el-form-item>
      <el-dialog :title="typeObject[fileType].dialogTitle" :visible.sync="showFileSelectDialog" append-to-body>
        <TreeFile
          v-if="showFileSelectDialog"
          :gitRepoConfig="source"
          :getGitSource="getGitSource"
          @checkedPath="checkedPath"
          :checkOne="!substantial"
          :fileType="typeObject[fileType].fileType"
        ></TreeFile>
      </el-dialog>
    </el-form>
  </div>
</template>
<script>
import RepoMixin from '../mixin/importRepo'
import TreeFile from './treeFile.vue'
export default {
  props: {
    repoSource: Object,
    hiddenLabel: {
      default: false,
      type: Boolean
    },
    substantial: {
      default: false,
      type: Boolean
    },
    fileType: {
      default: 'valuesYaml', // valuesYaml, k8sYaml
      type: String
    },
    showAutoSync: {
      default: false,
      type: Boolean
    }
  },
  mixins: [RepoMixin],
  data () {
    return {
      showFileSelectDialog: false,
      typeObject: {
        valuesYaml: {
          dialogTitle: 'Please select the service values Document',
          fileType: '.yaml'
        },
        k8sYaml: {
          dialogTitle: 'Please select files to sync',
          fileType: '.yaml'
        }
      }
    }
  },
  computed: {
    canSelectFile () {
      const source = this.source
      return !(
        source.codehostID &&
        source.owner &&
        source.repo &&
        source.branch
      )
    }
  },
  watch: {
    repoSource: {
      handler (nVal, oldV) {
        this.source = nVal
      },
      immediate: true
    }
  },
  methods: {
    checkedPath (data) {
      this.showFileSelectDialog = false
      if (!data.length) {
        return
      }
      this.source.valuesPaths = data.map(d => d.full_path)
      this.validate()
    },
    deletePath (index) {
      this.source.valuesPaths.splice(index, 1)
    },
    validate () {
      return this.$refs.repoForm.validate()
    }
  },
  components: {
    TreeFile
  }
}
</script>
<style lang="less" scoped>
@import url('~@assets/css/common/scroll-bar.less');

.value-repo-container {
  .repo-attr {
    span {
      display: inline-block;
      width: 128px;
      margin-bottom: 20px;
      padding-right: 12px;
      line-height: 40px;
      text-align: right;
    }
  }

  /deep/.el-form {
    &.value-repo-form {
      .el-form-item {
        margin-bottom: 12px;
      }
    }

    &.hidden-label {
      .el-form-item__label {
        display: none;
      }
    }

    &.el-form--label-right {
      .el-form-item__label {
        text-align: right;
      }
    }
  }

  .overflow-auto {
    max-height: 90px;
    margin: 9px 0;
    overflow: auto;
    line-height: 20px;

    .blockScrollBar();
  }
}

.submit-button {
  text-align: center;
}
</style>
