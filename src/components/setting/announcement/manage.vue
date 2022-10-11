<template>
  <div v-loading="loading"
       element-loading-text="Loading..."
       element-loading-spinner="iconfont iconfont-loading icongonggao"
       class="setting-anno-container">
    <!--announcement-create-dialog-->
    <el-dialog title='New'
               :visible.sync="dialogAnnouncementCreateFormVisible">
      <el-form ref="announcement"
               :rules="rules"
               :model="announcement"
               label-width="90px">
        <el-form-item label="Title"
                      prop="content.title">
          <el-input v-model="announcement.content.title"></el-input>
        </el-form-item>
        <el-form-item label="Priority"
                      prop="content.priority">
          <el-select v-model="announcement.content.priority"
                     placeholder="Please Select A Priority">
            <el-option label="High"
                       :value="1"></el-option>
            <el-option label="Middle"
                       :value="2"></el-option>
            <el-option label="Low"
                       :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Time Limit"
                      prop="duration">
          <el-date-picker v-model="announcement.duration"
                          type="datetimerange"
                          range-separator="To"
                          start-placeholder="Start Date"
                          end-placeholder="End Date">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Content"
                      prop="content.content">
          <el-input :autosize="{ minRows: 4}"
                    type="textarea"
                    v-model="announcement.content.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="small"
                   @click="dialogAnnouncementCreateFormVisible = false">Cancel</el-button>
        <el-button :plain="true"
                   type="success"
                   size="small"
                   @click="announcementOperation('add')">Save</el-button>
      </div>
    </el-dialog>
    <!--announcement-create-dialog-->

    <!--announcement-edit-dialog-->
    <el-dialog title='Amendment Announcement'
               :visible.sync="dialogAnnouncementEditFormVisible">
      <el-form ref="swapAnnouncement"
               :rules="rules"
               :model="swapAnnouncement"
               label-width="90px">
        <el-form-item label="Title"
                      prop="content.title">
          <el-input v-model="swapAnnouncement.content.title"></el-input>
        </el-form-item>
        <el-form-item label="Priority"
                      prop="content.priority">
          <el-select v-model="swapAnnouncement.content.priority"
                     placeholder="Please Select A Priority">
            <el-option label="High"
                       :value="1"></el-option>
            <el-option label="Middle"
                       :value="2"></el-option>
            <el-option label="Low"
                       :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Time Limit"
                      prop="duration">
          <el-date-picker v-model="swapAnnouncement.duration"
                          type="datetimerange"
                          range-separator="To"
                          start-placeholder="Start Date"
                          end-placeholder="End Date">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Content"
                      prop="content.content">
          <el-input :autosize="{ minRows: 4}"
                    type="textarea"
                    v-model="swapAnnouncement.content.content"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer"
           class="dialog-footer">
        <el-button size="small"
                   @click="dialogAnnouncementEditFormVisible = false">Cancel</el-button>
        <el-button size="small"
                   :plain="true"
                   type="success"
                   @click="announcementOperation('update')">Save</el-button>
      </div>
    </el-dialog>
    <div class="section">
      <div class="sync-container">
        <el-button :plain="true"
                   size="small"
                   @click="dialogAnnouncementCreateFormVisible=true"
                   type="success">New</el-button>
      </div>
      <div class="announcement-list">
        <template>
          <el-table :data="allAnnouncements"
                    style="width: 100%;">
            <el-table-column label="Title">
              <template slot-scope="scope">
                <span v-if="showActive(scope.row.content.start_time,scope.row.content.end_time)"
                      class="ann-active"></span>
                <span>{{scope.row.content.title}}</span>
              </template>
            </el-table-column>
            <el-table-column label="Priority">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.content.priority===1"
                        size="small"
                        type="danger">High</el-tag>
                <el-tag v-if="scope.row.content.priority===2"
                        size="small"
                        type="warning">Middle</el-tag>
                <el-tag v-if="scope.row.content.priority===3"
                        size="small"
                        type="info">Low</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Starting Time">
              <template slot-scope="scope">
                <i class="el-icon-time"></i>
                <span style="margin-left: 10px;">{{
                  $utils.convertTimestamp(scope.row.content.start_time) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="End Time">
              <template slot-scope="scope">
                <i class="el-icon-time"></i>
                <span style="margin-left: 10px;">{{
                  $utils.convertTimestamp(scope.row.content.end_time) }}</span>
              </template>
            </el-table-column>

            <el-table-column label="Operate">
              <template slot-scope="scope">
                <el-button @click="announcementOperation('edit',scope.row)"
                           size="mini" type="primary" plain>Edit</el-button>
                <el-button @click="announcementOperation('delete',scope.row)"
                           size="mini"
                           type="danger" plain>Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </div>

  </div>
</template>

<script>
import { deleteAnnouncementAPI, createAnnouncementAPI, updateAnnouncementAPI, getAnnouncementListAPI } from '@api'
import bus from '@utils/eventBus'
export default {
  data () {
    return {
      announcement: {
        content: {
          title: '',
          priority: null,
          content: ''
        },
        receiver: '*',
        type: 1
      },
      swapAnnouncement: {
        content: {
          title: '',
          priority: null,
          content: ''
        },
        receiver: '*',
        type: 1
      },
      dialogAnnouncementCreateFormVisible: false,
      dialogAnnouncementEditFormVisible: false,
      allAnnouncements: [],
      rules: {
        'content.title': [{ required: true, message: 'Please enter the announcement title', trigger: 'blur' }],
        'content.priority': [{ required: true, message: 'Please Select A Priority', trigger: 'blur' }],
        'content.content': [{ required: true, message: 'Please fill in the announcement content', trigger: 'blur' }],
        duration: [
          {
            type: 'array',
            required: true,
            message: 'Please select start and end time',
            trigger: 'change'
          }
        ]
      },
      loading: true
    }
  },
  methods: {
    announcementOperation (operate, current_announcement) {
      if (operate === 'add') {
        this.$refs.announcement.validate(valid => {
          if (valid) {
            const duration = this.announcement.duration
            const announcement = this.announcement
            announcement.content.priority = parseInt(this.announcement.content.priority)
            this.announcement.content.start_time = this.parseTime(duration[0], duration[1]).start
            this.announcement.content.end_time = this.parseTime(duration[0], duration[1]).end
            delete announcement.duration
            this.dialogAnnouncementCreateFormVisible = false
            this.addAnnouncement(announcement)
          } else {
            return false
          }
        })
      } else if (operate === 'edit') {
        this.swapAnnouncement = current_announcement
        this.$set(this.swapAnnouncement, 'duration', [new Date(current_announcement.content.start_time * 1000), new Date(current_announcement.content.end_time * 1000)])
        this.dialogAnnouncementEditFormVisible = true
      } else if (operate === 'update') {
        this.$refs.swapAnnouncement.validate(valid => {
          if (valid) {
            const duration = this.swapAnnouncement.duration
            const announcement = this.swapAnnouncement
            announcement.content.priority = parseInt(this.swapAnnouncement.content.priority)
            announcement.content.start_time = this.parseTime(duration[0], duration[1]).start
            announcement.content.end_time = this.parseTime(duration[0], duration[1]).end
            delete announcement.duration
            this.dialogAnnouncementEditFormVisible = false
            this.updateAnnouncement(announcement)
          } else {
            return false
          }
        })
      } else if (operate === 'delete') {
        deleteAnnouncementAPI(current_announcement.id).then(
          response => {
            this.$message({
              message: 'Announcement Deleted',
              type: 'success'
            })
            this.getAnnouncements()
          }
        )
      }
    },
    parseTime (start, end) {
      return {
        start: Math.floor(Date.parse(start) / 1000),
        end: Math.floor(Date.parse(end) / 1000)
      }
    },
    showActive (start, end) {
      const now = Math.floor(Date.parse(new Date()) / 1000)
      if (now >= start && now <= end) {
        return true
      } else {
        return false
      }
    },
    addAnnouncement (data) {
      createAnnouncementAPI(data).then(
        response => {
          this.$message({
            message: 'Added announcement successfully',
            type: 'success'
          })
          this.getAnnouncements()
          this.announcement = {
            content: {
              title: '',
              priority: null,
              content: ''
            },
            receiver: '*',
            type: 1
          }
        },
        response => {
          this.$message({
            message: 'Failed to add announcement',
            type: 'error'
          })
        }
      )
    },
    updateAnnouncement (data) {
      updateAnnouncementAPI(data).then(
        response => {
          this.$message({
            message: 'Modify the announcement successfully',
            type: 'success'
          })
          this.getAnnouncements()
        },
        response => {
          this.$message({
            message: 'Failed to modify announcement',
            type: 'error'
          })
        }
      )
    },
    getAnnouncements () {
      this.loading = true
      getAnnouncementListAPI().then(
        response => {
          this.loading = false
          this.allAnnouncements = response
        }
      )
    }
  },
  computed: {

  },
  created () {
    bus.$emit(`set-topbar-title`, { title: 'Announcement Management', breadcrumb: [] })

    this.getAnnouncements()
  }
}
</script>

<style lang="less">
.setting-anno-container {
  position: relative;
  flex: 1;
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

    .announcement-list {
      padding-bottom: 30px;

      .ann-active {
        display: inline-block;
        width: 10px;
        height: 10px;
        vertical-align: middle;
        background: @themeColor;
        border-radius: 50%;
      }
    }
  }
}
</style>
