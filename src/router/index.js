import Vue from 'vue'
import VueRouter from 'vue-router'

const onboarding_home = () => import('@/components/entry/home.vue')

Vue.use(VueRouter)
const routes = [
  {
    path: '/v1',
    component: onboarding_home,
    meta: {},
    children: [
      { path: 'statistics', component: () => import(/* webpackChunkName: "Statistics" */ '@/components/statistics/view.vue'), meta: { title: 'Data Overview' } },
      {
        path: '/v1/insight',
        component: () => import(/* webpackChunkName: "Insight" */ '@/components/insight/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'Effectiveness Insights'
        },
        redirect: '/v1/insight/build',
        children: [
          {
            path: 'build',
            component: () => import(/* webpackChunkName: "Insight Build" */ '@/components/insight/build/view.vue'),
            meta: {
              requiresAuth: true,
              title: 'Build Efficiency'
            }
          },
          {
            path: 'test',
            component: () => import(/* webpackChunkName: "Insight Test" */ '@/components/insight/test/view.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test Performance'
            }
          },
          {
            path: 'service',
            component: () => import(/* webpackChunkName: "Insight Service" */ '@/components/insight/service/view.vue'),
            meta: {
              requiresAuth: true,
              title: 'Deployment Efficiency'
            }
          }
        ]
      },
      {
        path: 'status',
        component: () => import('@/components/projects/workflow/status/status.vue'),
        meta: {
          requiresAuth: true,
          title: 'Operating Status'
        }
      },
      {
        path: 'projects',
        component: () => import(/* webpackChunkName: "Project List" */ '@/components/projects/detail_ope/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'Project'
        }
      },
      {
        path: 'projects/detail/:project_name',
        component: () => import(/* webpackChunkName: "Project View" */ '@/components/projects/detail_ope/view.vue'),
        meta: {
          requiresAuth: true,
          title: 'Project'
        },
        children: [
          {
            path: 'detail',
            component: () => import(/* webpackChunkName: "Project Detail" */ '@/components/projects/detail_ope/detail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Project Details'
            }
          },
          {
            path: 'pipelines',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/list.vue'),
            meta: {
              requiresAuth: true,
              title: 'Workflow'
            }
          },
          {
            path: 'pipelines/multi/:workflow_name',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/productDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Workflow Details'
            }
          },
          {
            path: 'pipelines/custom/create',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/workflowEditor/customWorkflow'),
            meta: {
              requiresAuth: true,
              title: 'New Workflow'
            }
          },
          {
            path: 'pipelines/custom/edit/:workflow_name',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/workflowEditor/customWorkflow'),
            meta: {
              requiresAuth: true,
              title: 'Edit Workflow'
            }
          },
          {
            path: 'pipelines/multi/:workflow_name/:task_id',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/productTaskDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Mission Details'
            }
          },
          {
            path: 'pipelines/custom/:workflow_name/:task_id',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/productCustomTaskDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Workflow Task Details'
            }
          },
          {
            path: 'pipelines/multi/testcase/:workflow_name/:task_id/:test_name/:test_job_name',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/report/productWorkflowTestCase.vue'),
            meta: {
              requiresAuth: true,
              title: 'Testing Report'
            }
          },
          {
            path: 'pipelines/common/:workflow_name',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/commonDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Workflow Details'
            }
          },
          {
            path: 'pipelines/custom/:workflow_name',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/productCustomDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Workflow Task List'
            }
          },
          {
            path: 'pipelines/common/:workflow_name/:task_id',
            component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/commonTaskDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Mission Details'
            }
          },
          {
            path: 'services',
            component: () => import(/* webpackChunkName: "Project Service" */ '@/components/projects/serviceMgr/service.vue'),
            meta: {
              requiresAuth: true,
              title: 'Serve'
            }
          },
          {
            path: 'builds',
            component: () => import(/* webpackChunkName: "Project Build" */ '@/components/projects/build/config.vue'),
            meta: {
              requiresAuth: true,
              title: 'Construct'
            }
          },
          {
            path: 'builds/create',
            component: () => import(/* webpackChunkName: "Project Build" */ '@/components/projects/build/configDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'New Build'
            }
          },
          {
            path: 'builds/detail/:build_name',
            component: () => import(/* webpackChunkName: "Project Build" */ '@/components/projects/build/configDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Build Details'
            }
          },
          {
            path: 'test',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/common/function/function.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test Center'
            }
          },
          {
            path: 'test/function',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/common/function/function.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test'
            }
          },
          {
            path: 'test/function/:test_name',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/function/functionDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test'
            }
          },
          {
            path: 'test/add/function',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/function/functionDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test-Add To'
            }
          },
          {
            path: 'test/detail/function/:test_name',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/function/functionSummary.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test-Detailed Statistics'
            }
          },
          {
            path: 'test/detail/function/:test_name/:task_id',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/function/functionTaskDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test-Mission Details'
            }
          },
          {
            path: 'test/testcase/function/:workflow_name/:task_id/:test_name',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/report/testCase.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test-Testing Report'
            }
          },
          {
            path: 'test/testcase/function/:workflow_name/:task_id/test/:test_name',
            component: () => import(/* webpackChunkName: "Project Test" */ '@/components/projects/test/report/testCase.vue'),
            meta: {
              requiresAuth: true,
              title: 'Test-Testing Report'
            }
          },
          {
            path: 'scanner',
            component: () => import(/* webpackChunkName: "Project Scanner" */ '@/components/projects/scanner/home.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Code Scan'
            }
          },
          {
            path: 'scanner/create',
            component: () => import(/* webpackChunkName: "Project Scanner" */ '@/components/projects/scanner/create.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'New Scan'
            }
          },
          {
            path: 'scanner/edit/:scanner_name',
            component: () => import(/* webpackChunkName: "Project Scanner" */ '@/components/projects/scanner/create.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Edit Scan'
            }
          },
          {
            path: 'scanner/detail/:scanner_name',
            component: () => import(/* webpackChunkName: "Project Scanner" */ '@/components/projects/scanner/history.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Scan List'
            }
          },
          {
            path: 'scanner/detail/:scanner_name/task/:task_id',
            component: () => import(/* webpackChunkName: "Project Scanner" */ '@/components/projects/scanner/taskDetail.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Scan Task Details'
            }
          },
          {
            path: 'version',
            component: () => import(/* webpackChunkName: "Project Delivery" */ '@/components/projects/version/index.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Version Management'
            }
          },
          {
            path: 'version/create',
            component: () => import(/* webpackChunkName: "Project Delivery" */ '@/components/delivery/version/helm/createVersion.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Create Version'
            }
          },
          {
            path: 'version/detail/:id',
            component: () => import(/* webpackChunkName: "Project Delivery" */ '@/components/projects/version/detail.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Version Details'
            }
          },
          {
            path: 'envs',
            component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/home.vue'),
            meta: {
              requiresAuth: true,
              title: 'Surroundings'
            },
            children: [
              {
                path: 'create',
                component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/createEnv.vue'),
                meta: {
                  requiresAuth: true,
                  title: 'Create An Environment'
                }
              },
              {
                path: 'detail',
                component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/envDetail.vue'),
                meta: {
                  requiresAuth: true,
                  title: 'Surroundings'
                }
              },
              {
                path: ':env_name/log',
                component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/changeLog.vue'),
                meta: {
                  requiresAuth: true,
                  title: 'Change Log'
                }
              },
              {
                path: 'externalConfig',
                component: () => import(/* webpackChunkName: "Project Hosting Env" */ '@/components/projects/env/hostEnv/editExternalConfig.vue'),
                meta: {
                  requiresAuth: true,
                  title: 'Configure hosting environment'
                }
              },
              {
                path: 'detail/:service_name',
                component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/serviceDetail.vue'),
                meta: {
                  requiresAuth: true,
                  title: 'Service Details'
                }
              },
              {
                path: 'detail/:service_name/pm',
                component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/pmServiceDetail.vue'),
                meta: {
                  requiresAuth: true,
                  title: 'Service Details'
                }
              },
              {
                path: 'detail/:service_name/config',
                component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/serviceConfig.vue'),
                meta: {
                  requiresAuth: true,
                  title: 'Configuration Details'
                }
              },
              {
                path: 'detail/:env_name/envConfig',
                component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/env_detail/envConfig/home.vue'),
                meta: {
                  requiresAuth: true,
                  title: 'Environment configuration'
                }
              }
            ]
          }
        ]
      },
      {
        path: 'template',
        component: () => import(/* webpackChunkName: "Template Library" */ '@/components/templateLibrary/index.vue'),
        meta: {
          title: 'Template Library'
        },
        children: [
          {
            path: '',
            redirect: 'k8s-yamls'
          },
          {
            path: 'charts',
            component: () => import(/* webpackChunkName: "Chart Template" */ '@/components/templateLibrary/chart/index.vue'),
            meta: {
              title: 'Chart Template Library'
            }
          }, {
            path: 'dockerfiles',
            component: () => import(/* webpackChunkName: "Dockerfile Template" */ '@/components/templateLibrary/dockerfile/index.vue'),
            meta: {
              title: 'Dockerfile Template Library'
            }
          },
          {
            path: 'k8s-yamls',
            component: () => import(/* webpackChunkName: "K8s Template" */ '@/components/templateLibrary/k8s/index.vue'),
            meta: {
              title: 'Kubernetes YAML Template Library'
            }
          },
          {
            path: 'builds',
            component: () => import(/* webpackChunkName: "Build Template" */ '@/components/templateLibrary/builds/index.vue'),
            meta: {
              title: 'Build A Template Library'
            }
          }]
      },
      {
        path: 'delivery',
        component: () => import(/* webpackChunkName: "Project Delivery" */ '@/components/delivery/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'Delivery Center'
        },
        children: [
          {
            path: '',
            redirect: 'version'
          },
          {
            path: 'version',
            component: () => import(/* webpackChunkName: "Project Delivery" */ '@/components/delivery/version/index.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Version Management'
            }
          },
          {
            path: 'version/detail/:project_name/:id',
            component: () => import(/* webpackChunkName: "Project Delivery" */ '@/components/delivery/version/detail.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Version Details'
            }
          },
          {
            path: 'artifacts',
            component: () => import(/* webpackChunkName: "Project Delivery" */ '@/components/delivery/artifacts/index.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Delivery Tracking'
            }
          },
          {
            path: 'artifacts/detail/:id',
            component: () => import(/* webpackChunkName: "Project Delivery" */ '@/components/delivery/artifacts/detail.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: false,
              title: 'Delivery Tracking'
            }
          }
        ]
      },
      {
        path: 'projects/create',
        component: () => import(/* webpackChunkName: "Project" */ '@/components/projects/detail_ope/create.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/k8s/info',
        component: () => import(/* webpackChunkName: "Onboarding K8s" */ '@/components/projects/guide/k8s/basicInfo.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/k8s/service',
        component: () => import(/* webpackChunkName: "Onboarding K8s" */ '@/components/projects/guide/k8s/service.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/k8s/runtime',
        component: () => import(/* webpackChunkName: "Onboarding K8s" */ '@/components/projects/guide/common/runtime.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/k8s/delivery',
        component: () => import(/* webpackChunkName: "Onboarding K8s" */ '@/components/projects/guide/k8s/delivery.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/host/config',
        component: () => import(/* webpackChunkName: "Onboarding Host" */ '@/components/projects/guide/host/hostConfig.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/helm/info',
        component: () => import(/* webpackChunkName: "Onboarding Helm" */ '@/components/projects/guide/helm/basicInfo.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/helm/service',
        component: () => import(/* webpackChunkName: "Onboarding Helm" */ '@/components/projects/guide/helm/service.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/helm/runtime',
        component: () => import(/* webpackChunkName: "Onboarding Helm" */ '@/components/projects/guide/helm/runtime.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/helm/delivery',
        component: () => import(/* webpackChunkName: "Onboarding Helm" */ '@/components/projects/guide/helm/delivery.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/pm/info',
        component: () => import(/* webpackChunkName: "Onboarding Host" */ '@/components/projects/guide/pm/info.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/pm/config',
        component: () => import(/* webpackChunkName: "Onboarding Host" */ '@/components/projects/guide/pm/config.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/pm/deploy',
        component: () => import(/* webpackChunkName: "Onboarding Host" */ '@/components/projects/guide/pm/deploy.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/create/:project_name/pm/delivery',
        component: () => import(/* webpackChunkName: "Onboarding Host" */ '@/components/projects/guide/pm/delivery.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Project'
        }
      },
      {
        path: 'projects/edit/:project_name',
        component: () => import(/* webpackChunkName: "Project" */ '@/components/projects/detail_ope/create.vue'),
        meta: {
          requiresAuth: true,
          title: 'Modify An Item'
        }
      },
      {
        path: 'projects/initialize/:project_name',
        component: () => import(/* webpackChunkName: "Project Init" */ '@/components/projects/detail_ope/initialize.vue'),
        meta: {
          requiresAuth: true,
          title: 'Project Details'
        }
      },
      {
        path: 'projects/detail/:project_name/pipelines',
        component: () => import(/* webpackChunkName: "Project Workflow" */ '@/components/projects/workflow/list.vue'),
        meta: {
          requiresAuth: true,
          title: 'Workflow'
        }
      },
      {
        path: 'projects/detail/:project_name/services',
        component: () => import(/* webpackChunkName: "Project Service" */ '@/components/projects/serviceMgr/service.vue'),
        meta: {
          requiresAuth: true,
          title: 'Serve'
        }
      },
      {
        path: 'projects/detail/:project_name/envs',
        component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'Surroundings'
        },
        children: [
          {
            path: 'create',
            component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/createEnv.vue'),
            meta: {
              requiresAuth: true,
              title: 'Create An Environment'
            }
          },
          {
            path: 'detail',
            component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/envDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Surroundings'
            }
          },
          {
            path: 'externalConfig',
            component: () => import(/* webpackChunkName: "Project External Env" */ '@/components/projects/env/hostEnv/editExternalConfig.vue'),
            meta: {
              requiresAuth: true,
              title: 'Configure hosting environment'
            }
          },
          {
            path: 'detail/:service_name',
            component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/serviceDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Service Details'
            }
          },
          {
            path: 'detail/:service_name/pm',
            component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/pmServiceDetail.vue'),
            meta: {
              requiresAuth: true,
              title: 'Service Details'
            }
          },
          {
            path: 'detail/:service_name/config',
            component: () => import(/* webpackChunkName: "Project Env" */ '@/components/projects/env/inner_env/serviceConfig.vue'),
            meta: {
              requiresAuth: true,
              title: 'Configuration Details'
            }
          }
        ]
      },
      {
        path: 'projects/detail/:project_name/rbac',
        component: () => import(/* webpackChunkName: "Project RBAC" */ '@/components/projects/rbac/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'Authority Management'
        }
      },
      {
        path: 'projects/detail/:project_name/policy',
        component: () => import(/* webpackChunkName: "Project Policy" */ '@/components/projects/policy/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'Collaborative Mode'
        }
      },
      {
        path: 'projects/detail/:project_name/host',
        component: () => import(/* webpackChunkName: "Project Host Management" */ '@/components/projects/host/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'Host Management'
        }
      }
    ]
  },
  {
    path: '/v1/tests',
    component: onboarding_home,
    meta: {
      requiresAuth: true,
      title: 'Test Center'
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "Quality Manage" */ '@/components/projects/test/common/function/function.vue'),
        meta: {
          requiresAuth: true,
          title: 'Test Center'
        }
      }
    ]
  },
  {
    path: '/workflows',
    component: () => import(/* webpackChunkName: "Workflow Editor" */ '@/components/projects/workflow/workflowEditor/view.vue'),
    meta: {
      requiresAuth: true,
      title: 'Workflow Management'
    },
    children: [
      {
        path: 'product/create',
        component: () => import(/* webpackChunkName: "Workflow Editor" */ '@/components/projects/workflow/workflowEditor/productWorkflow/workflow.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Workflow'
        }
      },
      {
        path: 'product/edit/:name',
        component: () => import(/* webpackChunkName: "Workflow Editor" */ '@/components/projects/workflow/workflowEditor/productWorkflow/workflow.vue'),
        meta: {
          requiresAuth: true,
          title: 'Edit Workflow'
        }
      },
      {
        path: 'common/create',
        component: () => import(/* webpackChunkName: "Workflow Editor" */ '@/components/projects/workflow/workflowEditor/commonWorkflow/workflow.vue'),
        meta: {
          requiresAuth: true,
          title: 'New Workflow'
        }
      },
      {
        path: 'common/edit/:name',
        component: () => import(/* webpackChunkName: "Workflow Editor" */ '@/components/projects/workflow/workflowEditor/commonWorkflow/workflow.vue'),
        meta: {
          requiresAuth: true,
          title: 'Edit Workflow'
        }
      }
    ]
  },
  {
    path: '/v1/profile',
    component: onboarding_home,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "User Setting" */ '@/components/profile/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'Account Settings'
        }
      },
      {
        path: 'info',
        component: () => import(/* webpackChunkName: "User Setting" */ '@/components/profile/manage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Account Settings'
        }
      }
    ]
  },
  {
    path: '/v1/system',
    component: onboarding_home,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/home.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'System Settings'
        }
      },
      {
        path: 'apps',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/apps/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Package Management'
        }
      },
      {
        path: 'imgs',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/imgs/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Build Image Management'
        }
      },
      {
        path: 'plugins',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/plugins/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Workflow Tasks'
        }
      },
      {
        path: 'registry',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/registry/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Mirror Repository'
        }
      },
      {
        path: 'storage',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/storage/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Object Storage'
        }
      },
      {
        path: 'helm',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/helm/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'HELM Storehouse'
        }
      },
      {
        path: 'cluster',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/cluster/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Cluster Management'
        }
      },
      {
        path: 'host',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/host'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Host Management'
        }
      },
      {
        path: 'integration',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/integration/home.vue'),
        meta: {
          requiresAuth: true,
          title: 'System Integration'
        }
      },
      {
        path: 'config',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/config/home.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'System Configuration'
        },
        children: [
          {
            path: 'manage/quota',
            component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/config/quota.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: true,
              title: 'System Quota'
            }
          },
          {
            path: 'manage/proxy',
            component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/config/proxy.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: true,
              title: 'Proxy Configuration'
            }
          },
          {
            path: 'manage/cache',
            component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/config/cache.vue'),
            meta: {
              requiresAuth: true,
              requiresSuperAdmin: true,
              title: 'Cache Cleaning'
            }
          }
        ]
      },
      {
        path: 'users',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/users/home.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'User Management'
        }
      },
      {
        path: 'announcement',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/announcement/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Announcement Settings'
        }
      },
      {
        path: 'auditlog',
        component: () => import(/* webpackChunkName: "Setting" */ '@/components/setting/auditlog/manage.vue'),
        meta: {
          requiresAuth: true,
          requiresSuperAdmin: true,
          title: 'Operation Log'
        }
      }
    ]
  },
  {
    path: '/mobile',
    component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/index.vue'),
    meta: {
      title: 'Zadig'
    },
    children: [
      {
        path: 'status',
        component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/pipelines/status.vue'),
        meta: {
          requiresAuth: true,
          title: 'Operating Status'
        }
      },
      {
        path: 'envs',
        component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/envs/envs.vue'),
        meta: {
          requiresAuth: true,
          title: 'Surroundings'
        }
      },
      {
        path: 'envs/detail/:project_name',
        component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/envs/envDetail'),
        meta: {
          requiresAuth: true,
          title: 'Surroundings'
        }
      },
      {
        path: 'envs/detail/:project_name/:service_name',
        component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/envs/serviceDetail.vue'),
        meta: {
          requiresAuth: true,
          title: 'Service Details'
        }
      },
      {
        path: 'pipelines',
        component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/pipelines/pipelines.vue'),
        meta: {
          requiresAuth: true,
          title: 'Workflow'
        }
      },
      {
        path: 'pipelines/project/:project_name/multi/:workflow_name/:task_id',
        component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/pipelines/multi_task.vue'),
        meta: {
          requiresAuth: true,
          title: 'Mission Details'
        }
      },
      {
        path: 'pipelines/project/:project_name/multi/:workflow_name',
        component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/pipelines/detail.vue'),
        meta: {
          requiresAuth: true,
          title: 'Workflow Details'
        }
      },
      {
        path: 'profile',
        component: () => import(/* webpackChunkName: "Mobile" */ '@/mobile/profile.vue'),
        meta: {
          requiresAuth: true,
          title: 'Account Settings'
        }
      }
    ]
  },
  {
    path: '/signin',
    component: () => import('@/components/entry/login.vue'),
    meta: {
      title: 'Log In'
    }
  },
  {
    path: '/404',
    component: () => import('@/components/entry/404.vue'),
    meta: {
      title: '404 Not Found'
    }
  },
  {
    path: '/',
    component: () => import('@/components/entry/login.vue'),
    meta: {
      title: 'Log In'
    }
  },
  {
    path: '/login/password',
    component: () => import('@/components/entry/passwordLogin.vue'),
    meta: {
      title: 'Log In'
    }
  },
  {
    path: '*',
    component: () => import('@/components/entry/404.vue'),
    meta: {
      title: '404 Not Found'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: routes
})

router.onError((error) => {
  console.log(error, router)
  const pattern = /Loading chunk (\d)+ failed/g
  const isChunkLoadFailed = error.message.match(pattern)
  if (isChunkLoadFailed) {
    window.location.replace(window.location.href)
  }
})

export default router
