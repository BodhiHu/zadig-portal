<template>
  <div class="setting-auditlog-container">
    <el-dialog :title="`API Ask：${currentLog.time}`"
               :visible.sync="payloadDialogVisiable"
               width="500px">

      <div>
        <vue-json-pretty v-if="currentLog.request_body"
                         :data="currentLog.request_body">
        </vue-json-pretty>
        <p v-if="currentLog.request_body ===''">No Request Yet Payload Information</p>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   size="small"
                   @click="payloadDialogVisiable = false">Sure</el-button>
      </span>
    </el-dialog>
    <div class="section">
      <div class="operation">
        <div class="type">
          <el-select v-model="searchType"
                     size="small"
                     placeholder="Please select a query type">
            <el-option label="Username"
                       value="username">
            </el-option>
            <el-option label="Project"
                       value="product_name">
            </el-option>
            <el-option label="Function"
                       value="function">
            </el-option>
            <el-option label="Status Code"
                       value="status">
            </el-option>
          </el-select>

        </div>

        <div class="keyword">
          <el-input clearable
                    size="small"
                    v-model="keyword"
                    @keyup.enter.native="getAuditLogBySearch"
                    placeholder="Please Enter Key Words"></el-input>
        </div>

        <el-button plain
                   size="small"
                   @click="getAuditLogBySearch"
                   type="primary">Inquire</el-button>
      </div>
      <div class="storage-list">
        <template>
          <el-table :data="results"
                    v-loading="loading"
                    element-loading-text="Desperately Loading"
                    element-loading-spinner="el-icon-loading"
                    style="width: 100%;">
            <el-table-column width="160px"
                             label="Time">
              <template slot-scope="scope">
                {{$utils.convertTimestamp(scope.row.created_at,'yyyy-mm-dd-ss')}}
              </template>
            </el-table-column>
            <el-table-column label="Username">
              <template slot-scope="scope">
                {{scope.row.username}}
              </template>
            </el-table-column>
            <el-table-column width="100px"
                             label="Operate">
              <template slot-scope="scope">
                {{scope.row.method}}
              </template>
            </el-table-column>
            <el-table-column label="Project">
              <template slot-scope="scope">
                {{scope.row.product_name}}
              </template>
            </el-table-column>
            <el-table-column label="Function">
              <template slot-scope="scope">
                {{scope.row.function}}
              </template>
            </el-table-column>
            <el-table-column label="Details">
              <template slot-scope="scope">
                {{scope.row.name}}
              </template>
            </el-table-column>
            <el-table-column width="100px"
                             label="Status Code">
              <template slot-scope="scope">
                <el-tag effect="dark"
                        :type="getStatusColor(scope.row.status)"
                        size="small">
                  {{scope.row.status}}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column width="100px"
                             label="API Ask">
              <template slot-scope="scope">
                <el-button @click="viewRequestPayload(scope.row)"
                           icon="el-icon-document"
                           type="text"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
      <!--start of page-divide -->
      <div class="log-table-pagination">
        <el-pagination background
                       @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="currentPageList"
                       :page-sizes="[50, 100,150, 200]"
                       :page-size="logPageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="totalLog">
        </el-pagination>
      </div>
      <!--page divide-->
    </div>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty'
import { getAuditLogAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      results: [],
      loading: false,
      payloadDialogVisiable: false,
      searchType: 'username',
      keyword: '',
      currentLog: {
        request_body: ''
      },
      editorOption: {
        showLineNumbers: true,
        showFoldWidgets: true,
        showGutter: true,
        displayIndentGuides: true,
        showPrintMargin: false,
        readOnly: true,
        tabSize: 2,
        maxLines: Infinity
      },
      totalLog: 0,
      logPageSize: 50,
      currentPageList: 1
    }
  },
  methods: {
    getAuditLogBySearch () {
      this.currentPageList = 1
      this.getAuditLog('', this.logPageSize, this.currentPageList)
    },
    getAuditLog (type, logPageSize, pageList) {
      this.loading = true
      const payload = {
        username: this.searchType === 'username' ? this.keyword : '',
        projectName: this.searchType === 'product_name' ? this.keyword : '',
        status: this.searchType === 'status' ? Number(this.keyword) : 0,
        function: this.searchType === 'function' ? this.keyword : '',
        per_page: logPageSize,
        page: pageList
      }
      getAuditLogAPI(payload).then((res) => {
        this.results = []
        this.loading = false
        this.totalLog = Number(res.headers['x-total'])
        this.results = res.data
        if (type !== 'init') {
          this.$message({
            message: 'Inquiry Is Complete',
            type: 'success'
          })
        }
      }, () => {
        this.loading = false
      })
    },
    getStatusColor (status) {
      if (status > 0 && status <= 299) {
        return 'success'
      } else if (status >= 400) {
        return 'danger'
      } else {
        return 'info'
      }
    },
    viewRequestPayload (request) {
      this.payloadDialogVisiable = true
      this.currentLog.time = this.$utils.convertTimestamp(request.created_at)
      this.currentLog.username = request.username
      this.currentLog.function = request.function
      if (request.request_body) {
        this.currentLog.request_body = JSON.parse(request.request_body)
      } else {
        this.currentLog.request_body = ''
      }
    },
    handleSizeChange (val) {
      this.logPageSize = val
      this.getAuditLog('init', this.logPageSize, this.currentPageList)
    },
    handleCurrentChange (val) {
      this.currentPageList = val
      this.getAuditLog('init', this.logPageSize, this.currentPageList)
    }
  },
  computed: {

  },
  components: {
    VueJsonPretty
  },
  created () {
    bus.$emit(`set-topbar-title`, { title: 'Operation Log', breadcrumb: [] })
    this.getAuditLog('init', this.logPageSize, this.currentPageList)
  }
}
</script>

<style lang="less">
.setting-auditlog-container {
  position: relative;
  flex: 1;
  height: 100%;
  padding: 15px 30px;
  overflow: auto;
  font-size: 13px;

  .section {
    margin-bottom: 56px;

    .operation {
      margin-bottom: 15px;

      .type {
        display: inline-block;
        width: 120px;
      }

      .keyword {
        display: inline-block;
        width: 400px;
      }
    }

    .log-table-pagination {
      margin-top: 15px;
    }
  }
}
</style>
