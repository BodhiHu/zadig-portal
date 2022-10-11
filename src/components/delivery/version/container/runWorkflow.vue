<template>
  <el-form class="run-workflow"
           label-width="90px">
    <el-form-item prop="productName"
                  label="Surroundings">
      <el-select v-model="runner.envAndNamespace"
                 size="small"
                 :disabled="specificEnv"
                 class="full-width">
        <el-option v-for="pro of matchedProducts"
                   :key="`${pro.projectName}/${pro.name}`"
                   :label="`${pro.projectName}/${pro.name}${pro.is_prod?'（Production）':''}`"
                   :value="`${pro.projectName}/${pro.name}`">
          <span>{{`${pro.projectName} / ${pro.name}`}}
            <el-tag v-if="pro.is_prod"
                    type="danger"
                    size="mini"
                    effect="light">
              Production
            </el-tag>
          </span>
        </el-option>
        <el-option v-if="matchedProducts.length===0"
                   label=""
                   value="">
          <router-link style="color: #909399;"
                       :to="`/v1/projects/detail/${projectName}/envs/create`">
            {{`(The environment does not exist or does not have permissions，Click to create an environment)`}}
          </router-link>
        </el-option>
      </el-select>
      <el-tooltip v-if="specificEnv"
                  effect="dark"
                  content="The workflow has a specified environment to run，Workflow can be modified by->Basic information to unbind the specified environment"
                  placement="top">
        <span><i style="color: #909399;"
             class="el-icon-question"></i></span>
      </el-tooltip>
    </el-form-item>
    <el-table v-if="imageConfigs.length > 0"
              :data="imageConfigs"
              empty-text="None"
              class="service-deploy-table">
      <el-table-column prop="serviceName"
                       label="Service Component(Service Name)"
                       width="150px">
        <template slot-scope="scope">{{$utils.showServiceName(scope.row.containerName)}}</template>
      </el-table-column>
      <el-table-column label="Image Name">
        <template slot-scope="scope">
          <div class="workflow-build-rows">
            <el-row class="build-row">
              <template>
                {{scope.row.registryName}}
              </template>
            </el-row>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="start-task">
      <el-button @click="submit"
                 :loading="startTaskLoading"
                 type="primary"
                 size="small">
        {{ startTaskLoading?'Starting':'Start Task' }}
      </el-button>

    </div>

  </el-form>
</template>

<script>
import { listProductAPI, runWorkflowAPI } from '@api'

export default {
  data () {
    return {
      matchedProducts: [],
      specificEnv: false,
      startTaskLoading: false,
      runner: {
        envAndNamespace: '',
        workflow_name: '',
        product_tmpl_name: '',
        namespace: '',
        artifact_args: [],
        registry_id: ''
      }
    }
  },
  computed: {
    artifactDeployEnabled () {
      return this.workflowMeta.artifact_stage && this.workflowMeta.artifact_stage.enabled
    }
  },
  methods: {
    async filterProducts (products) {
      const prodProducts = products.filter(element => {
        if (element.projectName === this.projectName) {
          if (element.production) {
            return element
          }
        }
        return false
      })
      const testProducts = products.filter(element => {
        if (element.projectName === this.projectName) {
          if (!element.production) {
            return element
          }
        }
        return false
      })
      this.matchedProducts = prodProducts.concat(testProducts)
    },
    submit () {
      const projectName = this.projectName
      const artifactDeployEnabled = true
      if (!this.checkInput()) {
        return
      }
      this.startTaskLoading = true
      this.runner.product_tmpl_name = this.runner.envAndNamespace.trim().split('/')[0]
      this.runner.namespace = this.runner.envAndNamespace.trim().split('/')[1]
      this.runner.artifact_args = this.imageConfigs.map(element => {
        return {
          name: element.serviceName.split('/')[1],
          service_name: element.serviceName.split('/')[0],
          image: element.registryName.split('/')[2],
          deploy: [{
            env: `${element.serviceName}`,
            type: 'k8s',
            product_name: this.runner.product_tmpl_name
          }]
        }
      })
      this.runner.registry_id = this.imageConfigs[0].registryId
      const clone = this.$utils.cloneObj(this.runner)
      runWorkflowAPI(projectName, clone, artifactDeployEnabled).then(res => {
        const taskId = res.task_id
        const pipelineName = res.pipeline_name
        this.$message.success('Created Successfully')
        this.$emit('success')
        this.$router.push(`/v1/projects/detail/${projectName}/pipelines/multi/${pipelineName}/${taskId}?status=running`)
      }).catch(error => {
        console.log(error)
        if (error.response && error.response.data.code === 6168) {
          const projectName = error.response.data.extra.productName
          const envName = error.response.data.extra.envName
          const serviceName = error.response.data.extra.serviceName
          this.$message({
            message: `Detected ${projectName} Middle ${envName} Environment ${serviceName} Service Not Started <br> Please check before running the workflow`,
            type: 'warning',
            dangerouslyUseHTMLString: true,
            duration: 5000
          })
          this.$router.push(`/v1/projects/detail/${projectName}/envs/detail/${serviceName}?envName=${envName}&projectName=${projectName}`)
        }
      }).finally(() => {
        this.startTaskLoading = false
      })
    },
    checkInput () {
      if (!this.runner.envAndNamespace) {
        this.$message.error('Please select an environment')
        return false
      } else {
        return true
      }
    }
  },
  created () {
    const projectName = this.projectName
    this.runner.workflow_name = this.workflowName
    listProductAPI(projectName).then(res => {
      this.filterProducts(res)
    })
  },
  props: {
    workflowName: {
      type: String,
      required: true
    },
    projectName: {
      type: String,
      required: true
    },
    imageConfigs: {
      type: Array,
      required: true
    }
  },
  components: {
  }
}
</script>

<style lang="less">
.run-workflow {
  .service-deploy-table,
  .test-table {
    width: auto;
    margin-bottom: 15px;
    padding: 0 5px;
  }

  .advanced-setting {
    margin-bottom: 10px;
    padding: 0 0;
  }

  .el-input,
  .el-select {
    &.full-width {
      width: 40%;
    }
  }

  .start-task {
    margin-bottom: 10px;
    margin-left: 10px;
  }
}
</style>
