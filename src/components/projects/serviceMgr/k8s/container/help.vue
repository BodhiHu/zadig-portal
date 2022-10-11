<template>
  <section class="pipeline-help">
    <p class="service-aside-help__welcome-message">
      Welcome to the Help Guide。You can refer to the following steps to configure the service
    </p>
    <h3 class="service-aside-help__step-header">
    </h3>
    <ul class="service-aside-help__step-list">
      <li class="service-aside-help__step-list-item">
        <div class="service-aside-help__step-list-item-counter">
          1
        </div>
        <p class="service-aside-help__step-list-item-text">
          New Service，Support Three Ways：Manual Input/Sync From Codebase/Create new using template
        </p>
      </li>
      <li class="service-aside-help__step-list-item">
        <div class="service-aside-help__step-list-item-counter">
          2
        </div>
        <p class="service-aside-help__step-list-item-text">
          Add And Modify YAML Variables In，It will be used as an environment variable in the runtime environment
        <ul>
          <li>Container(Service Component)Mirror Version Of：By configuring the build step，Implement version upgrade（Code Build->Build Image->Image Deployment）
          </li>
          <li>System built-in variables：Can be referenced directly in the service template configuration</li>
          <li>Custom Variable：It will be used as an environment variable in the runtime environment</li>
        </ul>
        </p>
      </li>
      <li class="service-aside-help__step-list-item">
        <div class="service-aside-help__step-list-item-counter">
          3
        </div>
        <p class="service-aside-help__step-list-item-text">
          Add Multiple Services，Update Environment，Add the service to the environment
        </p>
      </li>
    </ul>
    <h3 class="service-aside-help__step-header">
      Documentation Guidelines
    </h3>
    <ul class="service-aside-help__step-list">
      <el-row :gutter="20">
        <el-col :span="8">
          <li class="service-aside-help__step-list-item">
            <a target="_blank"
               href="https://docs.koderover.com/zadig/project/service/k8s/#Stateless Service"
               class="service-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="service-aside-help__step-list-item-link-text">
                Stateless Service</span>
            </a>
          </li>
        </el-col>
        <el-col :span="8">
          <li class="service-aside-help__step-list-item">
            <a href="https://docs.koderover.com/zadig/project/service/k8s/#Stateless Service"
               target="_blank"
               class="service-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="service-aside-help__step-list-item-link-text">Stateful Service </span>
            </a>
          </li>
        </el-col>

      </el-row>
      <el-row :gutter="20">
        <el-col :span="8">
          <li class="service-aside-help__step-list-item">
            <a href="https://docs.koderover.com/zadig/project/build/"
               target="_blank"
               class="service-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="service-aside-help__step-list-item-link-text">Added Build Step</span>
            </a>
          </li>
        </el-col>
      </el-row>
    </ul>
  </section>
</template>
<script>
</script>
<style lang="less" scoped>
@import "~@assets/css/component/service-help.less";
</style>
