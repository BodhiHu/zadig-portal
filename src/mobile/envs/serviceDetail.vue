<template>
  <div class="mobile-service-detail">
    <van-nav-bar left-arrow
                 fixed
                 @click-left="mobileGoback">
      <template #title>
        <span>{{`${envName} ${serviceName}`}}</span>
      </template>
    </van-nav-bar>
    <van-divider content-position="left">Basic Information</van-divider>
    <div class="service-info">
      <van-row>
        <van-col span="12">
          <div class="mobile-block">
            <h2 class="mobile-block-title">Internet Access</h2>
            <div class="mobile-block-desc">
              <template v-if="allHosts.length > 0">
                <div v-for="host of allHosts"
                     :key="host.host">
                  <a :href="`http://${host.host}`"
                     class="host"
                     target="_blank">{{ host.host }}</a>
                </div>
              </template>
              <div v-else>None</div>
            </div>
          </div>
        </van-col>
        <van-col span="12">
          <div class="mobile-block">
            <h2 class="mobile-block-title">Intranet Access</h2>
            <div class="mobile-block-desc">
              <template v-if="allEndpoints.length > 0">
              <div v-for="(ep,index) in allEndpoints"
                   :key="index">
                <span>{{ `${ep.service_name}:${ep.service_port}` }}</span>
                <el-popover v-if="index===0"
                            placement="bottom"
                            popper-class="ns-pop"
                            trigger="hover">
                  <span class="title">Same NS Access：</span>
                  <div v-for="(sameNs,indexSame) in allEndpoints"
                       :key="indexSame+'same'">
                    <span class="addr">{{ `${sameNs.service_name}:${sameNs.service_port}` }}</span>
                    <span v-clipboard:copy="`${sameNs.service_name}:${sameNs.service_port}`"
                          v-clipboard:success="copyCommandSuccess"
                          v-clipboard:error="copyCommandError"
                          class="copy-btn el-icon-copy-document">
                    </span>
                  </div>
                  <span class="title">Cross NS Access：</span>
                  <div v-for="(crossNs,indexCross) in allEndpoints"
                       :key="indexCross+'cross'">
                    <span
                          class="addr">{{ `${crossNs.service_name}.${namespace}:${crossNs.service_port}` }}</span>
                    <span v-clipboard:copy="`${crossNs.service_name}.${namespace}:${crossNs.service_port}`"
                          v-clipboard:success="copyCommandSuccess"
                          v-clipboard:error="copyCommandError"
                          class="copy-btn el-icon-copy-document">
                    </span>
                  </div>
                  <span slot="reference"><i class="show-more el-icon-more"></i></span>
                </el-popover>
              </div>
              </template>
              <div v-else>None</div>
            </div>
          </div>
        </van-col>
      </van-row>
    </div>
    <van-divider content-position="left">Service Instance</van-divider>
    <div class="container-info">
      <van-collapse v-model="activeContainers">
        <van-collapse-item v-for="(item,index) in currentService.scales"
                           :key="index"
                           :name="index">
          <template #title>
            <div>
              <van-row>
                <van-col :span="8"> {{item.name}}</van-col>
                <van-col :span="16">
                  <div v-for="(img,img_index) of item.images"
                       :key="img_index">
                    {{splitImg(img.image) }}
                  </div>
                </van-col>
              </van-row>
            </div>
          </template>
          <template #default>
            <div>
              <div v-if="activePod[index]"
                   class="info-body pod-container">
                <span v-for="(pod,pod_index) of item.pods"
                      :key="pod_index"
                      @click="selectPod(pod,index)"
                      :ref="pod.name"
                      :class="{pod:true, [pod.__color]:true, active: pod===activePod[index] }">
                </span>
                <div v-if="activePod[index].name"
                     class="pod-info">
                  <van-row :class="['pod-row', activePod[index].__color]"
                           ref="pod-row">
                    <van-col :span="24">
                      <span class="title">Instance Name：</span>
                      <span class="content">{{ activePod[index].name }}</span>
                    </van-col>
                  </van-row>
                  <van-row>
                    <van-col :span="24">
                      <span class="title">Runtime：</span>
                      <span class="content">{{ activePod[index].age }}</span>
                    </van-col>
                  </van-row>
                  <van-row v-for="container of activePod[index].containers"
                           :key="container.name"
                           :class="['container-row', container.__color]">
                    <div>
                      <span class="title">Container Name：</span>
                      <span class="content">{{ container.name }}</span>
                    </div>
                    <div>
                      <span class="title">Current Mirror：</span>
                      <span class="content">{{ container.imageShort }}</span>
                    </div>
                    <div v-if="container.message">
                      <span class="title">Error Message：</span>
                      <span class="content">{{ container.message }}</span>
                    </div>
                    <div>
                      <span class="title">State：</span>
                      <span class="content">{{ container.status }}</span>
                    </div>
                    <div v-if="container.startedAtReadable">
                      <span class="title">Start Time：</span>
                      <span class="content">{{ container.startedAtReadable }}</span>
                    </div>
                    <van-divider dashed></van-divider>
                  </van-row>
                  <van-row>
                    <van-col :span="24"
                             class="op-buttons">
                      <van-button plain
                                  size="small"
                                  @click="showPodEvents(activePod[index])"
                                  type="info">View Events</van-button>
                    </van-col>
                  </van-row>
                </div>

              </div>
            </div>
          </template>
        </van-collapse-item>
      </van-collapse>
    </div>
    <van-popup v-model="eventsModal.visible"
               closeable
               close-icon="close"
               round
               position="bottom"
               :style="{ height: '40%' }">
      <van-empty v-if="eventsModal.data.length === 0"
                 description="No Events For Now" />
      <el-table :data="eventsModal.data"
                v-else>
        <el-table-column prop="message"
                         label=""></el-table-column>
        <el-table-column prop="reason"
                         width="80"
                         label=""></el-table-column>
      </el-table>
    </van-popup>
  </div>
</template>
<script>
import { Col, Collapse, CollapseItem, Row, NavBar, Tag, Panel, Loading, Button, Notify, Tab, Tabs, Cell, CellGroup, Icon, Divider, ActionSheet, List, Popup, Empty } from 'vant'
import { podEventAPI, getServiceInfo } from '@api'
import moment from 'moment'
export default {
  components: {
    [NavBar.name]: NavBar,
    [Tag.name]: Tag,
    [Panel.name]: Panel,
    [Loading.name]: Loading,
    [Button.name]: Button,
    [Notify.name]: Notify,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Icon.name]: Icon,
    [Col.name]: Col,
    [Row.name]: Row,
    [Divider.name]: Divider,
    [ActionSheet.name]: ActionSheet,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [List.name]: List,
    [Popup.name]: Popup,
    [Empty.name]: Empty
  },
  data () {
    return {
      currentService: {
        scales: [],
        ingress: [],
        pods: [],
        service_name: '',
        service_endpoints: [],
        expands: []
      },
      activePod: {},
      statusColorMap: {
        running: 'green',
        pending: 'yellow',
        failed: 'red',
        unstable: 'red',
        unknown: 'purple',
        terminating: 'gray'
      },
      activeContainers: [],
      activeHelmNames: [],
      eventsModal: {
        visible: false,
        name: '',
        data: []
      }
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    originProjectName () {
      return this.$route.query.originProjectName
    },
    serviceName () {
      return this.$route.params.service_name
    },
    envName () {
      return this.$route.query.envName
    },
    isProd () {
      return this.$route.query.isProd === 'true'
    },
    allHosts () {
      if (this.currentService.ingress) {
        return this.currentService.ingress.reduce((carry, ing) => carry.concat(ing.host_info), [])
      } else {
        return []
      }
    },
    allEndpoints () {
      if (this.currentService.service_endpoints) {
        return this.currentService.service_endpoints.reduce(
          (carry, point) => {
            if (point.endpoints) {
              return carry.concat(point.endpoints)
            }
            return carry
          }, []
        )
      } else {
        return []
      }
    }
  },
  methods: {
    copyCommandSuccess (event) {
      this.$message({
        message: 'Address successfully copied to clipboard',
        type: 'success'
      })
    },
    copyCommandError (event) {
      this.$message({
        message: 'Address Copy Failed',
        type: 'error'
      })
    },
    fetchServiceData () {
      const projectName = this.projectName
      const serviceName = this.serviceName
      const envName = this.envName ? this.envName : ''
      const envType = this.isProd ? 'prod' : ''
      getServiceInfo(projectName, serviceName, envName, envType).then((res) => {
        if (res.scales) {
          if (res.scales.length > 0 && res.scales[0].pods.length > 0) {
            this.$set(this.activePod, 0, res.scales[0].pods[0])
          }
          res.scales.forEach(scale => {
            scale.pods.forEach(pod => {
              pod.status = pod.status.toLowerCase()
              pod.__color = this.statusColorMap[pod.status]
              pod.canOperate = !(pod.status in {
                pending: 1,
                terminating: 1
              })
              pod.containers.forEach(con => {
                con.edit = false
                con.image2Apply = con.image
                con.imageShort = con.image.split('/').pop()
                con.status = con.status.toLowerCase()
                con.__color = this.statusColorMap[con.status]
                con.startedAtReadable = con.started_at
                  ? moment(con.started_at, 'X').format('YYYY-MM-DD HH:mm:ss')
                  : ''
              })
            })
          })
        } else {
          res.scales = []
        }
        this.currentService = res
      })
    },
    selectPod (target, index) {
      this.$set(this.activePod, index, target)
      // https://stackoverflow.com/questions/5041494
      const sheet = document.styleSheets[0]
      const len = sheet.cssRules.length
      sheet.insertRule(`.mobile-service-detail .pod-info .pod-row::before
          { left: ${this.$refs[target.name][0].offsetLeft - 13}px!important; }`, len)
      sheet.insertRule(`.mobile-service-detail .pod-info
          { top: ${this.$refs[target.name][0].offsetTop + 30}px!important; }`, len + 1)
    },
    splitImg (img) {
      if (img) {
        if (img.includes('/')) {
          const length = img.split('/').length
          return img.split('/')[length - 1]
        } else {
          return img
        }
      }
    },
    showPodEvents (pod) {
      const projectName = this.projectName
      const podName = pod.name
      const envName = this.envName ? this.envName : ''
      const envType = this.isProd ? 'prod' : ''
      this.eventsModal.visible = true
      podEventAPI(projectName, podName, envName, envType).then((res) => {
        this.eventsModal.data = res.map(row => {
          row.firstSeenReadable = moment(row.first_seen, 'X').format('YYYY-MM-DD HH:mm')
          row.lastSeenReadable = moment(row.last_seen, 'X').format('YYYY-MM-DD HH:mm')
          return row
        })
      })
    }
  },
  mounted () {
    this.fetchServiceData()
  }
}
</script>
<style lang="less">
@normal-blue: #0066ff;
@hover-blue: #66b1ff;

@stat-green: #90d76d;
@stat-green-active: #baf19e;
@stat-green-faint: #dff6d4;

@stat-yellow: #f1bf5a;
@stat-yellow-active: #f8e0b4;
@stat-yellow-faint: #fdf4e3;

@stat-red: #f98181;
@stat-red-active: #f4c9c9;
@stat-red-faint: #f6e7e7;

@stat-purple: #aa70d1;
@stat-purple-active: #d9c6e7;
@stat-purple-faint: #ece7f0;

@stat-gray: #aab0bc;
@stat-gray-active: #d5e1f4;
@stat-gray-faint: #e7edf6;

.mobile-service-detail {
  padding-top: 46px;
  padding-bottom: 50px;

  .host {
    color: @themeColor;
  }

  .container-info {
    margin-top: 15px;
  }

  .pod {
    position: relative;
    display: inline-block;
    width: 24px;
    height: 30px;
    margin-right: 5px;
    border-radius: 1px;
    cursor: pointer;

    &.green {
      background-color: @stat-green;

      &.active {
        background-color: @stat-green-active;
      }
    }

    &.yellow {
      background-color: @stat-yellow;

      &.active {
        background-color: @stat-yellow-active;
      }
    }

    &.red {
      background-color: @stat-red;

      &.active {
        background-color: @stat-red-active;
      }
    }

    &.purple {
      background-color: @stat-purple;

      &.active {
        background-color: @stat-purple-active;
      }
    }

    &.gray {
      background-color: @stat-gray;

      &.active {
        background-color: @stat-gray-active;
      }
    }
  }

  .pod-row {
    position: relative;

    &:hover {
      &.green::before {
        border-bottom-color: @stat-green-faint;
      }

      &.yellow::before {
        border-bottom-color: @stat-yellow-faint;
      }

      &.red::before {
        border-bottom-color: @stat-red-faint;
      }

      &.purple::before {
        border-bottom-color: @stat-purple-faint;
      }

      &.gray::before {
        border-bottom-color: @stat-gray-faint;
      }
    }

    &::before {
      position: absolute;
      top: -8px;
      left: 4px;
      width: 0;
      height: 0;
      border-right: 8px solid transparent;
      border-bottom: 8px solid #fff;
      border-left: 8px solid transparent;
      transition: all 0.3s ease-out;
      content: " ";
    }
  }

  .op-buttons {
    margin-top: 10px;
  }
}
</style>
