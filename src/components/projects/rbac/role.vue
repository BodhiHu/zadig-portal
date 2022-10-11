<template>
  <div>
    <el-alert type="info" :closable="false" description="Project Role Management，Primarily used to define the role of the project"></el-alert>
    <div class="sync-container">
      <el-button plain size="small" @click="addRole" type="primary">Add Role</el-button>
    </div>

    <el-table v-loading="loading" row-key="id" :data="roles" style="width: 100%;">
      <el-table-column label="Role Name">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="Role Type">
        <template slot-scope="scope">
          <span>{{scope.row.isPublic ? 'Public Role': 'Private Role'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="Operate">
        <template slot-scope="scope">
          <el-button @click="editrole(scope.row)" v-if="scope.row.name !== 'admin' || !scope.row.isPublic"  size="mini" type="primary" plain>Edit</el-button>
          <el-button @click="deleteRole(scope.row)"  v-if="scope.row.name !== 'admin' || !scope.row.isPublic"  size="mini" type="danger" plain>Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <AddRole :projectName="projectName" :currentRole="currentRole" :getRoles="getRoles" ref="addRole" />
  </div>
</template>
<script>
import bus from '@utils/eventBus'
import AddRole from './addRole.vue'
import { queryRoleAPI, deleteRoleAPI, deletePublicRoleAPI } from '@/api'

export default {
  name: 'member',
  components: {
    AddRole
  },
  props: {
    projectName: String
  },
  data () {
    return {
      roles: [],
      loading: false,
      currentRole: null
    }
  },
  methods: {
    editrole (role) {
      this.currentRole = role
      this.$refs.addRole.dialogRoleAddFormVisible = true
    },
    addRole (role) {
      this.currentRole = null
      this.$refs.addRole.dialogRoleAddFormVisible = true
    },
    async getRoles () {
      this.loading = true
      const projectName = this.projectName
      const roles = await queryRoleAPI(projectName).catch(error => console.log(error))
      if (roles) {
        this.roles = roles
      }
      this.loading = false
    },
    async deleteRole (row) {
      const projectName = this.projectName
      this.$confirm('Member permissions for this role will also be removed，Please proceed with caution', 'Confirm deletion of this role?', {
        confirmButtonText: 'Sure',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        let res = null
        if (row.isPublic) {
          res = await deletePublicRoleAPI(row.name, projectName).catch(error => console.log(error))
        } else {
          res = await deleteRoleAPI(row.name, projectName).catch(error => console.log(error))
        }
        if (res) {
          this.$message.success('Successfully Deleted')
          this.getRoles()
        }
      })
    }
  },
  created () {
    this.getRoles()
    bus.$emit(`set-topbar-title`, { title: '', breadcrumb: [{ title: 'Project', url: '/v1/projects' }, { title: this.projectName, isProjectName: true, url: `/v1/projects/detail/${this.projectName}/detail` }, { title: 'Authority Management', url: '' }, { title: 'Role Management', url: '' }] })
  }
}
</script>
<style lang="less" scoped>
.sync-container {
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>
