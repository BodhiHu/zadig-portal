import bus from '@utils/eventBus'

export default {
  methods: {
    checkCurrentTab () {
      return new Promise((resolve, reject) => {
        bus.$once('receive-title', pass => {
          if (pass) {
            resolve()
          } else {
            reject()
          }
        })
        bus.$emit('set-topbar-title', { title: 'Project' })
      })
    }
  }
}
