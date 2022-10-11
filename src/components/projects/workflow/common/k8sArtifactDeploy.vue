<template>
  <div>
    <el-form-item label="Serve">
      <el-select
        v-model="pickedTargetServices"
        @change="getServiceImg"
        value-key="key"
        filterable
        multiple
        clearable
        size="medium"
        class="full-width"
      >
        <el-option v-for="(ser,index) of allServices" :key="index" :label="ser.name" :value="ser">
          <span>
            <span>{{ser.name}}</span>
            <span style="color: #ccc;">({{ser.service_name}})</span>
          </span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Mirror Repository">
      <el-select v-model="pickedRegistry" filterable clearable @change="changeRegistry" size="medium" class="full-width">
        <el-option v-for="(reg,index) of allRegistry" :key="index" :label="reg.namespace ? `${reg.reg_addr}/${reg.namespace}` : reg.reg_addr" :value="reg.id"></el-option>
      </el-select>
    </el-form-item>
    <el-table v-if="pickedTargetServices.length > 0" :data="pickedTargetServices" empty-text="None" class="service-deploy-table">
      <el-table-column prop="name" label="Serve" width="150px"></el-table-column>
      <el-table-column label="Mirror">
        <template slot-scope="scope">
          <div class="workflow-build-rows">
            <el-row class="build-row">
              <template>
                <el-col :span="12">
                  <el-select
                    v-if="imageMap[scope.row.image_name] && imageMap[scope.row.image_name].length > 0"
                    v-model="scope.row.image"
                    filterable
                    clearable
                    size="small"
                    style="width: 100%;"
                    placeholder="Please Select A Mirror"
                  >
                    <el-option
                      v-for="item in imageMap[scope.row.image_name]"
                      :key="`${item.name}-${item.tag}`"
                      :label="item.tag"
                      :value="item.full"
                    ></el-option>
                  </el-select>
                  <!-- Todo: use virtual-list -->
                  <!-- <el-select v-if="imageMap[scope.row.image_name] && imageMap[scope.row.image_name].length > 0"
                               v-model="scope.row.image"
                               @visible-change="changeVirtualData($event, scope.row, scope.$index)"
                               :filter-method="(val) =>{return imageFilter(scope.row.image_name,val)}"
                               filterable
                               clearable
                               size="small"
                               style="width: 100%;"
                               placeholder="Please Select A Mirror">
                      <virtual-scroll-list :ref="`scrollListRef${scope.$index}`"
                                           style="height: 272px; overflow-y: auto;"
                                           :size="virtualData.size"
                                           :keeps="virtualData.keeps"
                                           :start="startAll[scope.row.name]"
                                           :dataKey="(img)=>{ return img.name+'-'+img.tag}"
                                           :dataSources="imageMap[scope.row.image_name]"
                                           :dataComponent="itemComponent">
                      </virtual-scroll-list>
                  </el-select>-->
                  <el-tooltip v-else content="Failed to request mirroring，Please enter the mirror manually" placement="top" popper-class="gray-popper">
                    <el-input v-model="scope.row.image" class="short-input" size="small" placeholder="Please fill in the mirror"></el-input>
                  </el-tooltip>
                </el-col>
              </template>
            </el-row>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="showCreateVersion" class="create-version">
      <div v-hasPermi="{projectName: projectName, action: 'create_delivery'}" class="create-checkbox">
        <el-checkbox v-model="versionInfo.enabled">Create Version</el-checkbox>
      </div>
      <el-form v-if="versionInfo.enabled" :model="versionInfo" label-width="90px" ref="versionForm" :rules="versionRules">
        <el-form-item label="Version Name" prop="version">
          <el-input class="full-width" v-model="versionInfo.version" size="small" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Version Description" prop="desc">
          <el-input class="full-width" type="textarea" autosize placeholder="Please enter a version description" v-model="versionInfo.desc"></el-input>
        </el-form-item>
        <el-form-item label="Label" prop="labels">
          <el-input class="full-width" type="textarea" autosize placeholder="Please enter a version tag，For Multiple Labels ; Segmentation" v-model="versionInfo.labelStr"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import virtualListItem from '../../common/imageItem'
import virtualScrollList from 'vue-virtual-scroll-list'
import { getRegistryWhenBuildAPI, imagesAPI } from '@api'
import { uniq, sortBy } from 'lodash'
export default {
  data () {
    return {
      itemComponent: virtualListItem,
      imageMap: {},
      allRegistry: [],
      pickedTargetServices: [],
      pickedRegistry: '',
      versionInfo: {
        version: '',
        enabled: false,
        desc: '',
        labels: [],
        labelStr: ''
      },
      versionRules: {
        version: [
          {
            required: true,
            message: 'Please fill in the version name',
            trigger: ['blur', 'change']
          }
        ]
      },
      virtualData: {
        keeps: 20,
        size: 34,
        start: 0
      },
      startAll: {}
    }
  },
  methods: {
    changeRegistryId (id) {
      if (id && this.pickedRegistry !== id) {
        this.pickedRegistry = id
        this.changeRegistry(id)
      }
    },
    changeVirtualData (event, row, index) {
      const opt = event ? 0 : -1
      const id =
        this.imageMap[row.image_name].map(img => img.full).indexOf(row.image) +
        opt
      if (this.startAll[row.name]) {
        this.startAll[row.name] = id
      } else {
        this.$set(this.startAll, row.name, id)
      }
      this.$refs[`scrollListRef${index}`].virtual.updateRange(
        id,
        id + this.virtualData.keeps
      )
    },
    changeRegistry (val) {
      if (val) {
        this.$set(this, 'imageMap', {})
        const allClickableServiceNames = this.allServices.map(
          service => service.image_name
        ) // .filter(service => service.has_build)
        imagesAPI(uniq(allClickableServiceNames), val).then(images => {
          images = images || []
          for (const image of images) {
            image.full = `${image.name}:${image.tag}`
          }
          this.$set(this, 'imageMap', this.$utils.makeMapOfArray(images, 'name'))
          this.pickedTargetServices.forEach(tar => {
            this.$set(tar, 'image', '')
          })
        })
      }
    },
    getServiceImg (services) {
      const allServiceNames = services.map(service => service.image_name)
      this.getServiceImgs(allServiceNames)
    },
    getServiceImgs (val) {
      return new Promise((resolve, reject) => {
        const registryId = this.pickedRegistry
        imagesAPI(uniq(val), registryId).then(images => {
          images = images || []
          for (const image of images) {
            image.full = `${image.name}:${image.tag}`
          }
          this.$set(this, 'imageMap', this.$utils.makeMapOfArray(images, 'name'))
          resolve()
        })
      })
    },
    // Todo
    imageFilter (serviceName, val) {
      if (val) {
        this.filteredImages = this.imageMap[serviceName].filter(
          img => img.tag.indexOf(val) > -1
        )
      } else {
        this.filteredImages = this.imageMap[serviceName]
      }
    }
  },
  computed: {
    k8sArtifactDeployData () {
      return {
        versionInfo: this.versionInfo,
        services: this.pickedTargetServices,
        pickedRegistry: this.pickedRegistry
      }
    },
    projectName () {
      return this.$route.params.project_name
    }
  },
  created () {
    // If K8s When the deliverable deployment is enabled, the corresponding services and mirror warehouses are obtained.
    getRegistryWhenBuildAPI(this.projectName).then(res => {
      this.allRegistry = res
      // Clone Task Data
      if (
        this.forcedUserInput.version_args &&
        this.forcedUserInput.version_args.version
      ) {
        Object.assign(this.versionInfo, this.forcedUserInput.version_args)
        this.versionInfo.labelStr = this.versionInfo.labels.join(';')
      }
      if (this.forcedUserInput.registry_id) {
        this.pickedRegistry = this.forcedUserInput.registry_id
        this.pickedTargetServices = sortBy(
          this.forcedUserInput.artifact_args.map(element => {
            element.key = element.name + '/' + element.service_name
            return element
          }),
          'service_name'
        )
        this.forcedUserInput.artifact_args.forEach(r => {
          if (!r.image_name) {
            this.$set(r, 'image_name', r.name)
          }
        })
        this.getServiceImgs(
          this.forcedUserInput.artifact_args.map(r => r.image_name)
        )
        // Todo: use virtual-list
        // .then(() => {
        //   this.forcedUserInput.artifact_args.forEach((art, index) => {
        //     this.changeVirtualData(false, art, index)
        //   })
        // })
        return
      }
      if (res && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].is_default) {
            this.pickedRegistry = this.pickedRegistry || res[i].id
            break
          }
        }
      }
    })
  },
  props: {
    forcedUserInput: {
      type: Object,
      default () {
        return {}
      }
    },
    allServices: {
      type: Array,
      default () {
        return []
      }
    },
    showCreateVersion: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  watch: {
    k8sArtifactDeployData: {
      handler (new_val, old_val) {
        if (new_val) {
          this.$emit('update:k8sArtifactDeployData', new_val)
        }
      },
      deep: true
    }
  },
  components: {
    virtualScrollList
  }
}
</script>
