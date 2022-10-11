<template>
  <div class="projects-delivery-container">
    <div class="guide-container">
      <Step :activeStep="3" :stepThreeTitle="`Configuration Environment`"/>
      <div class="current-step-container">
        <div class="title-container">
          <span class="first">The Fourth Step</span>
          <span class="second">Run workflows to trigger automated delivery of services</span>
        </div>
        <div class="block-list">
          <el-table v-loading="loading" :data="mapWorkflows" style="width: 100%;">
            <el-table-column label="Workflow Name">
              <template slot-scope="scope">
                <span style="margin-left: 10px;">{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column width="200px" label="Environmental information">
              <template slot-scope="scope">
                <a
                  v-if="scope.row.env_name"
                  class="env-name"
                  :href="`/v1/projects/detail/${ scope.row.projectName}/envs/detail?envName=${ scope.row.env_name}`"
                  target="_blank">{{ `${scope.row.projectName}-env-${scope.row.env_name}` }}</a>
              </template>
            </el-table-column>
            <el-table-column label="Service Entrance">
              <template slot-scope="scope">
                <div v-for="(ingress,ingress_index) in scope.row.ingress_infos" :key="ingress_index">
                  <div v-for="(item,host_index) in scope.row.ingress_infos[ingress_index]['host_info']" :key="host_index">
                    <el-link :href="`http://${item.host}`" target="_blank">{{item.host}}</el-link>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column width="200px" label="Contains Steps">
              <template slot-scope="scope">
                <span>
                  <span v-for="(stage,index) in scope.row.enabledStages" :key="index" class="stage-tag">
                    <el-tag size="mini">{{wordTranslation(stage,'workflowStage')}}</el-tag>
                  </span>
                </span>
              </template>
            </el-table-column>
            <el-table-column width="150px" label="Update Information（Time/Operator）">
              <template slot-scope="scope">{{$utils.convertTimestamp(scope.row.updateTime)}}</template>
            </el-table-column>
            <el-table-column width="120px" label="Operate">
              <template slot-scope="scope">
                <span v-if="pipeStatus.status !== 'success'">Preparing，Please Wait...</span>
                <el-button v-else type="primary" size="mini" round @click="runCurrentTask(scope.row)" plain>Click To Run</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="help-links-container">
        <h3 class="links-header">
          You May Also Need：
        </h3>
        <ul class="links-list">
          <li class="list-item"><a target="_blank"
               href="https://docs.koderover.com/zadig/project/workflow/#git-webhook"
               class="list-item-link"><i class="icon el-icon-link"></i>
              <span class="list-item-link-text">
                Configure Git Webhook Automatically trigger service upgrades</span></a></li>
        </ul>
      </div>
    </div>
    <div class="controls__wrap">
      <div class="controls__right">
        <el-button type="primary" size="small"  :disabled="loading" @click="onboardingFinish">Finish</el-button>
      </div>
    </div>
    <el-dialog :visible.sync="taskDialogVisible" title="Run The Product-Workflow" custom-class="run-workflow" width="60%" class="dialog">
      <RunWorkflow
        v-if="taskDialogVisible"
        :workflowName="workflow.name"
        :workflowMeta="workflow"
        :targetProject="workflow.product_tmpl_name"
        @success="hideAfterSuccess"
      />
    </el-dialog>
  </div>
</template>
<script>
import bus from '@utils/eventBus'
import Step from '../common/step.vue'
import RunWorkflow from '../../workflow/common/runWorkflow.vue'
import { wordTranslate } from '@utils/wordTranslate.js'
import { getProjectIngressAPI, getProductWorkflowsInProjectAPI, getWorkflowDetailAPI, generateWorkflowAPI } from '@api'
export default {
  data () {
    return {
      loading: true,
      workflow: {},
      taskDialogVisible: false,
      mapWorkflows: [],
      pipeStatus: { status: '' }
    }
  },
  methods: {
    onboardingFinish () {
      const projectName = this.projectName
      this.saveOnboardingStatus(projectName, 0).then(() => {
        this.$router.push(`/v1/projects/detail/${projectName}/detail`)
      })
    },
    async getWorkflows () {
      this.loading = true
      const projectName = this.projectName
      const workflows = await getProductWorkflowsInProjectAPI(projectName)
      const ingresses = await getProjectIngressAPI(projectName)
      if (workflows && ingresses) {
        this.loading = false
        const w1 = 'workflow-qa'
        const w2 = 'workflow-dev'
        const w3 = 'ops-workflow'
        const currentWorkflows = workflows.filter(element => {
          return element.name.includes(w1) || element.name.includes(w2) || element.name.includes(w3)
        }).map((ele) => {
          const element = Object.assign({}, ele)
          if (element.name.includes(w1)) element.env_name = 'qa'
          if (element.name.includes(w2)) element.env_name = 'dev'
          if (element.name.includes(w3)) element.env_name = ''
          return element
        })
        currentWorkflows.forEach(workflow => {
          ingresses.forEach(ingress => {
            if (ingress.env_name === workflow.env_name) {
              workflow.ingress_infos = ingress.ingress_infos
            }
          })
        })
        this.mapWorkflows = currentWorkflows
      }
    },
    wordTranslation (word, category, subitem) {
      return wordTranslate(word, category, subitem)
    },
    runCurrentTask (scope) {
      getWorkflowDetailAPI(scope.projectName, scope.name).then(res => {
        this.taskDialogVisible = true
        this.workflow = res
      }).catch(err => {
        console.log(err)
        this.taskDialogVisible = false
      })
    },
    hideAfterSuccess () {
      this.taskDialogVisible = false
    },
    generatePipe () {
      this.pipeTimer = null
      const fn = () => {
        if (this.pipeStatus && this.pipeStatus.status !== 'success') {
          generateWorkflowAPI(this.projectName)
            .then(res => {
              this.$set(this, 'pipeStatus', res)
            })
            .catch(err => {
              console.log(err)
            })
            .then(() => {
              if (this.pipeTimer) this.pipeTimer = setTimeout(fn, 1000)
            })
        } else {
          this.getWorkflows()
          clearInterval(this.pipeTimer)
        }
      }
      this.pipeTimer = setTimeout(fn, 1000)
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  created () {
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: 'Project', url: '/v1/projects' },
        { title: this.projectName, isProjectName: true, url: '' }
      ]
    })

    this.getWorkflows()
    this.generatePipe()
  },
  beforeDestroy () {
    this.pipeTimer = null
  },
  components: {
    Step,
    RunWorkflow
  },
  onboardingStatus: 4
}
</script>

<style lang="less">
@import "~@assets/css/component/onboarding-delivery.less";
</style>
