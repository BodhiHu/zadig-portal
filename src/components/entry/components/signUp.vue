<template>
  <div>
    <div>
      <h1 class="title">User Registration</h1>
      <h2 class="subtitle">Please enter new user information</h2>
      <el-form :model="signUpForm" ref="signUpForm" :rules="rules" label-position="left" label-width="80px">
        <el-form-item label="Username" prop="account">
          <el-input v-model="signUpForm.account" placeholder="Please Enter User Name"></el-input>
        </el-form-item>
        <el-form-item label="Nick Name" prop="name">
          <el-input v-model="signUpForm.name" placeholder="Please Enter A Nickname"></el-input>
        </el-form-item>
        <el-form-item label="Mail" prop="email">
          <el-input type="email" v-model="signUpForm.email" placeholder="Please Input Your Email"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="signUpForm.password" placeholder="Please Enter Password"></el-input>
        </el-form-item>
      </el-form>
      <el-button type="submit" @click="submit" class="btn-md btn-theme btn-block login-btn">Register</el-button>
    </div>
  </div>
</template>
<script>
import { userSignUpAPI } from '@api'
export default {
  name: 'signUp',
  props: {
    openLogin: Function
  },
  data () {
    return {
      mail: '',
      signUpForm: {
        name: '',
        account: '',
        password: '',
        email: '',
        phone: ''
      },
      rules: {
        account: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter User Name',
            trigger: 'blur'
          }
        ],
        email: [
          {
            type: 'string',
            required: true,
            message: 'Please Input Your Email',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: 'Please input the correct email address',
            trigger: ['blur', 'change']
          }
        ],
        name: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter A Nickname',
            trigger: 'blur'
          }
        ],
        password: [
          {
            type: 'string',
            required: true,
            message: 'Please Enter Password',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    async submit () {
      this.$refs.signUpForm.validate(async valid => {
        if (valid) {
          const payload = this.signUpForm
          const res = await userSignUpAPI(payload).catch(error =>
            console.log(error)
          )
          if (res) {
            this.$message.success('User registration is successful')
            this.openLogin()
          }
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
h1,
h2 {
  margin: 0;
}

.title {
  color: #303133;
  font-weight: 600;
  font-size: 24px;
  text-align: left;
}

.subtitle {
  margin: 10px 0 25px;
  color: #8590a6;
  font-weight: 400;
  font-size: 15px;
  text-align: left;
}

.content {
  color: #606266;
  font-weight: 500;
  font-size: 17px;
  text-align: left;
}

.btn-theme {
  color: #fff;
  background: @themeColor;
  border: none;
}

.input {
  background: #fff !important;
}

.btn-theme:hover {
  background: #0066ffc2;
}

.btn-md {
  width: 100%;
  padding: 12px 30px 11px 30px;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 1px;
  border-radius: 4px;
  cursor: pointer;
}

/deep/ .el-input-group__append {
  background-color: rgb(232, 240, 254);
  cursor: pointer;
}
</style>
