<template>
  <section>
    <div class="primary-title">{{ isTest ? 'Test Execution' : 'Construct' }}Surroundings</div>
    <el-form-item
      label="Operating System"
      :prop="`${secondaryProp}.image_id`"
      class="secondary-label"
      :rules="{ required: true, message: 'Please select an operating system', trigger: ['change', 'blur'] }"
    >
      <el-select size="small" v-model="currentEnv.image_id" placeholder="Please Choose" @change="changeImage('id', $event)">
        <el-option disabled value="NEWCUSTOM">
          <router-link to="/v1/system/imgs" class="env-link">
            <i class="el-icon-circle-plus-outline" style="margin-right: 3px;"></i>
            {{ isTest ? 'Test execution environment' : 'Build Environment' }}
          </router-link>
        </el-option>
        <el-option v-for="(sys,index) in systems" :key="index" :label="sys.label" :value="sys.id">
          <span>
            {{sys.label}}
            <el-tag v-if="sys.image_from==='custom'" type="info" size="mini" effect="light">Customize</el-tag>
          </span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="currentEnv.installs.length===0" label="Dependent Packages" class="secondary-label">
      <el-button @click="addFirstApp()" type="primary" size="mini" plain>New</el-button>
    </el-form-item>
    <el-form-item
      v-else
      v-for="(app,appIndex) in currentEnv.installs"
      :key="appIndex"
      :prop="`${secondaryProp}.installs.${appIndex}.name`"
      :rules="{required: false, message: 'Can Not Be Empty', trigger: 'blur'}"
      :label="appIndex === 0 ? `Dependent Packages` : ''"
      class="secondary-label"
    >
      <el-select v-model="currentEnv.installs[appIndex]" placeholder="Please Choose" size="small" value-key="id" filterable>
        <el-option
          v-for="(app, index) in currentEnv.installs[appIndex].name ? [currentEnv.installs[appIndex]].concat(remainingApps) : remainingApps"
          :key="index"
          :label="`${app.name} ${app.version} `"
          :value="{'name':app.name,'version':app.version,'id':app.id}"
        ></el-option>
      </el-select>
      <span :class="mini?'':'app-operation'">
        <el-button v-if="currentEnv.installs.length >= 1" @click="deleteApp(appIndex)" type="danger" size="mini" plain>Delete</el-button>
        <el-button v-if="appIndex===currentEnv.installs.length-1" @click="addApp(appIndex)" type="primary" size="mini" plain>New</el-button>
      </span>
    </el-form-item>
  </section>
</template>

<script>
import { getImgListAPI, getAllAppsAPI } from '@api'
import { differenceBy } from 'lodash'
export default {
  props: {
    buildConfig: Object,
    isCreate: Boolean,
    mini: {
      default: false,
      type: Boolean
    },
    secondaryProp: {
      default: 'pre_build',
      type: String
    },
    isTest: {
      default: false,
      type: Boolean
    }
  },
  data () {
    return {
      systems: [],
      allApps: []
    }
  },
  computed: {
    currentEnv () {
      return this.buildConfig[this.secondaryProp]
    },
    remainingApps () {
      return differenceBy(this.allApps, this.currentEnv.installs, 'id')
    }
  },
  methods: {
    addFirstApp () {
      this.currentEnv.installs.push({
        name: '',
        version: '',
        id: ''
      })
    },
    deleteApp (index) {
      this.currentEnv.installs.splice(index, 1)
    },
    addApp () {
      this.currentEnv.installs.push({
        name: '',
        version: '',
        id: ''
      })
    },
    changeImage (key, value) {
      const imageSys = this.systems.find(item => {
        return item[key] === value
      })
      if (imageSys) {
        this.currentEnv.image_id = imageSys.id
        this.currentEnv.image_from = imageSys.image_from
        this.currentEnv.build_os = imageSys.value
      }
    },
    initData () {
      if (this.systems.length === 0) {
        // be used on Dependent Packages
        getAllAppsAPI().then(res => {
          const apps = this.$utils.sortVersion(res, 'name', 'asc')
          this.allApps = apps.map(app => {
            return {
              name: app.name,
              version: app.version,
              id: app.name + app.version
            }
          })
        })
        // be used on Operating System
        getImgListAPI().then(res => {
          this.systems = res
          this.initOperatingSystem()
        })
      } else {
        this.initOperatingSystem()
      }
    },
    initOperatingSystem () {
      if (this.isCreate) {
        this.changeImage('value', 'focal') // default use 20.04
      } else {
        const key = this.currentEnv.image_id
          ? 'id'
          : this.currentEnv.build_os
            ? 'value'
            : ''
        const value = this.currentEnv.image_id || this.currentEnv.build_os
        if (key) {
          this.changeImage(key, value)
        }
      }
    }
  },
  created () {
    this.initData()
  }
}
</script>

<style lang="less" scoped>
.env-link {
  display: inline-block;
  width: 100%;
  height: calc(~'100% - 1px');
  color: #606266;
  border-bottom: 1px solid @borderGray;
}
</style>
