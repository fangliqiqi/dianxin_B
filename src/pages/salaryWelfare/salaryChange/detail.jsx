import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'umi';
import { message, Button } from 'antd';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined } from '@ant-design/icons';
import { exportFormatJson, formatSign, formatSignColor, getSpecialParents } from '@/utils/utils';
import { personStaticsList, exportPersonStatics, personStaticsSum } from '@/services/salaryWelfare';
import { getTreeDepart } from '@/services/depart';
import moment from 'moment';
import qs from 'qs';

const List = (props) => {
  const { location, history } = props;
  
  const [exportQuery, setExportQuery] = useState({});
  const [staticsData, setStaticsData] = useState({});
  const [departTree, setDepartTree] = useState([]);
  const actionRef = useRef();
  const formRef = useRef();

  useEffect(() => {
    getTreeDepart().then((res) => {
      if (res.code === 200) {
        setDepartTree(res.data);
      }
    });
  }, []);

  const columns = [
    {
      title: '姓名',
      dataIndex: 'empName',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: '电信工号',
      dataIndex: 'teleNo',
      valueType: 'text',
      width: 150,
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'empName',
      width: 150,
      search: false,
    },
    {
      title: '身份证号',
      dataIndex: 'empIdCard',
      valueType: 'text',
      width: 160,
      ellipsis: true,
    },
    {
      title: '工资月份',
      dataIndex: 'salaryMonth',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '薪酬应发',
      dataIndex: 'payableSalary',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.payableSalaryFlag,
          record.payableSalary,
          record.payableSalaryOffset,
        );
      },
    },
    {
      title: '激励应发',
      dataIndex: 'payableIncentiveSalary',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.payableIncentiveSalaryFlag,
          record.payableIncentiveSalary,
          record.payableIncentiveSalaryOffset,
        );
      },
    },
    {
      title: '其他应发',
      dataIndex: 'payableOtherSalary',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.payableOtherSalaryFlag,
          record.payableOtherSalary,
          record.payableOtherSalaryOffset,
        );
      },
    },
    {
      title: '应发合计',
      dataIndex: 'payableTotal',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.payableTotalFlag,
          record.payableTotal,
          record.payableTotalOffset,
        );
      },
    },
    {
      title: '单位社保',
      dataIndex: 'companySocial',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.companySocialFlag,
          record.companySocial,
          record.companySocialOffset,
        );
      },
    },
    {
      title: '单位公积金',
      dataIndex: 'companyAccFund',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.companyAccFundFlag,
          record.companyAccFund,
          record.companyAccFundOffset,
        );
      },
    },
    {
      title: '代扣个人社保',
      dataIndex: 'personalSocial',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.personalSocialFlag,
          record.personalSocial,
          record.personalSocialOffset,
        );
      },
    },
    {
      title: '代扣个人公积金',
      dataIndex: 'personalAccFund',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.personalAccFundFlag,
          record.personalAccFund,
          record.personalAccFundOffset,
        );
      },
    },
    {
      title: '代扣个税',
      dataIndex: 'indIncomeTax',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.indIncomeTaxFlag,
          record.indIncomeTax,
          record.indIncomeTaxOffset,
        );
      },
    },
    {
      title: '其他扣款',
      dataIndex: 'otherDedutions',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.otherDedutionFalg,
          record.otherDedutions,
          record.otherDedutionOffset,
        );
      },
    },
    {
      title: '扣款合计',
      dataIndex: 'dedutionTotal',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.dedutionTotalFlag,
          record.dedutionTotal,
          record.dedutionTotalOffset,
        );
      },
    },
    {
      title: '实发工资',
      dataIndex: 'actualSalary',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.actualSalaryFlag,
          record.actualSalary,
          record.actualSalaryOffset,
        );
      },
    },
  ];

  // 导出
  const json2excel = (tableJson, filenames, autowidth, bookTypes, typeLength) => {
    import('@/utils/exportCommonExcel')
      .then((excel) => {
        const tHeader = [];
        const dataArr = [];
        const sheetnames = [];
        tableJson.forEach((item, index) => {
          tHeader.push(tableJson[index].tHeader);
          dataArr.push(exportFormatJson(tableJson[index].filterVal, tableJson[index].tableDatas));
          sheetnames.push(tableJson[index].sheetName);
        });
        excel.export_json_to_excel_more_sheet({
          header: tHeader,
          data: dataArr,
          sheetname: sheetnames,
          filename: filenames,
          bookType: bookTypes,
          autoLength: typeLength, // 所有类型长度
        });
      })
      .finally(() => {
        message.success('导出成功！');
      });
  };

  // 导出
  const exportExcel = async () => {
    const query = formRef.current?.getFieldsValue();
    const queryData = Object.assign({}, exportQuery, query);
    for (let key in queryData) {
      if (!queryData[key]) {
        delete queryData[key];
      }
    }

    const res2 = await exportPersonStatics(queryData);
    const name = `${queryData.departName || ''}个人薪资变动 ${
      queryData.salaryMonth || ''
    } ${moment().format('YYYY年MM月DD日')}`;
    if (res2.code === 200) {
      const tableData = res2.data.map((item) => {
        const obj = {
          payableSalary: formatSign(
            item.payableSalaryFlag,
            item.payableSalary,
            item.payableSalaryOffset,
          ),
          payableIncentiveSalary: formatSign(
            item.payableIncentiveSalaryFlag,
            item.payableIncentiveSalary,
            item.payableIncentiveSalaryOffset,
          ),
          payableOtherSalary: formatSign(
            item.payableOtherSalaryFlag,
            item.payableOtherSalary,
            item.payableOtherSalaryOffset,
          ),
          payableTotal: formatSign(
            item.payableTotalFlag,
            item.payableTotal,
            item.payableTotalOffset,
          ),
          companySocial: formatSign(
            item.companySocialFlag,
            item.companySocial,
            item.companySocialOffset,
          ),
          companyAccFund: formatSign(
            item.companyAccFundFlag,
            item.companyAccFund,
            item.companyAccFundOffset,
          ),
          personalSocial: formatSign(
            item.personalSocialFlag,
            item.personalSocial,
            item.personalSocialOffset,
          ),
          personalAccFund: formatSign(
            item.personalAccFundFlag,
            item.personalAccFund,
            item.personalAccFundOffset,
          ),
          indIncomeTax: formatSign(
            item.indIncomeTaxFlag,
            item.indIncomeTax,
            item.indIncomeTaxOffset,
          ),
          otherDedutions: formatSign(
            item.otherDedutionFalg,
            item.otherDedutions,
            item.otherDedutionOffset,
          ),
          dedutionTotal: formatSign(
            item.dedutionTotalFlag,
            item.dedutionTotal,
            item.dedutionTotalOffset,
          ),
          actualSalary: formatSign(
            item.actualSalaryFlag,
            item.actualSalary,
            item.actualSalaryOffset,
          ),
        };
        return { ...item, ...obj };
      });
      // 封面数据
      const excelDatas = [
        {
          tHeader: [
            '电信工号',
            '姓名',
            '身份证号',
            '工资月份',
            '薪酬应发',
            '激励应发',
            '其他应发',
            '应发合计',
            '单位社保',
            '单位公积金',
            '代扣个人社保',
            '代扣个人公积金',
            '代扣个税',
            '其他扣款',
            '扣款合计',
            '实发工资',
          ],
          filterVal: [
            'teleNo',
            'empName',
            'empIdCard',
            'salaryMonth',
            'payableSalary',
            'payableIncentiveSalary',
            'payableOtherSalary',
            'payableTotal',
            'companySocial',
            'companyAccFund',
            'personalSocial',
            'personalAccFund',
            'indIncomeTax',
            'otherDedutions',
            'dedutionTotal',
            'actualSalary',
          ],
          tableDatas: tableData,
          sheetName: '个人薪资变动',
        },
      ];

      json2excel(excelDatas, name, true, 'xlsx', true);
    } else {
      message.warning(res2.msg);
    }
  };

  // 请求列表
  const requestList = async (params) => {
    const query = { ...params, ...location.query };
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    setExportQuery(query);
    let records = [];
    let totalAll = 0;
    const res1 = await personStaticsList(query);
    if (res1.code === 200) {
      const dataRes = res1.data;
      if (dataRes) {
        records = dataRes.records;
        totalAll = dataRes.total;
      }
    }
    const res2 = await personStaticsSum(query);
    if (res2.code === 200) {
      setStaticsData(res2.data);
    }
    return { data: records, total: totalAll };
  };

  // 面包屑跳转地址
  const jumpUrl = (urlParam) => {
    history.push(`/salaryWelfare/salaryChange?${qs.stringify(urlParam)}`);
    if (Object.keys(urlParam).length === 0) {
      requestList({ salaryMonth: moment().subtract(1,'month').format('YYYYMM'), treeLogo: '1-2',
    });
    }
  };
  // 获取地址
  const getUrl = (obj, index, item) => {
    if (index === 0) {
      return {};
    }
    delete obj.selectType;
    delete obj.type;
    return {
      ...obj,
      ...{
        departLevel: index + 1,
        departName: item.name,
        departId: item.id,
        treeLogo: item.treeLogo,
      },
    };
  };
  // 设置面包屑导航
  const getCrumbNav = (tree) => {
    if (tree.treeLogo && departTree.children) {
      const parents = getSpecialParents(departTree.children, 'treeLogo', tree.treeLogo)||[];
      // debugger
      const arr = [];
      const leng = parents.length||[];
      const lastRouter = parents.length&&parents[parents.length - 1].children;

      parents.forEach((item, index) => {
        arr.push(
          <span key={item.id}>
            {index === leng - 1 && !lastRouter ? null : (
              <>
                <a onClick={() => jumpUrl(getUrl(tree, index, item))}>{item.name}</a> &gt;{' '}
              </>
            )}
          </span>,
        );
      });
      return arr;
    }
    return <a onClick={() => jumpUrl({})}>电信</a>;
  };

  const renderFontColor = (data) => {
    return (
      <>
        合计：应发：
        {data
          ? formatSignColor(data.payableTotalFlag, data.payableTotal, data.payableTotalOffset)
          : '- | -'}
        ；实发：
        {data
          ? formatSignColor(data.actualSalaryFlag, data.actualSalary, data.actualSalaryOffset)
          : '- | -'}
        ；人均成本：
        {data ? formatSignColor(data.perCapitaFlag, data.perCapita, data.perCapitaOffset) : '- | -'}
      </>
    );
  };

  return (
    <>
      <div style={{ margin: '15px 24px 0px' }}>
        <span>薪酬福利</span> &gt; <span>薪酬变动</span> &gt; {getCrumbNav(history.location.query)}
      </div>
      <ProTable
        rowClassName="gesture"
        tableClassName="xscroll"
        rowKey="id"
        columns={columns}
        options={false}
        actionRef={actionRef}
        formRef={formRef}
        request={(params) => requestList(params)}
        search={{
          span: 6,
          labelWidth: 'auto',
          optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
          className: 'searchForm',
        }}
        // pagination={{ pageSize: 10 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        headerTitle={
          <>
            <Button
              key="export"
              onClick={() => exportExcel()}
              icon={<DownloadOutlined />}
              type="primary"
              style={{ marginLeft: '8px' }}
            >
              导出
            </Button>
          </>
        }
        toolbar={{
          filter: renderFontColor(staticsData),
        }}
      />
    </>
  );
};

const salary = (props) => {
  return (
    <>
      <List {...props} />
    </>
  );
};

export default connect(() => {
  return {};
})(salary);
