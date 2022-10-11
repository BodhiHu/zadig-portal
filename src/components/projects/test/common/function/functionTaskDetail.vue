<template>
  <div class="workflow-task-detail workflow-or-pipeline-task-detail">
    <!--start of workspace-tree-dialog-->
    <el-dialog :visible.sync="artifactModalVisible"
               width="60%"
               title="Artifact File Export"
               class="downloadArtifact-dialog">
      <ArtifactDownload ref="downloadArtifact"
                         :workflowName="workflowName"
                         :taskId="taskID"
                         :showArtifact="artifactModalVisible"/>
    </el-dialog>
    <!--end of workspace-tree-dialog-->
    <el-row>
      <el-col :span="6">

        <div class="section-head">
          Basic Information
        </div>

        <el-form class="basic-info"
                 label-width="100px">
          <el-form-item label="State">
            <el-tag size="small"
                    effect="dark"
                    :type="$utils.taskElTagType(taskDetail.status)"
                    close-transition>
              {{ myTranslate(taskDetail.status) }}
            </el-tag>
          </el-form-item>
          <el-form-item label="Creator">
            {{ taskDetail.task_creator }}
          </el-form-item>
          <el-form-item v-if="taskDetail.task_revoker"
                        label="Canceller">
            {{ taskDetail.task_revoker }}
          </el-form-item>
          <el-form-item label="Duration">
            {{ taskDetail.interval }}
          </el-form-item>
          <el-form-item v-if="showOperation()"
                        label="Operate">
            <el-button v-hasPermi="{projectName: projectName, action: 'run_test',isBtn:true}" v-if="taskDetail.status==='failed' || taskDetail.status==='cancelled' || taskDetail.status==='timeout'"
                       @click="rerun"
                       type="text"
                       size="medium">Retry On Failure</el-button>
            <el-button v-hasPermi="{projectName: projectName, action: 'run_test',isBtn:true}" v-if="taskDetail.status==='running'||taskDetail.status==='created'"
                       @click="cancel"
                       type="text"
                       size="medium">Cancel Task</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <div v-if="testArray.length > 0"
         class="section-head">
      Test Task
    </div>
    <template v-if="testArray.length > 0">
      <span class="section-title">Automated Test</span>
      <el-table :data="testArray"
                row-key="_target"
                :expand-row-keys="expandedTests"
                @expand-change="updateTestExpanded"
                row-class-name="my-table-row"
                empty-text="None"
                class="test-table">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <TaskDetailTest ref="testComp"
                            :testingv2="scope.row.testingv2SubTask"
                            :serviceName="scope.row._target"
                            :pipelineName="workflowName"
                            :taskID="taskID"/>
          </template>
        </el-table-column>

        <el-table-column prop="_target"
                         label="Name"
                         width="200px">
          <template slot-scope="scope">
            <span>{{$utils.showServiceName(scope.row._target)}}</span>
          </template>
        </el-table-column>

        <el-table-column label="Operating Status">
          <template slot-scope="scope">
            <span :class="colorTranslation(scope.row.testingv2SubTask.status, 'pipeline', 'task')">
              {{ myTranslate(scope.row.testingv2SubTask.status) }}
            </span>
            {{ makePrettyElapsedTime(scope.row.testingv2SubTask) }}
          </template>
        </el-table-column>

        <el-table-column label="Testing Report">
          <template slot-scope="scope">
            <span v-if="scope.row.testingv2SubTask.report_ready === true">
              <router-link class="show-test-result" :to="getTestReport(scope.row.testingv2SubTask, scope.row._target)">
                Check
              </router-link>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="File Export">
          <template slot-scope="scope">
            <span v-if="scope.row.testingv2SubTask.job_ctx.is_has_artifact"
                  @click="artifactModalVisible=true"
                  class="download-artifact-link">
              Download
            </span>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <el-backtop target=".workflow-or-pipeline-task-detail"></el-backtop>
  </div>
</template>

<script>
import { workflowTaskDetailAPI, workflowTaskDetailSSEAPI, restartTestTaskAPI, cancelTestTaskAPI } from '@api'
import { wordTranslate, colorTranslate } from '@utils/wordTranslate.js'
import ArtifactDownload from '@/components/common/artifactDownload.vue'
import TaskDetailTest from './container/taskDetailTest.vue'
export default {
  data () {
    return {
      workflow: {
      },
      taskDetail: {
        stages: []
      },
      expandedTests: [],
      artifactModalVisible: false
    }
  },
  props: {
    basePath: {
      request: true,
      type: String
    }
  },
  computed: {
    workflowName () {
      return this.$route.params.test_name
    },
    taskID () {
      return this.$route.params.task_id
    },
    status () {
      return this.$route.query.status
    },
    projectName () {
      return this.$route.params.project_name
    },
    testMap () {
      const map = {}
      this.collectSubTask(map, 'testingv2')
      return map
    },
    testArray () {
      const arr = this.$utils.mapToArray(this.testMap, '_target')
      for (const test of arr) {
        test.expanded = false
      }
      return arr
    }
  },
  methods: {
    isStageDone (name) {
      if (this.taskDetail.stages.length > 0) {
        const stage = this.taskDetail.stages.find(element => {
          return element.type === name
        })
        return stage ? stage.status === 'passed' : false
      }
    },
    rerun () {
      const taskUrl = `/v1/projects/detail/${this.projectName}/test/detail/function/${this.workflowName}/${this.taskID}`
      restartTestTaskAPI(this.projectName, this.workflowName, this.taskID).then(res => {
        this.$message.success('Task Restarted')
        this.$router.push(taskUrl)
      })
    },
    cancel () {
      cancelTestTaskAPI(this.projectName, this.workflowName, this.taskID).then(res => {
        if (this.$refs && this.$refs.buildComp) {
          this.$refs.buildComp.killLog('buildv2')
          this.$refs.buildComp.killLog('docker_build')
        }
        if (this.$refs && this.$refs.testComp) {
          this.$refs.testComp.killLog('test')
        }
        this.$message.success('The task was canceled successfully')
      })
    },
    handleInputConfirm () {
      const inputValue = this.inputValue
      if (inputValue) {
        this.versionInfo.labels.push(inputValue)
      }
      this.inputTagVisible = false
      this.inputValue = ''
    },
    collectSubTask (map, typeName) {
      const stage = this.taskDetail.stages.find(stage => stage.type === typeName)
      if (stage) {
        for (const target in stage.sub_tasks) {
          if (!(target in map)) {
            map[target] = {}
          }
          map[target][`${typeName}SubTask`] = stage.sub_tasks[target]
        }
      }
    },

    fetchTaskDetail () {
      return workflowTaskDetailSSEAPI(this.projectName, this.workflowName, this.taskID, 'test').then(res => {
        this.adaptTaskDetail(res.data)
        this.taskDetail = res.data
        this.workflow = res.data.workflow_args
      }).closeWhenDestroy(this)
    },
    fetchOldTaskDetail () {
      workflowTaskDetailAPI(this.projectName, this.workflowName, this.taskID, 'test').then(res => {
        this.adaptTaskDetail(res)
        this.taskDetail = res
        this.workflow = res.workflow_args
      })
    },
    adaptTaskDetail (detail) {
      detail.interval = this.$utils.timeFormat(
        (detail.status === 'running'
          ? Math.round((new Date()).getTime() / 1000)
          : detail.end_time) - detail.start_time
      )
    },
    getTestReport (testSubTask, serviceName) {
      const projectName = this.projectName
      const test_job_name = this.workflowName + '-' + this.taskID + '-' + testSubTask.test_name
      const tail = `?is_workflow=1&service_name=${serviceName}&test_type=${testSubTask.job_ctx.test_type}`
      return (`/v1/${this.basePath}/detail/${projectName}/test/testcase/function/${this.workflowName}/${this.taskID}/${test_job_name}${tail}`)
    },
    repoID (repo) {
      return `${repo.source}/${repo.repo_owner}/${repo.repo_name}`
    },
    myTranslate (word) {
      return wordTranslate(word, 'pipeline', 'task')
    },
    colorTranslation (word, category, subitem) {
      return colorTranslate(word, category, subitem)
    },
    calcElapsedTimeNum (subTask) {
      if (this.$utils.isEmpty(subTask) || subTask.status === '') {
        return 0
      }
      const endTime = (subTask.status === 'running' || subTask.status === 'prepare') ? Math.floor(Date.now() / 1000) : subTask.end_time
      return endTime - subTask.start_time
    },
    makePrettyElapsedTime (subTask) {
      return this.$utils.timeFormat(this.calcElapsedTimeNum(subTask))
    },

    updateTestExpanded (row, expandedRows) {
      this.expandedTests = expandedRows.map(r => r._target)
    },
    showOperation () {
      if (this.taskDetail.status === 'failed' || this.taskDetail.status === 'cancelled' || this.taskDetail.status === 'timeout') {
        return true
      }
      if (this.taskDetail.status === 'running' || this.taskDetail.status === 'created') {
        return true
      }

      return false
    }
  },
  watch: {
    $route (to, from) {
      if (this.$route.query.status === 'running') {
        this.fetchTaskDetail()
      } else {
        this.fetchOldTaskDetail()
      }
    }
  },
  created () {
    if (this.status === 'running') {
      this.fetchTaskDetail()
    } else {
      this.fetchOldTaskDetail()
    }
  },
  components: {
    ArtifactDownload,
    TaskDetailTest
  }
}
</script>

<style lang="less">
.downloadArtifact-dialog {
  .el-dialog__body {
    padding: 0 5px;
  }
}

.issue-popper {
  display: inline-block;
  font-size: 14px;

  p {
    margin: 0.5em 0;
  }

  .issue-url {
    color: @themeColor;
    cursor: pointer;
  }
}

.workflow-task-detail {
  position: relative;
  flex: 1;
  padding: 0 20px;
  overflow: auto;

  .el-breadcrumb {
    font-size: 16px;
  }

  .build-summary {
    .repo-name {
      font-size: 15px;
    }

    .link a {
      color: @themeColor;
      cursor: pointer;
    }

    .el-row {
      margin-bottom: 5px;
    }
  }

  .section-head {
    width: 222px;
    height: 28px;
    margin-top: 25px;
    color: #303133;
    font-size: 16px;
    line-height: 28px;
    border-bottom: 1px solid #eee;
  }

  .section-title {
    display: inline-block;
    margin-top: 20px;
    margin-left: 15px;
    color: #666;
    font-size: 13px;
  }

  .version-link,
  .show-test-result,
  .download-artifact-link {
    color: @themeColor;
    cursor: pointer;
  }

  .basic-info,
  .build-deploy-table,
  .test-table,
  .release-table {
    margin-top: 10px;
  }

  .el-form-item {
    margin-bottom: 0;
  }

  .el-form-item__label {
    text-align: left;
  }

  .build-deploy-table,
  .test-table,
  .release-table {
    span[class^="color-"] {
      margin-right: 8px;
    }

    .icon {
      font-size: 18px;
      cursor: pointer;
    }

    .error {
      color: #ff1989;
    }
  }

  .el-table__expanded-cell {
    padding: 0;
  }

  .my-table-row {
    background-color: #f5faff;
  }
}
</style>
