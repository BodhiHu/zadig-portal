<template>
  <div class="integration-registry">
    <el-alert type="warning">
      <div>
        Mirror warehouse integration can refer to this
        <el-link type="warning"
                 class="integration-reference"
                 :href="`https://docs.koderover.com/zadig/settings/image-registry/`"
                 :underline="false"
                 target="_blank">Documentation</el-link>
      </div>
    </el-alert>
    <div class="content">
      <el-form ref="registry"
               :rules="rules"
               label-width="110px"
               label-position="top"
               :model="registry">
        <el-form-item label="Use By Default"
                      prop="is_default">
          <el-checkbox v-model="registry.is_default"></el-checkbox>
        </el-form-item>
        <el-form-item label="Provider"
                      prop="reg_provider">
          <el-select v-model="registry.reg_provider"
                     @change="changeProvider"
                     style="width: 100%;"
                     placeholder="Please select a mirror repository provider">
            <el-option v-for="(provider,index) in providers" :key="index" :value="provider.value"
                       :label="provider.label">
              <i class="iconfont" :class="provider.icon"></i> <span>{{provider.label}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="registry.reg_provider === 'swr' || registry.reg_provider === 'ecr'"
                      :label="providerMap[registry.reg_provider].region"
                      prop="region">
          <el-input clearable
                    v-model="registry.region"></el-input>
        </el-form-item>
        <el-form-item v-if="registry.reg_provider"
                      :label="providerMap[registry.reg_provider].reg_addr"
                      prop="reg_addr">
          <el-input clearable
                    v-model="registry.reg_addr"></el-input>
        </el-form-item>
        <el-form-item  v-if="registry.reg_provider && registry.reg_provider !=='ecr'" prop="namespace">
          <template slot="label">
            {{ registry.reg_provider ? providerMap[registry.reg_provider].namespace : 'Namespace' }}
          </template>
          <el-input clearable
                    v-model="registry.namespace"></el-input>
        </el-form-item>
        <el-form-item v-if="registry.reg_provider" :label="providerMap[registry.reg_provider].access_key"
                      :rules="{ required: true, message: `Please Enter ${providerMap[registry.reg_provider].access_key}`, trigger: ['blur'] }"
                      prop="access_key">
          <el-input clearable
                    v-model="registry.access_key"></el-input>
        </el-form-item>
        <el-form-item v-if="registry.reg_provider" :label="providerMap[registry.reg_provider].secret_key"
                      :rules="{ required: true, message: `Please Enter ${providerMap[registry.reg_provider].secret_key}`, trigger: ['blur'] }"
                      prop="secret_key">
          <el-input clearable
                    type="passsword"
                    v-model="registry.secret_key"></el-input>
        </el-form-item>
      </el-form>
      <div class="footer">
        <el-button :plain="true"
                   type="success"
                   size="small"
                   @click="registryOperation">Save</el-button>
        <el-button @click="$emit('cancel')"
                   size="small">Cancel</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { createRegistryAPI } from '@api'
import { keyBy } from 'lodash'
export default {
  name: 'IntegrationRegistry',
  data () {
    return {
      registry: {
        namespace: '',
        reg_addr: '',
        access_key: '',
        secret_key: '',
        reg_provider: '',
        region: '',
        is_default: true
      },
      providers: [
        {
          value: 'acr',
          label: 'Ali Cloud ACR',
          reg_addr: 'Address',
          namespace: 'Namespaces',
          access_key: 'Docker Username',
          secret_key: 'Docker Password',
          icon: 'iconfont logo iconaliyun'
        },
        {
          value: 'swr',
          label: 'HUAWEI CLOUD SWR',
          reg_addr: 'Address',
          namespace: 'Name Of Association',
          region: 'Area',
          access_key: 'Access Key',
          secret_key: 'Secret Key',
          icon: 'iconfont logo iconhuawei'
        },

        {
          value: 'tcr',
          label: 'Tencent Cloud TCR',
          reg_addr: 'Address',
          namespace: 'Namespaces',
          access_key: 'Docker Username',
          secret_key: 'Docker Password',
          icon: 'iconfont logo icontengxunyun'
        },
        {
          value: 'harbor',
          label: 'Harbor',
          reg_addr: 'Address',
          namespace: 'Project',
          access_key: 'Docker Username',
          secret_key: 'Docker Password',
          icon: 'iconfont logo iconHarbor'
        },
        {
          value: 'dockerhub',
          label: 'DockerHub',
          reg_addr: 'Address',
          namespace: 'Namespace',
          access_key: 'Docker Username',
          secret_key: 'Docker Password',
          icon: 'iconfont logo icondocker'
        },
        {
          value: 'ecr',
          label: 'Amazon ECR',
          reg_addr: 'URI',
          namespace: '',
          region: 'Region',
          access_key: 'Access Key ID',
          secret_key: 'Secret Access Key',
          icon: 'iconfont logo icondocker'
        },
        {
          value: 'native',
          label: 'Other',
          reg_addr: 'Address',
          namespace: 'Namespace',
          access_key: 'Docker Username',
          secret_key: 'Docker Password',
          icon: 'iconfont logo iconqita'
        }
      ],
      rules: {
        reg_provider: [{ required: true, message: 'Please select a mirror repository provider', trigger: ['blur'] }],
        reg_addr: [{
          required: true,
          message: 'Please Enter URL',
          trigger: ['blur']
        },
        {
          type: 'url',
          message: 'Please Enter The Correct URL，Include Agreement',
          trigger: ['blur']
        }],
        region: [{ required: true, message: 'Please Enter A Region', trigger: ['blur'] }],
        namespace: [{ required: true, message: 'Please Enter Namespace', trigger: ['blur'] }]
      }
    }
  },
  computed: {
    providerMap () {
      return keyBy(this.providers, 'value')
    }
  },
  methods: {
    changeProvider (val) {
      this.$nextTick(() => {
        this.registry = {
          namespace: '',
          reg_addr: val === 'dockerhub' ? 'https://registry.hub.docker.com' : '',
          access_key: '',
          secret_key: '',
          reg_provider: val,
          region: '',
          is_default: this.registry.is_default
        }
        this.$refs.registry.clearValidate()
      })
    },
    getProviderMap (name, type) {
      const providerMap = this.providerMap
      if (providerMap[name] && type) {
        return providerMap[name][type]
      } else {
        return providerMap.native.icon
      }
    },
    registryOperation () {
      this.$refs.registry.validate(valid => {
        if (valid) {
          const payload = this.registry
          createRegistryAPI(payload).then((res) => {
            this.$message({
              type: 'success',
              message: 'Added Successfully'
            })
            this.$emit('cancel')
            this.$emit('createSuccess')
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.integration-registry {
  padding: 10px 15px;
  font-size: 13px;

  .integration-reference {
    color: @themeColor;
    font-weight: 500;
    vertical-align: baseline;
  }

  .content {
    padding: 30px 20px;

    /deep/ .el-form-item {
      margin-bottom: 10px;

      &:first-child .el-form-item__content {
        top: -4px;
        display: inline-block;
        padding-left: 30px;
      }
    }
  }

  .footer {
    padding-top: 20px;
  }
}
</style>
