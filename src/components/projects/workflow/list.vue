<template>
  <div class="workflow-list" ref="workflow-list">
    <div
      v-loading="workflowListLoading"
      class="pipeline-loading"
      element-loading-text="Loading..."
      element-loading-spinner="iconfont iconfont-loading icongongzuoliucheng"
    >
      <ul class="workflow-ul">
        <div v-if="workflows.length > 0" class="project-header">
          <div class="header-start">
            <div class="container">
              <div class="function-container">
                <div class="btn-container">
                  <button type="button" :class="{'active':showFavorite}" @click="showFavorite=!showFavorite" class="display-btn">
                    <i class="el-icon-star-on favorite"></i>
                  </button>
                  <el-dropdown @command="sortWorkflow" placement="bottom">
                    <button type="button" class="display-btn">
                      <i class="el-icon-sort sort"></i>
                    </button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="name-asc">Ascending By Name</el-dropdown-item>
                      <el-dropdown-item command="name-desc">Descending By Name</el-dropdown-item>
                      <el-dropdown-item command="time-asc">Ascending by creation time</el-dropdown-item>
                      <el-dropdown-item command="time-desc">Descending by creation time</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
                <el-input v-model="keyword" placeholder="Search Workflow" class="search-workflow" prefix-icon="el-icon-search" clearable></el-input>
              </div>
            </div>
          </div>
        </div>
        <VirtualList
          v-if="availableWorkflows.length > 0"
          class="virtual-list-container"
          :data-key="'name'"
          :data-sources="availableWorkflows"
          :keeps="20"
          :estimate-size="82"
          :data-component="itemComponent"
        />
        <div v-if="availableWorkflows.length === 0 && !workflowListLoading" class="no-product">
          <img src="@assets/icons/illustration/workflow.svg" alt />
          <p>There are currently no workflows to show，Please create a new workflow manually</p>
        </div>
      </ul>
    </div>

    <el-dialog title="Choose A Workflow Type" :visible.sync="showSelectWorkflowType" width="450px">
      <div class="type-content">
        <el-radio v-model="selectWorkflowType" label="product">Workflow</el-radio>
        <div class="type-desc">Have a build on the project environment、Deploy、Ability to test and service release delivery</div>
        <!-- <el-radio v-model="selectWorkflowType" label="common">Universal-Workflow</el-radio>
        <div class="type-desc">Customizable Workflow，Built In Build、K8s Deploy、Small program release and other steps</div> -->
        <el-radio v-model="selectWorkflowType" label="custom">Custom Workflow<el-tag type="success" size="small" class="mg-l8">new</el-tag></el-radio>
        <div class="type-desc">Customizable workflow steps and freely choreographed execution sequence</div>
      </div>
      <div slot="footer">
        <el-button size="small" @click="showSelectWorkflowType = false">Cancel</el-button>
        <el-button size="small" type="primary" @click="createWorkflow">Sure</el-button>
      </div>
    </el-dialog>

    <el-dialog title="Run The Product-Workflow" :visible.sync="showStartProductBuild" custom-class="run-workflow" width="60%">
      <RunProductWorkflow
        v-if="workflowToRun.name"
        :workflowName="workflowToRun.name"
        :workflowMeta="workflowToRun"
        :targetProject="workflowToRun.product_tmpl_name"
        @success="hideProductTaskDialog"
      />
    </el-dialog>

    <el-dialog title="Run Generic-Workflow" :visible.sync="showStartCommonWorkflowBuild" :close-on-click-modal="false">
      <RunCommonWorkflow :value="showStartCommonWorkflowBuild" :workflow="commonToRun" />
    </el-dialog>
    <el-dialog :visible.sync="isShowRunCustomWorkflowDialog" title="Execute Workflow" custom-class="run-workflow" width="60%" class="dialog">
      <RunCustomWorkflow
        v-if="workflowToRun.name"
        :workflowName="workflowToRun.name"
        :projectName="projectName"
        @success="hideAfterSuccess"
      />
    </el-dialog>
  </div>
</template>

<script>
import VirtualListItem from './list/virtualListItem'
import RunProductWorkflow from './common/runWorkflow.vue'
import RunCommonWorkflow from './common/runCommonWorkflow.vue'
import RunCustomWorkflow from './common/runCustomWorkflow'
import VirtualList from 'vue-virtual-scroll-list'
import qs from 'qs'
import {
  getWorkflowDetailAPI,
  deleteProductWorkflowAPI,
  copyWorkflowAPI,
  getCommonWorkflowListAPI,
  getCustomWorkflowListAPI,
  getCustomWorkfloweTaskPresetAPI,
  deleteWorkflowAPI
} from '@api'
import bus from '@utils/eventBus'
import { mapGetters } from 'vuex'
import { orderBy } from 'lodash'

export default {
  name: 'workflow-list',
  data () {
    return {
      itemComponent: VirtualListItem,
      showStartProductBuild: false,
      workflowListLoading: false,
      showFavorite: false,
      workflowToRun: {},
      remain: 10,
      keyword: '',
      sortBy: 'name-asc',
      workflowsList: [],
      showSelectWorkflowType: false,
      selectWorkflowType: 'product',

      showStartCommonWorkflowBuild: false,
      isShowRunCustomWorkflowDialog: false,
      commonToRun: {}
    }
  },
  provide () {
    return {
      startProductWorkflowBuild: this.startProductWorkflowBuild,
      startCustomWorkflowBuild: this.startCustomWorkflowBuild,
      copyWorkflow: this.copyWorkflow,
      deleteProductWorkflow: this.deleteProductWorkflow,
      renamePipeline: this.renamePipeline,
      startCommonWorkflowBuild: this.startCommonWorkflowBuild,
      deleteCommonWorkflow: this.deleteCommonWorkflow
    }
  },
  computed: {
    ...mapGetters(['getOnboardingTemplates']),
    projectName () {
      return this.$route.params.project_name
    },
    workflows () {
      return this.workflowsList.filter(pipeline => {
        return !this.getOnboardingTemplates.includes(pipeline.projectName)
      })
    },
    availableWorkflows () {
      const filteredWorkflows = this.filteredWorkflows
      let sortedWorkflows = []
      const nameSorter = item => item.name.toLowerCase()
      const timeSorter = item => item.updateTime
      if (this.sortBy === 'name-asc') {
        sortedWorkflows = orderBy(filteredWorkflows, nameSorter, 'asc')
      } else if (this.sortBy === 'name-desc') {
        sortedWorkflows = orderBy(filteredWorkflows, nameSorter, 'desc')
      } else if (this.sortBy === 'time-asc') {
        sortedWorkflows = orderBy(filteredWorkflows, timeSorter, 'asc')
      } else if (this.sortBy === 'time-desc') {
        sortedWorkflows = orderBy(filteredWorkflows, timeSorter, 'desc')
      }
      if (this.showFavorite) {
        const favoriteWorkflows = this.$utils
          .cloneObj(sortedWorkflows)
          .filter(x => {
            return x.isFavorite
          })
        return favoriteWorkflows
      } else {
        const sortedByFavorite = this.$utils
          .cloneObj(sortedWorkflows)
          .sort(x => {
            return x.isFavorite ? -1 : 1
          })
        return sortedByFavorite
      }
    },
    filteredWorkflows () {
      const list = this.$utils.filterObjectArrayByKey(
        'name',
        this.keyword,
        this.workflows
      )
      return list
    }
  },
  watch: {
    keyword (val) {
      this.$router.replace({
        query: Object.assign(
          {},
          qs.parse(window.location.search, { ignoreQueryPrefix: true }),
          {
            name: val
          }
        )
      })
    },
    projectName (val) {
      if (val) {
        bus.$emit('set-topbar-title', {
          title: '',
          breadcrumb: [
            { title: 'Project', url: '/v1/projects' },
            {
              title: this.projectName,
              isProjectName: true,
              url: `/v1/projects/detail/${this.projectName}/detail`
            },
            { title: 'Workflow', url: '' }
          ]
        })
      }
    },
    $route (val) {
      if (val && !this.projectName) {
        this.getWorkflows()
      }
    }
  },
  methods: {
    createWorkflow () {
      const type = this.selectWorkflowType
      let path = ''
      if (type === 'product') {
        path = '/workflows/product/create'
      } else if (type === 'common') {
        path = '/workflows/common/create'
      } else {
        path = `/v1/projects/detail/${this.projectName}/pipelines/custom/create`
      }
      this.$router.push(
        `${path}?projectName=${this.projectName ? this.projectName : ''}`
      )
    },
    async getWorkflows (projectName) {
      this.workflowListLoading = true
      let commonWorkflows = []
      if (this.projectName) {
        commonWorkflows = await getCustomWorkflowListAPI(
          projectName
        ).catch(err => {
          console.log(err)
          return []
        })
        commonWorkflows.workflow_list.forEach(list => {
          list.type = 'common'
        })
      } else {
        commonWorkflows = await getCommonWorkflowListAPI().catch(err => {
          console.log(err)
          return []
        })
        commonWorkflows.workflow_list.forEach(list => {
          list.type = 'common'
        })
      }
      // use new api includes add data
      this.workflowListLoading = false
      this.workflowsList = [
        ...commonWorkflows.workflow_list
      ]
    },
    deleteProductWorkflow (workflow) {
      const name = workflow.name
      const projectName = workflow.projectName
      if (workflow.base_refs && workflow.base_refs.length) {
        this.$alert(`Workflow ${name} Already in collaborative mode ${workflow.base_refs.join('、')} Is defined as the baseline workflow，If you need to delete it, please modify the collaboration mode first！`, 'Delete Workflow', {
          confirmButtonText: 'Sure',
          type: 'warning'
        })
        return
      }
      this.$prompt('Enter workflow name to confirm', 'Delete Workflow ' + name, {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        confirmButtonClass: 'el-button el-button--danger',
        inputValidator: workflowName => {
          if (workflowName === name) {
            return true
          } else if (workflowName === '') {
            return 'Please enter a workflow name'
          } else {
            return 'Name Does Not Match'
          }
        }
      }).then(({ value }) => {
        deleteProductWorkflowAPI(projectName, name).then(() => {
          this.getWorkflows(this.projectName)
          this.$message.success('Successfully Deleted')
        })
      })
    },
    deleteCommonWorkflow (workflow) {
      if (workflow.base_refs && workflow.base_refs.length) {
        this.$alert(`Workflow ${workflow.name} Already in collaborative mode ${workflow.base_refs.join('、')} Is defined as the baseline workflow，If you need to delete it, please modify the collaboration mode first！`, 'Delete Workflow', {
          confirmButtonText: 'Sure',
          type: 'warning'
        })
        return
      }
      this.$prompt('Enter workflow name to confirm', `Delete Workflow ${workflow.name}`, {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        confirmButtonClass: 'el-button--danger',
        inputValidator: value => {
          if (value === workflow.name) {
            return true
          } else {
            return 'Input name does not match'
          }
        }
      })
        .then(({ value }) => {
          deleteWorkflowAPI(workflow.name, this.projectName).then(
            res => {
              this.getWorkflows(this.projectName)
              this.$message.success(`${value}Successfully Deleted！`)
            }
          )
        })
        .catch(() => {
          this.$message.info('Undelete')
        })
    },
    startProductWorkflowBuild (workflow) {
      this.workflowToRun = {}
      getWorkflowDetailAPI(workflow.projectName, workflow.name)
        .then(res => {
          this.showStartProductBuild = true
          this.workflowToRun = res
        })
        .catch(err => {
          this.showStartProductBuild = false
          console.log(err)
        })
    },
    startCustomWorkflowBuild (workflow) {
      this.workflowToRun = {}
      getCustomWorkfloweTaskPresetAPI(workflow.name, this.projectName)
        .then(res => {
          this.isShowRunCustomWorkflowDialog = true
          this.workflowToRun = res
        })
        .catch(() => {
          this.isShowRunCustomWorkflowDialog = false
        })
    },
    hideProductTaskDialog () {
      this.showStartProductBuild = false
    },
    hideAfterSuccess () {
      this.isShowRunCustomWorkflowDialog = false
    },
    copyWorkflow (workflow) {
      const oldName = workflow.name
      const projectName = workflow.projectName
      this.$prompt('Please enter a new product workflow name', 'Duplicate Workflow', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        inputValidator: newName => {
          const pipeNames = []
          this.workflowsList.forEach(element => {
            pipeNames.push(element.name)
          })
          if (newName === '') {
            return 'Please enter a workflow name'
          } else if (pipeNames.includes(newName)) {
            return 'Duplicate Workflow Name'
          } else if (!/^[a-zA-Z0-9-]+$/.test(newName)) {
            return 'Names only support uppercase and lowercase letters and numbers，Special characters only support underscores'
          } else {
            return true
          }
        }
      })
        .then(({ value }) => {
          this.copyWorkflowReq(projectName, oldName, value)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Cancel Copy'
          })
        })
    },
    copyWorkflowReq (projectName, oldName, newName) {
      copyWorkflowAPI(projectName, oldName, newName).then(() => {
        this.$message({
          message: 'Replication pipeline succeeded',
          type: 'success'
        })
        this.getWorkflows(this.projectName)
        this.$router.push(
          `/workflows/product/edit/${newName}?projectName=${projectName}`
        )
      })
    },
    sortWorkflow (cm) {
      this.sortBy = cm
    },
    startCommonWorkflowBuild (worflow) {
      this.commonToRun = worflow
      this.showStartCommonWorkflowBuild = true
    }
  },
  created () {
    this.$emit('injectComp', this)
    // Detecting change from VirtualListItem component event.
    this.$on('refreshWorkflow', projectName => {
      this.getWorkflows(projectName)
    })
    this.keyword = this.$route.query.name ? this.$route.query.name : ''
    if (this.projectName) {
      this.getWorkflows(this.projectName)
      bus.$emit('set-topbar-title', {
        title: '',
        breadcrumb: [
          { title: 'Project', url: '/v1/projects' },
          {
            title: this.projectName,
            isProjectName: true,
            url: `/v1/projects/detail/${this.projectName}/detail`
          },
          { title: 'Workflow', url: '' }
        ]
      })
    }
  },
  components: {
    RunProductWorkflow,
    VirtualListItem,
    VirtualList,
    RunCommonWorkflow,
    RunCustomWorkflow
  }
}
</script>

<style lang="less">
.workflow-list {
  position: relative;
  flex: 1;
  height: calc(~'100% - 60px');
  overflow-y: hidden;
  background-color: @globalBackgroundColor;

  ::-webkit-scrollbar-track {
    background-color: #f5f5f5;
    border-radius: 6px;
  }

  ::-webkit-scrollbar {
    width: 5px;
    background-color: #f5f5f5;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #b7b8b9;
    border-radius: 6px;
  }

  .pipeline-type-dialog {
    .choice,
    .desc {
      line-height: 32px;
    }

    .desc {
      padding-left: 24px;
      color: #999;
    }
  }

  .search-pipeline {
    display: inline-block;
    width: 100%;
    padding-top: 15px;

    .el-input {
      width: 200px;

      .el-input__inner {
        border-radius: 16px;
      }
    }

    .el-radio {
      margin-left: 15px;
    }
  }

  .project-header {
    display: flex;
    align-items: stretch;
    justify-content: flex-start;

    .header-start {
      flex: 1;

      .container {
        margin: 0;
        padding: 16px 12px;
        font-size: 13px;

        .function-container {
          display: flex;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: space-between;
          min-height: 30px;

          .btn-container {
            position: relative;
            display: flex;
            align-items: center;
            margin-right: 5px;

            .display-btn {
              margin-right: 5px;
              padding: 8px;
              color: @themeColor;
              font-size: 13px;
              text-decoration: none;
              background-color: #fff;
              border-color: #fff;
              border-style: none;
              border-radius: 4px;
              box-shadow: 0 4px 4px rgba(0, 0, 0, 0.05);
              cursor: pointer;

              .favorite,
              .sort {
                font-size: 20px;
              }

              &:hover {
                color: @themeLightColor;
                background-color: #fff;
                border-color: @themeLightColor;
              }

              &.active {
                color: #fff;
                background-color: @themeLightColor;
                border-color: @themeLightColor;
              }
            }
          }

          .search-workflow {
            width: 400px;
          }
        }
      }
    }

    .header-end {
      .add-project-btn {
        width: 165px;
        height: 100%;
        padding: 10px 17px;
        color: #fff;
        font-size: 13px;
        text-decoration: none;
        background-color: @themeColor;
        border: 1px solid @themeColor;
        cursor: pointer;
      }
    }
  }

  .pipeline-loading {
    height: 100%;
    margin: 0 12px;
    overflow: hidden;

    .virtual-list-container {
      height: 100%;
      overflow-y: auto;
    }

    .no-product {
      display: flex;
      flex-direction: column;
      align-content: center;
      align-items: center;
      justify-content: center;

      img {
        width: 400px;
        height: 400px;
      }

      p {
        color: #606266;
        font-size: 15px;
      }
    }
  }

  .workflow-ul {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0;
    padding: 0;
    list-style: none;

    .start-build {
      color: #000;
    }

    .step-arrow {
      color: #06f;
    }
  }

  .run-workflow {
    .el-dialog__body {
      padding: 8px 10px;
      color: #606266;
      font-size: 14px;
    }
  }

  .type-content {
    line-height: 32px;

    .type-desc {
      margin-bottom: 22px;
      margin-left: 25px;
      color: #999;
    }
  }
}
</style>
