<template>
  <div class="config-quota-container">

    <template>
      <el-alert type="info"
                :closable="false">
        <template>
          Set the workflow of the system and the execution strategy of the test task，Refer To
          <el-link style="font-size: 14px; vertical-align: baseline;"
                   type="primary"
                   :href="`https://docs.koderover.com/zadig/settings/system-settings/#Task Configuration`"
                   :underline="false"
                   target="_blank">Help Documentation</el-link>
        </template>
      </el-alert>
    </template>
    <div class="quota-container">
      <section>
        <h1>Task concurrency settings <el-tooltip effect="dark"
                                    placement="right">
          <div slot="content">
            1 Workflow tasks require at least 1C2G Resource。<br>
            Workflow task concurrency * The number of concurrent services for a single task * 1C2G ≤ Cluster Resources。<br>
            Example：Suppose the cluster resource is 8C16G，It is recommended that the concurrent number of workflow tasks be set to 2，Single-task service concurrency is set to 4。<br>
          </div>
          <i class="el-icon-question tooltip"></i>
          </el-tooltip>
        </h1>
        <div class="workflow-concurrency">
          <span class="desc">Workflow task concurrency</span>
          <el-input-number size="mini"
                           :min="1"
                           v-model.number="workflowConcurrency"></el-input-number>
        </div>
        <br/>
        <div class="workflow-concurrency">
          <span class="desc">The number of concurrent services for a single task</span>
          <el-input-number size="mini"
                           :min="1"
                           v-model.number="buildConcurrency"></el-input-number>
        </div>
      </section>
      <br/>
      <section class="save-concurrency-setting">
        <el-button @click="updateConcurrencySettings(workflowConcurrency, buildConcurrency)"
                   size="small"
                   type="primary">Save</el-button>
      </section>
      <br/>
      <section>
        <h1>Historical Task Retention Policy <el-tooltip effect="dark"
                                 content="Includes workflow tasks and their resulting build logs、Test Log、Testing Report、Binary File"
                                 placement="right">
          <i class="el-icon-question tooltip"></i>
        </el-tooltip>
        </h1>
        <div class="config-list">
          <el-radio-group v-model="selectType">
            <el-radio style="display: block; margin-bottom: 10px;"
                      label="max_days">
              <span class="desc">Retention Days</span>
              <el-input size="mini"
                        :disabled="selectType!=='max_days'"
                        v-model.number="WorkflowTaskRetention.max_days"
                        class="remain-day"
                        placeholder="">
                <template slot="append">Sky</template>
              </el-input>
            </el-radio>
            <el-radio style="display: block;"
                      label="max_items">
              <span class="desc">Keep Recent Tasks</span>
              <el-input size="mini"
                        :disabled="selectType!=='max_items'"
                        v-model.number="WorkflowTaskRetention.max_items"
                        class="remain-day"
                        placeholder="">
                <template slot="append">Indivual</template>
              </el-input>
            </el-radio>
          </el-radio-group>
        </div>

      </section>
      <section class="operation">
        <el-button @click="setCapacity('WorkflowTaskRetention',selectType,WorkflowTaskRetention[selectType])"
                   size="small"
                   type="primary">Save</el-button>
      </section>
    </div>
  </div>
</template>
<script>
import { getCapacityAPI, setCapacityAPI, getWorkflowConcurrencySettingsAPI, updateWorkflowConcurrencySettingsAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      selectType: '',
      WorkflowTaskRetention: {
        max_days: null,
        max_items: 1000
      },
      workflowConcurrency: 2,
      buildConcurrency: 5
    }
  },
  methods: {
    getCapacity (target) {
      getCapacityAPI(target).then((res) => {
        if (res.retention.max_days > 0) {
          this[target].max_days = res.retention.max_days
          this.selectType = 'max_days'
        } else if (res.retention.max_items > 0) {
          this[target].max_items = res.retention.max_items
          this.selectType = 'max_items'
        }
      })
    },
    getConcurrencySettings () {
      getWorkflowConcurrencySettingsAPI().then((res) => {
        this.workflowConcurrency = res.workflow_concurrency
        this.buildConcurrency = res.build_concurrency
      })
    },
    updateConcurrencySettings (workflowConcurrency, buildConcurrency) {
      const payload = {
        workflow_concurrency: workflowConcurrency,
        build_concurrency: buildConcurrency
      }
      updateWorkflowConcurrencySettingsAPI(payload).then((res) => {
        this.$message.success('Update workflow concurrency setting succeeded')
        this.getConcurrencySettings()
      })
    },
    setCapacity (target, key, value) {
      if (!isNaN(value) && value > 0) {
        const type = this.selectType
        const countStr = (type === 'max_days' ? `Up To Date ${this.WorkflowTaskRetention.max_days} Sky` : `Recent ${this.WorkflowTaskRetention.max_items} Indivual`)
        this.$confirm(`Keep Only${countStr}Data generated by the task（Include Build Log、Generated By The Build Tar Bag、Test logs and test reports），Other historical mission data will be permanently deleted<br><span style="color:#ff1949;font-size:13px">Notice：After Deciding，Effective Immediately</span>`, 'Hint', {
          confirmButtonText: 'Sure',
          cancelButtonText: 'Cancel',
          dangerouslyUseHTMLString: true,
          type: 'warning'
        }).then(() => {
          const payload = {
            target: target,
            retention: { [key]: value }
          }
          setCapacityAPI(payload).then((res) => {
            this.$message.success('Update history task retention policy succeeded')
            this.getCapacity('WorkflowTaskRetention')
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: 'Update Cancelled'
          })
        })
      } else {
        this.$message({
          type: 'error',
          message: 'The entered data does not meet the requirements'
        })
      }
    }
  },
  computed: {

  },
  watch: {

  },

  created () {
    bus.$emit(`set-topbar-title`, { title: 'System Configuration', breadcrumb: [] })

    this.getCapacity('WorkflowTaskRetention')
    this.getConcurrencySettings()
  }
}
</script>

<style lang="less">
.config-quota-container {
  position: relative;
  flex: 1;
  overflow: auto;
  font-size: 13px;

  .quota-container {
    margin-top: 15px;
    padding: 20px 20px 20px 20px;
    border: 1px solid #eee;
    border-radius: 5px;

    h1 {
      font-size: 1rem;
      line-height: 1;

      .tooltip {
        color: #909399;
        cursor: pointer;
      }
    }

    .workflow-concurrency {
      span.desc {
        margin-left: 22px;
        color: #606266;
        font-weight: 500;
        font-size: 14px;
      }

      .el-input-number {
        margin-left: 20px;
      }
    }

    .config-list {
      margin: 15px 0;

      .item {
        color: #303133;
        font-size: 16px;
      }

      span.desc {
        display: inline-block;
        width: 130px;
        color: #606266;
        font-weight: 500;
        font-size: 14px;

        &.concurrent {
          width: 150px;
        }
      }

      .el-input.remain-day {
        width: 140px;
      }
    }

    .operation {
      margin-top: 20px;
    }
  }
}
</style>
