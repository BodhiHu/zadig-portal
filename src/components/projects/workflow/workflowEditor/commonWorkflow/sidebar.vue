<template>
  <div class="common-side-menu">
    <ul>
      <li v-for="list in lists" :key="list.tab" @click="addTab(list)">
        {{list.tab}}
        <i v-if="list.tab !== 'Basic Information'" class="el-icon-circle-plus-outline"></i>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {}
  },
  props: {
    validObj: Object
  },
  computed: {
    ...mapState({
      lists: state => state.commonWorkflow.tabs
    })
  },
  methods: {
    addTab (list) {
      this.validObj.validateAll().then(res => {
        if (res[1]) {
          this.$store.commit('UPDATE_TABS', { type: 'add', tab: list.tab })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.common-side-menu {
  li {
    padding: 12px 0;
    cursor: pointer;
  }
}
</style>
