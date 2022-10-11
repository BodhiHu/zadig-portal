<template>
  <div class="insight-build">
    <el-row class="row-container" :gutter="20">
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Build Trends(Week)</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <BuildTrend :selectedDuration="selectedDuration" :selectedProjects="selectedProjects" />
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Build Health</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <Health :selectedDuration="selectedDuration" :selectedProjects="selectedProjects" />
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Recent 10 Secondary Build</span>
            </div>
            <RecentBuild :selectedDuration="selectedDuration" :selectedProjects="selectedProjects" />
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="row-container" :gutter="20">
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Daily Build Frequency</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <DaliyBuildFeq :selectedDuration="selectedDuration" :selectedProjects="selectedProjects" />
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Average Build Time</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <AverageBuildDuration :selectedDuration="selectedDuration" :selectedProjects="selectedProjects" />
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-title">
              <span class="head">Top 10 Long Builds</span>
              <span class="duration">{{getSetTime}}</span>
            </div>
            <LongestBuild :selectedDuration="selectedDuration" :selectedProjects="selectedProjects" />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import moment from 'moment'
import bus from '@utils/eventBus'
import RecentBuild from './recentBuilds.vue'
import LongestBuild from './longestBuilds.vue'
import BuildTrend from './trend.vue'
import Health from './health.vue'
import AverageBuildDuration from './averageDuration.vue'
import DaliyBuildFeq from './daliyFeq.vue'
export default {
  components: {
    RecentBuild,
    LongestBuild,
    Health,
    AverageBuildDuration,
    DaliyBuildFeq,
    BuildTrend
  },
  props: {
    selectedProjects: {
      required: true
    },
    selectedDuration: {
      required: true
    }
  },
  computed: {
    getSetTime () {
      const start = moment(
        Math.floor(this.selectedDuration[0] / 1000),
        'X'
      ).format('YYYY/MM/DD')
      const end = moment(
        Math.floor(this.selectedDuration[1] / 1000),
        'X'
      ).format('YYYY/MM/DD')
      return `${start} - ${end}`
    }
  },
  mounted () {
    bus.$emit(`set-topbar-title`, {
      title: '',
      breadcrumb: [
        { title: 'Effectiveness Insights', url: '/v1/insight' },
        { title: 'Build Efficiency', url: '' }
      ]
    })
  }
}
</script>
<style lang="less">
@import '~@assets/css/component/insight-charts.less';
</style>
