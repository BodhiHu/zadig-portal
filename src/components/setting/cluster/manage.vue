<template>
  <div
    v-loading="loading"
    element-loading-text="Loading..."
    element-loading-spinner="iconfont iconfont-loading iconjiqun"
    class="setting-cluster-container"
  >
    <!--Cluster-access-dialog-->
    <el-dialog
      :title="`Access Cluster ${accessCluster.name}`"
      :visible.sync="dialogClusterAccessVisible"
      custom-class="dialog-style"
      :close-on-click-modal="false"
      width="75%"
    >
      <p>Run The Following kubectl Order，Import It To Zadig In The System</p>
      <div class="highlighter-rouge">
        <div class="highlight">
          <span class="code-line">
            {{`$ kubectl apply -f "${$utils.getOrigin()}/api/aslan/cluster/agent/${accessCluster.id}/agent.yaml${deployType==='Deployment'?'?type=deploy':''}"`}}
            <span
              v-clipboard:copy="getYamlUrl()"
              v-clipboard:success="copyCommandSuccess"
              v-clipboard:error="copyCommandError"
              class="el-icon-document-copy copy"
            ></span>
          </span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button :plain="true" size="small" type="primary" @click="dialogClusterAccessVisible=false">Sure</el-button>
      </div>
    </el-dialog>
    <!--Cluster-access-dialog-->

    <!--Cluster-dialog-->
    <el-dialog
      :title="isEdit ? 'Modify The Cluster': 'Add A Cluster'"
      :visible.sync="dialogClusterFormVisible"
      custom-class="dialog-style"
      :close-on-click-modal="false"
      width="45%"
    >
      <el-alert title="Notice:" type="warning" style="margin-bottom: 15px;" :closable="false">
        <slot>
          <span class="tip-item">- If the specified production cluster is“No”，A user with environment creation privileges，Can specify which cluster resource to use。</span>
          <span class="tip-item">
            -
            If the specified production cluster is“Yes”，Super administrators can control the use of cluster resources through permissions，In order to achieve strict isolation of business and resources and safe production control。
          </span>
          <span class="tip-item">
            - After joining the new cluster，If the cluster supports generic domain name access，Need To Be Installed Ingress Controller，See
            <el-link
              style="font-size: 14px; vertical-align: baseline;"
              type="primary"
              :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
              :underline="false"
              target="_blank"
            >Help</el-link> Check Agent Deployment Example。
          </span>
          <span class="tip-item">
            - To configure workflow tasks“Scheduling Strategy”And“Cache resource configuration”，Please configure it after the cluster is connected normally，See
            <el-link
              style="font-size: 14px; vertical-align: baseline;"
              type="primary"
              :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
              :underline="false"
              target="_blank"
            >Help</el-link> View specific configuration。
          </span>
        </slot>
      </el-alert>
      <el-form ref="cluster" :rules="rules" label-width="150px" label-position="left" :model="cluster">
        <el-form-item label="Connection Method" prop="type">
          <el-select v-model="cluster.type" style="width: 100%;" size="small" placeholder="Please select a connection method" :disabled="isEdit">
            <el-option value="agent" label="Proxy Connection"></el-option>
            <el-option value="kubeconfig" label="Direct Connection"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input size="small" v-model="cluster.name" placeholder="Please enter a cluster name"></el-input>
        </el-form-item>
        <el-form-item label="Cluster Provider" prop="provider">
          <el-select v-model="cluster.provider" style="width: 100%;" size="small" placeholder="Please select a cluster provider">
            <el-option :value="1" label="Ali Cloud ACK">
              <i class="iconfont iconaliyun"></i>
              <span>Ali Cloud ACK</span>
            </el-option>

            <el-option :value="2" label="Tencent Cloud TKE">
              <i class="iconfont icontengxunyun"></i>
              <span>Tencent Cloud TKE</span>
            </el-option>
            <el-option :value="3" label="HUAWEI CLOUD CCE">
              <i class="iconfont iconhuawei"></i>
              <span>HUAWEI CLOUD CCE</span>
            </el-option>
            <el-option :value="0" label="Other">
              <i class="iconfont iconqita"></i>
              <span>Other</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Describe" prop="description">
          <el-input size="small" v-model="cluster.description" placeholder="Please enter a description"></el-input>
        </el-form-item>
        <el-form-item label="Production Cluster" prop="production">
          <el-radio-group v-model="cluster.production">
            <el-radio :label="true">Yes</el-radio>
            <el-radio :label="false">No</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="KubeConfig" prop="config" v-if="cluster.type === 'kubeconfig'" :show-message="false">
          <Resize :resize="'vertical'" :height="'100px'" @sizeChange="$refs.codemirror.refresh()">
            <Codemirror ref="codemirror" v-model="cluster.config" placeholder="Please enter the target cluster KubeConfig"></Codemirror>
          </Resize>
        </el-form-item>
        <el-button type="text" @click="expandAdvanced = !expandAdvanced">
          Advanced Configuration
          <i :class="{'el-icon-arrow-right': !expandAdvanced,'el-icon-arrow-down': expandAdvanced}"></i>
        </el-button>
        <template v-if="expandAdvanced">
          <section>
            <h4>Specify Project Scope</h4>
            <el-form-item label="Select Item" prop="advanced_config.project_names" class="project-scoped">
              <el-select
                v-model="cluster.advanced_config.project_names"
                placeholder="Please Select An Item"
                size="small"
                style="width: 100%;"
                filterable
                multiple
                clearable
                collapse-tags
              >
                <el-option v-for="name in projectNames" :key="name" :label="name" :value="name"></el-option>
              </el-select>
              <el-button size="mini" plain @click="cluster.advanced_config.project_names = []">Clear All</el-button>
            </el-form-item>
          </section>
          <section v-show="isEdit">
            <h4>
              Scheduling Strategy
              <el-tooltip effect="dark" placement="top">
                <div slot="content" style="line-height: 1.5;">
                  <div>Random Scheduling：Workflow tasks are randomly scheduled to available nodes in the cluster</div>
                  <div>Force Scheduling：Workflow tasks are forced to be scheduled to the corresponding nodes，If there is a problem with the node，The task may not be scheduled successfully</div>
                  <div>Priority Scheduling：Workflow tasks are preferentially scheduled to the corresponding nodes，If there is a problem with the node，Will be scheduled to other available nodes</div>
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
              <span v-if="!isConfigurable" style="color: #e6a23c; font-weight: 400; font-size: 12px;">The scheduling policy can only be selected after the cluster is connected normally</span>
            </h4>
            <el-form-item prop="advanced_config.strategy" >
              <span slot="label">Choose Strategy</span>
              <el-select
                v-model="cluster.advanced_config.strategy"
                placeholder="Please Select A Strategy"
                style="width: 100%;"
                size="small"
                required
                :disabled="!isConfigurable"
              >
                <el-option label="Random Scheduling" value="normal"></el-option>
                <el-option label="Force Scheduling" value="required"></el-option>
                <el-option label="Priority Scheduling" value="preferred"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="cluster.advanced_config.strategy && cluster.advanced_config.strategy !== 'normal'"
              prop="advanced_config.node_labels"
              label="Select Label"
            >
              <el-select v-model="cluster.advanced_config.node_labels" placeholder="Please Choose" multiple style="width: 100%;" size="small">
                <el-option v-for="node in clusterNodes.labels" :key="node" :label="node" :value="node"></el-option>
              </el-select>
              <span style="color: #e6a23c; font-size: 12px;" v-if="clusterNodes.labels.length == 0">Please label the corresponding node first</span>
              <div class="list-host">
                <div v-for="host in  matchedHost" :key="host.ip">
                  {{host.ip}} &nbsp;&nbsp;-&nbsp;&nbsp;
                  <span
                    :style="{color: host.ready ? '#67c23a' : '#f56c6c'}"
                  >{{host.ready ? 'Ready' : 'Not Ready'}}</span>
                </div>
              </div>
            </el-form-item>
          </section>
          <section v-show="isEdit">
            <h4>
              Cache resource configuration
              <el-tooltip effect="dark" placement="top">
                <div slot="content" style="line-height: 1.5;">Workflow tasks scheduled to the current cluster will be cached using the specified storage medium</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
              <el-link
                style="font-size: 14px; vertical-align: baseline;"
                type="primary"
                :href="`https://docs.koderover.com/zadig/pages/cluster_manage/#Cache resource configuration`"
                :underline="false"
                target="_blank"
              >Help</el-link>
            </h4>
            <el-form-item prop="cache.medium_type">
              <span slot="label">Select Storage Medium</span>
              <el-radio-group v-model="cluster.cache.medium_type" @change="changeMediumType" class="storage-medium">
                <el-radio label="object">Object Storage</el-radio>
                <el-radio :disabled="!isConfigurable" label="nfs">
                  Cluster Storage
                  <span v-if="!isConfigurable" style="color: #e6a23c; font-weight: 400; font-size: 12px;">Cluster resources can only be used after the cluster is connected normally</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <!-- <el-form-item v-if="cluster.cache.medium_type === 'object'" prop="cache.object_properties.id">
              <span slot="label">Choose Object Storage</span>
              <el-select v-model="cluster.cache.object_properties.id" placeholder="Please select Object Storage" style="width: 100%;" size="small">
                <template v-if="allStorage.length > 0">
                  <el-option v-for="(item,index) in (cluster.local ? allStorage : externalStorage)" :key="index" :label="`${item.endpoint}/${item.bucket}`" :value="item.id"></el-option>
                </template>
                <el-option v-if="(cluster.local ? allStorage : externalStorage).length === 0" value="NEWCUSTOM">
                  <router-link to="/v1/system/storage" style="color: #606266;">Integrated Object Storage</router-link>
                </el-option>
              </el-select>
            </el-form-item>-->
            <template v-if="cluster.cache.medium_type === 'nfs'">
              <el-form-item prop="cache.nfs_properties.provision_type">
                <span slot="label">Choose Storage Resources</span>
                <el-radio-group v-model="cluster.cache.nfs_properties.provision_type">
                  <el-radio label="dynamic">Dynamically generate resources</el-radio>
                  <el-radio label="static">Use existing storage resources</el-radio>
                </el-radio-group>
              </el-form-item>
              <template v-if="cluster.cache.nfs_properties.provision_type === 'dynamic'">
                <el-form-item prop="cache.nfs_properties.storage_class">
                  <span slot="label">Choose Storage Class</span>
                  <el-select v-model="cluster.cache.nfs_properties.storage_class" placeholder="Please Choose" style="width: 100%;" size="small">
                    <el-option v-for="(item,index) in allFileStorageClass" :key="index" :label="item" :value="item"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item prop="cache.nfs_properties.storage_size_in_gib">
                  <span slot="label">Storage Space Size</span>
                  <el-input
                    v-model.number="cluster.cache.nfs_properties.storage_size_in_gib"
                    style="width: 100%; vertical-align: baseline;"
                    size="small"
                    placeholder="Please enter storage size"
                  >
                    <template slot="append">GiB</template>
                  </el-input>
                </el-form-item>
              </template>
              <template v-else-if="cluster.cache.nfs_properties.provision_type === 'static'">
                <el-form-item prop="cache.nfs_properties.pvc">
                  <span slot="label">
                    Specify PVC
                    <el-link
                      style="font-size: 14px; vertical-align: baseline;"
                      type="primary"
                      :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
                      :underline="false"
                      target="_blank"
                    >Help</el-link>
                  </span>
                  <el-select v-model="cluster.cache.nfs_properties.pvc" placeholder="Please Choose" style="width: 100%;" size="small">
                    <el-option
                      v-for="(item,index) in allPvc"
                      :key="index"
                      :label="`${item.name} ${$utils.formatBytes(item.storage_size_in_bytes)}`"
                      :value="item.name"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </template>
              <el-form-item prop="cache.nfs_properties.subpath">
                <span slot="label">
                  Cache Directory Rules
                  <el-tooltip effect="dark" placement="right">
                    <div slot="content">
                      The cache directory rule supports the following variables：<br><br>
                      <span style="display: inline-block; width: 120px;">$PROJECT</span><span>Project Name</span><br>
                      <span style="display: inline-block; width: 120px;">$WORKFLOW</span>Workflow Name<br>
                      <span style="display: inline-block; width: 120px;">$SERVICE_MODULE</span>Service Component Name (When executing a test workflow，The Value Is Empty)<br><br>
                      You can also use relative paths such as cache Etc. to implement shared cache，A null value indicates the root directory of the cluster storage
                    </div>
                    <i class="el-icon-question tooltip"></i>
                  </el-tooltip>
                </span>
                <el-input v-model="cluster.cache.nfs_properties.subpath" size="small" placeholder="Please enter relative path">
                  <el-button slot="append" @click="cluster.cache.nfs_properties.subpath = '$PROJECT/$WORKFLOW/$SERVICE_MODULE'" size="mini">Reset</el-button>
                </el-input>
              </el-form-item>
            </template>
          </section>
          <section>
            <h4>
              Dind Resource Configuration
              <el-link
                style="font-size: 14px; vertical-align: baseline;"
                type="primary"
                :href="`https://docs.koderover.com/zadig/pages/cluster_manage/#dind-Resource Configuration`"
                :underline="false"
                target="_blank"
              >Help</el-link>
            </h4>
            <el-form-item label="Number Of Copies" prop="dind_cfg.replicas">
              <el-input v-model.number="cluster.dind_cfg.replicas" size="small" placeholder="Please enter the number of copies"></el-input>
            </el-form-item>
            <el-form-item label="Resource Constraints(limit)">
              <el-form-item label="CPU(m)" label-width="90px" prop="dind_cfg.resources.limits.cpu">
                <el-input v-model.number="cluster.dind_cfg.resources.limits.cpu" size="small" placeholder="Please Enter CPU"></el-input>
              </el-form-item>
              <el-form-item label="Mem(Mi)" label-width="90px" prop="dind_cfg.resources.limits.memory">
                <el-input v-model.number="cluster.dind_cfg.resources.limits.memory" size="small" placeholder="Please Enter Memory"></el-input>
              </el-form-item>
            </el-form-item>
            <template v-if="isEdit">
              <el-form-item label="Storage Resources">
                <el-radio-group v-model="cluster.dind_cfg.storage.type" @change="changeDindStorageType">
                  <el-radio label="rootfs">Temporary Storage</el-radio>
                  <el-radio label="dynamic" :disabled="cluster.status !== 'normal'">
                    Cluster storage resources
                    <span v-if="cluster.status !== 'normal'" style="color: #e6a23c; font-weight: 400; font-size: 12px;">Cluster storage resources can only be used after the cluster is connected normally</span>
                  </el-radio>
                </el-radio-group>
              </el-form-item>
              <template v-if="cluster.dind_cfg.storage.type === 'dynamic' && cluster.status === 'normal'">
                <el-form-item prop="dind_cfg.storage.storage_class" label="Choose Storage Class">
                  <el-select v-model="cluster.dind_cfg.storage.storage_class" placeholder="Please Choose" style="width: 100%;" size="small">
                    <el-option v-for="(item,index) in allStorageClass" :key="index" :label="item" :value="item"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item prop="dind_cfg.storage.storage_size_in_gib" label="Storage Space Size">
                  <el-input
                    v-model.number="cluster.dind_cfg.storage.storage_size_in_gib"
                    style="width: 100%; vertical-align: baseline;"
                    size="small"
                    placeholder="Please enter storage size"
                  >
                    <template slot="append">GiB</template>
                  </el-input>
                </el-form-item>
              </template>
            </template>
          </section>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogClusterFormVisible = false">Cancel</el-button>
        <el-button :plain="true" size="small" type="success" @click="clusterOperation(isEdit ? 'update' : 'add')">Save</el-button>
      </div>
    </el-dialog>
    <!--Cluster-dialog-->

    <div class="section">
      <el-alert type="info" :closable="false">
        <template>
          Support Alibaba Cloud ACK、Tencent Cloud TKE、HUAWEI CLOUD CCE Wait K8s Access and use of clusters，For details, please refer to
          <el-link
            style="font-size: 14px; vertical-align: baseline;"
            type="primary"
            :href="`https://docs.koderover.com/zadig/pages/cluster_manage/`"
            :underline="false"
            target="_blank"
          >Help Documentation</el-link>
        </template>
      </el-alert>
      <div class="sync-container">
        <el-button size="small" :plain="true" @click="clusterOperation('init')" type="success">New</el-button>
      </div>
      <div class="cluster-list">
        <template>
          <el-table :data="allCluster" style="width: 100%;" :row-class-name="tableRowClassName">
            <el-table-column label="Name">
              <template slot-scope="scope">
                <i v-if="scope.row.local" class="iconfont iconvery-k8s"></i>
                <i v-else :class="getProviderMap(scope.row.provider,'icon')"></i>
                <span v-if="scope.row.local">Local Cluster（local）</span>
                <span v-else>{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column width="120" label="State">
              <template slot-scope="scope">
                <el-tag size="small" effect="dark" :type="statusIndicator[scope.row.status]">{{myTranslate(scope.row.status)}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Production Cluster">
              <template slot-scope="scope">
                <span>{{scope.row.production?'Yes':'No'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="Describe">
              <template slot-scope="scope">
                <span>{{scope.row.description}}</span>
              </template>
            </el-table-column>
            <el-table-column label="Last Connection Time">
              <template slot-scope="{ row }">
                <span>{{$utils.convertTimestamp(row.last_connection_time)}}</span>
                <el-tooltip v-if="row.update_hubagent_error_msg" effect="dark" content="The last component update failed，Click「Update Components」Button To Update Again" placement="top">
                  <i class="el-icon-warning-outline" style="color: red;"></i>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="Founder">
              <template slot-scope="scope">
                <span>{{scope.row.createdBy}}</span>
              </template>
            </el-table-column>

            <el-table-column width="310" label="Operate">
              <template slot-scope="scope">
                <span v-show="!scope.row.local && scope.row.type !== 'kubeconfig'">
                  <el-button
                    v-if="scope.row.status==='pending'||scope.row.status==='abnormal'"
                    @click="clusterOperation('access',scope.row)"
                    size="mini"
                  >Access</el-button>
                  <el-button v-if="scope.row.status==='normal'" @click="clusterOperation('disconnect',scope.row)" size="mini">Disconnect</el-button>
                  <el-button v-if="scope.row.status==='disconnected'" @click="clusterOperation('recover',scope.row)" size="mini">Recover</el-button>
                </span>
                <el-button @click="clusterOperation('edit',scope.row)" type="primary" size="mini" plain>Edit</el-button>
                <el-button v-show="!scope.row.local" @click="clusterOperation('delete',scope.row)" size="mini" type="danger" plain>Delete</el-button>
                <el-tooltip effect="dark" content="Renew Zadig Relevant components of the system management cluster" placement="top">
                  <el-button v-if="!scope.row.local" :disabled="scope.row.type === 'agent' && scope.row.status !== 'normal'" @click="updateAgent(scope.row)" size="mini" type="primary" plain>Update Components</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Resize from '@/components/common/resize'
import Codemirror from '@/components/projects/common/codemirror.vue'
import {
  getClusterListAPI,
  createClusterAPI,
  updateClusterAPI,
  deleteClusterAPI,
  recoverClusterAPI,
  disconnectClusterAPI,
  getClusterNodeInfo,
  getClusterStorageClassAPI,
  getClusterPvcAPI,
  getStorageListAPI,
  upgradeHubAgentAPI
} from '@api'
import { wordTranslate } from '@utils/wordTranslate'
import bus from '@utils/eventBus'
import { cloneDeep, omit } from 'lodash'
const validateClusterName = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter a cluster name'))
  } else {
    if (!/^[a-z0-9-]+$/.test(value)) {
      callback(new Error('The name only supports lowercase letters and numbers，Special characters only support underscores'))
    } else {
      callback()
    }
  }
}

const clusterInfo = {
  type: 'agent',
  name: '',
  provider: null,
  production: false,
  description: '',
  config: '',
  cache: {
    medium_type: 'object',
    object_properties: {
      id: ''
    },
    nfs_properties: {
      provision_type: 'dynamic',
      storage_class: '',
      storage_size_in_gib: 0,
      pvc: '',
      subpath: '$PROJECT/$WORKFLOW/$SERVICE_MODULE'
    }
  },
  advanced_config: {
    project_names: [],
    strategy: 'normal',
    node_labels: []
  },
  dind_cfg: {
    replicas: 1,
    resources: {
      limits: {
        cpu: 4000,
        memory: 8192
      }
    },
    storage: {
      type: 'rootfs',
      storage_class: '',
      storage_size_in_gib: 10
    }
  }
}
export default {
  data () {
    return {
      statusIndicator: {
        normal: 'success',
        abnormal: 'danger',
        pending: 'info',
        disconnected: 'warning'
      },
      allCluster: [],
      allStorage: [],
      externalStorage: [],
      allFileStorageClass: [],
      allStorageClass: [],
      allPvc: [],
      deployType: 'Deployment',
      cluster: cloneDeep(clusterInfo),
      providerMap: {
        0: {
          icon: 'iconfont logo iconqita',
          name: 'Other'
        },

        1: {
          icon: 'iconfont logo iconaliyun ',
          name: 'Ali Cloud'
        },
        2: {
          icon: 'iconfont logo icontengxunyun',
          name: 'Tencent Cloud'
        },
        3: {
          icon: 'iconfont logo iconhuawei',
          name: 'HUAWEI CLOUD'
        }
      },
      accessCluster: {
        yaml: 'init',
        name: 'test'
      },
      dialogClusterFormVisible: false,
      dialogClusterAccessVisible: false,
      loading: false,
      rules: {
        name: [
          {
            type: 'string',
            required: true,
            validator: validateClusterName,
            trigger: 'change'
          }
        ],
        provider: [
          { required: true, message: 'Please Select A Provider', trigger: ['blur', 'change'] }
        ],
        production: [
          {
            type: 'boolean',
            required: true,
            message: 'Please select whether it is a production cluster'
          }
        ],
        config: {
          type: 'string',
          required: true,
          message: 'Please enter the target cluster KubeConfig',
          trigger: 'change'
        },
        'advanced_config.node_labels': {
          required: false,
          message: 'Please Select A Label',
          type: 'array'
        },
        'advanced_config.project_names': {
          required: false,
          message: 'Please Select An Item',
          type: 'array'
        },
        'cache.object_properties.id': {
          required: true,
          message: 'Please select Object Storage',
          type: 'string'
        },
        'cache.nfs_properties.provision_type': {
          required: true,
          message: 'Please select a storage resource',
          type: 'string'
        },
        'cache.nfs_properties.storage_class': {
          required: true,
          message: 'Please Choose Storage Class',
          type: 'string'
        },
        'cache.nfs_properties.storage_size_in_gib': {
          required: true,
          message: 'Please enter storage size',
          type: 'number'
        },
        'cache.nfs_properties.pvc': {
          required: true,
          message: 'Please Choose PVC',
          type: 'string'
        },
        'cache.nfs_properties.subpath': {
          required: false,
          type: 'string',
          validator: (rule, value, callback) => {
            if (value.charAt(0) === '/') {
              callback(new Error('Please fill in relative path，Cannot Be / Beginning'))
            } else {
              callback()
            }
          }
        },
        'dind_cfg.replicas': {
          required: true,
          message: 'Please enter the number of copies',
          type: 'number'
        },
        'dind_cfg.resources.limits.cpu': {
          required: true,
          message: 'Please Enter CPU',
          type: 'number'
        },
        'dind_cfg.resources.limits.memory': {
          required: true,
          message: 'Please Enter Memory',
          type: 'number'
        },
        'dind_cfg.storage.storage_class': {
          required: true,
          message: 'Please Choose Storage Class',
          type: 'string'
        },
        'dind_cfg.storage.storage_size_in_gib': {
          required: true,
          message: 'Please enter storage size',
          type: 'number'
        }
      },
      clusterNodes: {
        labels: [],
        data: [] // {labels, ready, ip}
      },
      expandAdvanced: false,
      hasNotified: false
    }
  },
  computed: {
    isEdit () {
      return !!this.cluster.id
    },
    isConfigurable () {
      return this.cluster.id && this.cluster.status === 'normal'
    },
    matchedHost () {
      const labels = this.cluster.advanced_config.node_labels
      return this.clusterNodes.data.filter(data => {
        return labels.filter(label => {
          return data.labels.includes(label)
        }).length
      })
    },
    projectNames () {
      return this.$store.getters.projectList.map(project => project.name)
    }
  },
  watch: {
    dialogClusterFormVisible (nVal, oldV) {
      if (!nVal) {
        this.expandAdvanced = false
        this.clearValidate()
        this.clusterNodes = {
          labels: [],
          data: []
        }
      } else if (!this.isEdit) {
        this.cluster.advanced_config.project_names = cloneDeep(
          this.projectNames
        )
      }
    }
  },
  methods: {
    async getStorage () {
      const key = this.$utils.rsaEncrypt()
      await getStorageListAPI(key).then(res => {
        this.allStorage = res
        this.externalStorage = res.filter(
          storage => !storage.endpoint.startsWith('zadig-minio.')
        )
      })
    },
    getClusterNode (clusterId) {
      getClusterNodeInfo(clusterId).then(res => {
        this.clusterNodes = res
      })
    },
    tableRowClassName ({ row, rowIndex }) {
      if (row.local) {
        return 'local-row'
      }
      return ''
    },
    getProviderMap (name, type) {
      if (name && type) {
        return this.providerMap[name][type]
      } else {
        return this.providerMap[0].icon
      }
    },
    getYamlUrl () {
      return `kubectl apply -f "${this.$utils.getOrigin()}/api/aslan/cluster/agent/${
        this.accessCluster.id
      }/agent.yaml${this.deployType === 'Deployment' ? '?type=deploy' : ''}"`
    },
    async clusterOperation (operate, currentCluster) {
      if (operate === 'init') {
        await this.getStorage()
        if (this.allStorage.length > 0) {
          const defaultStorage = this.allStorage.find(
            storage => storage.is_default
          )
          this.cluster.cache.object_properties.id = defaultStorage.id
        }
        this.dialogClusterFormVisible = true
      } else if (operate === 'add') {
        this.$refs.cluster.validate(valid => {
          if (valid) {
            const payload = cloneDeep(omit(this.cluster, 'cache'))
            this.dialogClusterFormVisible = false
            this.addCluster(payload)
          } else {
            return false
          }
        })
      } else if (operate === 'access') {
        this.accessCluster = cloneDeep(currentCluster)
        this.dialogClusterAccessVisible = true
      } else if (operate === 'disconnect') {
        this.$confirm(`Sure you want to disconnect ${currentCluster.name} Connection?`, 'Confirm', {
          confirmButtonText: 'Sure',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(({ value }) => {
          this.disconnectCluster(currentCluster.id)
        })
      } else if (operate === 'recover') {
        this.recoverCluster(currentCluster.id)
      } else if (operate === 'edit') {
        // set default value when edit subpath
        if (currentCluster.cache.medium_type === '') {
          currentCluster.cache.nfs_properties.subpath = '$PROJECT/$WORKFLOW/$SERVICE_MODULE'
        }
        const namesapce = currentCluster.local ? 'unknown' : 'koderover-agent'
        this.cluster = cloneDeep(currentCluster)
        if (this.isConfigurable) {
          this.getClusterNode(currentCluster.id)
        }
        if (this.cluster.cache.medium_type === 'object') {
          await this.getStorage()
        } else if (this.cluster.cache.medium_type === 'nfs') {
          this.allFileStorageClass = await getClusterStorageClassAPI(
            currentCluster.id
          )
          this.allPvc = await getClusterPvcAPI(currentCluster.id, namesapce)
        }
        if (!this.cluster.dind_cfg.storage) {
          this.$set(this.cluster.dind_cfg, 'storage', cloneDeep(clusterInfo.dind_cfg.storage))
        } else if (this.cluster.dind_cfg.storage.type === 'dynamic' && this.cluster.status === 'normal') {
          this.allStorageClass = await getClusterStorageClassAPI(currentCluster.id, 'all')
        }
        this.dialogClusterFormVisible = true
        this.hasNotified = false
      } else if (operate === 'update') {
        this.$refs.cluster.validate(valid => {
          if (valid) {
            const id = this.cluster.id
            const payload = cloneDeep(this.cluster)
            this.dialogClusterFormVisible = false
            this.updateCluster(id, payload)
          } else {
            return false
          }
        })
      } else if (operate === 'delete') {
        const id = currentCluster.id
        this.$confirm(`Sure You Want To Delete ${currentCluster.name} ?`, 'Confirm', {
          confirmButtonText: 'Sure',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(({ value }) => {
          deleteClusterAPI(id).then(res => {
            this.getCluster()
            this.$message({
              message: 'Delete cluster successfully',
              type: 'success'
            })
          })
        })
      }
    },
    async changeDindStorageType (type) {
      if (type === 'dynamic') {
        this.allStorageClass = await getClusterStorageClassAPI(this.cluster.id, 'all')
      }
    },
    async changeMediumType (type) {
      if (!this.hasNotified) {
        this.$message({
          message: 'After Modification，The previous cache will no longer take effect',
          type: 'info'
        })
      }
      this.hasNotified = true
      const namesapce = this.cluster.local ? 'unknown' : 'koderover-agent'
      const id = this.cluster.id
      if (type === 'object') {
        await this.getStorage()
      } else if (type === 'nfs') {
        this.allPvc = await getClusterPvcAPI(id, namesapce)
        this.allFileStorageClass = await getClusterStorageClassAPI(id)
      }
    },
    addCluster (payload) {
      createClusterAPI(payload).then(res => {
        this.getCluster()
        this.accessCluster = res
        if (payload.type === 'agent') {
          this.dialogClusterAccessVisible = true
        }
        this.$message({
          type: 'success',
          message: 'Added Successfully'
        })
      })
    },
    disconnectCluster (id) {
      disconnectClusterAPI(id).then(res => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: 'Disconnect the cluster successfully'
        })
      })
    },
    recoverCluster (id) {
      recoverClusterAPI(id).then(res => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: 'The cluster connection was restored successfully'
        })
      })
    },
    updateCluster (id, payload) {
      updateClusterAPI(id, payload).then(res => {
        this.getCluster()
        this.$message({
          type: 'success',
          message: 'Update Completed'
        })
      })
    },
    getCluster () {
      this.loading = true
      getClusterListAPI().then(res => {
        this.loading = false
        const localId = res.findIndex(re => re.local)
        if (localId !== -1) {
          const local = res.splice(localId, 1)
          res.unshift(local[0])
        } else {
          this.$message.error(`Local Cluster Not Found！`)
        }
        this.allCluster = res.map(re => {
          if (!re.advanced_config.node_labels) {
            re.advanced_config.node_labels = []
          }
          return re
        })
      })
    },
    copyCommandSuccess (event) {
      this.$message({
        message: 'Command successfully copied to clipboard',
        type: 'success'
      })
    },
    copyCommandError (event) {
      this.$message({
        message: 'Command Copy Failed',
        type: 'error'
      })
    },
    myTranslate (word) {
      return wordTranslate(word, 'setting', 'cluster')
    },
    clearValidate () {
      this.cluster = cloneDeep(clusterInfo)
      this.$nextTick(() => {
        this.$refs.cluster.clearValidate()
      })
    },
    updateAgent (row) {
      this.$confirm('Are you sure you want to update components?', 'Renew', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        upgradeHubAgentAPI(row.id).then(res => {
          this.$message({
            message: 'Update components succeeded',
            type: 'success'
          })
          this.getCluster()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Update Cancelled'
        })
      })
    }
  },
  created () {
    this.getCluster()
    bus.$emit(`set-topbar-title`, { title: 'Cluster Management', breadcrumb: [] })
  },
  components: {
    Resize,
    Codemirror
  }
}
</script>

<style lang="less">
@import url('~@assets/css/common/scroll-bar.less');

.setting-cluster-container {
  position: relative;
  flex: 1;
  height: 100%;
  padding: 15px 30px;
  overflow: auto;
  font-size: 13px;

  .section {
    margin-bottom: 56px;

    .sync-container {
      padding-top: 15px;
      padding-bottom: 15px;
      overflow: hidden;

      .el-button--success.is-plain {
        color: @themeColor;
        background: #fff;
        border-color: @themeColor;
      }

      .el-button--success.is-plain:hover {
        color: @themeColor;
        background: #fff;
        border-color: @themeColor;
      }
    }

    .cluster-list {
      padding-bottom: 30px;

      .logo {
        font-size: 20px;
      }

      .local-row {
        background: #fafafa;
      }
    }
  }

  .dialog-style {
    .el-dialog__body {
      padding: 0 20px;
    }

    .el-form-item {
      margin-bottom: 10px;
    }

    .tip-item {
      display: block;
      font-size: 14px;
      line-height: 17px;

      &.code {
        display: block;
        margin: 2px 0;
        padding: 0 2px;
        color: #ecf0f1;
        font-size: 13px;
        font-family: monospace;
        word-wrap: break-word;
        word-break: break-all;
        background-color: #3d3d3d;
        background-color: #334851;
        border: 1px solid #0a141a;
        border-radius: 4px;
      }
    }

    .highlighter-rouge {
      .code-line {
        display: block;
        margin: 0;
        padding: 8px 0;
        color: #ecf0f1;
        font-size: 14px;
        font-family: monospace;
        word-wrap: break-word;
        word-break: break-all;
        background-color: #3d3d3d;
        background-color: #334851;
        border: 1px solid #0a141a;
        border-radius: 4px;
      }

      .copy {
        font-size: 16px;
        cursor: pointer;

        &:hover {
          color: @themeColor;
        }
      }
    }

    .command {
      color: #fff;
      font-size: 13px;
      line-height: 20px;
      background: #303133;
    }

    .project-scoped {
      position: relative;

      .el-button {
        position: absolute;
        right: 1px;
        bottom: 6px;
        z-index: 1;
      }
    }

    .storage-medium {
      .el-radio {
        padding: 5px 0;
      }
    }
  }

  .list-host {
    max-height: 50px;
    padding: 5px;
    overflow: auto;
    color: #909399;
    font-size: 12px;

    .blockScrollBar();

    div {
      line-height: 1.2;
    }
  }
}
</style>
