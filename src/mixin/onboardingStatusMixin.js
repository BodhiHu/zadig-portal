import { saveOnboardingStatusAPI } from '@api'
export default {
  methods: {
    saveOnboardingStatus (projectName, status) {
      return new Promise((resolve, reject) => {
        saveOnboardingStatusAPI(projectName, status)
          .then((res) => {
            if (res.message !== 'success') {
              this.$message.error(`${projectName}/${status}Failed To Save State：${res}`)
              reject(res.message)
            }
            resolve('ok')
          })
          .catch((err) => {
            this.$message.error(`${projectName}/${status}Failed To Save State：${err}`)
            reject(err)
          })
          .then(() => {
            this.$store.dispatch('getProjectList')
          })
      })
    }
  },
  created () {
    const onboardingStatus = this.$options.onboardingStatus
    if (onboardingStatus !== undefined) {
      this.saveOnboardingStatus(this.$route.params.project_name, onboardingStatus)
    }
  }
}
