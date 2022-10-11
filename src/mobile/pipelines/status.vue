<template>
  <div class="mobile-status">
    <van-nav-bar>
      <template #title>
        Operating Status
      </template>
    </van-nav-bar>
    <van-tabs v-model="activeTab"
              sticky>
      <van-tab :title="`Running ${tasksCount.running?tasksCount.running:''}`"
               name="running">
        <van-empty v-if="tasksCount.running===0"
                   image="search"
                   description="No Running Tasks Yet" />
        <div v-else
             v-for="task in runningTasks"
             :key="task.task_id"
             class="task-container">
          <van-cell-group>
            <van-cell center
                      :to="`/mobile/pipelines/project/${task.product_name}/multi/${task.pipeline_name}/${task.task_id}?status=${task.status}`">
              <template #title>
                <span class="workflow-name">{{`${task.pipeline_name}`}}</span>
                <van-tag plain
                         type="primary">{{`#${task.task_id}`}}</van-tag>
              </template>
              <template #label>
                <span class="creator">{{`${task.task_creator}`}}</span>
                <div class="time">{{$utils.convertTimestamp(task.create_time)}}</div>
              </template>
              <template #default>
                <van-button round
                            @click.stop="taskOperation('cancel',task.task_id,task.pipeline_name)"
                            size="small"
                            type="danger">Cancel</van-button>
              </template>
            </van-cell>
          </van-cell-group>
        </div>

      </van-tab>
      <van-tab :title="`In Queue ${tasksCount.pending?tasksCount.pending:''}`"
               name="pending">
        <van-empty v-if="tasksCount.pending===0"
                   image="search"
                   description="There are no tasks in the queue" />
        <div v-else
             v-for="task in pendingTasks"
             :key="task.task_id"
             class="task-container">
          <van-cell-group>
            <van-cell center>
              <template #title>
                <span class="workflow-name">{{`${task.pipeline_name}`}}</span>
                <van-tag plain
                         type="primary">{{`#${task.task_id}`}}</van-tag>
              </template>
              <template #label>
                <span class="creator">{{`${task.task_creator}`}}</span>
                <div class="time">{{$utils.convertTimestamp(task.create_time)}}</div>
              </template>
              <template #default>
                <van-button round
                            @click.stop="taskOperation('cancel',task.task_id,task.pipeline_name)"
                            size="small"
                            type="danger">Cancel</van-button>
              </template>
            </van-cell>
          </van-cell-group>
        </div>

      </van-tab>
    </van-tabs>

  </div>
</template>
<script>
import { NavBar, Tag, Panel, Loading, Button, Notify, Tab, Tabs, Cell, CellGroup, Icon, Empty } from 'vant'
import { taskRunningSSEAPI, taskPendingSSEAPI, cancelWorkflowAPI } from '@api'
export default {
  components: {
    [NavBar.name]: NavBar,
    [Tag.name]: Tag,
    [Panel.name]: Panel,
    [Loading.name]: Loading,
    [Button.name]: Button,
    [Notify.name]: Notify,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Icon.name]: Icon,
    [Empty.name]: Empty

  },
  data () {
    return {
      activeTab: 'running',
      tasksCount: {
        running: null,
        pending: null
      },
      runningTasks: [],
      pendingTasks: []
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  methods: {
    showTaskList (type) {
      if (type === 'running') {
        taskRunningSSEAPI()
          .then(res => {
            this.runningTasks = res.data
            this.tasksCount.running = res.data.length
          })
          .closeWhenDestroy(this)
      } else if (type === 'queue') {
        taskPendingSSEAPI()
          .then(res => {
            this.pendingTasks = res.data
            this.tasksCount.pending = res.data.length
          })
          .closeWhenDestroy(this)
      }
    },
    /*
    Task Operation
    * @param  {string}           operation Operate （cancel）
    * @param  {number}           id Task id
    * @param  {string}           pipeline_name Pipeline Name
    * @return {}
    */
    taskOperation (operation, id, pipeline_name) {
      switch (operation) {
        case 'cancel':
          cancelWorkflowAPI(this.projectName, pipeline_name, id).then(res => {
            Notify({ type: 'success', message: 'The task was canceled successfully' })
          })
          break
        default:
          break
      }
    }
  },
  mounted () {
    this.showTaskList('running')
    this.showTaskList('queue')
  }
}
</script>
