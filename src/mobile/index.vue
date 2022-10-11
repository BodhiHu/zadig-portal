<template>
  <div>
    <van-nav-bar v-if="title==='Zadig'"
                 title="Zadig" />
    <van-notice-bar v-if="title==='Zadig'"
                    color="#0066ff"
                    background="#ecf9ff"
                    :scrollable="true"
                    left-icon="info-o">
      Welcome Zadig Mobile，Limited Functionality，For More Features Go To PC End Use
    </van-notice-bar>
    <router-view />
    <van-tabbar v-model="active"
                active-color="#0066ff"
                inactive-color="#000"
                route>
      <van-tabbar-item replace
                       name="status"
                       to="/mobile/status"
                       icon="browsing-history-o">Operating Status</van-tabbar-item>
      <van-tabbar-item replace
                       name="pipelines"
                       to="/mobile/pipelines"
                       icon="play-circle-o">Workflow</van-tabbar-item>
      <van-tabbar-item replace
                       name="envs"
                       to="/mobile/envs"
                       icon="points">Surroundings</van-tabbar-item>
      <van-tabbar-item replace
                       name="profile"
                       to="/mobile/profile"
                       icon="user-circle-o">Account Settings</van-tabbar-item>
    </van-tabbar>

  </div>
</template>

<script>

import { NavBar, Tabbar, TabbarItem, NoticeBar } from 'vant'
export default {
  components: {
    [TabbarItem.name]: TabbarItem,
    [Tabbar.name]: Tabbar,
    [NavBar.name]: NavBar,
    [NoticeBar.name]: NoticeBar
  },

  data () {
    return {
      active: ''
    }
  },

  computed: {
    title () {
      return this.$route.meta.title
    }

  },
  methods: {
    goBack () {
      this.$router ? this.$router.back() : window.history.back()
    }
  }
}
</script>

<style lang="less">
@import "~@assets/css/component/mobile.less";
</style>
