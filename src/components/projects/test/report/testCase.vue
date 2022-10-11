<template>
  <TestCase/>
</template>

<script>
import TestCase from '@/components/projects/test/common/report/testCase.vue'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
    }
  },
  components: {
    TestCase
  },
  computed: {
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
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: 'Project', url: '/v1/projects' },
        { title: this.projectName, isProjectName: true, url: `/v1/projects/detail/${this.projectName}/detail` },
        { title: 'Test', url: `/v1/projects/detail/${this.projectName}/test/function` },
        { title: this.workflowName, url: `/v1/projects/detail/${this.projectName}/test/detail/function/${this.workflowName}` },
        { title: `#${this.taskId}`, url: `/v1/projects/detail/${this.projectName}/test/detail/function/${this.workflowName}/${this.taskId}` },
        { title: 'Test Case', url: '' }]
    })
  }
}
</script>
