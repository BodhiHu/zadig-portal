export function wordTranslate (word, category, subitem = '') {
  const wordComparisonTable = {
    container: {
      'NOT-RUNNING': 'Not Functioning Properly',
      RUNNING: 'Normal Operation',
      STOPPED: 'Container Is Stopped',
      EXITED: 'Container Exited',
      RESTARTING: 'Container keeps restarting'
    },
    service: {
      Running: 'Running',
      Pending: 'Waiting',
      CrashLoopBackOff: 'An Error Occurred',
      '': '*'
    },
    product: {
      Running: 'Normal',
      Deleting: 'Deleting',
      Updating: 'Updating',
      Unstable: 'Unstable Operation',
      Error: 'Internal Error'
    },
    pipeline: {
      task: {
        '': 'Not Running',
        created: 'In The Line',
        waiting: 'In The Line',
        running: 'Running',
        failed: 'Fail',
        passed: 'Success',
        timeout: 'Time Out',
        cancelled: 'Cancel',
        blocked: 'Block',
        queued: 'In Queue',
        skipped: 'Jump Over',
        prepare: 'Prepare The Environment',
        reject: 'Reject'
      }
    },
    approval: {
      status: {
        '': 'Pending Review',
        waiting: 'In The Line',
        running: 'Running',
        failed: 'Fail',
        passed: 'Success',
        timeout: 'Time Out',
        cancelled: 'Cancel',
        blocked: 'Block',
        queued: 'In Queue',
        skipped: 'Jump Over',
        prepare: 'Prepare The Environment',
        reject: 'Reject',
        approve: 'Pass'
      }
    },
    project: {
      vars: {
        unused: 'Unused',
        present: 'Used',
        new: 'Value Is Empty'
      }
    },
    setting: {
      cluster: {
        pending: 'Waiting For Access',
        normal: 'Normal', // Normal
        abnormal: 'Abnormal', // Abnormal
        disconnected: 'Active Disconnect'
      }
    },
    workflowStage: {
      build: 'Build And Deploy',
      artifact: 'Deliverables Deployment',
      test: 'Test',
      distribute: 'Distribution Deployment'
    }
  }
  if (subitem === '') {
    return wordComparisonTable[category][word]
  } else if (subitem !== '') {
    return wordComparisonTable[category][subitem][word]
  }
}

export function translateTaskStatus (status) {
  return wordTranslate(status, 'pipeline', 'task')
}

export function colorTranslate (word, category, subitem = '') {
  if (typeof word === 'undefined' || word === '') {
    return 'color-notrunning'
  } else {
    const colorComparisonTable = {
      pipeline: {
        task: {
          created: 'color-created',
          waiting: 'color-created',
          running: 'color-running',
          failed: 'color-failed',
          passed: 'color-passed',
          timeout: 'color-timeout',
          cancelled: 'color-cancelled',
          reject: 'color-failed',
          approve: 'color-passed'
        }
      },
      approval: {
        status: {
          '': 'color-created',
          reject: 'color-failed',
          approve: 'color-passed',
          waiting: 'color-created',
          running: 'color-running',
          failed: 'color-failed',
          passed: 'color-passed',
          timeout: 'color-timeout',
          cancelled: 'color-cancelled'
        }
      },
      environment: {
        status: {
          Running: 'status-running',
          Creating: 'status-primary',
          Updating: 'status-primary',
          Succeeded: 'status-success',
          Unstable: 'status-warning',
          Deleting: 'status-warning',
          Error: 'status-danger',
          Unknown: 'status-info'
        }
      }
    }
    if (word !== '' && subitem === '') {
      return colorComparisonTable[category][word]
    } else if (word !== '' && subitem !== '') {
      return colorComparisonTable[category][subitem][word]
    }
  }
}

export function calcTaskStatusColor (status) {
  return colorTranslate(status, 'pipeline', 'task')
}

export function calcEnvStatusColor (status) {
  return colorTranslate(status, 'environment', 'status')
}

export function translateEnvStatus (status, updateble) {
  if (status === 'Running' && updateble) {
    return 'Environment can be updated'
  } else if (status === 'Creating') {
    return 'Creating'
  } else if (status === 'Running') {
    return 'Running'
  } else if (status === 'Updating') {
    return 'Updating'
  } else if (status === 'Succeeded') {
    return 'Normal'
  } else if (status === 'Unstable') {
    return 'Unstable Operation'
  } else if (status === 'Deleting') {
    return 'Deleting'
  } else if (status === 'Error') {
    return 'Internal Error'
  } else if (status === 'Unknown') {
    return 'Unknown'
  }
}

export const serviceTypeMap = {
  k8s: 'Container'
}

export function translateServiceType (type) {
  return serviceTypeMap[type]
}

export const subTaskTypeMap = {
  distribute2kodo: 'Storage Distribution',
  release_image: 'Mirror Distribution'
}

export function translateSubTaskType (type) {
  return subTaskTypeMap[type]
}

export default {
  wordTranslate,
  translateTaskStatus,

  colorTranslate,
  calcTaskStatusColor,
  calcEnvStatusColor,

  translateServiceType,
  translateSubTaskType
}
