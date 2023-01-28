// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;
export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          path: '/user',
          redirect: '/user/login',
        },
        {
          name: '登录',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/detail',
          component: '../layouts/BlankLayout',
          routes: [
            {
              name: '月工资报表',
              path: '/detail/salary/salaryReport',
              component: './salary/salaryReport',
            },
            {
              name: '项目工资报表',
              path: '/detail/salary/projectReport',
              component: './salary/projectReport',
            },
            {
              name: '工伤事件详情',
              path: '/detail/incidents/detail',
              component: './incidents/detail',
            },
            {
              name: '社保公积金详情',
              path: '/detail/socialfund/detail',
              component: './socialfund/detail',
            },
            {
              name: '政策中心',
              path: '/detail/policy/policylist',
              component: './policy/policyList',
            },
            {
              name: '政策详情',
              path: '/detail/policy/policydetail',
              component: './policy/detail',
            },
          ],
        },
        {
          // 花名册=》个人详情
          path: '/m',
          component: '../layouts/PersonerLayout',
          routes: [
            {
              name: '档案',
              path: '/m/personerInfo/archives',
              component: './members/Marchives',
            },
            {
              name: '薪酬',
              path: '/m/personerInfo/pay',
              component: './members/Mpay',
            },
            {
              name: '社保',
              path: '/m/personerInfo/security',
              component: './members/Msecurity',
            },
            {
              name: '假勤信息',
              path: '/m/personerInfo/attendance',
              component: './members/attendance',
            },
            {
              name: '证件信息',
              path: '/m/personerInfo/certificate',
              component: './members/certificate',
            },
            {
              component: './NoFoundPage',
            },
          ],
        },
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['admin', 'user'],
          routes: [
            // {
            //   path: '/',
            //   redirect: '/employeeManage/employeeList',
            // },
            {
              path: '/employeeManage',
              name: '人员管理',
              // icon: 'icon-renyuanguanli',
              icon: 'Team',
              routes: [
                {
                  name: '人员信息',
                  icon: 'UsergroupAdd',
                  path: '/employeeManage/employeeList',
                  component: './employeeManage/employeeList',
                },
                {
                  name: '证件信息',
                  icon: 'CreditCard',
                  path: '/employeeManage/credentials',
                  component: './employeeManage/credentials',
                },
              ]
            },
            {
              name: '薪酬',
              icon: 'icon-xinchou',
              path: '/salary',
              component: './salary',
            },
            {
              name: '社保公积金',
              icon: 'SafetyCertificate',
              path: '/socialfund',
              component: './socialfund',
            },
            {
              name: '商险',
              icon: 'Insurance',
              path: '/insurance',
              component: './insurance',
            },
            {
              name: '员工合同',
              icon: 'reconciliation',
              path: '/contract',
              component: './contract',
            },
            {
              name: '用工事件',
              icon: 'solution',
              path: '/incidents',
              component: './incidents',
            },
            {
              name: '政策管理',
              icon: 'fileDone',
              path: '/policy',
              routes: [
                {
                  path: '/policy',
                  name: '政策列表',
                  component: './policy',
                  hideInMenu: true,
                },
                {
                  path: '/policy/edit',
                  name: '新增政策',
                  component: './policy/edit',
                  hideInMenu: true,
                },
              ],
            },
            {
              name: '系统设置',
              icon: 'Setting',
              path: '/systemSet',
              routes: [
                {
                  name: '部门管理',
                  icon: 'Apartment',
                  path: '/systemSet/departMange',
                  component: './systemSet/departMange',
                },
                {
                  name: '标签管理',
                  icon: 'Tags',
                  path: '/systemSet/tagsManage',
                  component: './systemSet/tagsManage',
                },
                {
                  name: '账号管理',
                  icon: 'icon-zhanghaoguanli',
                  path: '/systemSet/account',
                  component: './systemSet/account',
                },
                {
                  name: '预警管理',
                  icon: 'Dashboard',
                  path: '/systemSet/warnManage',
                  component: './systemSet/warnManage',
                },
              ]
            },
            {
              icon: 'Calculator',
              name: '结算管理',
              path: '/settlementList',
              routes:[
                {
                  name: '结算列表',
                  icon: 'icon-jiesuanliebiao',
                  path: '/settlementList',
                  component: './settlementList'
                },
              ],
            },
            {
              icon: 'calendar',
              name: '假勤管理',
              icon: 'Calendar',
              path: '/attendanceManage',
              routes: [
                {
                  name: '假勤信息',
                  icon: 'icon-jiaqixinxi',
                  path: '/attendanceManage/attendanceInfo',
                  component: './attendanceManage/attendanceInfo',
                },
                {
                  name: '离职信息',
                  icon: 'UsergroupDelete',
                  path: '/attendanceManage/departureInfo',
                  component: './attendanceManage/departureInfo',
                },
                {
                  name: '年假未休监控',
                  icon: 'Control',
                  path: '/attendanceManage/annualControl',
                  component: './attendanceManage/annualControl',
                },
                {
                  name: '年假规则设置',
                  icon: 'icon-nianjiaguizeshezhi',
                  path: '/attendanceManage/annualRules',
                  component: './attendanceManage/annualRules',
                },
             ],
            },
            {
              name: '薪酬福利',
              icon: 'Wallet',
              path: '/salaryWelfare',
              routes: [
                {
                  name: '薪酬福利表',
                  path: '/salaryWelfare/welfareList',
                  component: './salaryWelfare/welfareList',
                },
                {
                  name: '薪酬变动',
                  path: '/salaryWelfare/salaryChange',
                  component: './salaryWelfare/salaryChange',
                },
             ],
            },
            {
              component: './NoFoundPage',
            },

          ],
        },
        {
          component: './NoFoundPage',
        },
      ],
    },
    {
      component: './NoFoundPage',
    },
  ],
  
 
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // chainWebpack(config){
  //   config.merge({
  //     optimization: {
  //       minimize: true,
  //       splitChunks: {
  //         chunks: 'async',
  //         minSize: 10000,
  //         minChunks: 3,
  //         automaticNameDelimiter: '.',
  //         cacheGroups: {
  //           vendor: {
  //             name: 'vendors',
  //             test: /[\\/]node_modules[\\/](lodash|moment|react|dva|postcss|mapbox-gl|@antv|antd|@ant-design)/,
  //             chunks: "all",
  //             priority: -10,
  //           },
  //           default: {
  //             minChunks: 1,
  //             priority: -20,
  //             reuseExistingChunk: true
  //           }
  //         }
  //       }
  //     }
  //   });
  //   //过滤掉momnet的那些不使用的国际化文件
  //   config.plugin("replace").use(require("webpack").ContextReplacementPlugin).tap(() => {
  //     return [/moment[/\\]locale$/, /zh-cn/];
  //   });
  // },

});
