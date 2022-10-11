<template>
  <div class="import-from-namespace-container">
    <el-dialog
      title="From Kubernetes Namespace Import"
      :close-on-click-modal="false"
      append-to-body
      center
      width="720px"
      label-position="left"
      custom-class="dialog-import-from-namespace"
      :visible="dialogImportFromNamespaceVisible"
      @update:visible="$emit('update:dialogImportFromNamespaceVisible', $event)"
      :before-close="closeDialog"
    >
      <el-form
        ref="importK8sNamespaceRefRef"
        :model="importNamespace"
        :rules="rules"
        label-width="120px"
        label-position="left"
        class="primary-form"
      >
        <el-form-item label="Choose A Cluster" prop="cluster_id" :show-message="false">
          <el-select filterable v-model="importNamespace.cluster_id" placeholder="Please Select A Cluster" @change="changeCluster" size="small">
            <el-option v-for="cluster in allCluster" :key="cluster.id" :label="$utils.showClusterName(cluster)" :value="cluster.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Select Namespace" prop="namespace" :show-message="false">
          <el-select filterable v-model="importNamespace.namespace" placeholder="Please select a namespace" @change="changeNamespace" size="small">
            <el-option v-for="(ns,index) in hostingNamespace" :key="index" :label="ns.name" :value="ns.name"></el-option>
          </el-select>
        </el-form-item>

        <el-table :data="importNamespace.services" style="width: 100%;">
          <el-table-column width="200px" label="Service Name">
            <template slot-scope="{ row, $index }">
              <el-form-item
                label-width="0"
                :prop="`services[${$index}].name`"
                :rules="{ required: true, type: 'string', message: 'Please enter a service name', trigger: 'change'}"
                :show-message="false"
              >
                <el-input v-model="row.name" placeholder="Enter Service Name" size="small" style="width: 85%;"></el-input>
                <el-button type="text" icon="el-icon-minus" style="margin-left: 5px;" @click="operateService('delete', $index)"></el-button>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="Select Configuration">
            <template slot-scope="{ row, $index }">
              <div v-for="(workload, index) in row.workloads_map" :key="index">
                <el-form-item
                  label-width="0"
                  :prop="`services[${$index}].workloads_map[${index}].type`"
                  :rules="{ required: true, message: 'Please Select A Resource', trigger: 'change'}"
                  style=" display: inline-block; width: 30%;"
                  :show-message="false"
                >
                  <span v-show="workload.type" style=" display: inline-block; width: 100%;">{{ workload.type }}</span>
                  <el-select v-show="!workload.type" v-model="workload.type" placeholder="Choose A Resource" size="small">
                    <el-option
                      v-for="item in difference(Object.keys(workloadsMap), row.workloads_map.map(work => work.type))"
                      :key="item"
                      :label="item"
                      :value="item"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  label-width="0"
                  :prop="`services[${$index}].workloads_map[${index}].configs`"
                  :rules="{ required: true, type: 'array', message: 'Please select a configuration', trigger: 'change'}"
                  style=" display: inline-block; width: 55%;"
                  :show-message="false"
                >
                  <el-select v-model="workload.configs" placeholder="Select Configuration" multiple collapse-tags filterable size="small">
                    <el-option v-for="item in workload.configs" :key="item" :label="item" :value="item"></el-option>
                    <el-option v-for="item in (remainingConfig[workload.type] || [])" :key="item" :label="item" :value="item"></el-option>
                  </el-select>
                </el-form-item>
                <el-button
                  v-if="row.workloads_map.length > 1"
                  type="text"
                  icon="el-icon-minus"
                  style="margin-left: 5px;"
                  @click="operateConfig('delete', row.workloads_map, index)"
                ></el-button>
                <el-button
                  v-if="index === row.workloads_map.length-1"
                  type="text"
                  icon="el-icon-plus"
                  style="margin-left: 5px;"
                  @click="operateConfig('add', row.workloads_map, index)"
                ></el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="text" icon="el-icon-plus" @click="operateService('add')">Add Service</el-button>
      </el-form>
      <div class="dialog-footer">
        <el-button plain native-type="submit" @click="closeDialog()" size="small" :disabled="importLoading">Cancel</el-button>
        <el-button
          type="primary"
          native-type="submit"
          size="small"
          class="start-create"
          :loading="importLoading"
          @click="loadServiceFromKubernetesNamespace"
        >Import</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getClusterListAPI,
  productHostingNamespaceAPI,
  getConfigFromNamespaceAPI,
  createServiceFromK8sNamespaceAPI
} from '@api'

import { cloneDeep, difference } from 'lodash'

const workloadsMapInfo = {
  configmap: [],
  deployment: [],
  statefulset: [],
  ingress: [],
  secret: [],
  pvc: [],
  service: []
}

export default {
  data () {
    return {
      allCluster: [],
      hostingNamespace: [],
      rules: {
        cluster_id: {
          required: true,
          message: 'Please Select A Cluster',
          trigger: ['change']
        },
        namespace: {
          required: true,
          message: 'Please select a namespace',
          trigger: ['change']
        }
      },
      importNamespace: {
        cluster_id: '',
        namespace: '',
        product_name: '',
        visibility: 'private',
        type: 'k8s',
        services: [] // {name: '', workloads_map: [{ type: '', configs: []}]}
      },
      workloadsMap: cloneDeep(workloadsMapInfo),
      difference,
      importLoading: false
    }
  },
  props: {
    projectName: {
      type: String,
      required: true
    },
    dialogImportFromNamespaceVisible: {
      type: Boolean,
      default: false
    },
    importServiceFromNamespaceSuccess: Function
  },
  methods: {
    closeDialog (done) {
      this.$refs.importK8sNamespaceRefRef.resetFields()
      this.importNamespace = {
        cluster_id: '',
        namespace: '',
        product_name: this.projectName,
        visibility: 'private',
        type: 'k8s',
        services: []
      }
      this.$emit('update:dialogImportFromNamespaceVisible', false)
      this.importLoading = false
      done && done()
    },
    operateService (action, index) {
      if (action === 'add') {
        this.importNamespace.services.push({
          name: '',
          workloads_map: [{ type: '', configs: [] }]
        })
      } else if (action === 'delete') {
        this.importNamespace.services.splice(index, 1)
      }
    },
    operateConfig (action, workloadsMap, index) {
      if (action === 'add') {
        workloadsMap.push({
          type: '',
          configs: []
        })
      } else if (action === 'delete') {
        workloadsMap.splice(index, 1)
      }
    },
    getCluster () {
      getClusterListAPI(this.projectName).then(res => {
        this.allCluster = res.filter(element => {
          return element.status === 'normal'
        })
      })
    },
    changeCluster (clusterId) {
      this.importNamespace.namespace = ''
      this.importNamespace.services = []
      this.hostingNamespace = []
      productHostingNamespaceAPI(clusterId).then(res => {
        this.hostingNamespace = res
      })
    },
    changeNamespace () {
      this.importNamespace.services = []
      this.workloadsMap = cloneDeep(workloadsMapInfo)

      const namespace = this.importNamespace.namespace
      const clusterId = this.importNamespace.cluster_id
      getConfigFromNamespaceAPI(this.projectName, clusterId, namespace).then(
        res => {
          this.workloadsMap = {
            ...cloneDeep(workloadsMapInfo),
            ...res.workloads_map
          }
        }
      )
    },
    loadServiceFromKubernetesNamespace () {
      this.$refs.importK8sNamespaceRefRef.validate().then(() => {
        if (!this.importNamespace.services.length) {
          this.$message.info('Please Add Service')
          return
        }
        const payload = cloneDeep(this.importNamespace)
        payload.services = payload.services.map(service => {
          const workloads_map = {}
          service.workloads_map.forEach(workload => {
            workloads_map[workload.type] = workload.configs
          })
          return {
            name: service.name,
            workloads_map
          }
        })
        this.importLoading = true
        createServiceFromK8sNamespaceAPI(this.projectName, payload)
          .then(() => {
            this.importLoading = false
            this.$message.success('Create service successfully！')
            this.closeDialog()
            this.importServiceFromNamespaceSuccess()
          })
          .catch(() => {
            this.importLoading = false
          })
      })
    }
  },
  computed: {
    remainingConfig () {
      const workloadsMap = this.workloadsMap
      const remaining = cloneDeep(workloadsMapInfo)
      const current = cloneDeep(workloadsMapInfo)
      this.importNamespace.services.forEach(service => {
        service.workloads_map.forEach(workload => {
          if (workload.type) {
            current[workload.type] = [
              ...current[workload.type],
              ...workload.configs
            ]
          }
        })
      })
      for (const key in remaining) {
        remaining[key] = difference(workloadsMap[key], current[key])
      }
      return remaining
    }
  },
  mounted () {
    this.importNamespace.product_name = this.projectName
    this.getCluster()
  }
}
</script>
<style lang="less">
.dialog-import-from-namespace {
  .el-dialog__header {
    padding: 20px 20px 10px;
    font-size: 16px;
    border: 1px solid #d2d2d2;
  }

  .el-dialog__footer {
    padding: 0 20px 20px;
    text-align: right;
  }

  .el-dialog__body {
    padding: 30px 70px;

    .dialog-footer {
      margin-top: 18px;
      text-align: right;
    }
  }
}
</style>
