<template>
  <div class="test-case-container">
    <template v-if="testType === 'undefined'|| testType === 'function'">
      <el-card class="box-card" :body-style="{ padding: '0px', margin: '15px 0 0 0' }">
        <div slot="header" class="clearfix">
          <span>测试报告概览</span>
        </div>
        <div class="test-summary">
          <function-test-summary
            :success="testSummary.successes?testSummary.successes:(testSummary.tests - testSummary.failures - testSummary.errors)"
            :failure="testSummary.failures"
            :error="testSummary.errors"
            :total="testSummary.tests"
            :skip="testSummary.skips"
          ></function-test-summary>
        </div>
      </el-card>
      <el-card class="box-card task-process" :body-style="{ padding: '0px', margin: '15px 0 0 0' }">
        <div slot="header" class="clearfix">
          <span>详细用例</span>
        </div>
        <function-test-case :testCases="testCases"></function-test-case>
      </el-card>
    </template>
    <template v-if="testType ==='performance'">
      <el-card class="box-card" :body-style="{ padding: '0px', margin: '15px 0 0 0' }">
        <el-table :data="performanceTests" style="width: 100%;">
          <el-table-column prop="label" label="Label"></el-table-column>
          <el-table-column prop="samples" label="Samples"></el-table-column>
          <el-table-column prop="average" label="Average"></el-table-column>
          <el-table-column prop="min" label="Min"></el-table-column>
          <el-table-column prop="max" label="Max"></el-table-column>
          <el-table-column prop="error" label="Error"></el-table-column>
          <el-table-column prop="line" label="90% Line"></el-table-column>
          <el-table-column prop="stdDev" label="Std Dev"></el-table-column>
          <el-table-column prop="throughput" label="Throughput"></el-table-column>
          <el-table-column prop="receivedKb" label="Received KB/sec"></el-table-column>
          <el-table-column prop="avgByte" label="Avg Bytes"></el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script>
import functionTestCase from '@/components/projects/test/common/functionTestCase.vue'
import functionTestSummary from '@/components/projects/test/common/functionTestSummary.vue'
import { getTestReportAPI, getTestJunitReportAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      testSummary: {
        failures: 0,
        skips: 0,
        tests: 0,
        time: 0,
        errors: 0,
        successes: 0
      },
      testCases: [
        {
          name: '',
          skipped: '',
          time: 0
        }
      ],
      performanceTests: []
    }
  },
  methods: {
    getTestCases () {
      const { workflow_name, task_id, test_job_name } = this.$route.params
      const { service_name, test_type } = this.$route.query
      if (service_name) {
        getTestReportAPI(
          this.projectName,
          workflow_name,
          task_id,
          test_job_name,
          service_name,
          test_type
        ).then(res => {
          if (test_type === 'undefined' || test_type === 'function') {
            this.testSummary = res.functionTestSuite
            this.testCases = res.functionTestSuite.testcase
            this.testCases.forEach(testCase => {
              const blocks = []
              if (testCase.failure && typeof testCase.failure === 'string') {
                blocks.push(`失败原因:\n${testCase.failure}`)
              }
              if (testCase.failure && typeof testCase.failure === 'object') {
                blocks.push(`失败信息:\n${testCase.failure.message}`)
                blocks.push(`失败详情:\n${testCase.failure.text}`)
              }
              if (testCase.system_out) {
                blocks.push(`标准输出:\n${testCase.system_out}`)
              }
              if (testCase.error) {
                blocks.push(`错误信息:\n${testCase.error.message}`)
                blocks.push(`错误详情:\n${testCase.error.text}`)
                blocks.push(`错误类型:\n${testCase.error.type}`)
              }
              testCase.mergedOutput = blocks.join('\n')
            })
          } else if (test_type === 'performance') {
            this.performanceTests = res.performanceTestSuite
          }
        })
      } else {
        // custom workflow
        getTestJunitReportAPI(
          workflow_name,
          task_id,
          test_job_name
        ).then(res => {
          if (test_type === 'undefined' || test_type === 'function') {
            this.testSummary = res.functionTestSuite
            this.testCases = res.functionTestSuite.testcase
            this.testCases.forEach(testCase => {
              const blocks = []
              if (testCase.failure && typeof testCase.failure === 'string') {
                blocks.push(`失败原因:\n${testCase.failure}`)
              }
              if (testCase.failure && typeof testCase.failure === 'object') {
                blocks.push(`失败信息:\n${testCase.failure.message}`)
                blocks.push(`失败详情:\n${testCase.failure.text}`)
              }
              if (testCase.system_out) {
                blocks.push(`标准输出:\n${testCase.system_out}`)
              }
              if (testCase.error) {
                blocks.push(`错误信息:\n${testCase.error.message}`)
                blocks.push(`错误详情:\n${testCase.error.text}`)
                blocks.push(`错误类型:\n${testCase.error.type}`)
              }
              testCase.mergedOutput = blocks.join('\n')
            })
          } else if (test_type === 'performance') {
            this.performanceTests = res.performanceTestSuite
          }
        })
      }
    }
  },
  computed: {
    testType () {
      return this.$route.query.test_type
    },
    workflowName () {
      return this.$route.params.workflow_name
    },
    projectName () {
      return this.$route.params.project_name
    },
    taskId () {
      return this.$route.params.task_id
    }
  },
  created () {
    this.getTestCases()
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: '项目', url: '/v1/projects' },
        {
          title: this.projectName,
          isProjectName: true,
          url: `/v1/projects/detail/${this.projectName}/detail`
        },
        {
          title: '工作流',
          url: `/v1/projects/detail/${this.projectName}/pipelines`
        },
        {
          title: this.workflowName,
          url: `/v1/projects/detail/${this.projectName}/pipelines/multi/${this.workflowName}`
        },
        {
          title: `#${this.taskId}`,
          url: `/v1/projects/detail/${this.projectName}/pipelines/multi/${this.workflowName}/${this.taskId}`
        },
        { title: '测试用例', url: '' }
      ]
    })
  },
  components: {
    functionTestSummary,
    functionTestCase
  }
}
</script>

<style lang="less" >
.pointer {
  cursor: pointer;
}

.failure-dialog {
  .el-dialog__body {
    padding: 15px 20px;
    color: rgb(72, 85, 106);
    font-size: 14px;
  }
}

.test-case-container {
  position: relative;
  flex: 1;
  height: 100%;
  padding: 0 10px;
  overflow: auto;

  .clearfix::before,
  .clearfix::after {
    display: table;
    content: '';
  }

  .clearfix {
    span {
      color: #999;
      font-size: 16px;
      line-height: 20px;
    }
  }

  .clearfix::after {
    clear: both;
  }

  .test-summary {
    width: 300px;
    height: 140px;
  }

  .box-card,
  .task-process {
    margin-top: 15px;
    padding: 0 10px;
    border: none;
    box-shadow: none;
  }

  .el-card__header {
    padding-left: 0;
  }

  .el-row {
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .filter-header {
    cursor: pointer;
  }

  .el-table__column-filter-trigger {
    .el-icon-arrow-down {
      position: relative;
      top: 3px;
      font-size: 24px;
    }
  }
}

.icon {
  font-size: 17px;
  cursor: pointer;

  &:hover {
    color: @themeColor;
  }
}
</style>
