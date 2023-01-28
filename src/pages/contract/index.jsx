import React, { useRef, useEffect, useState } from 'react';
import ProTable from '@ant-design/pro-table';
import { getContractBusinessAlertCount, getContractBusinessPage, getOtherContractBusinessInfo } from '@/services/contract';
import { Space } from 'antd';
import styles from './index.less';
import PageHeader from '@/components/PageHeader';
import HeaderFilter from '@/components/HeaderFilter';
import TypeOfContractToText from '@/components/TypeOfContractToText';
import SettleName from '@/components/SettleName';
import Pagination from '@/components/PaginationB';
import DeadlineWarn from '@/components/DeadlineWarn';
import IconFont from "@/components/IconFont";
import { KeepAlive } from 'umi';

// 头部筛选区域
const filterCoumns = [
  {
    key: 'empName',
    placeholder: '按姓名查询',
  },
  {
    key: 'flag',
    placeholder: '',
    valueEnum: { 0: '', 1: '即将过期' },
    hideInForm: true
  }
];

// 表格展开的详情数据
const expandColumns = [
  {
    title: '姓名',
    dataIndex: 'empName',
    render: () => <></>,
    width: "12.5%"
  },
  {
    title: '所在项目',
    dataIndex: 'settleDomain',
    render: () => <></>,
    width: "12.5%"
  },
  {
    title: '合同性质',
    dataIndex: 'contractName',
    render: text => (text) ? text : "-",
    width: "12.5%"
  },
  {
    title: '合同类型',
    dataIndex: 'contractType',
    render: (text) => <TypeOfContractToText>{text}</TypeOfContractToText>,
    width: "12.5%"
  },
  {
    title: '合同起始日期',
    dataIndex: 'contractStart',
    width: "12.5%",
    render: text => (text) ? text : "-",
  },
  {
    title: '合同结束日期',
    dataIndex: 'contractEnd',
    width: "12.5%",
    render: text => (text) ? text : "-",
  },
  {
    title: '累计签约次数',
    dataIndex: 'renewCount',
    render: () => <></>,
    width: "12.5%"
  },
  {
    title: '签订情况',
    dataIndex: 'situation',
    render: text => (text) ? text : "-",
    width: "12.5%"
  },
];

const Contract = () => {
  const actionRef = useRef();
  const [overdeuNum, setOverdueNum] = useState(0); // 设置合同过期数量
  const [filterItems, setFilterItems] = useState({}); // 设置筛选条件
  const childRef = useRef(); // 父组件调用子组件时需要使用
  const [settleNames, setSettleNames] = useState([]);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 列表字段数据
  const columns = [
    {
      title: '姓名',
      dataIndex: 'empName',
      width: "12.5%",
      render: text => (text) ? text : "-"
    },
    {
      title: '所在项目',
      dataIndex: 'settleDomain',
      render: (text) => <SettleName args={settleNames}>{text}</SettleName>,
      width: "12.5%"
    },
    {
      title: '合同性质',
      dataIndex: 'contractName',
      width: "12.5%",
      render: text => (text) ? text : "-"
    },
    {
      title: '合同类型',
      dataIndex: 'contractType',
      render: (text) => <TypeOfContractToText>{text}</TypeOfContractToText>,
      width: "12.5%"
    },
    {
      title: '合同起始日期',
      dataIndex: 'contractStart',
      width: "12.5%",
      render: text => (text) ? text : "-"
    },
    {
      title: '合同结束日期',
      dataIndex: 'contractEnd',
      width: "12.5%",
      render: text => (text) ? text : "-"
    },
    {
      title: '累计签约次数',
      dataIndex: 'renewCount',
      width: "12.5%",
      render: text => (text) ? text : "0"
    },
    {
      title: '签订情况',
      dataIndex: 'situation',
      width: "12.5%",
      render: text => (text) ? text : "-"
    },
  ];


  useEffect(() => {
    // 获取合同过期数量
    const fetchOverdeuNumber = async () => {
      const result = await getContractBusinessAlertCount();
      if (result.code === 200) {
        setOverdueNum(result.data);
      }
    };
    fetchOverdeuNumber();
  }, []);

  const updateChildState = () => {
    // // formReset就是子组件暴露给父组件的方法
    childRef.current.formReset();
  };

  // 详情布局
  const expandedDetailRender = (record) =>  (
      <div className={styles.expendContainer}>
        <ProTable
          columns={expandColumns}
          rowKey={Math.random()}
          className={styles.colBg}
          options={false}
          search={false}
          showHeader={false}
          pagination={false}
          toolBarRender={false}
          request={() => getOtherContractBusinessInfo({
            contractId: record.id,
            empId: record.empId
          }).then((res) => {
            return { data: res.data };
          })}
          expandable={{
            expandedRowRender: {},
            rowExpandable: () => { return false }
          }}
        />
      </div>
    );

  // 头部右侧过期提示
  const headerRightRender = () => {
    return (
      <Space>
        <DeadlineWarn title="劳动合同即将过期">
          有
          <a className={styles.number} onClick={() => {
            updateChildState(); // 触发子组件方法
            setFilterItems({ flag: 1 });
            setCurrent(1);
            if (actionRef.current) { // 刷新列表
              actionRef.current.reload();
            }
          }}>{overdeuNum}</a>个劳动合同即将到期
           </DeadlineWarn>
      </Space>
    )
  };

  // 根据查询条件重新刷新列表
  const reloadSearch = (form) => {
    const formData = form.getFieldValue();
    setFilterItems(formData);
    setCurrent(1);
    if (actionRef.current) { // 刷新列表
      actionRef.current.reload();
    }
  };

  return (
    <PageHeader
      title="员工合同"
      rightRender={headerRightRender()}>
      <HeaderFilter
        columns={filterCoumns}
        filterParam={filterItems}
        settleNames={(res) => { setSettleNames(res); }}
        showProject={true}
        selectChange={(form) => {
          form.setFieldsValue({ empName: null, flag: 0 });
          reloadSearch(form);
        }}
        onSearch={(form) => {
          form.setFieldsValue({ settlementOrgan: null, flag: 0 });
          reloadSearch(form);
        }}
        itemClose={(form) => { reloadSearch(form); }}
        cRef={childRef} // 此处注意需要将childRef通过props属性从父组件中传给自己 cRef={childRef}
      />
      <ProTable
        rowClassName='gesture'
        columns={columns}
        rowKey="id"
        options={false}
        search={false}
        actionRef={actionRef}
        hideOnSinglePage={true}
        pagination={false}
        request={() => getContractBusinessPage({
          size: pageSize,
          current: current,
          settleDomain: filterItems.settlementOrgan || null,
          empName: filterItems.empName || null,
          flag: filterItems.flag === 1 ? 0 : 1,
        }).then((res) => {

          let records = [];
          if (res.code === 200) {
            const data = res.data;
            if (data) {
              records = data.records;
              setTotal(data.total);
              setCurrent(data.current)
              setPageSize(data.size)
            } else {
              setTotal(0);
              setCurrent(1)
              setPageSize(10)
            }
          }
          return { data: records };
        })}
        toolBarRender={false}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: expandedDetailRender,
          rowExpandable: (record) => { return record.renewCount > 1 },
          expandIcon: ({ expanded, onExpand, record }) => {
            if (record.renewCount > 1) {
              return expanded ? (<IconFont type='iconzhankai_icon' onClick={e => onExpand(record, e)} />)
                : (<IconFont type='iconyoujiantou' onClick={e => onExpand(record, e)} />)
            } else {
              return null
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
}

export default () => {
  return (
    <>
      <KeepAlive>
        <Contract />
      </KeepAlive>
    </>
  )
}
