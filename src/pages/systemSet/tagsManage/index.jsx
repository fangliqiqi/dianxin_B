import React, { useState, useRef, useEffect } from 'react';
import { history, KeepAlive, connect } from 'umi';
import { message, Button, Divider, Popconfirm, Spin } from 'antd';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { tagsList, addTags, editTags, deleteTags, getidTags } from '@/services/tags';

import Edit from './edit';

const List = (props) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [defaultValues, setDefaultValues] = useState({});
  const [allTags, setAlltags] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const actionRef = useRef();

  // 获取数据列表
  const getAllList = () => {
    tagsList().then((res) => {
      if (res.code === 200) {
        setAlltags(res.data);
      }
    });
  };
  // 获取数据列表
  const requestList = async (params) => {
    const query = { ...params };
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    setLoading(true);
    const listRes = await tagsList(query);
    setLoading(false);
    let records = [];
    let totalAll = 0;
    if (listRes.code === 200 && listRes.data && listRes.data.total) {
      const page = Math.ceil(listRes.data.total / listRes.data.size);
      if (page == listRes.data.pages && listRes.data.records.length == 0) {
        query.current = 1;
        actionRef.current.reloadAndRest();
      }
      records = listRes.data.records;
      totalAll = listRes.data.total;
    }
    return { data: records, total: totalAll };
    // }).finally(()=>{
    //   setLoading(false)
    // })
  };

  useEffect(() => {
    getAllList();
  }, []);

  // 编辑 和添加 操作
  const editRow = (record) => {
    // console.log(record)
    // 如果行内有值就是编辑
    if (record) {
      setTitle('编辑标签');
      const value = JSON.parse(JSON.stringify(record));
      value.status = value.status.toString(); // 下拉框回显问题
      setDefaultValues(value);
    } else {
      setTitle('添加标签');
      setDefaultValues({});
    }
    // 设置弹框显示
    setVisible(true);
  };

  // 点击确认禁用
  const confirm = (record) => {
    let msg = '禁用成功';
    if (record.status === 1) {
      msg = '启用成功';
    }
    const values = {
      id: record.id,
      name: record.name,
      remark: record.remark,
      status: record.status ? '0' : '1',
    };
    editTags(values, 'PUT').then((res) => {
      if (res.code === 200) {
        message.success(msg);
        actionRef.current.reload();
      } else {
        message.warning(res.msg);
      }
    });
  };

  const cancel = (e) => {
    // console.log(e);
  };

  // 保存
  const handleOk = (values) => {
    if (values.id) {
      editTags(values, 'PUT').then((res) => {
        if (res.code === 200) {
          message.success('编辑成功');
          getAllList();
          actionRef.current.reload();
          setVisible(false);
        } else {
          message.warning(res.msg);
        }
      });
    } else {
      addTags(values, 'POST').then((res) => {
        if (res.code === 200) {
          message.success('添加成功!');
          getAllList();
          actionRef.current.reload();
          setVisible(false);
        } else {
          message.warning(res.msg);
        }
      });
    }
  };

  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
  };
  const renderSwitch = (text, record) => (
    <Popconfirm
      key="popconfirm"
      title={`确认${text}吗?`}
      okText="是"
      cancelText="否"
      onConfirm={() => confirm(record)}
      onCancel={cancel}
    >
      <a>{text}</a>
    </Popconfirm>
  );

  const columns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '标签说明',
      dataIndex: 'remark',
      valueType: 'text',
      ellipsis: true,
      search: false,
    },
    {
      title: '标签状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        0: '启用',
        1: '禁用',
      },
    },
    {
      title: '操作',
      valueType: 'option',
      colSize: '0.75',
      render: (text, record) => {
        let node = renderSwitch('启用', record);
        if (record.status === 0) {
          node = renderSwitch('禁用', record);
        }
        return [
          <a
            key="edit"
            onClick={() => {
              editRow(record);
            }}
          >
            编辑
          </a>,
          node,
        ];
      },
    },
  ];

  return (
    <PageHeader title="标签管理">
      <Spin spinning={loading}>
        <ProTable
          rowClassName="gesture"
          rowKey="id"
          columns={columns}
          options={false}
          actionRef={actionRef}
          loading={false}
          search={{
            span: 6,
            optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
          }}
          request={(params) => requestList(params)}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          headerTitle={
            <>
              <Button
                key="add"
                onClick={() => editRow()}
                icon={<PlusOutlined />}
                type="primary"
                style={{ marginRight: '10px' }}
              >
                添加
              </Button>
            </>
          }
        />
      </Spin>
      <Edit
        visible={visible}
        title={title}
        defaultValues={defaultValues}
        handleCancel={() => {
          handleCancel();
        }}
        handleOk={handleOk}
      />
    </PageHeader>
  );
};

const departMange = (props) => {
  return (
    <>
      <KeepAlive>
        <List {...props} />
      </KeepAlive>
    </>
  );
};

export default connect(({ exampleModels }) => {
  return {
    exampleStatus: exampleModels,
  };
})(departMange);
