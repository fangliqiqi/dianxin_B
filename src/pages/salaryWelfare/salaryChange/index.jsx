import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'umi';
import { message, Button } from 'antd';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { exportFormatJson, formatSign, formatSignColor, getSpecialParents } from '@/utils/utils';
import {
  departSalaryList,
  departSalaryStatics,
  exportDepartSalary,
  curDepartInfo,
  curPersonStatic,
} from '@/services/salaryWelfare';

import { getSubDepart, getTreeDepart } from '@/services/depart';
import moment from 'moment';
import Ellipsis from '@/components/Ellipsis';
import Detail from './detail';
import qs from 'qs';
import styles from './index.less';

const List = (props) => {
  const { history, location } = props;
  const [staticsData, setStaticsData] = useState({});
  const [currentStaticsData, setCurrentStaticsData] = useState({});
  const [subStaticsData, setSubStaticsData] = useState({});
  const [exportQuery, setExportQuery] = useState({});
  const [departs, setDeparts] = useState({});
  const [departTree, setDepartTree] = useState([]);

  const [isSubDepart, setIsSubDepart] = useState(false);
  const [currentShow, setCurrentShow] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const [tableTitle, setTableTitle] = useState('薪酬变动');
  const [dataSource, setDataSource] = useState([]);
  const [currentDataSource, setCurrentDataSource] = useState([]);
  const [paginationConfig, setPaginationConfig] = useState({
    show: true,
    pageSize: 10,
    current: 1,
    total: 0,
    defaultPageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  const actionRef = useRef();
  const formRef = useRef();

  // 统计数据
  const staticsSalary = (params) => {
    const query = { ...params };
    delete query.pageSize;
    delete query.current;
    delete query.size;
    delete query.departLevel;
    departSalaryStatics(query).then((res) => {
      if (res.code === 200) {
        setStaticsData(res.data);
      }
    });
  };
  const staticsSubSalary = (params) => {
    departSalaryStatics(params)
      .then((res) => {
        if (res.code === 200) {
          setSubStaticsData(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 查询部门下拉选项
  const departRequest = (params) => {
    let query = { pid: 2, level: 1 };
    if (Object.keys(params).length) {
      query = params;
    }
    // 获取默认电信所有一级部门
    getSubDepart(query).then((res) => {
      if (res.code === 200) {
        const obj = {};
        res.data.forEach((item) => {
          obj[item.treeLogo] = item.name;
        });
        setDeparts(obj);
      }
    });
  };

  const getLevel = (treeLogo) => {
    const reg = new RegExp('-', 'g');
    return treeLogo.match(reg).length;
  };

  // 请求列表
  const requestList = async (params) => {
    const query = { ...params };
    delete query.departName;
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    if (!query.treeLogo) {
      query.treeLogo = '1-2';
    }

    // 当前部门列表
    if (history.location.search) {
      query.salaryMonth = history.location.query.salaryMonth;
      departRequest({
        pid: query.treeLogo.split('-')[query.departLevel],
        level: query.departLevel,
      });
      const logo = formRef.current.getFieldValue('treeLogo'); // 获取搜索中的部门
      // 下级部门变动
      staticsSubSalary({ treeLogo: logo || `${query.treeLogo}-`, salaryMonth: query.salaryMonth });
      // 薪酬变动合计
      staticsSalary({
        salaryMonth: query.salaryMonth,
        treeLogo: logo ? history.location.query.treeLogo : query.treeLogo,
      });
    } else {
      // 默认一级部门
      departRequest({});
      query.departLevel = 1;
      const logo = formRef.current.getFieldValue('treeLogo'); // 获取搜索中的部门
      // 电信部门统计
      staticsSubSalary({ treeLogo: logo || '1-2', salaryMonth: query.salaryMonth });
    }

    setExportQuery(query);
    let records = [];
    let totalAll = 0;
    const res = await departSalaryList(query);
    if (res.code === 200) {
      const dataRes = res.data;
      if (dataRes) {
        records = dataRes.records;
        totalAll = dataRes.total;
      }
    }
    // console.log('query', query);
    setPaginationConfig({
      ...paginationConfig,
      ...{ total: totalAll, pageSize: query.pageSize, current: query.current },
    });
    setDataSource(records);
  };

  // 获取当前部门薪酬信息
  const getCurrentSalary = async (record) => {
    const res2 = await curDepartInfo({
      departId: record.departId,
      salaryMonth: record.salaryMonth,
    });
    if (res2.code === 200 && res2.data) {
      const arrData = [];
      arrData.push(res2.data);
      setCurrentDataSource(arrData);
    }
    // 当前部门薪酬统计
    const res3 = await curPersonStatic({
      departId: record.departId,
      salaryMonth: record.salaryMonth,
    });
    if (res3.code === 200 && res3.data) {
      setCurrentShow(true);
      setCurrentStaticsData(res3.data);
    } else {
      setCurrentShow(false);
    }
  };

  useEffect(() => {
    getTreeDepart().then((res) => {
      if (res.code === 200) {
        setDepartTree(res.data);
      }
    });
    if (history.location.search) {
      const params = history.location.query;
      // 设置标题
      setTableTitle(params.departName);
      setIsSubDepart(true);
      // 上级部门信息
      requestList(params);
      // 当前部门信息
      getCurrentSalary({ departId: params.departId, salaryMonth: params.salaryMonth });
      setRefresh(true);
    } else {
      // 点击左侧菜单
      setIsSubDepart(false);
      if (refresh) {
        requestList({
          departLevel: 1,
          salaryMonth: moment().subtract(1, 'month').format('YYYYMM'),
        });
        setRefresh(false);
      }
    }
  }, [location.search]);

  // 点击查询子部门
  const clickDepart = async (record) => {
    // 当前部门层级
    const levels = getLevel(record.treeLogo);
    const res1 = await getSubDepart({ level: levels, pid: record.departId });
    if (res1.code === 200) {
      if (res1.data.length) {
        // 有子部门仍然部门薪酬查询
        const urlParam = {
          departName: record.departName,
          treeLogo: record.treeLogo,
          salaryMonth: record.salaryMonth,
          departLevel: levels,
          departId: record.departId,
        };
        history.push(`/salaryWelfare/salaryChange?${qs.stringify(urlParam)}`);
        const params = {
          treeLogo: record.treeLogo,
          departLevel: levels,
          salaryMonth: record.salaryMonth,
        };
        setExportQuery(params);
        const obj = {};
        res1.data.forEach((item) => {
          obj[item.treeLogo] = item.name;
        });
        setDeparts(obj);
        // 清空查询表单
        formRef.current.setFieldsValue({ treeLogo: undefined, salaryChangeType: undefined });
      } else {
        // 无子部门跳转个人薪酬
        history.push(
          `/salaryWelfare/salaryChange?type=detail&salaryMonth=${record.salaryMonth}&treeLogo=${record.treeLogo}&departName=${record.departName}`,
        );
      }
    }
  };

  // 跳转人员薪酬页面
  const goDetail = (record) => {
    history.push(
      `/salaryWelfare/salaryChange?type=detail&selectType=1&salaryMonth=${record.salaryMonth}&treeLogo=${record.treeLogo}&departName=${record.departName}`,
    );
  };

  const columns = [
    {
      title: '部门',
      dataIndex: 'treeLogo',
      hideInTable: true,
      valueType: 'select',
      valueEnum: departs,
      fieldProps: {
        showSearch: true,
        optionFilterProp: 'label',
        allowClear: false,
      },
      // initialValue: '',
      // search:{
      //   transform: (value)=>{
      //     const reg = new RegExp("-","g");
      //     return {treeLogo:value,departLevel:value.match(reg).length}
      //   }
      // },
    },
    {
      title: '部门名称',
      dataIndex: 'departName',
      search: false,
      width: 200,
      ellipsis: true,
      render: (text, record) => {
        return (
          <Button type="link" onClick={() => clickDepart(record)}>
            <Ellipsis title={record.departName} length={8} />
          </Button>
        );
      },
    },
    {
      title: '工资月份',
      dataIndex: 'salaryMonth',
      initialValue: moment().subtract(1, 'month').format('YYYYMM'),
      valueType: 'date',
      width: 150,
      ellipsis: true,
      search: !isSubDepart,
      fieldProps: {
        format: 'YYYYMM',
        picker: 'month',
        allowClear: false,
      },
    },
    // {
    //   title: '变动类型',
    //   dataIndex: 'salaryChangeType',
    //   valueType: 'select',
    //   valueEnum: changeType,
    //   width:150,
    //   hideInTable: true,
    //   fieldProps:{
    //     showSearch:true,
    //     optionFilterProp:'children',
    //   },
    // },
    {
      title: '人数',
      dataIndex: 'peopleNumber',
      valueType: 'text',
      width: 100,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.peopleNumberFlag,
          record.peopleNumber,
          record.peopleNumberOffset,
          1,
        );
      },
    },
    {
      title: '薪酬应发',
      dataIndex: 'payableSalary',
      valueType: 'text',
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
    {
      title: '人均成本',
      dataIndex: 'perCapita',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(record.perCapitaFlag, record.perCapita, record.perCapitaOffset);
      },
    },
  ];
  const currentColumns = [
    {
      title: '部门名称',
      dataIndex: 'departName',
      search: false,
      width: 200,
      ellipsis: true,
      render: (text, record) => {
        return (
          <Button type="link" onClick={() => goDetail(record)}>
            <Ellipsis title={record.departName} length={8} />
          </Button>
        );
      },
    },
    {
      title: '工资月份',
      dataIndex: 'salaryMonth',
      initialValue: moment().subtract(1, 'month').format('YYYYMM'),
      valueType: 'date',
      width: 150,
      ellipsis: true,
      fieldProps: {
        format: 'YYYYMM',
        picker: 'month',
        allowClear: false,
      },
    },
    {
      title: '人数',
      dataIndex: 'peopleNumber',
      valueType: 'text',
      width: 100,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(
          record.peopleNumberFlag,
          record.peopleNumber,
          record.peopleNumberOffset,
          1,
        );
      },
    },
    {
      title: '薪酬应发',
      dataIndex: 'payableSalary',
      valueType: 'text',
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
    {
      title: '人均成本',
      dataIndex: 'perCapita',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
      render: (text, record) => {
        return formatSignColor(record.perCapitaFlag, record.perCapita, record.perCapitaOffset);
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
    let name = tableTitle;
    const query = formRef.current.getFieldsValue();
    const queryData = Object.assign({}, exportQuery, query);

    // 如果有参数treeLogo
    if (query.treeLogo) {
      queryData.treeLogo = query.treeLogo;
    } else {
      queryData.treeLogo = exportQuery.treeLogo;
    }

    if (queryData.salaryMonth && queryData.salaryMonth._isAMomentObject) {
      queryData.salaryMonth = queryData.salaryMonth.format('YYYYMM');
    }

    if (tableTitle === '薪酬变动') name = '电信';
    name += ` ${queryData.salaryMonth}下级部门变动 ${moment().format('YYYY年MM月DD日')}`;
    const res2 = await exportDepartSalary(queryData);
    if (res2.code === 200) {
      const tableData = res2.data.map((item) => {
        const obj = {
          peopleNumber: formatSign(
            item.peopleNumberFlag,
            item.peopleNumber,
            item.peopleNumberOffset,
          ),
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
          perCapita: formatSign(item.perCapitaFlag, item.perCapita, item.perCapitaOffset),
        };
        return { ...item, ...obj };
      });
      // 封面数据
      const excelDatas = [
        {
          tHeader: [
            '部门名称',
            '工资月份',
            '人数',
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
            '人均成本',
          ],
          filterVal: [
            'departName',
            'salaryMonth',
            'peopleNumber',
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
            'perCapita',
          ],
          tableDatas: tableData,
          sheetName: '薪酬变动',
        },
      ];
      json2excel(excelDatas, name, true, 'xlsx', true);
    } else {
      message.warning(res2.msg);
    }
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

  const renderSum = (data) => {
    return (
      <>
        应发：
        {data
          ? formatSignColor(data.payableTotalFlag, data.payableTotal, data.payableTotalOffset)
          : '- | -'}
        ； 实发：
        {data
          ? formatSignColor(data.actualSalaryFlag, data.actualSalary, data.actualSalaryOffset)
          : '- | -'}
        ； 人均成本：
        {data ? formatSignColor(data.perCapitaFlag, data.perCapita, data.perCapitaOffset) : '- | -'}
      </>
    );
  };
  // 面包屑跳转地址
  const jumpUrl = (urlParam) => {
    history.push(`/salaryWelfare/salaryChange?${qs.stringify(urlParam)}`);
    if (Object.keys(urlParam).length === 0) {
      setIsSubDepart(false);
      const monthFiled = formRef.current.getFieldValue('salaryMonth');
      let month = null;
      if (moment(monthFiled).isValid()) {
        month = moment(monthFiled).format('YYYYMM');
        formRef.current.setFieldsValue({ salaryMonth: month });
      }
      requestList({
        salaryMonth: month || moment().subtract(1, 'month').format('YYYYMM'),
        treeLogo: '1-2',
        pageSize: 10, 
        current: 1
      });
    }
  };
  // 获取地址
  const getUrl = (obj, index, item, length) => {
    if (index === 0) {
      return {};
    }
    if (index === length - 1) {
      return obj;
    } else {
      return {
        ...obj,
        ...{
          departLevel: index + 1,
          departName: item.name,
          departId: item.id,
          treeLogo: item.treeLogo,
        },
      };
    }
  };

  // 设置面包屑导航
  const getCrumbNav = (tree) => {
    if (tree.treeLogo && departTree.children) {
      const parents = getSpecialParents(departTree.children, 'treeLogo', tree.treeLogo);
      const arr = [];
      const leng = parents.length;
      parents.forEach((item, index) => {
        arr.push(
          <span key={item.id}>
            {index < leng - 1 ? (
              <a onClick={() => jumpUrl(getUrl(tree, index, item, leng))}>{item.name}</a>
            ) : null}
            {index !== leng - 1 ? ' > ' : null}
          </span>,
        );
      });
      return arr;
    }
    // return (<a onClick={()=>jumpUrl({})}>电信</a>);
  };

  return (
    <div>
      <div style={{ margin: '15px 24px 0px' }}>
        <span>薪酬福利</span> &gt; <span>薪酬变动</span> &gt; {getCrumbNav(history.location.query)}
      </div>
      {history.location.search && currentShow ? (
        <>
          <div className={styles.static}>
            <span className={styles.span}>薪酬变动合计</span>——
            {renderSum(staticsData)}
          </div>
          <ProTable
            rowClassName="gesture"
            tableClassName="xscroll"
            rowKey="id"
            search={false}
            options={false}
            pagination={false}
            columns={currentColumns}
            dataSource={currentDataSource}
            headerTitle={<span className={styles.headTitle}>本部门变动</span>}
            toolBarRender={() => <div>{renderFontColor(currentStaticsData)}</div>}
          />
          <div className={styles.subTitle}>下级部门变动</div>
        </>
      ) : null}
      <ProTable
        rowClassName="gesture"
        tableClassName="xscroll"
        rowKey="id"
        columns={columns}
        options={false}
        actionRef={actionRef}
        formRef={formRef}
        request={(params) => requestList({ ...history.location.query, ...params })}
        dataSource={dataSource}
        search={{
          span: 6,
          labelWidth: 'auto',
          optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
          className: 'searchForm',
        }}
        pagination={paginationConfig}
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
          filter: renderFontColor(subStaticsData),
        }}
      />
    </div>
  );
};

const salary = (props) => {
  const { location } = props;
  return (
    <>
      {location && location.query && location.query.type && location.query.type === 'detail' ? (
        <Detail {...props} />
      ) : (
        <List {...props} />
      )}
    </>
  );
};

export default connect(() => {
  return {};
})(salary);
