<template>
  <div class="common-basic-info">
    <el-form ref="basicForm" :model="commonInfoUse" :rules="rules" label-width="120px" label-position="top">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="Workflow Name" prop="name">
            <el-input v-model="commonInfoUse.name" placeholder="Please enter a workflow name" size="small" :disabled="!!$route.query.id"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Select Item" prop="project_name">
            <el-select
              v-model="commonInfoUse.project_name"
              placeholder="Please Select An Item"
              size="small"
              clearable
              :disabled="!!$route.query.projectName"
            >
              <el-option v-for="project in projectList" :key="project.value" :label="project.value" :value="project.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Describe">
        <el-input type="textarea" v-model="commonInfoUse.description" rows="4" size="small"></el-input>
      </el-form-item>
      <el-form-item label="Variable Settings">
        <el-table v-if="commonInfoUse.parameters" :data="commonInfoUse.parameters" style="width: 100%;">
          <el-table-column label="Variable/Variable Group">
            <template slot-scope="{row}">
              <el-input v-model="row.key" placeholder="Please Enter A Variable" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Type">
            <template slot-scope="{row, $index}">
              <el-select v-model="row.type" placeholder="Please Choose The Type" size="small" style="width: 100px; margin-right: 10px;">
                <el-option label="String" value="string"></el-option>
                <el-option label="Enumerate" value="choice"></el-option>
                <el-option label="Dynamic" value="external"></el-option>
              </el-select>
              <i v-show="row.type !== 'string'" class="el-icon-edit" style="cursor: pointer;" @click="updateParams(row, $index)"></i>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="Defaults">
            <template slot-scope="{row}">
              <el-input v-if="row.type==='string'" v-model="row.default_value" placeholder="Please enter a default value" size="small"></el-input>
              <el-select v-else-if="row.type==='choice'" v-model="row.default_value" placeholder="Please Select Default" size="small">
                <el-option v-for="option in row.choice_option" :key="option" :label="option" :value="option"></el-option>
              </el-select>
              <span v-else>None</span>
            </template>
          </el-table-column>
          <el-table-column label="Operate" width="80px" align="center">
            <template slot-scope="{ $index }">
              <i class="el-icon-delete" style="color: red;" @click="handleParameters('delete', $index)"></i>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="text" icon="el-icon-plus" @click="handleParameters('add')">Add Variable</el-button>
      </el-form-item>
    </el-form>
    <el-dialog :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false" :show-close="false">
      <div slot="title">{{title}}</div>

      <BasicDialog :param="paramData" ref="paramRef" :value="dialogVisible"/>

      <div slot="footer">
        <el-button @click="dialogVisible = false" size="small">Cancel</el-button>
        <el-button type="primary" @click="summit" size="small">Sure</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BasicDialog from './basicDialog.vue'
import { mapState } from 'vuex'
import { cloneDeep } from 'lodash'
import { templatesAPI } from '@api'
export default {
  data () {
    this.rules = {
      name: {
        required: true,
        message: 'Please enter a workflow name',
        trigger: ['blur', 'change']
      },
      project_name: {
        required: true,
        message: 'Please select a project name',
        trigger: ['blur', 'change']
      }
    }
    return {
      projectList: [],
      commonInfoUse: null,
      paramData: null,
      dialogVisible: false
    }
  },
  props: {
    validObj: Object
  },
  computed: {
    ...mapState({
      commonInfo: state => state.commonWorkflow.commonInfo
    }),
    title () {
      if (this.paramData) {
        if (this.paramData.type === 'choice') {
          return 'Enumerate'
        } else if (this.paramData.type === 'async') {
          return 'Dynamic Variable'
        }
      }
      return ''
    }
  },
  watch: {
    commonInfo: {
      handler (newV) {
        const { name, project_name, description, parameters } = cloneDeep(newV)
        this.commonInfoUse = { name, project_name, description, parameters }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    updateParams (row, index) {
      this.dialogVisible = true
      this.paramData = row
      this.paramIndex = index
    },
    summit () {
      const res = this.$refs.paramRef.getParamData()
      res.choice_option = res.choice_option.split(',')
      this.commonInfoUse.parameters.splice(this.paramIndex, 1, res)
      this.dialogVisible = false
    },
    validate () {
      return this.$refs.basicForm.validate()
    },
    handleParameters (type, index) {
      if (type === 'delete') {
        this.commonInfoUse.parameters.splice(index, 1)
      } else if (type === 'add') {
        this.commonInfoUse.parameters.push({
          key: '',
          type: 'string',
          default_value: '',
          is_credential: false
        })
      }
    },
    getProjectlist () {
      templatesAPI().then(res => {
        this.projectList = res
      })
    },
    updateCommonInfo () {
      this.$store.commit('UPDATE_COMMON_INFO', this.commonInfoUse)
    }
  },
  components: {
    BasicDialog
  },
  created () {
    const projectName = this.$route.query.projectName
    if (!projectName) {
      this.getProjectlist()
    } else {
      this.commonInfoUse.project_name = projectName
    }
  },
  activated () {
    this.validObj.addValidate({
      name: 'Basic Information',
      valid: this.validate
    })
  },
  deactivated () {
    this.updateCommonInfo()
  }
}
</script>

<style lang="less" scoped>
.common-basic-info {
  /deep/.el-form {
    &.el-form--label-top {
      .el-form-item__label {
        padding: 0;
      }
    }

    .el-form-item {
      margin-bottom: 10px;
    }
  }

  .el-input,
  .el-select {
    width: 80%;
  }

  .el-select > .el-input {
    width: 100%;
  }
}
</style>
