<template>
  <div style="width: 100%; height: 100%;">
    <v-chart :options="option"
             :autoresize="true" />
  </div>
</template>
<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/component/title'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/chart/line'
import { getServiceDeployAPI } from '@api'
import moment from 'moment'

export default {
  data () {
    return {
      option: {
        color: ['#67c23a', '#ff1949'],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Success', 'Fail']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          show: true,
          type: 'category',
          boundaryGap: true,
          data: [],
          axisTick: {
            show: false
          }
        }],
        yAxis: {
          type: 'value',
          axisTick: {
            show: false
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#000000a6'
            }
          }
        },
        series: [
          {
            name: 'Success',
            type: 'line',
            smooth: true,
            stack: 'Total',
            areaStyle: {},
            data: []
          },
          {
            name: 'Fail',
            type: 'line',
            smooth: true,
            stack: 'Total',
            areaStyle: {},
            data: []
          }
        ]
      }
    }
  },
  methods: {
    getServiceDeploy () {
      const startTime = Math.floor(this.selectedDuration[0] / 1000)
      const endTime = Math.floor(this.selectedDuration[1] / 1000)
      const selectedProjects = this.selectedProjects
      getServiceDeployAPI({ startDate: startTime, endDate: endTime, projectNames: selectedProjects }).then((res) => {
        this.option.xAxis[0].data = (res.map(element => {
          return moment(element.day, 'X').format('YYYY-MM-DD')
        })).reverse()
        this.option.series[0].data = (res.map(element => {
          return element.totalSuccess
        })).reverse()
        this.option.series[1].data = (res.map(element => {
          return element.totalFailure
        })).reverse()
      })
    }
  },
  components: {
    'v-chart': ECharts
  },
  watch: {
    selectedDuration: {
      handler () {
        this.getServiceDeploy()
      },
      immediate: false
    },
    selectedProjects: {
      handler () {
        this.getServiceDeploy()
      },
      immediate: false
    }
  },
  mounted () {
    this.getServiceDeploy()
  },
  props: {
    selectedDuration: {
      required: true
    },
    selectedProjects: {
      required: true
    }
  }
}
</script>
<style lang="less">
.echarts {
  width: 100% !important;
  height: 100% !important;
}
</style>
