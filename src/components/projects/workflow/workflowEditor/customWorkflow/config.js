const tabList = [
  {
    label: 'Interface',
    name: 'ui'
  },
  {
    label: 'YAML',
    name: 'yaml'
  }
]
const buildTabList = [
  {
    label: 'Variable',
    name: 'env'
  },
  {
    label: 'Branch Configuration',
    name: 'branch'
  }
]
const jobTabList = [
  {
    label: 'Basic Configuration',
    name: 'base'
  },
  {
    label: 'Variable',
    name: 'env'
  }
]
const jobTypeList = [
  // {
  //   label: 'Customize',
  //   name: 'custom',
  //   tip: 'Customize'
  // },
  {
    label: 'Construct',
    name: 'zadig-build',
    type: 'zadig-build',
    is_offical: true,
    description: 'Can Be Directly Quoted「Project」-「Construct」Configuration in the module'
  },
  {
    label: 'Deploy',
    name: 'zadig-deploy',
    type: 'zadig-deploy',
    is_offical: true,
    description: 'Updatable service image in container form'
  },
  {
    label: 'General Task',
    name: 'freestyle',
    type: 'freestyle',
    is_offical: true,
    description: 'Support Pulling Code、Implement Shell Script、File storage and other functions'
  }
  // {
  //   label: 'Test',
  //   is_offical: true,
  //   name: '',
  //   description: 'coming soon'
  // }
]
const configList = [
  {
    label: 'Variable',
    value: 'env'
  },
  {
    label: 'Trigger',
    value: 'webhook',
    drawerSize: '70%',
    drawerConfirmText: 'Save',
    drawerCancelText: 'Cancel',
    drawerHideButton: true
  },
  // {
  //   label: 'Notice',
  //   value: 'notify'
  // },
  {
    label: 'Advanced Configuration',
    value: 'high'
  }
]
const jobType = {
  build: 'zadig-build',
  deploy: 'zadig-deploy',
  approval: 'zadig-approval',
  common: 'freestyle',
  freestyle: 'freestyle',
  plugin: 'plugin'
}
const editorOptions = {
  mode: 'yaml',
  theme: 'neo',
  lineNumbers: true,
  lineWrapping: true,
  indentUnit: 2,
  tabSize: 2,
  indentWithTabs: false,
  autofocus: true,
  extraKeys: {
    'Ctrl-Space': 'autocomplete'
  }
}
const buildEnvs = [
  {
    variable: '$WORKSPACE',
    desc: 'Work List'
  },
  {
    variable: '$TASK_ID',
    desc: 'Workflow Tasks ID'
  },
  {
    variable: '$BUILD_URL',
    desc: 'Build Task URL'
  },
  {
    variable: '$CI',
    desc: 'Value Is Equal To true，Indicates that the current environment is CI/CD Surroundings'
  },
  {
    variable: '$ZADIG',
    desc: 'Value Is Equal To true，Expressed In ZADIG Execute the script on the system'
  },
  {
    variable: '$REPONAME_<index>',
    desc: 'Specify <index> The Name Of The Codebase，In <index> The location of the code in the build configuration，The Initial Value Is 0'
  },
  {
    variable: '$REPO_<index>',
    desc:
      'Specify <index> The Name Of The Codebase（Can be used for code information related variable names，Underscore in repository name "-" Replace With Underscore"_"），In <index> The location of the code in the build configuration，The Initial Value Is 0'
  },
  {
    variable: '$<REPO>_PR',
    // eslint-disable-next-line
    desc: 'Code Used When Building Pull Request Information，In <REPO> Is the specific code repository name，When using, you can fill in the warehouse name or combine $REPO_<index> Variable Usage，For Example By eval PR=\\${${REPO_0}_PR} Way to get the first codebase Pull Request Information'
  },
  {
    variable: '$<REPO>_BRANCH',
    // eslint-disable-next-line
    desc: 'Code branch information used when building，In <REPO> Is the specific code repository name，When using, you can fill in the warehouse name or combine $REPO_index Variable Usage，For Example By eval BRANCH=\\${${REPO_0}_BRANCH} Way to get the branch information of the first code base'
  },
  {
    variable: '$<REPO>_TAG',
    // eslint-disable-next-line
    desc: 'Build With Code Tag Information，In <REPO> Is the specific code repository name，When using, you can fill in the warehouse name or combine $REPO_index Variable Usage，For Example By eval TAG=\\${${REPO_0}_TAG} Way to get the branch information of the first code base'
  },
  {
    variable: '$<REPO>_COMMIT_ID',
    // eslint-disable-next-line
    desc: 'Build With Code Commit Information，In <REPO> Is the specific code repository name，When using, you can fill in the warehouse name or combine $REPO_index]Variable Usage，For Example By eval COMMITID=\\${${REPO_0}_COMMIT_ID} Way to get the first codebase COMMIT Information'
  },
  {
    variable: '',
    desc: 'If other code sources are used，$<REPO>_PR And $<REPO>_COMMIT_ID Variable Not Supported'
  }
]
const globalConstEnvs = [
  '{{.project}}',
  '{{.workflow.name}}',
  '{{.workflow.task.id}}',
  '{{.workflow.task.creator}}',
  '{{.workflow.task.timestamp}}'
]
export {
  tabList,
  buildTabList,
  configList,
  jobTabList,
  jobTypeList,
  editorOptions,
  jobType,
  buildEnvs,
  globalConstEnvs
}
