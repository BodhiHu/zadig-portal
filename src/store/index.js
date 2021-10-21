import Vue from 'vue'
import Vuex from 'vuex'
// Login
import login from './modules/login'

// Workflow
import workflow_list from './modules/workflow_list'

// Env
import product_list from './modules/product_list'

// Install Status
import signup_status from './modules/sign_up_status'

// Sidebar
import sidebar_status from './modules/sidebar_status'

// Service
import service_manage from './modules/service_manage'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    login,
    product_list,
    signup_status,
    workflow_list,
    sidebar_status,
    service_manage
  },
  strict: debug
})
