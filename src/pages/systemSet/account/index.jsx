import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Button, Switch } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';

import {
  adminList,
  saveMSetttleCustomerUser,
  createUserApi,
  updateLock,
  saveRoleMenu,
  getRoleAndMenu,
  customerForBusinessVo,
} from '@/services/admin';

import Edit from './edit';

const List = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [defaultValues, setDefaultValues] = useState({});
  const [disableForm, setDisableForm] = useState(false);
  const actionRef = useRef();
  const childRef = useRef();

  useEffect(() => {}, []);

  // 编辑操作
  const editRow = async (mtitle, record, flag) => {
    setDisableForm(!!flag);
    setTitle(mtitle);
    if (record) {
      const res1 = await getRoleAndMenu({ type: 0, userId: record.userId });
      if (res1.code === 200) {
        delete record.password;
        let selectValue = {
          ...record,
          ...{ roleName: res1.data.havaRole, lockFlag: record.lockFlag === '0' ? true : false },
        };
        const res2 = await customerForBusinessVo(record.userId);
        if (res2.code === 200 && res2.data) {
          selectValue = {
            ...selectValue,
            ...{
              customerId: res2.data.hadCustomer || [],
              settleId: res2.data.hadSettle || [],
              customerLists: res2.data.customerList || [],
            },
          };
          console.log(selectValue);
          setDefaultValues(selectValue);
          if (res2.data.settleDomainList) {
            const saveList = [];
            // 结算主体列表
            const list = res2.data.settleDomainList.map((item) => {
              if (selectValue.settleId.indexOf(item.id) > -1) {
                saveList.push({
                  settleId: item.id,
                  customerId: item.customerId,
                });
              }
              return { label: item.departName, value: item.id, customerId: item.customerId };
            });
            if (childRef) {
              childRef.current.getSettleList(list);
              childRef.current.initSaveList(saveList);
              childRef.current.transformRole(res1.data.havaRole);
            }
          }
        }
        setVisible(true);
      } else {
        message.warning(res1.msg);
      }
    } else {
      setDefaultValues({});
      childRef.current.getSettleList([]);
      setVisible(true);
    }
  };

  // 保存
  const handleOk = async (values) => {
    const res1 = await createUserApi(values.user);
    if (res1.code === 200) {
      const { userId } = res1.data;
      if (values.lockFlag === 1) {
        const res2 = await updateLock({ id: userId, lockFlag: values.lockFlag });
        if (res2.code !== 200) {
          message.warning(res2.msg);
          return false;
        }
      }
      const lists = values.customer.map((item) => {
        return {
          customerId: item.customerId,
          settleId: item.settleId,
          userId: userId,
        };
      });
      const res3 = await saveMSetttleCustomerUser({ list: lists });
      if (res3.code !== 200) {
        message.warning(res3.msg);
        return false;
      }
      const res4 = await saveRoleMenu({ userId: userId }, values.roleList);
      if (res4.code !== 200) {
        message.warning(res4.msg);
        return false;
      }
      message.success('保存成功!');
      setVisible(false);
      actionRef.current.reloadAndRest();
      childRef.current.initData();
    } else {
      message.warning(res1.msg);
    }
  };

  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    setDefaultValues({});
    childRef.current.colseDialog();
  };

  const changeSwitch = (val, record) => {
    const flag = val ? '0' : '1';
    updateLock({ id: record.userId, lockFlag: flag }).then((res) => {
      if (res.code === 200) {
        message.success('操作成功!');
        actionRef.current.reload();
      } else {
        message.warning(res.msg);
      }
    });
  };

  const columns = [
    {
      title: '账号',
      dataIndex: 'username',
      valueType: 'text',
      search: false,
    },
    {
      title: '用户名',
      dataIndex: 'nickname',
      valueType: 'text',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      valueType: 'text',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'lockFlag',
      valueType: 'switch',
      search: false,
      render: (text, record) => {
        return (
          <Switch
            checked={record.lockFlag == 0 ? true : false}
            checkedChildren="正常"
            unCheckedChildren="锁定"
            onChange={(val) => changeSwitch(val, record)}
          />
        );
      },
    },

    {
      title: '操作',
      valueType: 'option',
      colSize: '0.75',
      render: (text, record) => [
        <a
          key="detail"
          onClick={() => {
            editRow('详情', record, true);
          }}
        >
          详情
        </a>,
        <a
          key="edit"
          onClick={() => {
            editRow('编辑', record);
          }}
        >
          编辑
        </a>,
      ],
    },
  ];

  // 请求列表
  const requestList = async (params) => {
    const query = { ...params };
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    return adminList(query).then((res) => {
      let records = [];
      let totalAll = 0;
      if (res.code === 200) {
        const dataRes = res.data;
        if (dataRes) {
          records = dataRes.records;
          totalAll = dataRes.total;
        } else {
          totalAll = 0;
        }
      }
      return { data: records, total: totalAll };
    });
  };

  return (
    <PageHeader title="账号管理">
      <ProTable
        rowClassName="gesture"
        rowKey="userId"
        columns={columns}
        options={false}
        actionRef={actionRef}
        request={(params) => requestList(params)}
        search={{
          labelWidth: 'auto',
          optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
        }}
        pagination={{ pageSize: 10 }}
        headerTitle={
          <>
            <Button
              key="add"
              onClick={() => editRow('添加')}
              icon={<PlusOutlined />}
              type="primary"
            >
              添加
            </Button>
          </>
        }
      />
      <Edit
        title={title}
        childRef={childRef}
        disableForm={disableForm}
        visible={visible}
        handleCancel={handleCancel}
        handleOk={handleOk}
        defaultValues={defaultValues}
      />
    </PageHeader>
  );
};

const account = (props) => {
  return (
    <>
      <KeepAlive>
        <List {...props} />
      </KeepAlive>
    </>
  );
};

export default connect(() => {
  return {};
})(account);
