<template>
  <div class="import-from-template-container">
    <el-dialog
      :title="currentUpdatedServiceName?'Update Service':'New Service - Create new using template'"
      :close-on-click-modal="false"
      append-to-body
      center
      width="720px"
      label-position="left"
      custom-class="dialog-import-from-template"
      :visible="dialogImportFromYamlVisible"
      @update:visible="$emit('update:dialogImportFromYamlVisible', $event)"
    >
      <el-form :model="importYaml" @submit.native.prevent ref="importYamlForm">
        <el-form-item label="Service Name" prop="serviceName" :rules="{ required: true, message: 'Service name cannot be empty', trigger: ['change','blur'] }">
          <el-input style="width: 400px;" v-model.trim="importYaml.serviceName" size="small" :disabled="currentUpdatedServiceName!==''?true:false" placeholder="Please enter a service name" clearable></el-input>
        </el-form-item>
        <el-form-item label="Choose A Template" prop="id" :rules="{ required: true, message: 'Please Select A Template', trigger: ['change','blur'] }">
          <el-select style="width: 400px;" size="small" v-model="importYaml.id" placeholder="Please Select A Template" @change="getKubernetesTemplate">
            <el-option disabled value="NEWMODULE">
              <router-link to="/v1/template/k8s-yamls" class="module-link">
                <i class="el-icon-circle-plus-outline" style="margin-right: 3px;"></i>
                New Template
              </router-link>
            </el-option>
            <el-option v-for="item in importYaml.yamls" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Variable Configuration">
        <template v-if="importYaml.id && importYaml.variables.length > 0">
        <el-table :data="importYaml.variables" style="width: auto;">
          <el-table-column label="Key">
            <template slot-scope="scope">
              <span>{{ scope.row.key }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Value">
            <template slot-scope="scope">
              <el-input
                size="small"
                v-model="scope.row.value"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
                placeholder="Please Enter Value"
              ></el-input>
            </template>
          </el-table-column>
        </el-table>
      </template>
        </el-form-item>
        <el-form-item prop="auto_sync">
          <span style="margin-right: 16px;">
            <span>Auto Sync</span>
            <el-tooltip  content="After Opening，When applying a template library operation to a service，The service configuration will be automatically synchronized based on the template content。" placement="top">
              <i  class="pointer el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-switch v-model="importYaml.auto_sync" />
        </el-form-item>
        <el-form-item>
          <el-button :disabled="!importYaml.id" style="margin-left: 5px;" type="text" :icon="previewYamlFile?'el-icon-arrow-up':'el-icon-arrow-down'" @click="previewYamlFile = !previewYamlFile">
            {{
            previewYamlFile ? 'Close Preview' : 'Preview'
            }}
          </el-button>
        </el-form-item>
      </el-form>
      <codemirror v-if="previewYamlFile" v-model="renderedYaml" :options="importTemplateEditorOption"></codemirror>
      <div slot="footer" class="dialog-footer">
        <el-button plain native-type="submit" @click="$emit('update:dialogImportFromYamlVisible', false)" size="small">Cancel</el-button>
        <el-button type="primary" native-type="submit" size="small" class="start-create" @click="loadServiceFromKubernetesTemplate">{{currentUpdatedServiceName?'Renew':'New'}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/yaml/yaml.js'
import {
  loadServiceFromKubernetesTemplateAPI,
  reloadServiceFromKubernetesTemplateAPI,
  getKubernetesTemplatesAPI,
  getKubernetesTemplateDetailAPI
} from '@api'
export default {
  data () {
    return {
      previewYamlFile: false,
      importYaml: {
        serviceName: '',
        id: '',
        yamls: [],
        variables: [],
        content: '',
        auto_sync: false
      },
      importTemplateEditorOption: {
        tabSize: 2,
        readOnly: 'nocursor',
        theme: 'neo',
        mode: 'text/yaml',
        lineNumbers: false,
        line: true,
        showGutter: false,
        displayIndentGuides: false,
        showPrintMargin: false,
        collapseIdentical: true
      }
    }
  },
  props: {
    projectName: {
      type: String,
      required: true
    },
    dialogImportFromYamlVisible: {
      type: Boolean,
      default: false
    },
    currentUpdatedServiceName: {
      type: String,
      required: false
    },
    currentUpdatedServiceTemplateId: {
      type: String,
      required: false
    }
  },
  methods: {
    async getKubernetesTemplate (id) {
      if (id) {
        this.previewYamlFile = false
        const projectName = this.projectName
        const res = await getKubernetesTemplateDetailAPI(id, projectName).catch(err => {
          console.log(err)
        })
        if (res) {
          this.importYaml.content = res.content
          this.importYaml.variables = res.variable
        }
      }
    },
    async openImportYamlDialog () {
      this.importYaml.serviceName = ''
      this.importYaml.id = ''
      this.importYaml.auto_sync = false
      const res = await getKubernetesTemplatesAPI(this.projectName)
      if (res) {
        this.importYaml.yamls = res.yaml_template
      }
    },
    async loadServiceFromKubernetesTemplate () {
      const serviceName = this.currentUpdatedServiceName ? this.currentUpdatedServiceName : this.importYaml.serviceName
      const projectName = this.projectName
      const templateId = this.importYaml.id
      const variables = this.importYaml.variables
      const autoSync = this.importYaml.auto_sync
      const payload = {
        service_name: serviceName,
        project_name: projectName,
        template_id: templateId,
        variables: variables,
        auto_sync: autoSync
      }
      const valid = await this.$refs.importYamlForm.validate().catch((err) => { return err })
      if (valid) {
        const res = this.currentUpdatedServiceName
          ? await reloadServiceFromKubernetesTemplateAPI(payload, projectName).catch(
            err => {
              console.log(err)
            }
          )
          : await loadServiceFromKubernetesTemplateAPI(payload, projectName).catch(
            err => {
              console.log(err)
            }
          )

        if (res) {
          this.$refs.importYamlForm.resetFields()
          this.importYaml.variables = []
          this.previewYamlFile = false
          this.$emit('update:dialogImportFromYamlVisible', false)
          this.$message({
            type: 'success',
            message: `Service Template ${payload.service_name} ${this.currentUpdatedServiceName ? 'Renew' : 'Import'}Success`
          })
          this.$emit('importYamlSuccess', serviceName)
        }
      }
    }
  },
  computed: {
    renderedYaml () {
      const keywords = this.importYaml.variables.map(item => {
        return { key: `{{.${item.key}}}`, value: item.value }
      })
      const variables = [
        {
          key: '$T-Project$',
          value: this.projectName
        },
        {
          key: '$T-Service$',
          value: this.importYaml.serviceName
        }
      ].concat(keywords)
      let originYaml = this.importYaml.content
      variables.forEach(item => {
        if (item.value) {
          originYaml = originYaml.replaceAll(item.key, item.value)
        }
      })
      return originYaml
    },
    serviceInfo () {
      return this.$store.state.k8sService.k8sServiceInfo
    }
  },
  watch: {
    currentUpdatedServiceName (val) {
      if (val) {
        this.importYaml.serviceName = val
      } else {
        this.importYaml.serviceName = ''
      }
    },
    currentUpdatedServiceTemplateId (val) {
      if (val) {
        this.importYaml.id = val
      } else {
        this.importYaml.id = ''
      }
    },
    serviceInfo: {
      handler (val) {
        // update from k8s service
        this.importYaml.auto_sync = val.service.auto_sync
        this.importYaml.variables = val.template_variable
      },
      deep: true
    }
  },
  mounted () {
    this.openImportYamlDialog()
  },
  components: {
    codemirror
  }
}
</script>
<style lang="less">
.dialog-source,
.dialog-import-from-template {
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
    padding: 40px 106px 0;

    .preload-container {
      .service-name,
      .contains {
        color: #909399;
        font-size: 13px;
      }

      .service-name {
        display: inline-block;
        margin-right: 4px;
        color: #303133;
      }
    }
  }

  .preload-error {
    color: #ff1949;
    font-size: 12px;
  }

  .el-table th.el-table__cell {
    padding: 0;
    color: #888;
    background: #fff;
  }
}

.module-link {
  display: inline-block;
  width: 100%;
  height: calc(~'100% - 1px');
  color: #606266;
  border-bottom: 1px solid #d2d7dc;
}
</style>
