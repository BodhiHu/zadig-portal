<template>
  <div class="version-info">
    <el-form ref="infoRef" :rules="rules" :model="releaseInfo" label-width="90px">
      <el-form-item label="Version Name" prop="version">
        <el-input v-model="releaseInfo.version" placeholder="Enter Version Name" size="small"></el-input>
      </el-form-item>
      <el-form-item label="Version Label" prop="labels">
        <el-input v-model="releaseInfo.labels" placeholder="Enter Version Tag，Use ',' Segmentation" size="small"></el-input>
      </el-form-item>
      <el-form-item label="Version Description">
        <el-input type="textarea" v-model="releaseInfo.desc" placeholder="Enter version description" :rows="4" size="small"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    releaseInfo: Object
  },
  data () {
    this.rules = {
      version: {
        required: true,
        message: 'Please fill in the version name',
        trigger: ['change', 'blur']
      }
    }
    return {}
  },
  methods: {
    validate () {
      return this.$refs.infoRef.validate()
    }
  }
}
</script>

<style lang="less" scoped>
.version-info {
  /deep/.el-input,
  .el-textarea,
  .el-select {
    width: calc(~'100% - 80px');
  }

  /deep/.el-select > .el-input {
    width: 100%;
  }
}
</style>
