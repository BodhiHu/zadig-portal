<template>
  <div class="mobile-env">
    <van-nav-bar>
      <template #title>
        Surroundings
      </template>
    </van-nav-bar>
    <van-cell v-for="(item,index) in envs"
              :key="index"
              is-link
              :to="item.url"
              icon="apps-o"
              size="large">
      <template #title>
        <span>{{item.name}}</span>
      </template>
    </van-cell>
  </div>
</template>
<script>
import { NavBar, Empty, Cell, CellGroup } from 'vant'
import { uniqBy, orderBy } from 'lodash'
import { getProjectsAPI } from '@api'
export default {
  components: {
    [NavBar.name]: NavBar,
    [Empty.name]: Empty,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup
  },
  data () {
    return {
      envs: []
    }
  },
  computed: {
    filteredProducts () {
      return uniqBy(orderBy(this.projectList, ['product_name', 'is_prod']), 'product_name')
    }
  },
  methods: {
    async getEnvs () {
      const projects = await getProjectsAPI()
      const sortedEnvs = orderBy(projects.filter(project => {
        return !project.onboard && project.envs.length
      }), 'name')
      this.envs = sortedEnvs.map(element => {
        return { name: element.name, url: `/mobile/envs/detail/${element.name}?envName=${element.envs[0]}` }
      })
    }
  },
  mounted () {
    this.getEnvs()
  }
}
</script>
