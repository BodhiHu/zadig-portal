<template>
  <div class="test-timer">
    <el-dialog :title="timerEditMode?'Modify timer configuration':'Add Timer'"
               :width="dialogWidth"
               :center="!dialogLeft"
               :close-on-click-modal="false"
               class="add-time-trigger"
               @close="cancelSchedule"
               :visible.sync="addTimerDialogVisible">
      <div class="section-wrapper add-timer">
        <el-form :model="schedule_config"
                 ref="addTimer"
                 :rules="triggerRules"
                 label-width="100px"
                 label-position="left">
          <el-form-item label="Trigger Method"
                        prop="type">
            <el-radio v-model="schedule_config.type"
                      label="timing">{{ schedule_config.timing.name }}</el-radio>
            <el-radio v-model="schedule_config.type"
                      label="gap">{{ schedule_config.gap.name }}</el-radio>
            <el-radio v-model="schedule_config.type"
                      label="crontab">{{ schedule_config.crontab.name }}</el-radio>
          </el-form-item>
          <el-form-item label="Time Configuration">
            <div v-if="schedule_config.type === 'timing'"
                 class="inline-show">
              <!--Timing-->
              <el-form-item prop="timing.frequency">
                <el-select v-model="schedule_config.timing.frequency"
                           size="small"
                           style="width: 150px;"
                           placeholder="Please Choose">
                  <el-option v-for="(item,index) in dateTranslate"
                             :key="index"
                             :label="item.label"
                             :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="timing.time">
                <el-time-picker v-model="schedule_config.timing.time"
                                value-format="HH:mm"
                                format="HH:mm"
                                size="small"
                                style="width: 150px;"
                                placeholder="Please Select A Time"></el-time-picker>
              </el-form-item>
            </div>
            <div v-else-if="schedule_config.type === 'gap'"
                 class="inline-show">
              <!--Interval-->
              <el-form-item prop="gap.number">
                <el-input-number v-model="schedule_config.gap.number"
                                 :min="1"
                                 size="small"
                                 style="width: 150px;"></el-input-number>
              </el-form-item>
              <el-form-item prop="gap.frequency">
                <el-select v-model="schedule_config.gap.frequency"
                           size="small"
                           style="width: 150px;">
                  <el-option label="Minute"
                             value="minutes">
                  </el-option>
                  <el-option label="Hour"
                             value="hours">
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            <div v-else-if="schedule_config.type === 'crontab'">
              <!--Cron-->
              <el-form-item prop="crontab.cron">
                <el-input v-model="schedule_config.crontab.cron"
                          size="small"
                          style="width: 300px;" />
              </el-form-item>
            </div>
          </el-form-item>
        </el-form>
        <div v-if="schedule_config.type === 'crontab'">
          <div class="cron-title-show">Cron Expression Parsing</div>
          <el-table :data="cronValue"
                    border
                    size="small"
                    class="cron-table-show"
                    :header-cell-style="()=>{return {background: '#dddddd'}}"
                    :cell-style="()=>{return {height:'30px'}}">
            <el-table-column prop="min"
                             label="Minute"></el-table-column>
            <el-table-column prop="hour"
                             label="Hour"></el-table-column>
            <el-table-column prop="date"
                             label="Date"></el-table-column>
            <el-table-column prop="month"
                             label="Month"></el-table-column>
            <el-table-column prop="week"
                             label="Week"></el-table-column>
          </el-table>
        </div>
        <slot name="content"
              :indexWork="getIndex"
              :orgsObject="schedule_config[schedule_config.type].workflow_args">
        </slot>
      </div>
      <div v-if="whichSave === 'inside'"
           slot="footer"
           :style="{ 'text-align' : dialogLeft ? 'left' : 'right' }"
           class="dialog-footer">
        <el-button size="small"
                   @click="cancelSchedule()"
                   round>Cancel</el-button>
        <el-button size="small"
                   type="primary"
                   @click="addSchedule"
                   round>Sure</el-button>
      </div>
    </el-dialog>
    <div v-show="schedules.enabled"
         class="timer-container">
      <div class="section-wrapper">
        <el-table :data="schedules['items']"
                  style="width: 100%;">
          <el-table-column label="Trigger Method"
                           #default="{ row }">
            {{ schedule_config[row.type].name }}
          </el-table-column>
          <el-table-column label="Time Configuration"
                           #default="{ row}">
            <span v-if="row.type === 'timing'">
              {{ getWeekday(row.frequency) }}&nbsp;&nbsp;{{ row.time }}
            </span>
            <span v-if="row.type === 'gap'">
              Every&nbsp;&nbsp;{{ row.number }}&nbsp;&nbsp;{{ row.frequency === 'hours' ? 'Hour' : 'Minute'}}
            </span>
            <span v-if="row.type === 'crontab'">
              {{ row.cron }}
            </span>
          </el-table-column>
          <el-table-column label="Operate"
                           #default="{ $index }">
            <el-button @click="editSchedule($index)"
                       size="mini"
                       type="primary"
                       plain>Edit</el-button>
            <el-button @click="deleteSchedule($index)"
                       size="mini"
                       type="danger"
                       plain>Delete</el-button>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
export default {
  data () {
    const checkCron = (rule, value, callback) => {
      if (value.trim().split(/\s+/).length !== 5) {
        callback(new Error('Please Check The Format，Only five digits are supported！'))
      } else if (!/^[0-9\s/\-\*\,]+$/.test(value)) {
        callback(new Error('Please Check The Format，Only numbers are supported * , - / '))
      } else {
        callback()
      }
    }
    return {
      addTimerDialogVisible: false,
      dateTranslate: [
        { label: 'Every Day', value: 'day' },
        { label: 'Every Monday', value: 'monday' },
        { label: 'Every Tuesday', value: 'tuesday' },
        { label: 'Every Wednesday', value: 'wednesday' },
        { label: 'Every Thursday', value: 'thursday' },
        { label: 'Every Friday', value: 'friday' },
        { label: 'Every Saturday', value: 'saturday' },
        { label: 'Every Sunday', value: 'sunday' }
      ],
      triggerRules: {
        type: [{ required: true, message: 'Please select a trigger method', trigger: 'blur' }],
        'timing.frequency': [{ required: true, message: 'Please Select A Period', trigger: 'blur' }],
        'timing.time': [{ required: true, message: 'Please fill in the selected time', trigger: 'blur' }],
        'gap.number': [{ required: true, message: 'Please fill in the selected time', trigger: 'blur' }],
        'gap.frequency': [{ required: true, message: 'Please Select A Period', trigger: 'blur' }],
        'crontab.cron': [{ required: true, validator: checkCron, trigger: 'blur' }]
      },
      timerEditMode: false,
      schedule_config: {
        type: 'timing',
        timing: {
          type: 'timing',
          name: 'Timed Loop',
          frequency: '',
          number: 1,
          time: ''
        },
        gap: {
          type: 'gap',
          name: 'Interval Loop',
          number: 1,
          frequency: '',
          time: ''
        },
        crontab: {
          type: 'crontab',
          name: 'Cron Expression',
          number: 1,
          frequency: '',
          time: '',
          cron: '* * * * *'
        }
      },
      editMiddleDate: {}
    }
  },
  props: {
    schedules: {
      required: true,
      type: Object
    },
    timerType: {
      type: String,
      required: true
    },
    testName: {
      type: String,
      default: ''
    },
    projectName: {
      required: true,
      type: String
    },

    dialogLeft: {
      type: Boolean,
      default: false
    },
    dialogWidth: {
      type: String,
      default: '50%'
    },
    whichSave: {
      type: String,
      default: 'inside'
    }
  },
  methods: {
    getWeekday (enday) {
      for (const date of this.dateTranslate) {
        if (date.value === enday) {
          return date.label
        }
      }
    },
    addTimerBtn () {
      this.addTimerDialogVisible = true
      this.schedules.enabled = true
      this.editMiddleDate = {}
      this.timerEditMode = false
    },
    editSchedule (index) {
      this.timerEditMode = true
      this.addTimerDialogVisible = true
      const editData = this.schedules.items[index]
      this.editMiddleDate = {}
      this.editMiddleDate.index = index
      this.editMiddleDate.type = editData.type
      this.editMiddleDate[editData.type] = this.schedule_config[editData.type]
      this.schedule_config.type = editData.type
      this.schedule_config[editData.type] = Object.assign({}, this.schedule_config[editData.type], editData)
    },
    cancelSchedule () {
      this.addTimerDialogVisible = false
      this.editMiddleDate.type && (this.schedule_config[this.editMiddleDate.type] = this.editMiddleDate[this.editMiddleDate.type])
    },
    addSchedule (argsObject = {}, argsType = '') {
      const type = this.schedule_config.type
      if (this.timerType === 'test') {
        argsObject = {
          product_name: this.projectName,
          test_name: this.testName
        }
        argsType = 'test_args'
      }
      this.$refs.addTimer.validate((valid) => {
        if (valid) {
          if (!this.schedules.items) {
            this.$set(this.schedules, 'items', [])
          }
          if (!this.editMiddleDate.type) {
            this.$set(this.schedule_config[type], argsType, argsObject)
          }
          if (this.editMiddleDate.type) {
            this.schedule_config[type][argsType] = argsObject
            this.schedules.items.splice(this.editMiddleDate.index, 1, this.schedule_config[type])
          } else if (type && type === 'timing') {
            this.schedules.items.push(this.schedule_config.timing)
            this.schedule_config.timing = {
              type: 'timing',
              name: 'Timed Loop',
              frequency: '',
              number: 1,
              time: '',
              enabled: true
            }
          } else if (type && type === 'gap') {
            this.schedules.items.push(this.schedule_config.gap)
            this.schedule_config.gap = {
              type: 'gap',
              name: 'Interval Loop',
              number: null,
              frequency: '',
              time: '',
              max_failures: 3,
              enabled: true
            }
          } else if (type && type === 'crontab') {
            this.schedules.items.push(this.schedule_config.crontab)
            this.schedule_config.crontab = {
              type: 'crontab',
              name: 'Cron Expression',
              number: null,
              frequency: '',
              time: '',
              cron: '* * * * *',
              enabled: true
            }
          }
          this.addTimerDialogVisible = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    deleteSchedule (index) {
      this.schedules.items.splice(index, 1)
    }
  },
  computed: {
    getIndex () {
      if (this.timerEditMode) {
        return this.schedules.items.length * 10 + this.editMiddleDate.index
      } else {
        return -this.schedules.items.length * 10
      }
    },
    cronValue () {
      const cronArr = this.schedule_config.crontab.cron.trim().split(/\s+/)
      return [{
        min: cronArr[0],
        hour: cronArr[1],
        date: cronArr[2],
        month: cronArr[3],
        week: cronArr[4]
      }]
    }
  },
  components: {
  }
}
</script>

<style lang="less">
.test-timer {
  color: #606266;

  .add-timer {
    margin-top: -20px;
    margin-left: 10px;

    .inline-show {
      display: flex;

      & > div {
        margin-right: 10px;
      }
    }

    .cron-table-show {
      width: 600px;
      line-height: 1;

      th,
      td {
        padding: 3px;
      }
    }

    .cron-title-show {
      margin: 12px 0 5px;
      line-height: 1;
    }
  }

  .timer-container {
    font-size: 14px;
    line-height: 1;
  }

  .box-card {
    .el-card__header {
      text-align: center;
    }

    .el-form {
      .el-form-item {
        margin-bottom: 5px;
      }
    }

    .el-card__body {
      padding: 0;
    }

    .divider {
      width: 100%;
      height: 1px;
      margin: 13px 0;
      background-color: #dfe0e6;
    }

    .help-link {
      color: @themeColor;
    }
  }

  .el-form--label-top .el-form-item__label {
    display: inline-block;
    float: none;
    padding: 0;
    text-align: left;
  }

  .el-form-item.is-required .el-form-item__label {
    &::before {
      content: none;
    }

    &::after {
      content: none;
    }
  }
}
</style>
