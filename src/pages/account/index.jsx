import React, { useState, useRef, useEffect } from 'react';
import { adminList, createUserApi, userInfoCount } from '@/services/admin';
import ProTable from '@ant-design/pro-table';
import { Button, Modal, message } from 'antd';
import { history, KeepAlive, connect } from 'umi';
import StatisticsTable from '@/components/StatisticsTable';
import PageHeader from '@/components/PageHeader';
import LoginForm from '../user/login/components/Login';
import Pagination from '@/components/PaginationB';
import Time from '@/components/Time';
import IconFont from "@/components/IconFont";
import styles from './styles.less';

const { UserName, Mobile, Submit } = LoginForm;

const Account = (props) => {

  const { accountStatus } = props;
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const actionRef = useRef();

  const [statisticsData, setStatisticsData] = useState({});
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    // 统计数据
    userInfoCount().then(res => {
      setSpinning(false);
      if (res.code === 200) {
        res.data && setStatisticsData(res.data)
      }
    })

    if (actionRef.current) {
      actionRef.current.reload();
    }

  }, [accountStatus]);


  const statistics = [
    {
      title: "客户",
      value: statisticsData.customerCount || '0',
      divider: true
    },
    {
      title: "账号",
      value: statisticsData.userCount || '0',
      divider: true
    },
    {
      title: "7日登录人次",
      value: (statisticsData.loginCountMap) ? statisticsData.loginCountMap["7"] : '0',
      divider: true
    },
    {
      title: "30日登录人次",
      value: (statisticsData.loginCountMap) ? statisticsData.loginCountMap["30"] : '0',
    }
  ]


  const columns = [
    // {
    //   title: '客户单位',
    //   dataIndex: 'customerName',
    //   render: text => text ? text : "-"
    // },
    // {
    //   title: '用户状态',
    //   dataIndex: 'lockFlag',
    //   render: text => Number(text) === 0 ? "启用" : "禁用"
    // },
    {
      title: '账号',
      dataIndex: 'nickname',
    },
    {
      title: '用户名',
      dataIndex: 'nickname',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'loginCount',
    },
    {
      title: '状态',
      dataIndex: 'loginCount',
    },
    {
      title: '最近登录',
      dataIndex: 'lastLoginTime',
      render: text => <Time type="YYYY.MM.DD">{text}</Time>
    }
  ];

  // 创建用户成功
  const funCreateUser = (valuse) => {
    setConfirmLoading(true)

    createUserApi(valuse).then((res) => {

      setConfirmLoading(false)

      if (res && res.code === 200) {
        message.success('用户创建成功成功！');
        setShowCreateUser(false)

        setCurrent(1);
        if (actionRef && actionRef.current) { // 刷新列表
          actionRef.current.reload();
        }
        editUser(res.data.userId)
      }

    }).catch((error) => {
      setConfirmLoading(false)
    })
  }

  // 跳转编辑页面
  const editUser = (id) => {
    history.push({
      pathname: '/account/edit',
      query: {
        id: id
      }
    })
  }

  return (
    <PageHeader
      hideDivider
      title="账号管理">

      <StatisticsTable datas={statistics} dark={true} spinning={spinning} />

      <Button type="primary" icon={<IconFont type='iconxinjian_icon' />} style={{ margin: "26px 0", width: "106px" }} onClick={() => { setShowCreateUser(true) }}>新建账号</Button>

      <Modal
        width={448}
        centered={true}
        closable={false}
        title="创建账号"
        footer={null}
        className='accountDialog'
        visible={showCreateUser}
        bodyStyle={{
          padding: '0 40px 20px'
        }}
        onCancel={() => { setShowCreateUser(false) }}
      >
        <LoginForm onSubmit={funCreateUser}>
          <UserName
            name="nickname"
            placeholder="请输入姓名"
            rules={[
              {
                required: true,
                message: '请输入姓名!',
              },
            ]}
          />

          <Mobile
            name="phone"
            placeholder="请输入手机号"
            rules={[
              {
                required: true,
                message: '请输入手机号！',
              },
              {
                pattern: /^1\d{10}$/,
                message: '手机号格式错误！',
              },
            ]}
          />

          <Submit loading={confirmLoading}>保存</Submit>
        </LoginForm>
      </Modal>

      <ProTable
        rowClassName='gesture'
        rowKey="userId"
        columns={columns}
        options={false}
        search={false}
        pagination={false}
        actionRef={actionRef}
        request={() => adminList({
          current: current,
          size: pageSize
        }).then((res) => {
          let records = [];

          if (res.code === 200) {
            const data = res.data;
            if (data) {
              records = data.records;
              setTotal(data.total);
              setCurrent(data.current);
              setPageSize(data.size);
            }
          }

          return {
            data: records,
          };
        })}
        onRow={(record) => {
          return {
            onClick: () => {
              editUser(record.userId)
            }
          }
        }}
      />

      <Pagination
        current={current}
        pageSize={pageSize}
        total={total}
        actionRef={actionRef}
        onChange={(page, pagesize) => {
          setCurrent(page)
          setPageSize(pagesize)
        }}
      />
    </PageHeader>
  );
};

const AccountPage = (props) => {
  return (
    <>
      <KeepAlive>
        <Account {...props} />
      </KeepAlive>
    </>
  )
}


export default connect(({ accountModels }) => {
  return ({
    accountStatus: accountModels && accountModels.accountChanged,
  })
})(AccountPage);

