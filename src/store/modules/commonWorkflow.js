import * as types from '../mutations'
import { } from '@api'

import { cloneDeep } from 'lodash'

const tabInfo = [{
  tab: 'Basic Information',
  selected: true,
  isCurrent: true
},
{
  tab: 'Construct',
  selected: false,
  isCurrent: false,
  type: 'buildv3'
}, {
  tab: 'Expand',
  selected: false,
  isCurrent: false,
  type: 'trigger'
}]

const commonInfo = {
  name: '',
  project_name: '',
  description: '',
  parameters: [],
  sub_tasks: [],
  buildv3: {},
  trigger: {}
}

const state = {
  tabs: cloneDeep(tabInfo),
  commonInfo: cloneDeep(commonInfo)

}

const getters = {
  currentTab: (state) => {
    return state.tabs.filter(tab => tab.isCurrent)[0].tab
  },
  selectedTabs: (state) => {
    return state.tabs.filter(tab => tab.selected)
  }
}

const actions = {

}

const mutations = {
  [types.UPDATE_TABS] (state, payload) {
    if (payload.type === 'delete') {
      const tab = state.tabs.find(tab => tab.tab === payload.tab)
      tab.selected = false
      if (tab.isCurrent) state.tabs[0].isCurrent = true
    } else {
      state.tabs.forEach(tab => {
        tab.isCurrent = false
        if ((payload.tab && tab.tab === payload.tab) || (payload.tabType && tab.type === payload.tabType)) {
          tab.selected = true
          tab.isCurrent = true
        }
      })
    }
  },
  [types.UPDATE_COMMON_INFO] (state, payload) {
    Object.assign(state.commonInfo, payload)
  },
  [types.RESET_COMMON_WORKFLOW] (state) {
    state.tabs = cloneDeep(tabInfo)
    state.commonInfo = cloneDeep(commonInfo)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
