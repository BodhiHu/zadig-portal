<template>
  <div class="service-content">
    <div class="title">
      <span>
        <i class="iconfont iconfuwu"></i>
      </span> Detected service components
      <el-tooltip effect="dark" placement="top">
        <div slot="content">The name of the service container that can be updated</div>
        <span>
          <i class="el-icon-question"></i>
        </span>
      </el-tooltip>
    </div>
    <el-table :data="serviceModules" stripe style="width: 100%;">
      <el-table-column prop="name" label="Service Component"></el-table-column>
      <el-table-column prop="image_name" label="Mirror Name"></el-table-column>
      <el-table-column prop="image" label="Current Image Version"></el-table-column>
      <el-table-column label="Build Information/Operate">
        <template slot-scope="scope">
          <div v-for="(buildName, index) in scope.row.build_names" :key="index">
            <span class="build-name" @click="openBuild(scope.row, buildName)">{{ buildName }}</span>
          </div>
          <el-button v-hasPermi="{projectName: projectName, action: 'create_build',isBtn:true}" size="small" type="text" @click="openBuild(scope.row)">Add Build</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'serviceModule',
  props: {
    serviceModules: Array,
    openBuild: Function,
    projectName: String
  }
}
</script>
<style lang="less" scoped>
.service-content {
  box-sizing: border-box;
  width: 100%;
  padding: 10px;

  .title {
    color: #909399;
    font-weight: 300;
  }

  .build-name {
    display: inline-block;
    margin-top: 5px;
    color: @themeColor;
    font-size: 12px;
    line-height: 16px;
    cursor: pointer;

    &:hover {
      color: @themeBorderColor;
    }
  }
}
</style>
