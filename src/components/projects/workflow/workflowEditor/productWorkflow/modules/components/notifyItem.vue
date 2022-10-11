<template>
  <div>
    <el-card class="notifyItem box-card">
      <i class="del el-icon-delete" @click="delNotify"></i>
      <el-form :model="notify" :rules="notifyRules" label-position="top" ref="notify">
        <el-form-item prop="webhook_type">
          <span slot="label">
            <span>Webhook Type：</span>
          </span>
          <el-select v-model="notify.webhook_type" @change="clearForm" style="width: 350px;" size="small" placeholder="Please Choose The Type">
            <el-option label="Dingding" value="dingding"></el-option>
            <el-option label="Enterprise We Chat" value="wechat"></el-option>
            <el-option label="Flying Book" value="feishu"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="notify.webhook_type==='feishu'" prop="feishu_webhook">
          <span slot="label">
            <span>
              Webhook Address：
              <el-tooltip class="item" effect="dark" content="Click To View Feishu webhook Configuration Document" placement="top">
                <a class="help-link" href="https://docs.koderover.com/zadig/project/workflow/#Flying Book/" target="_blank">
                  <i class="el-icon-question"></i>
                </a>
              </el-tooltip>
            </span>
          </span>
          <el-input style="width: 350px;" size="small" v-model="notify.feishu_webhook"></el-input>
        </el-form-item>
        <el-form-item v-if="notify.webhook_type==='wechat'" prop="weChat_webHook">
          <span slot="label">
            <span>
              Webhook Address：
              <el-tooltip class="item" effect="dark" content="Click to view enterprise WeChat webhook Configuration Document" placement="top">
                <a class="help-link" href="https://docs.koderover.com/zadig/project/workflow/#Enterprise We Chat/" target="_blank">
                  <i class="el-icon-question"></i>
                </a>
              </el-tooltip>
            </span>
          </span>
          <el-input style="width: 350px;" size="small" v-model="notify.weChat_webHook"></el-input>
        </el-form-item>
        <el-form-item v-if="notify.webhook_type==='dingding'" prop="dingding_webhook">
          <span slot="label">
            <span>
              Webhook Address：
              <el-tooltip class="item" effect="dark" content="Click To View Ding Talk webhook Configuration Document" placement="top">
                <a class="help-link" href="https://docs.koderover.com/zadig/project/workflow/#Dingding/" target="_blank">
                  <i class="el-icon-question"></i>
                </a>
              </el-tooltip>
            </span>
          </span>
          <el-input style="width: 350px;" size="small" v-model="notify.dingding_webhook"></el-input>
        </el-form-item>
        <el-form-item v-if="notify.webhook_type==='dingding'" prop="at_mobiles">
          <span slot="label">
            <span>@Designated Member（Enter the mobile number of the designated notification recipient，Use ; Segmentation，If empty, all staff will be notified）：</span>
          </span>
          <el-input style="width: 350px;" type="textarea" :rows="3" placeholder="Enter the mobile number of the designated notification recipient，Use ; Segmentation" v-model="mobileStr"></el-input>
        </el-form-item>

        <el-form-item prop="notify_type" label="Notification Event：">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">Select All</el-checkbox>
          <el-checkbox-group @change="handleCheckedValueChange" v-model="notify.notify_type">
            <el-checkbox v-for="type in notifyType" :key="type.label" :label="type.label">{{type.desc}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'NotifyItem',
  data () {
    return {
      notifyType: [
        {
          label: 'passed',
          desc: 'Mission Succeeded'
        },
        {
          label: 'failed',
          desc: 'Mission Failed'
        },
        {
          label: 'timeout',
          desc: 'Task Timeout'
        },
        {
          label: 'cancelled',
          desc: 'Task Canceled'
        },
        {
          label: 'changed',
          desc: 'Status Change'
        }
      ],
      isIndeterminate: true,
      notifyRules: {
        webhook_type: [
          {
            type: 'string',
            required: true,
            message: 'Choose a notification type',
            trigger: 'blur'
          }
        ],
        weChat_webHook: [
          {
            type: 'string',
            required: true,
            message: 'Please fill in the company WeChat Webhook',
            trigger: 'blur'
          }
        ],
        dingding_webhook: [
          {
            type: 'string',
            required: true,
            message: 'Please Fill In Ding Talk Webhook',
            trigger: 'blur'
          }
        ],
        feishu_webhook: [
          {
            type: 'string',
            required: true,
            message: 'Please Fill In Feishu Webhook',
            trigger: 'blur'
          }
        ],
        notify_type: [
          {
            type: 'array',
            required: true,
            message: 'Please select a notification type',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    checkAll: {
      get: function () {
        return this.notify.notify_type.length === this.notifyType.length
      },
      set (val) {
        return val
      }
    },
    'notify.at_mobiles': {
      get: function () {
        return this.mobileStr.split(';')
      }
    },
    mobileStr: {
      get: function () {
        if (this.notify.at_mobiles) {
          return this.notify.at_mobiles.join(';')
        } else {
          return ''
        }
      },
      set: function (newValue) {
        if (newValue === '') {
          this.$set(this.notify, 'is_at_all', true)
          this.$set(this.notify, 'at_mobiles', [])
        } else {
          this.$set(this.notify, 'is_at_all', false)
          this.$set(this.notify, 'at_mobiles', newValue.split(';'))
        }
      }
    }
  },
  methods: {
    delNotify () {
      this.$emit('update', this.curIndex)
    },
    handleCheckAllChange (val) {
      this.notify.notify_type = val
        ? this.notifyType.map(type => type.label)
        : []
      this.isIndeterminate = false
    },
    handleCheckedValueChange (value) {
      const typeLength = this.notifyType.length
      const checkedCount = value.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < typeLength
    },
    clearForm () {
      this.$refs.notify.clearValidate()
    }
  },
  props: {
    notify: {
      required: true,
      type: Object
    },
    curIndex: {
      type: Number,
      default: null
    },
    fromWorkflow: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="less" scoped>
.notifyItem {
  position: relative;

  .del {
    position: absolute;
    top: 16px;
    right: 16px;
    cursor: pointer;
  }

  .help-link {
    color: #303133;
  }
}
</style>
