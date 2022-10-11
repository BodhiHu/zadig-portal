<template>
  <div class="common-workflow">
    <SideMenu class="side" :validObj="validObj"/>
    <div class="middle">
      <TabMenu class="top" :validObj="validObj"/>
      <el-card class="content">
        <keep-alive>
          <component :is="isComp" :validObj="validObj" ref="commonStep" :isEdit="!!pipelineId"></component>
        </keep-alive>
      </el-card>
    </div>
    <footer class="footer">
      <el-tag>Fill in the relevant information，Then Click Save</el-tag>
      <el-button type="primary" plain @click="$router.go(-1)">Cancel</el-button>
      <el-button type="primary" plain @click="saveCommonWorkflow">Save</el-button>
    </footer>
  </div>
</template>

<script>
import SideMenu from './sidebar.vue'
import TabMenu from './tab.vue'
import BasicInfo from './modules/basicInfo.vue'
import Build from './modules/build.vue'
import External from './modules/external.vue'
import ValidateSubmit from '@utils/validateAsync'

import { mapGetters, mapState } from 'vuex'
import { cloneDeep, get } from 'lodash'
import {
  createCommonWorkflowAPI,
  getCommonWorkflowAPI,
  updateCommonWorkflowAPI
} from '@api'
export default {
  data () {
    return {
      validObj: new ValidateSubmit()
    }
  },
  computed: {
    ...mapGetters(['currentTab', 'selectedTabs']),
    ...mapState({
      commonInfo: state => state.commonWorkflow.commonInfo
    }),
    isComp () {
      let res = BasicInfo
      const currentTab = this.currentTab
      switch (currentTab) {
        case 'Basic Information':
          res = BasicInfo
          break
        case 'Construct':
          res = Build
          break
        case 'Expand':
          res = External
          break
      }
      return res
    },
    pipelineId () {
      return this.$route.query.id
    }
  },
  methods: {
    saveCommonWorkflow () {
      this.validObj.validateAll().then(res => {
        if (res[1]) {
          this.$refs.commonStep.updateCommonInfo()

          const commonInfo = cloneDeep(this.commonInfo)

          commonInfo.parameters.forEach(param => {
            if (param.type === 'string') {
              delete param.choice_option
              delete param.external_setting
            } else if (param.type === 'choice') {
              delete param.external_setting
            } else if (param.type === 'external') {
              delete param.choice_option
            }
          })

          if (commonInfo.buildv3.job_ctx) {
            commonInfo.buildv3.job_ctx.clean_workspace = !commonInfo.buildv3
              .job_ctx.clean_workspace
          }

          // if (commonInfo.buildv3.enabled) {
          //   commonInfo.sub_tasks.push(commonInfo.buildv3)
          // }

          // if (commonInfo.trigger.enabled) {
          //   commonInfo.sub_tasks.push(commonInfo.trigger)
          // }

          this.selectedTabs.forEach(tab => {
            if (tab.type) {
              commonInfo.sub_tasks.push(commonInfo[tab.type])
            }
          })

          delete commonInfo.buildv3
          delete commonInfo.trigger

          const projectName = commonInfo.project_name

          const fn = this.pipelineId
            ? updateCommonWorkflowAPI(projectName, this.pipelineId, commonInfo)
            : createCommonWorkflowAPI(projectName, commonInfo)

          fn.then(res => {
            this.$message.success(
              `${commonInfo.name} ${this.pipelineId ? 'Revise' : 'Create'}Success！`
            )
            this.$router.push(
              `/v1/projects/detail/${
                commonInfo.project_name
              }/pipelines/common/${commonInfo.name}?id=${this.pipelineId ||
                res.id}`
            )
          })
        }
      })
    }
  },
  components: {
    SideMenu,
    TabMenu
  },
  created () {
    if (this.pipelineId) {
      const projectName = this.$route.query.projectName
      getCommonWorkflowAPI(projectName, this.pipelineId).then(res => {
        let length = res.sub_tasks.length
        let task = {}
        while (length--) {
          task = res.sub_tasks.shift()
          res[task.type] = task
          this.$store.commit('UPDATE_TABS', { type: 'add', tabType: task.type })
        }

        this.$store.commit('UPDATE_TABS', { type: 'add', tab: 'Basic Information' })

        if (get(res.buildv3, 'job_ctx')) {
          res.buildv3.job_ctx.clean_workspace = !res.buildv3.job_ctx
            .clean_workspace
        }
        this.$store.commit('UPDATE_COMMON_INFO', res)
      })
    }
  },
  destroyed () {
    this.$store.commit('RESET_COMMON_WORKFLOW')
  }
}
</script>

<style lang="less" scoped>
.common-workflow {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  font-size: 14px;
  background-color: #f0f2f5;

  .side {
    flex: 0 0 auto;
    align-self: center;
    width: 90px;
    padding: 15px;
    background-color: #fff;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    box-shadow:
      0 1px 6px rgba(0, 0, 0, 0.117647),
      0 1px 4px rgba(0, 0, 0, 0.117647);
  }

  .middle {
    flex: 1 1 auto;
    width: 70%;
    margin: 50px 5% 0;
    margin-left: 30px;

    .content {
      max-height: calc(~'100% - 35px');
      overflow: auto;
      background-color: #fff;
      border-radius: 6px;
      box-shadow:
        0 1px 6px rgba(0, 0, 0, 0.117647),
        0 1px 4px rgba(0, 0, 0, 0.117647);
    }
  }

  .footer {
    position: absolute;
    right: 10%;
    bottom: 20px;

    /deep/.el-tag {
      margin-right: 20px;
    }
  }
}
</style>
