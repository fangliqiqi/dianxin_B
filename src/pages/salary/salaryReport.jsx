import React, { useRef, useState, useEffect } from 'react';
import ProTable from '@ant-design/pro-table';
import { Select, Space } from 'antd';
import { loadDictionaryValue, filterMultiDictText,loadProject,getProjectList} from '@/services/global';
import { loadSalaryReportListData } from '@/services/salary';
import styles from './index.less';
import { history, KeepAlive } from 'umi';
import IconFont from "@/components/IconFont";
import Pagination from '@/components/PaginationB';
import { CaretDownOutlined } from '@ant-design/icons';

const SalaryReport = props => {
  const { location } = props;

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const actionRef = useRef();

  const { Option } = Select;
  const [departID, setDepartID] = useState(null); // 设置查询的项目名称
  const [settleNameArray, setSettleNameArray] = useState([]); // 结算主题的选择项
  const [formType, setFormType] = useState({}); // 报表类型

  useEffect(() => {
    // 获取项目
    getProjectData();
    // 获取报表类型
    loadDictionaryValue('form_type').then(res => {
      const object = filterMultiDictText(res.data);
      setFormType(object);
    });

  }, []);

  // 获取项目
  const getProjectData = (settleName) => {
    getProjectList({ settleName: settleName, limit: 20 }).then(res => {
      if (Number(res.code) === 200) {
        if (res.data && Array.isArray(res.data)) {
          setSettleNameArray(res.data);
        }
      }
    });
  };

  // 带搜索的下拉框搜索事件
  const selectOnSearch = (val) => {
    getProjectData(val);
  };

  // 带搜索的下拉框选择项目
  const selectOnSelect = (keyName, value) => {
    setCurrent(1); // 重置分页器
    setDepartID(keyName);
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  // 处理点击清空筛选项按钮事件
  const selectOnChange = (value) => {
    if (!value) {
      setCurrent(1); // 重置分页器
      setDepartID(null);
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  // 发放状态
  const status = {
    0: '待提交',
    1: '待审核',
    3: '待发放',
    4: '已发放',
    5: '审核不通过',
    6: '确认不通过',
    7: '财务退回',
    8: '结算单调整待审核',
    9: '结算单调整待打印'
  };

  const columns = [
    {
      title: '发放状态',
      dataIndex: 'status',
      valueEnum: status,
      width: '15%',
      render: (text, record, index) => {
        return <span style={{ color: '#2E77F3' }}>{status[record.status]}</span>;
      }
    },
    {
      title: '业务项目',
      dataIndex: 'departName',
      ellipsis: true,
      width: '20%',
    },
    {
      title: '结算金额',
      dataIndex: 'settlementAmount',
      width: '15%',
    },
    {
      title: '报表类型',
      dataIndex: 'formType',
      valueEnum: formType,
      width: '10%',
    },
    {
      title: '款项来源',
      dataIndex: 'moneyFrom',
      width: '15%',
      render: (text, record, index) => {
        return (record.moneyFrom === 1) ? '垫付' : '客户到款';
      }
    },
    {
      title: '发放时间',
      dataIndex: 'revenueTime',
      render: (text, record, index) => {
        return record.revenueTime ? record.revenueTime : '-';
      }
    },
    {
      title: '',
      dataIndex: 'option',
      valueType: 'option',
      render: (text, record, index) => [
        <IconFont style={{ marginRight: '12px', color: '#C8C8C8' }} key={index} type='iconyoujiantou' />
      ]
    }
  ];

  return (
    <div className={styles.blankContent}>
      <div className={styles.cusToolbar}>
        <Space>
          <Select
            showSearch
            allowClear={true}
            filterOption={false}
            style={{ width: 200 }}
            suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
            placeholder="全部项目"
            onSearch={text => selectOnSearch(text)}
            onSelect={selectOnSelect}
            onChange={text => selectOnChange(text)}
            dropdownRender={menu => (
              <>
                {menu}
              </>
            )}
          >
            {
              settleNameArray ? settleNameArray.map((item, index) => (
                <Option key={index} value={item.id}>{item.departName}</Option>
              )) : ''
            }
          </Select>
        </Space>
      </div>
      <ProTable
        rowClassName='gesture'
        headerTitle="工资报表"
        columns={columns}
        rowKey="id"
        options={false}
        search={false}
        actionRef={actionRef}
        hideOnSinglePage={true}
        pagination={false}
        request={(parameters) => loadSalaryReportListData({
          current: current,
          size: pageSize,
          departId: departID ? departID : '',
          salaryMonth: location.query.salaryMonth ? location.query.salaryMonth : ''
        }).then((res) => {
          const data = res.data;

          if (data) {
            setTotal(data.total );
            setCurrent(data.current)
            setPageSize(data.size)
          } else {
            setTotal(0);
            setCurrent(1)
            setPageSize(0)
          }
          return {data: data.records};
        })}
        toolBarRender={false}
        onRow={(record, index) => {
          return {
            onClick: (e) => {
              console.log(record)
              history.push({
                pathname: '/detail/salary/projectReport',
                query: {
                  title: `${record.salaryMonth}月${record.departName}项目工资报表`,
                  salaryFormId: record.id,
                  revenueTime: record.revenueTime
                }
              })
            }
          }
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

    </div>
  )
}
export default (props) => {
  return (
    <React.Fragment>
      <KeepAlive>
        <SalaryReport {...props} />
      </KeepAlive>
    </React.Fragment>
  )
};
