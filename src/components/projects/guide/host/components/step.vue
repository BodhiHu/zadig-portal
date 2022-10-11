<template>
  <div class="host-step-container">
    <div class="step-detail">
      <div class="guide-title">
        <h4>
          Project initialization wizard
        </h4>
      </div>
      <OnboardingSteps :active="activeStep" class="steps-container" align-center simple finish-status="success">
            <OnboardingStep title="Configure environment hosting" description></OnboardingStep>
            <OnboardingStep title="Configure Service Build" description></OnboardingStep>
            <OnboardingStep title="Run The Workflow" description></OnboardingStep>
      </OnboardingSteps>
    </div>
    <div class="title-container">
      <span class="first">{{stepMap[activeStep].title}}</span>
      <span class="second"
        >{{stepMap[activeStep].description}}</span
      >
    </div>
  </div>
</template>
<script>
import OnboardingSteps from '@/common/steps/src/steps.vue'
import OnboardingStep from '@/common/steps/src/step.vue'
export default {
  data () {
    return {
      stepMap: [{
        title: 'First Step',
        description: 'Hosting Already K8s Cluster Resources，Select Service In Zadig Manage In'
      }, {
        title: 'Second Step',
        description: 'Add build and configure related scripts，The service can be automatically updated later in the workflow'
      }, {
        title: 'Third Step',
        description: 'Run workflows to trigger automated delivery of services'
      }]
    }
  },
  props: {
    activeStep: {
      required: true,
      type: Number
    }
  },
  components: {
    OnboardingSteps,
    OnboardingStep
  }
}
</script>
<style lang="less">
.host-step-container {
  padding-top: 10px;

  .title-container {
    margin-bottom: 10px;
    margin-left: 20px;
    padding-top: 40px;

    .first {
      display: inline-block;
      width: 130px;
      padding: 8px;
      color: #fff;
      font-weight: 300;
      font-size: 16px;
      text-align: center;
      background: @themeColor;
    }

    .second {
      display: inline-block;
      color: #4c4c4c;
      font-size: 13px;
    }
  }

  .step-detail {
    width: 100%;

    .guide-title {
      display: flex;

      h4 {
        width: 130px;
        margin: 0 0 10px 20px;
        padding: 8px;
        color: #fff;
        font-weight: 300;
        font-size: 16px;
        text-align: center;
        background: @themeColor;
      }
    }
  }
}
</style>
