import store from '../store'
import { isEmpty } from 'lodash'

export function checkPermissionSync (opts) {
  let globalPermission = store.getters.globalPermission
  // Get data when it doesn't exist
  if (isEmpty(globalPermission)) {
    store.dispatch('getGlobalPermission')
    globalPermission = store.getters.globalPermission
  }
  const isSystemAdmin = globalPermission.is_system_admin
  const projectAdminList = globalPermission.project_admin_list ? globalPermission.project_admin_list : []
  const { type, projectName, action, actions, resource, operator } = opts
  // System administrator release
  if (isSystemAdmin) {
    return true
  }
  if (projectAdminList.includes(projectName)) {
    return true
  }
  // System role permission judgment
  if (type === 'system' && (action || actions)) {
    const systemVerbs = globalPermission.system_verbs ? globalPermission.system_verbs : []
    if (systemVerbs.length > 0) {
      if (operator && actions) {
        if (operator === 'and') {
          for (const action of actions) {
            if (!systemVerbs.includes(action)) {
              return false
            }
          }
        }
        if (operator === 'or') {
          for (const action of actions) {
            if (systemVerbs.includes(action)) {
              return true
            }
          }
        }
      } else {
        return systemVerbs.includes(action)
      }
    } else {
      return false
    }
    // Project role permission judgment
  } else if (type === 'project' || projectName) {
    const currentProjectPermissions = store.getters.projectPermissions[projectName] ? store.getters.projectPermissions[projectName] : {}
    const projectCollaborativeModeCheckingResult = () => {
      if (!isEmpty(resource) && (!isEmpty(currentProjectPermissions.workflow_verbs_map[resource.name]) || !isEmpty(currentProjectPermissions.environment_verbs_map[resource.name]))) {
        if (resource.type === 'workflow') {
          const resourcePermission = currentProjectPermissions.workflow_verbs_map[resource.name]
          return resourcePermission.includes(action)
        } else if (resource.type === 'env') {
          const resourcePermission = currentProjectPermissions.environment_verbs_map[resource.name]
          return resourcePermission.includes(action)
        }
      } else {
        return false
      }
    }
    const projectCheckingResult = () => {
      if (!isEmpty(currentProjectPermissions) && (action || actions)) {
        const projectVerbs = currentProjectPermissions.project_verbs ? currentProjectPermissions.project_verbs : []
        if (projectVerbs.length > 0) {
          if (operator && actions) {
            if (operator === 'and') {
              for (const action of actions) {
                if (!projectVerbs.includes(action)) {
                  return false
                }
              }
            }
            if (operator === 'or') {
              for (const action of actions) {
                if (projectVerbs.includes(action)) {
                  return true
                }
              }
            }
          } else {
            return projectVerbs.includes(action)
          }
        } else {
          return false
        }
      } else {
        return false
      }
    }
    return projectCheckingResult() || projectCollaborativeModeCheckingResult()
  } else {
    return false
  }
}

export async function permissionCheckingLogic (opts) {
  let globalPermission = store.getters.globalPermission
  // Get data when it doesn't exist
  if (isEmpty(globalPermission)) {
    await store.dispatch('getGlobalPermission')
    globalPermission = store.getters.globalPermission
  }
  const isSystemAdmin = globalPermission.is_system_admin
  const projectAdminList = globalPermission.project_admin_list ? globalPermission.project_admin_list : []
  const { type, projectName, action, actions, resource, operator } = opts
  // System administrator release
  if (isSystemAdmin) {
    return true
  }
  if (projectAdminList.includes(projectName)) {
    return true
  }
  // System role permission judgment
  if (type === 'system' && (action || actions)) {
    const systemVerbs = globalPermission.system_verbs ? globalPermission.system_verbs : []
    if (systemVerbs.length > 0) {
      if (operator && actions) {
        if (operator === 'and') {
          for (const action of actions) {
            if (!systemVerbs.includes(action)) {
              return false
            }
          }
        }
        if (operator === 'or') {
          for (const action of actions) {
            if (systemVerbs.includes(action)) {
              return true
            }
          }
        }
      } else {
        return systemVerbs.includes(action)
      }
    } else {
      return false
    }
    // Project role permission judgment
  } else if (type === 'project' || projectName) {
    const currentProjectPermissions = store.getters.projectPermissions[projectName] ? store.getters.projectPermissions[projectName] : {}
    const projectCollaborativeModeCheckingResult = () => {
      if (!isEmpty(resource) && (!isEmpty(currentProjectPermissions.workflow_verbs_map[resource.name]) || !isEmpty(currentProjectPermissions.environment_verbs_map[resource.name]))) {
        if (resource.type === 'workflow') {
          const resourcePermission = currentProjectPermissions.workflow_verbs_map[resource.name]
          return resourcePermission.includes(action)
        } else if (resource.type === 'env') {
          const resourcePermission = currentProjectPermissions.environment_verbs_map[resource.name]
          return resourcePermission.includes(action)
        }
      } else {
        return false
      }
    }
    const projectCheckingResult = () => {
      if (!isEmpty(currentProjectPermissions) && (action || actions)) {
        const projectVerbs = currentProjectPermissions.project_verbs ? currentProjectPermissions.project_verbs : []
        if (projectVerbs.length > 0) {
          if (operator && actions) {
            if (operator === 'and') {
              for (const action of actions) {
                if (!projectVerbs.includes(action)) {
                  return false
                }
              }
            }
            if (operator === 'or') {
              for (const action of actions) {
                if (projectVerbs.includes(action)) {
                  return true
                }
              }
            }
          } else {
            return projectVerbs.includes(action)
          }
        } else {
          return false
        }
      } else {
        return false
      }
    }
    return projectCheckingResult() || projectCollaborativeModeCheckingResult()
  } else {
    return false
  }
}
