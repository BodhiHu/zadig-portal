<template>
  <div class="common-tab-menu">
    <div
      v-for="tab in selectedTabs"
      :key="tab.tab"
      @click="updateTab(tab, 'select')"
      class="tab-title"
      :class="{'is-current': tab.isCurrent}"
    >
      {{tab.tab}}
      <i v-if="tab.tab !== 'Basic Information'" class="icon el-icon-error" @click.stop="updateTab(tab, 'delete')"></i>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {}
  },
  props: {
    validObj: Object
  },
  computed: {
    ...mapGetters(['selectedTabs'])
  },
  methods: {
    updateTab (list, type) {
      if (type === 'delete') {
        this.$store.commit('UPDATE_TABS', { type: type, tab: list.tab })
        this.validObj.deleteValidate({ name: list.tab })
      } else {
        this.validObj.validateAll().then(res => {
          if (res[1]) {
            this.$store.commit('UPDATE_TABS', { type: type, tab: list.tab })
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.common-tab-menu {
  display: flex;

  .tab-title {
    position: relative;
    width: 100px;
    margin: 0 3px;
    color: #fff;
    line-height: 35px;
    text-align: center;
    background-color: #808080ba;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    cursor: pointer;

    &.is-current {
      background-color: #6c6c6c;
    }

    .icon {
      position: absolute;
      top: -8px;
      right: -8px;
      color: #ff5733;
      border-radius: 50%;
    }
  }
}
</style>
