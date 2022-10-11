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
          New Service，Support Three Ways：Sync From Codebase/From Chart Warehouse synchronization/Create new using template
        </p>
      </li>
      <li class="service-aside-help__step-list-item">
        <div class="service-aside-help__step-list-item-counter">
          2
        </div>
        <p class="service-aside-help__step-list-item-text">
          Configure an updatable image(Service Component)<br>
          The system can automatically values.yaml Parse the mirror information in the following format in。More Matching Formats，Go To“Mirror Update”->“Update Matching Rules”Configure
        <ul style="padding-left: 5px;">
          <li>
            Format One：<br>
            image:<br>
            &nbsp;&nbsp;&nbsp;&nbsp;repository： Warehouse Address/Namespaces/Mirror Name<br>
            &nbsp;&nbsp;&nbsp;&nbsp;tag：Label Name<br>
          </li>
          <li>
            Format 2：<br>
            &nbsp;&nbsp;&nbsp;&nbsp;image：Warehouse Address/Namespaces/Mirror Name:Label Name
          </li>
        </ul>
        </p>
      </li>
      <li class="service-aside-help__step-list-item">
        <div class="service-aside-help__step-list-item-counter">
          3
        </div>
        <p class="service-aside-help__step-list-item-text">
          By configuring the build script on the image，Implement version upgrade（Code Build -> Build Image -> Image Deployment）
        </p>
      </li>
      <li class="service-aside-help__step-list-item">
        <div class="service-aside-help__step-list-item-counter">
          4
        </div>
        <p class="service-aside-help__step-list-item-text">
          Configuration Variable，Define the different contexts used values.yaml
        </p>
      </li>
    </ul>
    <h3 class="service-aside-help__step-header">
      Guidelines You May Use
    </h3>
    <ul class="service-aside-help__step-list">
      <el-row :gutter="20">
        <el-col :span="8">
          <li class="service-aside-help__step-list-item">
            <a target="_blank"
               href="https://docs.koderover.com/zadig/project/service/k8s/#Serve-yaml-Sample"
               class="service-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="service-aside-help__step-list-item-link-text">
                Stateless Service</span>
            </a>
          </li>
        </el-col>
        <el-col :span="8">
          <li class="service-aside-help__step-list-item">
            <a href="https://docs.koderover.com/zadig/project/service/k8s/#Serve-yaml-Sample"
               target="_blank"
               class="service-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="service-aside-help__step-list-item-link-text">Stateful Service </span>
            </a>
          </li>
        </el-col>
        <el-col :span="8">
          <li class="service-aside-help__step-list-item">
            <a target="_blank"
               href="https://docs.koderover.com/zadig/project/service/helm/chart/"
               class="service-aside-help__step-list-item-link">
              <i class="icon el-icon-link"></i>
              <span class="service-aside-help__step-list-item-link-text">
                Helm Chart Serve</span>
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
export default {

}
</script>
<style lang="less" scoped>
@import "~@assets/css/component/service-help.less";
</style>
