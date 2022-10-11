<template>
  <div class="config-home">
    <div class="tab-container">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane name="quota" label="Task Configuration">
          <keep-alive >
            <Quota v-if="activeTab === 'quota'" />
          </keep-alive>
        </el-tab-pane>
        <el-tab-pane name="proxy" label="Proxy Configuration">
          <keep-alive >
            <Proxy v-if="activeTab === 'proxy'" />
          </keep-alive>
        </el-tab-pane>
        <el-tab-pane name="cache" label="Cache Cleaning">
          <keep-alive >
            <Cache v-if="activeTab === 'cache'" />
          </keep-alive>
        </el-tab-pane>
        <el-tab-pane name="link" label="Quick Link">
          <keep-alive >
            <Link v-if="activeTab === 'link'" />
          </keep-alive>
        </el-tab-pane>
        <el-tab-pane name="mail" label="Mail Configuration">
          <keep-alive >
            <Mail v-if="activeTab === 'mail'" />
          </keep-alive>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import Quota from './quota.vue'
import Proxy from './proxy.vue'
import Cache from './cache.vue'
import Link from './link.vue'
import Mail from './mail.vue'
import bus from '@utils/eventBus'

export default {
  name: 'config',
  components: {
    Proxy,
    Cache,
    Quota,
    Link,
    Mail
  },
  data () {
    return {
      activeTab: 'quota'
    }
  },
  mounted () {
    bus.$emit('set-topbar-title', { title: 'System Configuration', breadcrumb: [] })
  }
}
</script>

<style lang="less" >
.config-home {
  position: relative;
  flex: 1;
  padding: 15px 30px;
  overflow: auto;
}
</style>
