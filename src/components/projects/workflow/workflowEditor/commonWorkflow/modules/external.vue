<template>
  <div class="common-external">
    <el-form ref="externalForm" :model="externalData" :rules="rules" label-width="100px">
      <el-form-item label="URL">
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item prop="url">
              <el-select v-model="externalData.url" placeholder="Choose an external system" size="small" clearable>
                <el-option v-for="external in externalList" :key="external.id" :label="external.server" :value="external.server"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="path">
              <el-input v-model="externalData.path" placeholder="Enter The Access Path" size="small"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <div>
          <el-tag size="small">Headers</el-tag>
          <el-button type="text" @click="addHeader" class="add-header">Add To</el-button>
        </div>
        <el-table :data="externalData.headers" style="width: 100%;">
          <el-table-column label="Header Name">
            <template slot-scope="{row}">
              <el-input v-model="row.key" placeholder="Header Name" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="Header Value">
            <template slot-scope="{row}">
              <el-input v-model="row.value" placeholder="Header Value" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="Operate" width="100px">
            <template slot-scope="{$index}">
              <el-button style="font-size: 20px;" type="text" icon="el-icon-remove-outline" @click="deleteHeader($index)"></el-button>
              <el-button style="font-size: 20px;" type="text" icon="el-icon-circle-plus-outline" @click="addHeader"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="Whether To Call Back">
        <el-switch v-model="externalData.is_callback"></el-switch>
        <div v-show="externalData.is_callback">Please call the interface as specified：{{`${origin}/api/callback`}} Interface</div>
      </el-form-item>
      <el-form-item label="Time Out" v-show="externalData.is_callback">
        <el-input-number v-model="externalData.timeout" :min="1" :max="100" size="small"></el-input-number>Minute
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getExternalSystemsAPI } from '@api'
import { mapState } from 'vuex'
import { cloneDeep } from 'lodash'
const externalInfo = {
  enabled: true,
  type: 'trigger',
  url: '',
  path: '',
  headers: [], // key,value
  is_callback: false,
  timeout: 10
}
export default {
  data () {
    this.rules = {
      url: {
        required: true,
        message: 'Please select an external system',
        trigger: ['blur', 'change']
      },
      path: {
        required: true,
        message: 'Please enter the access path',
        trigger: ['blur', 'change']
      }
    }
    return {
      externalData: cloneDeep(externalInfo),
      externalList: [],
      origin: location.origin
    }
  },
  computed: {
    ...mapState({
      commonInfo: state => state.commonWorkflow.commonInfo
    })
  },
  props: {
    validObj: Object
  },
  methods: {
    validate () {
      return this.$refs.externalForm.validate()
    },
    updateCommonInfo () {
      this.externalData.headers = this.externalData.headers.filter(
        header => header.key
      )
      this.$store.commit('UPDATE_COMMON_INFO', { trigger: cloneDeep(this.externalData) })
    },
    addHeader () {
      this.externalData.headers.push({ key: '', value: '' })
    },
    deleteHeader (index) {
      this.externalData.headers.splice(index, 1)
    }
  },
  created () {
    const key = this.$utils.rsaEncrypt()
    getExternalSystemsAPI(key).then(res => {
      this.externalList = res.external_system
    })
  },
  activated () {
    this.validObj.addValidate({
      name: 'Expand',
      valid: this.validate
    })
    this.externalData = {
      ...cloneDeep(externalInfo),
      ...cloneDeep(this.commonInfo.trigger)
    }
  },

  deactivated () {
    this.updateCommonInfo()
  }
}
</script>

<style lang="less" scoped>
.common-external {
  /deep/.el-input,
  .el-select {
    width: 100%;
  }

  /deep/.el-table {
    .el-table__cell {
      padding: 0;
    }

    .el-table__empty-block {
      min-height: 48px;

      .el-table__empty-text {
        line-height: 48px;
      }
    }
  }

  .add-header {
    margin-left: 5px;
    font-size: 13px;
  }
}
</style>
