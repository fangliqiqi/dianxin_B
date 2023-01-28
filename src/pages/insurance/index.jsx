import React, { useRef, useEffect, useState } from 'react';
import ProTable from '@ant-design/pro-table';
import { loadInsuranceListData, loadTakingWarnNumber } from '@/services/insurance';
import { loadDictionaryValue, filterMultiDictText } from '@/services/global';
import styles from './index.less';
import PageHeader from '@/components/PageHeader';
import HeaderFilter from '@/components/HeaderFilter';
import CloumnOrder from '@/components/CloumnOrder';
import IconFont from "@/components/IconFont";
import Pagination from '@/components/PaginationB';
import DeadlineWarn from '@/components/DeadlineWarn';
import Time from '@/components/Time';
import { KeepAlive } from 'umi';
import Dictionaries from '@/components/Dictionaries';

// 购买类型
const buyType = {
  1: '新增',
  2: '短期',
  3: '批增'
};

const expandableLayout = (recordData) => {
  // 表格展开的详情数据
  const expandColumnsTop = [
    {
      title: '是否失效',
      dataIndex: 'validFlag',
      valueEnum: {
        0: '有效',
        1: '无效'
      }
    },
    {
      title: '购买类型',
      dataIndex: 'buyType',
      valueEnum: buyType,
    },
    {
      title: '办理状态',
      dataIndex: 'status',
      render: text => <Dictionaries type="Insurance_record_status">{text}</Dictionaries>
    },
    {
      title: '商险购买地',
      dataIndex: 'businessInsuranceProv',
    },
  ];
  const expandColumnsBottom = [
    {
      title: '实际保费',
      dataIndex: 'buyPay',
    },
    {
      title: '身故或残疾',
      dataIndex: 'deathDisabilityMoney',
    },
    {
      title: '医疗额度',
      dataIndex: 'medicalMoney',
    },
    {
      title: '发票号',
      dataIndex: 'invoiceNo',
    },
    {
      title: '结算类型',
      dataIndex: 'settleType',
      render: text => <Dictionaries type="settlementType">{text}</Dictionaries>
    },
    {
      title: '保单开始时间',
      dataIndex: 'policyStart',
    },
    {
      title: '保单结束时间',
      dataIndex: 'policyEnd',
      render: (text) => {
        return <Time type="YYYY.MM.DD">{text}</Time>;
      }
    },
    {
      title: '保单生效时间',
      dataIndex: 'policyEffect',
      render: (text) => {
        return <Time type="YYYY.MM.DD">{text}</Time>;
      }
    },
    {
      title: '结算月份',
      dataIndex: 'settleMonth',
      render: (text) => {
        return <Time type="YYYY.MM">{text}</Time>;
      }
    },
    {
      title: '派单类型',
      dataIndex: 'fromEmpName',
      render: (text, record) => {
        return (record.fromEmpName) ? '替换' : '新增';
      }
    },
    {
      title: '被替换人',
      dataIndex: 'fromEmpName',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (text) => {
        return <Time type="YYYY.MM.DD">{text}</Time>;
      }
    },
  ];

  // 嵌套的详情数据
  return (
    <React.Fragment>
      <CloumnOrder
        data={recordData}
        titleAlignRight={true}
        cloumns={expandColumnsTop}
        rowGutter={30}
        colSpan={6} />

      <div className={styles.spareLine}></div>

      <CloumnOrder
        data={recordData}
        titleAlignRight={true}
        cloumns={expandColumnsBottom}
        rowGutter={30}
        colSpan={6} />
    </React.Fragment>
  )
}

// 列表展开折叠的箭头
const expandIconLayout = (expanded, onExpand, record) => {
  return expanded ? (<IconFont type='iconzhankai_icon' onClick={e => onExpand(record, e)} />)
    : (<IconFont type='iconyoujiantou' onClick={e => onExpand(record, e)} />)
}

const Insurance = props => {

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const actionRef = useRef();

  const [overdeuNum, setOverdueNum] = useState(0); // 设置商险过期数量
  const [filterItems, setFilterItems] = useState({}); // 设置筛选条件
  const [status, setStatus] = useState({}); // 设置办理状态
  const childRef = useRef(); // 父组件调用子组件时需要使用

  useEffect(() => {

    // 获取商险过期数量
    const fetchOverdeuNumber = async () => {
      const result = await loadTakingWarnNumber();
      setOverdueNum(result.data);
    };
    fetchOverdeuNumber();
    // 获取办理状态字典
    loadDictionaryValue('Insurance_record_status').then(res => {
      const object = filterMultiDictText(res.data);
      setStatus(object);
    });
  }, []);

  const updateChildState = () => {
    // // formReset就是子组件暴露给父组件的方法
    childRef.current.formReset();
  };

  // 列表字段数据
  const columns = [
    {
      title: '姓名',
      dataIndex: 'empName'
    },
    {
      title: '身份证号',
      dataIndex: 'empIdcardNo'
    },
    {
      title: '保单号',
      dataIndex: 'policyNo',
      render: (text, record, index) => (record.policyNo) ? record.policyNo : '-'
    },
    {
      title: '保险公司/险种',
      dataIndex: 'insuranceCompanyName/insuranceTypeName',
      ellipsis: true,
      render: (text, record, index) => `${record.insuranceCompanyName}/${record.insuranceTypeName}`
    },
    {
      title: '保单起止时间',
      dataIndex: 'policyStart',
      render: (text, record, index) => (
        <React.Fragment>
          <Time type="YYYY.MM.DD">{record.policyStart}</Time> ~ <Time type="YYYY.MM.DD">{record.policyEnd}</Time>
        </React.Fragment>
      )
    },
    {
      title: '购买标准',
      dataIndex: 'buyStandard',
    },
    {
      title: '派单类型',
      dataIndex: 'fromEmpName',
      render: (text, record, index) => (record.fromEmpName) ? '替换' : '新增'
    },
    {
      title: '办理状态',
      dataIndex: 'status',
      valueEnum: status,
    },
  ];

  // 头部筛选区域
  const filterCoumns = [
    {
      key: 'status',
      placeholder: '办理状态',
      valueEnum: status,
    },
    {
      key: 'empName',
      placeholder: '按姓名查询',
    },
    {
      key: 'takingWarningFlag',
      placeholder: '商险过期',
      valueEnum: { 0: '', 1: '即将过期' },
      hideInForm: true
    }
  ];

  // 头部右侧过期提示
  const headerRightRender = () => {
    return (
      <DeadlineWarn title="商险即将过期">
        有
        <a className={styles.number} onClick={() => {
          updateChildState(); // 触发子组件方法
          setCurrent(1); // 重置分页器
          setFilterItems({ takingWarningFlag: 1 });
          if (actionRef.current) { // 刷新列表
            actionRef.current.reload();
          }
        }}>{overdeuNum}</a>个商险即将过期
      </DeadlineWarn>
    )
  };

  // 根据查询条件重新刷新列表
  const reloadSearch = (form) => {
    const formData = form.getFieldValue();
    setFilterItems(formData);
    setCurrent(1); // 重置分页器
    if (actionRef.current) { // 刷新列表
      actionRef.current.reload();
    }
  };

  return (
    <PageHeader
      title="商险账单"
      rightRender={headerRightRender()}>
      <HeaderFilter
        columns={filterCoumns}
        filterParam={filterItems}
        showProject={true}
        selectChange={(form) => {
          form.setFieldsValue({ empName: undefined, takingWarningFlag: 0 });
          reloadSearch(form);
        }}
        onSearch={(form) => {
          form.setFieldsValue({ settlementOrgan: undefined, status: undefined, takingWarningFlag: 0 });
          reloadSearch(form);
        }}
        itemClose={(form) => {
          reloadSearch(form);
        }}
        cRef={childRef} // 此处注意需要将childRef通过props属性从父组件中传给自己 cRef={childRef}
      />
      <ProTable
        rowClassName='gesture'
        headerTitle="商险账单"
        columns={columns}
        rowKey="id"
        options={false}
        search={false}
        actionRef={actionRef}
        pagination={false}
        request={(parameters) => loadInsuranceListData(Object.assign({
          current: current,
          size: pageSize,
        }, filterItems)).then((res) => {
          const data = res.data;
          setTotal(data.total);
          setCurrent(data.current)
          setPageSize(data.size)
          return { data: data.records };
        })}
        toolBarRender={false}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: record => expandableLayout(record),
          expandIcon: ({ expanded, onExpand, record }) => expandIconLayout(expanded, onExpand, record)
        }}
      ></ProTable>

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

export default (props) => {
  return (
    <React.Fragment>
      <KeepAlive>
        <Insurance {...props} />
      </KeepAlive>
    </React.Fragment>
  )
}
