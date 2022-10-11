<template>
    <div >
      <el-form-item label="Serve">
        <el-select v-model="pickedTargetServices"
                   @change="getArtifactFile"
                   value-key="key"
                   filterable
                   multiple
                   clearable
                   size="medium"
                   class="full-width">
          <el-option v-for="(ser,index) of allServices"
                     :key="index"
                     :label="ser.name"
                     :value="ser">
            <span>
              <span>{{ser.name}}</span><span style="color: #ccc;"> ({{ser.service_name}})</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Object Storage" >
        <el-select v-model="pickedStorage"
                   filterable
                   clearable
                   @change="changeStorage"
                   size="medium"
                   class="full-width">
          <el-option v-for="(item,index) of objectstorageList"
                     :key="index"
                     :label="`${item.bucket}(${item.endpoint})`"
                     :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-table v-if="pickedTargetServices.length > 0"
                :data="pickedTargetServices"
                empty-text="None"
                class="service-deploy-table">
        <el-table-column prop="name"
                         label="Serve"
                         width="150px">
        </el-table-column>
        <el-table-column label="Deliverables">
          <template slot-scope="scope">
            <div class="workflow-build-rows">
              <el-row class="build-row">
                <template>
                  <el-col :span="12">
                    <!-- Binding Metadata -->
                    <!-- Todo Use virtual-item-list -->
                    <el-select v-if="tarFileMap[scope.row.name] && tarFileMap[scope.row.name].length > 0"
                               v-model="scope.row.file"
                               filterable
                               clearable
                               value-key="file_name"
                               size="small"
                               style="width: 100%;"
                               placeholder="Please select deliverable">
                      <el-option v-for="(source,index) in tarFileMap[scope.row.name]" :key="index"
                        :label="source.file_name"
                        :value="source">
                      </el-option>

                    </el-select>
                    <el-tooltip v-else
                                content="Deliverable does not exist，Please enter deliverable information manually"
                                placement="top"
                                popper-class="gray-popper">
                      <el-input v-model="scope.row.file_name"
                                class="short-input"
                                size="small"
                                placeholder="Please fill in the deliverable information"></el-input>
                    </el-tooltip>
                  </el-col>
                </template>
              </el-row>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
</template>
<script>
import { getArtifactFileAPI, getStorageListAPI } from '@api'
import { sortBy } from 'lodash'
export default {
  name: 'pmArtifactDeploy',
  data () {
    return {
      tarFileMap: {},
      objectstorageList: [],
      pickedTargetServices: [],
      pickedStorage: '',
      virtualData: {
        keeps: 20,
        size: 20,
        start: 0
      },
      startAll: {}
    }
  },
  methods: {
    getArtifactFile (services) {
      const allServiceNames = services.map(service => service.name)
      this.getArtifactFiles(allServiceNames)
    },
    getArtifactFiles (val) {
      return new Promise((resolve, reject) => {
        const objectStorageId = this.pickedStorage
        const projectName = this.projectName
        const payload = { names: val }
        getArtifactFileAPI(payload, objectStorageId, projectName).then((files) => {
          files = files || []
          this.tarFileMap = this.$utils.makeMapOfArray(files, 'name')
          resolve()
        })
      })
    },
    changeStorage (val) {
      if (val) {
        this.tarFileMap = []
        const allClickableServeiceNames = this.pickedTargetServices.map(service => service.name)
        const payload = { names: allClickableServeiceNames }
        const projectName = this.projectName
        getArtifactFileAPI(payload, val, projectName).then((files) => {
          files = files || []
          this.tarFileMap = this.$utils.makeMapOfArray(files, 'name')
          this.pickedTargetServices.forEach(item => {
            item.file = null
          })
        })
      }
    }
  },
  computed: {
    pmArtifactDeployData () {
      return {
        services: this.pickedTargetServices,
        pickedStorage: this.pickedStorage
      }
    }
  },
  created () {
    // If PM When the deliverable deployment is enabled, the corresponding service and object warehouse are obtained.
    const key = this.$utils.rsaEncrypt()
    getStorageListAPI(key).then((res) => {
      this.objectstorageList = res
      // Clone Task Data
      if (this.forcedUserInput.storage_id) {
        this.pickedStorage = this.forcedUserInput.storage_id
        this.pickedTargetServices = sortBy(this.forcedUserInput.artifact_args.map(element => {
          element.key = element.name + '/' + element.service_name
          element.file = {
            file_name: element.file_name,
            name: element.name,
            service_name: element.service_name,
            task_id: element.task_id,
            url: element.url,
            workflow_name: element.workflow_name
          }
          return element
        }), 'service_name')
        this.getArtifactFiles(this.forcedUserInput.artifact_args.map(r => r.name))
        return
      }
      if (res && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].is_default) {
            this.pickedStorage = res[i].id
            break
          };
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
    projectName: {
      type: String,
      default () {
        return ''
      }
    }
  },
  watch: {
    pmArtifactDeployData: {
      handler (new_val, old_val) {
        if (new_val) {
          this.$emit('update:pmArtifactDeployData', new_val)
        }
      },
      deep: true
    }
  }
}
</script>
