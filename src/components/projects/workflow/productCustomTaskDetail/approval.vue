<template>
  <div class="approval">
    <header class="mg-b8">
      <el-col :span="2" class>
        <span class="type">Manual Review</span>
      </el-col>
      <el-col :span="6" class="text">
        <span>Starting Time：</span>
        <span>{{$utils.convertTimestamp(approvalInfo.start_time)}}</span>
      </el-col>
      <el-col :span="6" class="text" v-if="!isDisabled">
        <span class="red">{{approvalInfo.approval.timeout}} Minute</span>
        <span>Post Review Timeout</span>
      </el-col>
      <el-col :span="6" class="text" v-else>
        <span>Complete Time：</span>
        <span>{{$utils.convertTimestamp(approvalInfo.end_time)}}</span>
        <span
          :class="[`status-${$utils.taskElTagType(approvalInfo.approval.reject_or_approve)}`]"
        >{{ wordTranslation(approvalInfo.approval.reject_or_approve,'pipeline','task') }}</span>
      </el-col>
      <el-col :span="1" class="close">
        <span @click="$emit('showFooter',false)">
          <i class="el-icon-close"></i>
        </span>
      </el-col>
    </header>
    <main>
      <el-table :data="approvalInfo.approval.approve_users" size="small" class="mg-t24">
        <el-table-column prop="user_name" label="Reviewer"></el-table-column>
        <el-table-column prop="reject_or_approve" label="Audit Results">
          <template slot-scope="scope">
            <span
              :class="$translate.calcTaskStatusColor(scope.row.reject_or_approve,'approval','status')"
            >{{ wordTranslation(scope.row.reject_or_approve,'approval','status') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operation_time" label="Review Time">
          <template slot-scope="scope">
            <span>{{$utils.convertTimestamp(scope.row.operation_time)}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="Comment Information"></el-table-column>
      </el-table>
      <el-row class="mg-t24">
        <el-button type="warning" size="small" @click="isShowCommentDialog=true" :disabled="isDisabled">Audit</el-button>
      </el-row>
    </main>
    <el-dialog title="Comment Information" :visible.sync="isShowCommentDialog">
      <el-form :model="form">
        <el-input placeholder="Enter comment information" size="small" v-model="form.comment"></el-input>
      </el-form>
      <span slot="footer">
        <el-button type="primary" size="small" @click="submit(true)">Pass</el-button>
        <el-button size="small" @click="submit(false)">Reject</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { approvalCustomWorkflowTaskAPI } from '@api'
import { wordTranslate } from '@utils/wordTranslate.js'
import { mapState } from 'vuex'

export default {
  name: '',
  props: {
    approvalInfo: {
      type: Object,
      default: () => ({})
    },
    taskId: {
      type: [String, Number],
      default: 1
    },
    workflowName: {
      type: String,
      default: ''
    },
    projectName: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      form: {
        comment: ''
      },
      isShowCommentDialog: false
    }
  },
  computed: {
    ...mapState({
      role: state => state.login.role,
      userInfo: state => state.login.userinfo
    }),
    isDisabled () {
      const curUser = this.approvalInfo.approval.approve_users.find(
        item => item.user_id === this.userInfo.uid
      )
      if (!curUser) {
        return true
      }
      if (
        !this.approvalInfo.approval.reject_or_approve &&
        !curUser.reject_or_approve
      ) {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    submit (approvalable) {
      const payload = {
        workflow_name: this.workflowName,
        stage_name: this.approvalInfo.name,
        task_id: Number(this.taskId),
        approve: approvalable,
        comment: this.form.comment
      }
      approvalCustomWorkflowTaskAPI(payload, this.projectName).then(res => {
        this.isShowCommentDialog = false
      })
    },
    hideFooter () {
      this.$emit('showFooter', false)
    },
    wordTranslation (word, category, subitem) {
      return wordTranslate(word, category, subitem)
    }
  }
}
</script>
<style lang="less" scoped>
.approval {
  position: relative;
  height: 100%;
  font-size: 14px;
  background: #fff;
  box-shadow: 1px 1px 14px rgba(0, 0, 0, 0.1);

  header {
    height: 42px;
    padding: 0 24px;
    line-height: 42px;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;

    .type {
      margin-right: 8px;
      font-weight: 500;
    }

    .close {
      float: right;
      font-size: 16px;
      cursor: pointer;
    }
  }

  main {
    padding: 0 24px;

    .text {
      color: #8d9199;
      font-size: 12px;

      .red {
        color: red;
      }
    }
  }
}
</style>
