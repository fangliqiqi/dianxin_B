export default {
  '/api/menu': (req, res) => {

    res.status(200).send({
      msg: '',
      code: 200,
      data: [
        {
          name: '人员',
          icon: 'team',
          path: '/members',
          component: './members',
        },
        {
          name: '薪酬',
          icon: 'transaction',
          path: '/salary',
          component: './salary',
        },
        {
          name: '社保公积金',
          icon: 'reconciliation',
          path: '/socialfund',
          component: './socialfund',
        },
        {
          name: '商险',
          icon: 'solution',
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
          name: '账号管理',
          icon: 'solution',
          path: '/account',
          component: './account',
        },
        {
          name: '政策管理 ',
          icon: 'solution',
          path: '/policy',
          component: './policy',
        }
      ]
    })

  }
}
