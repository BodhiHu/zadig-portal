<template>
  <div class="mobile-pipelines-detail">
    <van-nav-bar left-arrow fixed @click-left="mobileGoback">
      <template #title>
        <span>{{workflowName}}</span>
      </template>
    </van-nav-bar>
    <van-divider content-position="left">基本信息</van-divider>
    <div class="task-info">
      <van-row>
        <van-col span="12">
          <div class="mobile-block">
            <h2 class="mobile-block-title">创建者</h2>
            <div class="mobile-block-desc">{{ workflow.update_by }}</div>
          </div>
        </van-col>
        <van-col span="12">
          <div class="mobile-block">
            <h2 class="mobile-block-title">更新时间</h2>
            <div class="mobile-block-desc">{{ $utils.convertTimestamp(workflow.update_time) }}</div>
          </div>
        </van-col>
      </van-row>
      <van-row v-if="workflow.description">
        <van-col span="24">
          <div class="mobile-block">
            <h2 class="mobile-block-title">描述</h2>
            <div class="mobile-block-desc">{{workflow.description}}</div>
          </div>
        </van-col>
      </van-row>
      <van-row>
        <van-col span="24">
          <div class="mobile-block">
            <h2 class="mobile-block-title">包含流程</h2>
            <div class="mobile-block-desc">
              <van-tag v-if="!$utils.isEmpty(workflow.build_stage) && workflow.build_stage.enabled" type="primary">构建部署</van-tag>
              <van-tag v-if="!$utils.isEmpty(workflow.artifact_stage) && workflow.artifact_stage.enabled" type="primary">交付物部署</van-tag>
              <van-tag v-if="!$utils.isEmpty(workflow.distribute_stage) &&  workflow.distribute_stage.enabled" type="primary">分发部署</van-tag>
              <van-tag v-if="!$utils.isEmpty(workflow.test_stage) &&  workflow.test_stage.enabled" type="primary">测试</van-tag>
            </div>
          </div>
        </van-col>
      </van-row>
      <van-row>
        <van-col span="24">
          <div class="mobile-block">
            <h2 class="mobile-block-title">操作</h2>
            <van-cell is-link title="启动工作流" @click="showAction = true" />
            <van-action-sheet
              close-on-click-action
              v-model="showAction"
              :actions="actions"
              cancel-text="取消"
              @select="onSelectAction"
              @cancel="onCancel"
            />
          </div>
        </van-col>
      </van-row>
    </div>
    <van-divider content-position="left">历史任务</van-divider>
    <div>
      <van-cell
        v-for="task in workflowTasks"
        :to="`/mobile/projects/detail/${projectName}/workflows/multi/${task.pipeline_name}/${task.task_id}?status=${task.status}`"
        :key="task.task_id"
      >
        <template #title>
          <span class="create-info">{{ convertTimestamp(task.create_time)+' '+ task.task_creator}}</span>
        </template>
        <template #label>
          <span class="task-id">{{`#${task.task_id}`}}</span>
          <span class="status">
            <van-tag plain :type="$utils.mobileElTagType(task.status)">{{ myTranslate(task.status) }}</van-tag>
          </span>
          <span class="env" v-if="task.namespace">{{task.namespace}}</span>
        </template>
        <template #default>
          <span v-if="task.status!=='running'" style="font-size: 13px;">{{ $utils.timeFormat(task.end_time - task.start_time) }}</span>
          <span v-else style="font-size: 13px;">
            {{ taskDuration(task.task_id,task.start_time) +
            $utils.timeFormat(durationSet[task.task_id]) }}
          </span>
        </template>
      </van-cell>
      <van-pagination v-model="currentPage" @change="changeTaskPage" :items-per-page="pageSize" :total-items="total" />
      <van-popup closeable round v-model="taskDialogVisible" position="bottom" :style="{ height: '70%' }">
        <RunWorkflow
          v-if="taskDialogVisible"
          :workflowName="workflowName"
          :workflowMeta="workflow"
          :targetProject="workflow.product_tmpl_name"
          :forcedUserInput="forcedUserInput"
          @success="hideAndFetchHistory"
        />
      </van-popup>
    </div>
  </div>
</template>
<script>
import {
  NavBar,
  Tag,
  Loading,
  Button,
  Tab,
  Tabs,
  Cell,
  CellGroup,
  Icon,
  Col,
  Row,
  Divider,
  ActionSheet,
  List,
  Pagination,
  Popup
} from 'vant'
import { getWorkflowDetailAPI, workflowTaskListAPI } from '@api'
import { wordTranslate } from '@utils/wordTranslate.js'
import RunWorkflow from './runWorkflow.vue'
import moment from 'moment'
export default {
  components: {
    [NavBar.name]: NavBar,
    [Tag.name]: Tag,
    [Loading.name]: Loading,
    [Button.name]: Button,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Icon.name]: Icon,
    [Col.name]: Col,
    [Row.name]: Row,
    [Divider.name]: Divider,
    [ActionSheet.name]: ActionSheet,
    [List.name]: List,
    [Pagination.name]: Pagination,
    [Popup.name]: Popup,
    RunWorkflow
  },
  data () {
    return {
      workflow: {},
      workflowTasks: [],
      actions: [{ name: '启动' }],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      guideDialog: false,
      taskDialogVisible: false,
      showAction: false,
      durationSet: {},
      forcedUserInput: {},
      loading: false,
      finished: true
    }
  },
  methods: {
    onSelectAction (action) {
      if (action.name === '启动') {
        this.runTask()
      }
      this.showAction = false
    },
    onCancel () {
      this.showAction = false
    },
    runTask () {
      this.taskDialogVisible = true
      this.forcedUserInput = {}
    },
    hideAndFetchHistory () {
      this.taskDialogVisible = false
      this.fetchHistory(0, this.pageSize)
    },
    fetchHistory (start, max) {
      workflowTaskListAPI(this.projectName, this.workflowName, start, max).then(
        res => {
          res.data.forEach(element => {
            if (element.test_reports) {
              const testArray = []
              for (const testName in element.test_reports) {
                const val = element.test_reports[testName]
                if (typeof val === 'object') {
                  const struct = {
                    success: null,
                    total: null,
                    name: null,
                    type: null,
                    time: null,
                    img_id: null
                  }
                  if (val.functionTestSuite) {
                    struct.name = testName
                    struct.type = 'function'
                    struct.success =
                      val.functionTestSuite.tests -
                      val.functionTestSuite.failures -
                      val.functionTestSuite.errors
                    struct.total = val.functionTestSuite.tests
                    struct.time = val.functionTestSuite.time
                  }
                  testArray.push(struct)
                }
              }
              element.testSummary = testArray
            }
          })
          this.workflowTasks = res.data
          this.total = res.total
        }
      )
    },
    changeTaskPage (val) {
      const start = (val - 1) * this.pageSize
      this.fetchHistory(start, this.pageSize)
    },
    convertTimestamp (value) {
      return moment.unix(value).format('MM-DD HH:mm')
    },
    myTranslate (word) {
      return wordTranslate(word, 'pipeline', 'task')
    },
    taskDuration (task_id, started) {
      const refresh = () => {
        const duration = Math.floor(Date.now() / 1000) - started
        this.$set(this.durationSet, task_id, duration)
      }
      setInterval(refresh, 1000)
      return ''
    }
  },
  computed: {
    workflowName () {
      return this.$route.params.workflow_name
    },
    projectName () {
      return this.$route.params.project_name
    }
  },
  mounted () {
    getWorkflowDetailAPI(this.projectName, this.workflowName).then(res => {
      this.workflow = res
    })
    this.fetchHistory(0, this.pageSize)
  }
}
</script>
<style lang="less">
.mobile-pipelines-detail {
  padding-top: 46px;
  padding-bottom: 50px;

  .task-id {
    color: @themeColor;
  }

  .status,
  .env {
    margin-left: 8px;
  }

  .run-workflow {
    .el-dialog__body {
      padding: 8px 10px;
      color: #606266;
      font-size: 14px;
    }
  }

  .van-cell__label {
    white-space: nowrap;
  }
}
</style>
