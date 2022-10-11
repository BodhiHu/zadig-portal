<template>
  <div>
    <el-dialog title="Version History" :visible.sync="historyVisible" width="70%" class="config-history-dialog">
      <div style="margin-bottom: 16px;">
        <el-button @click="showDiff" type="primary" plain size="mini" icon="el-icon-view">Compare selected versions</el-button>
      </div>

      <el-table v-loading="historyLoading" :data="histories" @selection-change="selectionChanged" ref="configHistoryTable">
        <el-table-column type="selection"></el-table-column>
        <el-table-column prop="version" label="Version"></el-table-column>
        <el-table-column prop="create_time" label="Creation Time">
          <template slot-scope="scope">
            <span>{{moment(scope.row.create_time*1000).format('YYYY-MM-DD HH:mm')}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="update_user_name" label="Last Review"></el-table-column>
        <el-table-column label="Operate" width>
          <template slot-scope="scope">
            <el-button v-if="scope.$index!==0" @click="rollbackTo(scope.row)" icon="el-icon-refresh-left" size="mini">Rollback</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog :title="diffTitle" :visible.sync="diffVisible" width="60%" class="log-diff-container">
      <div class="diff-content">
        <pre :style="{ width: maxWidth || '100%' }"><!--
       --><div v-for="(section, index) in configDiff" :key="index" :class="{ 'added': section.added, 'removed': section.removed }"><!--
         --><span v-if="section.added" class="code-line-prefix"> + </span><!--
         --><span v-if="section.removed" class="code-line-prefix"> - </span><!--
         --><span id="yaml-content">{{ section.value }}</span><!--
       --></div><!--
     --></pre>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import { getObjectHistoryVersionAPI } from '@api'
const jsdiff = require('diff')

export default {
  data () {
    return {
      moment,
      historyVisible: false,
      histories: [],
      selectedHistories: [],
      diffVisible: false,
      configDiff: [],

      srcConfigName: null,
      historyLoading: false,
      maxWidth: ''
    }
  },
  computed: {
    projectName () {
      return this.$route.params.project_name
    },
    envName () {
      return this.$route.params.env_name
    },
    orderedHistoriesDesc () {
      if (
        Array.isArray(this.selectedHistories) &&
        this.selectedHistories.length > 1
      ) {
        const arr = Array.from(this.selectedHistories)
        if (arr[1].id < arr[0].id) {
          arr.reverse()
        }
        return arr
      }
      return this.selectedHistories
    },
    diffTitle () {
      const candidates = this.selectedHistories
      if (Array.isArray(candidates) && candidates.length > 1) {
        return `${candidates[0].version} Relative To ${candidates[1].version} Of diff`
      }
      return 'Configure diff（Unchecked）'
    }
  },
  methods: {
    showDiff () {
      this.maxWidth = ''
      const candidates = this.selectedHistories
      if (candidates.length !== 2) {
        this.$message({
          message: 'Only two versions can be selected for comparison',
          type: 'warning'
        })
        return
      }

      this.diffVisible = true
      this.configDiff = jsdiff.diffLines(
        this.orderedHistoriesDesc[0].yaml_data
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t'),
        this.orderedHistoriesDesc[1].yaml_data
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
      )
      this.$nextTick(() => {
        const arr = document.querySelectorAll('.log-diff-container #yaml-content')
        let maxWidth = 0
        arr.forEach(ele => {
          maxWidth = Math.max(maxWidth, ele.offsetWidth)
        })
        this.maxWidth = maxWidth + 'px'
      })
    },
    selectionChanged (val) {
      if (val.length > 2) {
        this.$message({
          message: 'Only two versions can be selected for comparison',
          type: 'warning'
        })
        this.$refs.configHistoryTable.toggleRowSelection(val[val.length - 1])
        return false
      }

      this.selectedHistories = val
    },
    rollbackTo (row) {
      this.$emit('actionConfig', {
        actionType: 'edit',
        name: row.name,
        yamlData: row.yaml_data,
        services: row.services || [],
        showImport: false,
        readOnly: true
      })
    },
    async showVersionList (objectName, commonEnvCfgType, services) {
      this.historyVisible = true
      const params = {
        objectName,
        projectName: this.projectName,
        envName: this.envName,
        commonEnvCfgType
      }
      this.historyLoading = true
      const res = await getObjectHistoryVersionAPI(params).catch(err =>
        console.log(err)
      )

      if (res) {
        this.historyLoading = false
        this.histories = res.map((re, index) => {
          return {
            ...re,
            services,
            version: index === 0 ? 'Current Version' : `Version ${index}`
          }
        })
      }
    },
    closeHistoryDialog () {
      this.historyVisible = false
    }
  },
  watch: {
    historyVisible (nVal) {
      if (!nVal) {
        this.histories = []
      }
    }
  }
}
</script>

<style lang="less">
.config-history-dialog {
  .el-table-column--selection.is-leaf > .cell {
    display: none;
  }

  .el-dialog__body {
    padding: 20px;
  }
}

.log-diff-container {
  .diff-content {
    height: 500px;
    overflow-y: auto;

    .added {
      background-color: #b4e2b4;
    }

    .removed {
      background-color: #ffb6ba;
    }
  }
}
</style>
