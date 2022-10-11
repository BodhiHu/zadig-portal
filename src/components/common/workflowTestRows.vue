<template>
  <div class="workflow-build-rows">
    <el-table v-if="runnerTests.length > 0"
              :data="runnerTests"
              empty-text="None"
              class="test-table">
      <el-table-column prop="test_module_name"
                       label="Test"
                       width="100px"></el-table-column>

      <el-table-column label="Code Library">
        <template slot-scope="scope">
          <el-row v-for="build of scope.row.builds"
                  class="build-row"
                  :key="build._id_">
            <template v-if="!build.use_default">
              <el-col :span="7">
                <div class="repo-name-container">
                  <el-tooltip class="item" effect="dark" :content="build.repo_name" placement="top">
                    <span :class="{'repo-name': true}"> {{$utils.tailCut(build.repo_name,20) }}</span>
                  </el-tooltip>
                </div>
              </el-col>

              <el-col :span="7">
                <el-select v-if="build.branchNames && build.branchNames.length > 0"
                            v-model="build.branch"
                            filterable
                            allow-create
                            clearable
                            size="small"
                            placeholder="Please Select A Branch">
                  <el-option v-for="branch of build.branchNames"
                              :key="branch"
                              :label="branch"
                              :value="branch"></el-option>
                </el-select>
                <el-tooltip v-else
                            content="Request Branch Failed，Please enter the branch manually"
                            placement="top"
                            popper-class="gray-popper">
                  <el-input v-model="build.branch"
                            class="short-input"
                            size="small"
                            placeholder="Please fill in the branch"></el-input>
                </el-tooltip>
              </el-col>

              <el-col :span="7"
                      :offset="1">
                <el-select v-if="!$utils.isEmpty(build.branchPRsMap)"
                            v-model.number="build[build.prNumberPropName]"
                            size="small"
                            placeholder="Please Choose PR"
                            filterable
                            clearable>

                  <el-tooltip v-for="item in build.branchPRsMap[build.branch]"
                              :key="item[build.prNumberPropName]"
                              placement="left"
                              popper-class="gray-popper">

                    <div slot="content">{{`Founder: ${$utils.tailCut(item.authorUsername,10)}`}}
                      <br />{{`Time: ${$utils.convertTimestamp(item.createdAt)}`}}
                      <br />{{`Source Branch: ${item.sourceBranch}`}}
                      <br />{{`Target Branch: ${item.targetBranch}`}}
                    </div>
                    <el-option :label="`#${item[build.prNumberPropName]} ${item.title}`"
                                :value="item[build.prNumberPropName]">
                    </el-option>
                  </el-tooltip>
                </el-select>
                <el-tooltip v-else
                            content="PR Does Not Exist，Support Manual Input PR No"
                            placement="top"
                            popper-class="gray-popper">
                  <el-input v-model.number="build[build.prNumberPropName]"
                            class="short-input"
                            size="small"
                            placeholder="Please Fill Out PR No"></el-input>
                </el-tooltip>
              </el-col>
              <el-col :span="1">
                <el-tooltip v-if="build.errorMsg"
                          class="item"
                          effect="dark"
                          :content="build.errorMsg"
                          placement="top">
                  <i class="el-icon-question repo-warning"></i>
                </el-tooltip>
              </el-col>
            </template>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column width="250px">
      </el-table-column>
      <el-table-column width="100px"
                       label="Variable">
        <template slot-scope="scope">
          <el-popover placement="left"
                      width="450"
                      trigger="click">
            <el-table :data="scope.row.envs">
              <el-table-column property="key"
                               label="Key"></el-table-column>
              <el-table-column label="Value">
                <template slot-scope="{ row }">
                  <el-select
                    style="width: 100%;"
                    v-if="row.type==='choice'"
                    v-model="row.value"
                    placeholder="Defaults"
                    size="small"
                  >
                    <el-option v-for="option in row.choice_option" :key="option" :label="option" :value="option"></el-option>
                  </el-select>
                  <el-input v-else
                            size="small"
                            v-model="row.value"
                            placeholder="Please Enter value"></el-input>
                </template>
              </el-table-column>
            </el-table>
            <el-button style="padding: 5px 0;"
                       slot="reference"
                       type="text">Set Up</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  props: {
    runnerTests: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="less">
@import '~@assets/css/common/build-row.less';
</style>
