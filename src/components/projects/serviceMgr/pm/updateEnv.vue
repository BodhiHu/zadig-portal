<template>
  <el-dialog
    title="Whether to update the corresponding environment？"
    custom-class="dialog-upgrade-env"
    :visible.sync="updateEnvDialogVisible"
    width="40%"
  >
    <div class="title">
      <el-alert
        title="Check the environment that needs to be updated，After Clicking OK，The service will automatically be updated in the corresponding environment"
        :closable="false"
        type="warning"
      >
      </el-alert>
      <el-checkbox-group v-model="checkList">
        <el-checkbox
          v-for="(env, index) in envNameList"
          :key="index"
          :label="env.envName"
        ></el-checkbox>
      </el-checkbox-group>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" type="primary" @click="autoUpgradeEnv"
        >Sure</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import { autoUpgradeEnvAPI, listProductAPI } from '@api'
export default {
  data () {
    return {
      checkList: [],
      updateEnvDialogVisible: false,
      envNameList: []
    }
  },
  methods: {
    async getEnvNameList () {
      const projectName = this.projectName
      const envNameList = await listProductAPI(projectName)
      envNameList.forEach(element => {
        element.envName = element.name
      })
      if (envNameList.length) {
        this.envNameList = envNameList
      }
    },
    openDialog () {
      this.updateEnvDialogVisible = true
    },
    autoUpgradeEnv () {
      const payload = this.checkList.map(env => {
        return {
          env_name: env
        }
      })
      const projectName = this.projectName
      autoUpgradeEnvAPI(projectName, payload, false).then((res) => {
        this.$router.push(`/v1/projects/detail/${projectName}/envs`)
        this.$message({
          message: 'Update environment succeeded',
          type: 'success'
        })
      })
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    }
  },
  created () {
    this.getEnvNameList()
  }
}
</script>
