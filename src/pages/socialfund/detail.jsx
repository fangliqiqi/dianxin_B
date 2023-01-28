import React, { useRef, useState, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Table } from 'antd';
import { getPaymentByMonthAndAuth, getStaticsByMonth, getPaymentByMonthAndEmpId, getSocialAndFundReduceInfo } from '@/services/socialfund';
import styles from './index.less';
import StatisticsTable from '@/components/StatisticsTable';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import IconFont from "@/components/IconFont";
import Pagination from '@/components/PaginationB';
import Time from '@/components/Time';
import Money2Dec from '@/components/Money2Dec';
import { connect, } from 'umi';

// 表格展开后的详情表格头部数据
const columns = [
  {
    title: '姓名',
    dataIndex: 'empName',
  },
  {
    title: '缴纳月份',
    dataIndex: 'month',
  },
  {
    title: '社保个人缴费',
    dataIndex: 'socialPersonalSum',
  },
  {
    title: '社保公司缴费',
    dataIndex: 'socialUnitSum',
  },
  {
    title: '公积金个人缴费',
    dataIndex: 'fundPersonalSum',
  },
  {
    title: '公积金公司缴费',
    dataIndex: 'fundUnitSum',
  },
  {
    title: '合计缴费',
    dataIndex: 'sum',
  },
];

// 表格展开详情的数据组装
const expandedData = (data) => {
  const temp = [];
  temp.push({
    id: 0,
    name: '养老',
    basic: data.personalPensionSet,
    personalPropor: data.personalPensionPer,
    personalPay: data.personalPensionMoney,
    companyPropor: data.unitPensionPer,
    companyPay: data.unitPensionMoney,
    sumPay: parseFloat(data.personalPensionMoney + data.unitPensionMoney).toFixed(2)
  })

  temp.push({
    id: 1,
    name: '医疗',
    basic: data.personalMedicalSet,
    personalPropor: data.personalMedicalPer,
    personalPay: data.personalMedicalMoney,
    companyPropor: data.unitMedicalPer,
    companyPay: data.unitMedicalMoney,
    sumPay: data.personalMedicalMoney + data.unitMedicalMoney
  })

  temp.push({
    id: 2,
    name: '大病医疗保险',
    basic: '',
    personalPropor: data.personalBigailmentPer,
    personalPay: data.personalBigmailmentMoney,
    companyPropor: data.unitBigailmentPer,
    companyPay: data.unitBigmailmentMoney,
    sumPay: data.personalBigmailmentMoney + data.unitBigmailmentMoney
  })

  temp.push({
    id: 3,
    name: '失业',
    basic: data.personalUnemploymentSet,
    personalPropor: data.personalUnemploymentPer,
    personalPay: data.personalUnemploymentMoney,
    companyPropor: data.unitUnemploymentPer,
    companyPay: data.unitUnemploymentMoney,
    sumPay: data.personalUnemploymentMoney + data.unitUnemploymentMoney
  })

  temp.push({
    id: 4,
    name: '工伤',
    basic: data.injuryAloneSet,
    personalPropor: data.injuryAlonePer,
    personalPay: data.injuryAloneMoney,
    companyPropor: data.unitInjuryPer,
    companyPay: data.unitInjuryMoney,
    sumPay: data.injuryAloneMoney + data.unitInjuryMoney
  })

  temp.push({
    id: 5,
    name: '生育',
    basic: data.unitBirthSet,
    personalPropor: '-',
    personalPay: '-',
    companyPropor: data.unitBirthPer,
    companyPay: data.unitBirthMoney,
    sumPay: data.unitBirthMoney
  })

  temp.push({
    id: 6,
    name: '公积金',
    basic: data.personalProidentSet,
    personalPropor: data.providentPercent,
    personalPay: data.fundPersonalSum,
    companyPropor: data.providentPercent,
    companyPay: data.fundUnitSum,
    sumPay: data.fundPersonalSum + data.fundUnitSum
  })

  temp.push({
    id: 7,
    name: '退费',
    basic: ' ',
    personalPropor: ' ',
    personalPay: data.personalRefund,
    companyPropor: ' ',
    companyPay: data.unitRefund,
    sumPay: ' '
  })

  return temp;
}

const expandedColumns = [
  {
    title: '缴费科目',
    dataIndex: 'name',
    render: (text) => {
      return (text || text === 0) ? `${text}` : '-'
    }
  },
  {
    title: '缴纳基数',
    dataIndex: 'basic',
    render: (text) => {
      return <Money2Dec>{text}</Money2Dec>
    }
  },
  {
    title: '个人比例',
    dataIndex: 'personalPropor',
    render: (text) => {
      return (text || text === 0) ? `${text}` : '-'
    }
  },
  {
    title: '个人缴纳',
    dataIndex: 'personalPay',
    render: (text) => {
      return <Money2Dec>{text}</Money2Dec>
    }
  },
  {
    title: '公司比例',
    dataIndex: 'companyPropor',
    render: (text) => {
      return (text || text === 0) ? `${text}` : '-'
    }
  },
  {
    title: '公司缴纳',
    dataIndex: 'companyPay',
    render: (text) => {
      return <Money2Dec>{text}</Money2Dec>
    }
  },
  {
    title: '合计缴纳',
    dataIndex: 'sumPay',
    render: (text) => {
      return <Money2Dec>{text}</Money2Dec>
    }
  },
];

// 减员列表的数据
const reduceColumns = [
  {
    title: '姓名',
    dataIndex: 'empName',
  },
  {
    title: '离职日期',
    dataIndex: 'leaveDate',
    render: (text, record, index) => {
      return <Time type="YYYY-MM-DD">{text}</Time>
    }
  },
  {
    title: '社保状态',
    dataIndex: 'socialStatus',
    render: (text, record, index) => {
      return Number(record.socialStatus) === 1 ? '派减办理成功' : '-';
    }
  },
  {
    title: '公积金状态',
    dataIndex: 'fundStatus',
    render: (text, record, index) => {
      return Number(record.fundStatus) === 1 ? '派减办理成功' : '-';
    }
  },
  {
    title: '停缴社保日期',
    dataIndex: 'socialReduceDate',
    render: (text, record, index) => {
      return <Time type="YYYY-MM-DD">{text}</Time>
    }
  },
  {
    title: '停缴公积金日期',
    dataIndex: 'fundReduceDate',
    render: (text, record, index) => {
      return <Time type="YYYY-MM-DD">{text}</Time>
    }
  },
];

// 总结合计行布局
const summaryLayout = (pageData) => {
  let totalPerSum = 0;
  let totalUnitSum = 0;
  pageData.forEach(({ personalPay, companyPay, sumPay }) => {
    const tempPer = (personalPay === null || personalPay === '-') ? 0 : parseFloat(personalPay);
    const tempUnit = (companyPay === null || companyPay === '-') ? 0 : parseFloat(companyPay);
    totalPerSum += tempPer;
    totalUnitSum += tempUnit;
  });
  return (
    <>
      <Table.Summary.Row>
        <Table.Summary.Cell colSpan={3}>合计缴费</Table.Summary.Cell>
        <Table.Summary.Cell colSpan={2}>{totalPerSum.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{totalUnitSum.toFixed(2)}</Table.Summary.Cell>
        <Table.Summary.Cell>{(totalPerSum + totalUnitSum).toFixed(2)}</Table.Summary.Cell>
      </Table.Summary.Row>
    </>
  )
}

// 统计视图
const staticsLayout = (statisticsColumn, tabIndex) => {
  return (
    <div className={styles.headerStatics}>
      <StatisticsTable datas={statisticsColumn} dark={true} select={tabIndex} />
    </div>
  )
}

// 账单人数、增员列表展开折叠的箭头
const expandIconLayout = (expanded, onExpand, record) => {
  return expanded ? (<IconFont type='iconzhankai_icon' onClick={e => onExpand(record, e)} />)
    : (<IconFont type='iconyoujiantou' onClick={e => onExpand(record, e)} />)
}

const Detail = (props) => {
  const { location, dispatch } = props;
  // models的命名空间标识
  const modelsNameSpace = 'socialfund/updateSocialfundTitle';

  // 列表
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const actionRef = useRef();
  // 减员列表
  const [reduceCurrent, setReduceCurrent] = useState(1);
  const [reducePageSize, setReducePageSize] = useState(10);
  const [reduceTotal, setReduceTotal] = useState(0);
  const reduceActionRef = useRef();

  const [staticsData, setStaticsData] = useState({}); // 设置查询的年份
  const [listType, setListType] = useState(0); // type 0 查询所有 1 查询对应月份派增的人员缴费库
  const [isReduce, setIsReduce] = useState(false); // 是否是减员的布局
  const [tabIndex, setTabIndex] = useState(0); // 头部可点击的tab索引

  function updateTitle(title) {
    dispatch({ type: modelsNameSpace, payload: { title: title }, });
  }

  useEffect(() => {
    // 标题
    updateTitle(location.query.defaultTitle)

    // 获取办理状态字典
    getStaticsByMonth({ month: location.query.month, settleDomainId: location.query.settleDomain }).then(res => {
      if (Number(res.code) === 200) {
        const data = {
          personalAdd: res.data.personalAdd ? res.data.personalAdd : 0,
          personalReduce: res.data.personalReduce ? res.data.personalReduce : 0
        }
        setStaticsData(data);
      }
    });
    return () => {
      // 组件卸载的时候执⾏行行
      updateTitle('')
    }
  }, []);

  // 头部统计数据
  const statisticsColumn = [
    {
      title: "账单人数",
      value: location.query.personNum,
      onClick: () => {
        setTabIndex(0); // 选中的项目
        setIsReduce(false);
        setListType(0);
        setCurrent(1); // 重置分页器
        if (actionRef.current) {
          actionRef.current.reload();
        }
        updateTitle(location.query.defaultTitle);
      }
    },
    {
      title: "增员",
      value: staticsData.personalAdd,
      icon: <CaretUpOutlined style={{ color: '#FF6E4C' }} />,
      onClick: () => {
        setTabIndex(1); // 选中的项目
        setIsReduce(false);
        setListType(1);
        setCurrent(1); // 重置分页器
        if (actionRef.current) {
          actionRef.current.reload();
        }
        updateTitle(`${location.query.defaultTitle} - 增员`);
      }
    },

    {
      title: "减员",
      value: staticsData.personalReduce,
      divider: true,
      icon: <CaretDownOutlined style={{ color: '#26A872' }} />,
      onClick: () => {
        setTabIndex(2); // 选中的项目
        setIsReduce(true);
        setReduceCurrent(1); // 重置分页器
        if (reduceActionRef.current) {
          reduceActionRef.current.reload();
        }
        updateTitle(`${location.query.defaultTitle} - 减员`);
      }
    },
    {
      title: "个人缴费",
      value: location.query.perPayment,
    },
    {
      title: "公司缴费",
      value: location.query.unitPayment,
    },
    {
      title: "合计缴费",
      value: parseFloat(location.query.perPayment + location.query.unitPayment).toFixed(2),
    },
  ];

  // 减员布局
  const reducePageRender = () => {
    return (
      <React.Fragment>
        <ProTable
          key='reduce'
          columns={reduceColumns}
          actionRef={reduceActionRef}
          rowKey="id"
          options={false}
          search={false}
          pagination={false}
          request={(parameters) => getSocialAndFundReduceInfo({
            current: reduceCurrent,
            size: reducePageSize,
            month: location.query.month,
            settleDomainId: location.query.settleDomain,
          }).then((res) => {
            const data = res.data;
            setReduceTotal(data.total);
            setReduceCurrent(data.current)
            setReducePageSize(data.size)
            return { data: data.records };
          })}
        />

        <Pagination
          current={reduceCurrent}
          pageSize={reducePageSize}
          total={reduceTotal}
          actionRef={reduceActionRef}
          onChange={(page, pagesize) => {
            setReduceCurrent(page)
            setReducePageSize(pagesize)
          }}
        />
      </React.Fragment>
    )
  };

  // 详情布局
  const expandedDetailRender = (record) => {
    return (
      <div className={styles.expendContainer}>
        <ProTable
          columns={expandedColumns}
          rowKey='id'
          options={false}
          search={false}
          pagination={false}
          request={(params) => getPaymentByMonthAndEmpId({
            empId: record.empId,
            month: location.query.month,
            settleDomainId: location.query.settleDomain,
          }).then((res) => {
            return { data: expandedData(res.data) };
          })}
          summary={pageData => summaryLayout(pageData)}
        />
      </div>
    )
  };

  return (
    <div className={styles.detailPageWrap}>
      {staticsLayout(statisticsColumn, tabIndex)}
      {
        isReduce ? reducePageRender() :
          <React.Fragment>
            <ProTable
              rowClassName='gesture'
              key="basic"
              headerTitle="社保公积金"
              columns={columns}
              rowKey="empId"
              options={false}
              search={false}
              actionRef={actionRef}
              pagination={false}
              request={(parameters) => getPaymentByMonthAndAuth({
                current: current,
                size: pageSize,
                settleDomainId: location.query.settleDomain,
                month: location.query.month,
                type: listType
              }).then((res) => {
                const data = res.data;
                setTotal(data.total);
                setCurrent(data.current)
                setPageSize(data.size)
                return { data: data.records };
              })}
              toolBarRender={false}
              expandable={{
                expandRowByClick: true,
                expandedRowRender: expandedDetailRender,
                expandIcon: ({ expanded, onExpand, record }) =>expandIconLayout(expanded, onExpand, record)
              }} />

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
          </React.Fragment>
      }
    </div>
  )
}

export default connect(({ title }) => ({
  socialFundTitle: title,
}))(Detail);
