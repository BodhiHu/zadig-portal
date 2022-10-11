<template>
  <div class="config-link">
    <el-alert type="info" :closable="false">
      <template>Support for adding external shortcut links，For details, please refer to
        <el-link style="font-size: 14px; vertical-align: baseline;"
          type="primary"
          :href="`https://docs.koderover.com/zadig/settings/system-settings/#Quick Link`"
          :underline="false"
          target="_blank">Help Documentation</el-link>
      </template>
    </el-alert>
    <div class="link-content">
      <el-table :data="links" style="width: 100%;">
        <el-table-column prop="name" label="Name">
          <template slot-scope="{row}">
            <span v-show="!row.edit">{{row.name}}</span>
            <el-input v-show="row.edit" v-model="row.name" placeholder="Please Enter A Name" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="URL">
          <template slot-scope="{row}">
            <span v-show="!row.edit">{{row.url}}</span>
            <el-input v-show="row.edit" v-model="row.url" placeholder="Please Enter URL" size="small"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Operate">
          <template slot-scope="{row}">
            <el-button v-if="!row.edit" size="mini" type="primary" @click="row.edit = true" plain>Edit</el-button>
            <el-button v-if="!row.edit" size="mini" type="danger"  @click="deleteExternalLink(row)" plain>Delete</el-button>
            <el-button v-if="row.edit"  size="mini" type="primary" @click="updateExternalLink(row)" plain>Confirm</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 20px;">
        <el-button type="text" icon="el-icon-plus" @click="addLink">Add To</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getExternalLinksAPI,
  createExternalLinkAPI,
  updateExternalLinkAPI,
  deleteExternalLinkAPI
} from '@api'
export default {
  data () {
    return {
      links: []
    }
  },
  methods: {
    addLink () {
      this.links.push({
        id: '',
        name: '',
        url: '',
        edit: true
      })
    },
    getExternalLinks () {
      getExternalLinksAPI().then(res => {
        this.$store.commit('SET_EXTERNAL_LINK', res || [])
        this.links = (res || []).map(re => {
          return {
            ...re,
            edit: false
          }
        })
      })
    },

    updateExternalLink (data) {
      if (!data.name || !data.url) {
        this.$message.info(`${data.name ? 'URL ' : 'Name'}Can Not Be Empty！`)
        return
      }
      const payload = {
        name: data.name,
        url: data.url
      }
      const res = data.id
        ? updateExternalLinkAPI(data.id, payload)
        : createExternalLinkAPI(payload)
      res.then(() => {
        this.$message.success(`${data.id ? 'Renew' : 'New'}External Link Success！`)
        this.getExternalLinks()
      })
    },
    deleteExternalLink (data) {
      deleteExternalLinkAPI(data.id).then(() => {
        this.$message.success(`Remove external link successfully！`)
        this.getExternalLinks()
      })
    }
  },
  created () {
    this.getExternalLinks()
  }
}
</script>

<style lang="less" scoped>
.config-link {
  .link-content {
    padding-top: 15px;
    padding-bottom: 15px;
  }
}
</style>
