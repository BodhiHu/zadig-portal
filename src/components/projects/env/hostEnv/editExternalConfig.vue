<template>
  <div class="content">
    <div class="title">Configure Hosting</div>
    <div class="step">
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step title="Configure environment hosting" description=""></el-step>
        <el-step title="Configure Service Build" description=""></el-step>
        <el-step title="Run The Workflow" description=""></el-step>
      </el-steps>
    </div>
    <div class="currentStep">
      <div class="step">{{stepMap[currentStep].title}}</div>
      <span class="des">{{stepMap[currentStep].description}}</span>
      <component ref="component" :envName="$route.query.envName" :projectName="projectName" class="com" :is="componentsList[currentStep]" />
    </div>
    <div class="bottom">
      <div class="nextstep" @click="nextStep">{{currentStep===2 ? 'Finish' : 'Next Step'}} </div>
      <span class="des" @click="exit" v-if="currentStep===1">Exit The Wizard</span>
    </div>
  </div>
</template>
<script>
import ServiceBuild from '@/components/projects/common/hosting/serviceBuild'
import EditHostService from './editHosService.vue'
import RunWorkflow from '@/components/projects/common/hosting/runWorkflow'

export default {
  name: 'editExternalConfig',
  data () {
    return {
      componentsList: [EditHostService, ServiceBuild, RunWorkflow],
      stepMap: [{
        title: 'First Step',
        description: 'Modify Hosting Services'
      }, {
        title: 'Second Step',
        description: 'Configure Service Build'
      }, {
        title: 'Third Step',
        description: 'Run The Workflow'
      }]
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    currentStep () {
      return this.$route.query.step - 1
    }
  },
  methods: {
    exit () {
      const envName = this.$route.query.envName
      this.$router.push(`/v1/projects/detail/${this.projectName}/envs/detail?envName=${envName}`)
    },
    nextStep () {
      const envName = this.$route.query.envName
      if (this.currentStep === 0) {
        this.$refs.component.submit(this.currentStep + 2)
      } else if (this.currentStep === 1) {
        this.$router.push(`/v1/projects/detail/${this.projectName}/envs/externalConfig?envName=${envName}&step=${this.currentStep + 2}`)
      } else {
        this.$router.push(`/v1/projects/detail/${this.projectName}/envs/detail?envName=${envName}`)
      }
    }
  }
}
</script>
<style lang="less" scoped>
.content {
  width: 100%;

  .title {
    width: 110px;
    height: 30px;
    margin: 10px 0 10px 30px;
    padding: 5px;
    color: #fff;
    font-weight: 300;
    font-size: 18px;
    line-height: 30px;
    text-align: center;
    background: @themeColor;
  }

  .step {
    width: 80%;
    margin-top: 40px;
  }

  .currentStep {
    margin: 0 0 10px 30px;

    .step {
      display: inline-block;
      width: 110px;
      height: 30px;
      padding: 5px;
      color: #fff;
      font-weight: 300;
      font-size: 18px;
      line-height: 30px;
      text-align: center;
      background: @themeColor;
    }

    .des {
      position: relative;
      left: 4px;
      display: inline-block;
      color: #4c4c4c;
      font-size: 13px;
    }
  }

  .com {
    height: calc(~"100vh - 440px");
    margin-top: 30px;
  }

  .bottom {
    position: fixed;
    bottom: 30px;
    z-index: 999;
    margin: 0 0 10px 30px;
    cursor: pointer;

    .nextstep {
      display: inline-block;
      width: 110px;
      height: 30px;
      padding: 5px;
      color: #fff;
      font-weight: 300;
      font-size: 18px;
      line-height: 30px;
      text-align: center;
      background: @themeColor;
    }

    .des {
      position: relative;
      left: 6px;
      display: inline-block;
      color: #4c4c4c;
      font-size: 13px;
    }
  }
}
</style>
