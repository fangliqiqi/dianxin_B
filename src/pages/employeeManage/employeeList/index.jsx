import React, { useState, useRef, useEffect } from 'react';
import { history, KeepAlive, connect, useLocation } from 'umi';

import { message, Button, Dropdown, Menu, Upload, Modal, Tag, Tooltip } from 'antd';
import ProTable from '@ant-design/pro-table';
import { ToTopOutlined, DownloadOutlined, DownOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { handleTreeData, exportFormatJson, handleBlankRow, getParents } from '@/utils/utils';
import { departList, getTreeDepart, getDepartAll, allDeparts } from '@/services/depart';
import {
  employeeList,
  exportEmployee,
  batchFlashEmployee,
  getEmployeeBusinessInfoById,
  editEmployee,
} from '@/services/members';
import { loadProject, getProjectList,tsettledomain, getDictMap } from '@/services/global';
import { getBusAttaList } from '@/services/settlement';
import { getAllTags } from '@/services/tags';
import SelectPage from '@/components/SelectPage';
import Ellipsis from '@/components/Ellipsis';

import XLSX from 'xlsx';
import Edit from './edit';

const List = (props) => {
  // const { location } = props;

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [exportQuery, setExportQuery] = useState({});
  const [employeeAllTags, setEmployeeAllTags] = useState([]);
  const [fileObj, setFileObj] = useState({});
  const [token, setToken] = useState({});
  const [departs, setDeparts] = useState([]);
  const [certType, setCertType] = useState({});
  const actionRef = useRef();
  const childRef = useRef();
  const departRef = useRef();
  const formRef = useRef();

  const fieldParams = {
    姓名: 'empName',
    身份证: 'empIdcard',
    电信工号: 'businessTelecomNumber',
    所属部门名称: 'departName',
    最高学历及专业: 'highestDegreeAndMajor',
    岗位: 'businessPost',
    第一学历及专业: 'firstDegreeAndMajor',
    第一学历毕业院校: 'firstDegreeGraduateSchool',
    最高学历毕业院校: 'highestDegreeGraduateSchool',
    联系方式: 'contactInfo',
    档案托管地: 'archivesAddr',
    标签名称: 'employeeTags',
    入职时间: 'businessEnjoinDate',
  };
  const workingStatusOption = { 0: '在职', 1: '离职' };

  useEffect(() => {
    // 获取所有未删除部门
    getDepartAll()
      .then((res) => {
        if (res.code === 200) {
          setDeparts(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
    getDictMap({ itemType: 'cert_type', type: 0 })
      .then((res) => {
        if (res.code === 200) {
          setCertType(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // 每次页面进来重新获取标签
  useEffect(() => {
    // 员工标签
    getAllTags()
      .then((res) => {
        if (res.code === 200) {
          const obj = {};
          res.data.forEach((item) => {
            obj[item.id] = item.name;
          });
          setEmployeeAllTags(obj);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.location]);

  const findSon = (id, tree) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of tree) {
      if (item.id === id) return item;
      if (item.children) {
        const res = findSon(id, item.children);
        if (res) return res;
      }
    }
    return null;
  };

  // 编辑操作
  const editRow = async (mtitle, record) => {
    setTitle(mtitle);
    const departRes = await getTreeDepart();
    let departIds = null;
    if (departRes.code === 200) {
      if (departRes.data.id === record.departId) {
        departIds = record.departId;
      } else {
        const findson = findSon(record.departId, departRes.data.children);
        departIds = findson ? findson.id : null;
      }
      const result = handleTreeData(departRes.data.children, 'id', 'name', 'all', 0, 0, 'treeLogo');
      setTreeData([{ title: departRes.data.name, value: departRes.data.id, children: result }]);
    }
    const detailRes = await getEmployeeBusinessInfoById({
      id: record.id,
      settleDomain: record.settleDomain,
    });
    if (detailRes.code === 200) {
      const details = detailRes.data;
      const defaultVal = {
        ...details.employeeBusinessVo,
        ...{
          fundReduceDate: details.fundReduceDate,
          socialReduceDate: details.socialReduceDate,
          situationCount: details.situationCount,
          situation: details.situation,
          contractEndDate: details.contractEndDate,
          contractStartDate: details.contractStartDate,
        },
      };
      if (defaultVal.employeeTags) {
        const tags = defaultVal.employeeTags.split(',');
        defaultVal.employeeTags = tags.map((item) => {
          return Number(item);
        });
      } else {
        defaultVal.employeeTags = [];
      }
      const res2 = await getBusAttaList({ relationId: record.id });
      let file = [];
      if (res2.code === 200) {
        file = res2.data.map((item) => {
          return {
            uid: item.id,
            name: item.attaName,
            status: 'done',
            url: item.attaSrc,
          };
        });
      }
      childRef.current.showFileList(file);

      setDefaultValues({ ...defaultVal, ...{ departId: departIds, id: record.id } });

      setVisible(true);
    } else {
      message.warning(detailRes.msg);
    }
  };

  const handleDetail = (record) => {
    history.push({
      pathname: '/m/personerInfo/archives',
      query: {
        title: record.empName,
        id: record.id,
        empIdcard: record.empIdcard,
        empId: record.empId,
        settleDomain: record.settleDomain,
      },
    });
  };

  // 保存
  const handleOk = (values) => {
    values.extendId = values.extendId || null;
    // console.log(values);
    editEmployee(values).then((res) => {
      if (res.code === 200) {
        message.success(res.msg || '保存成功');
        setVisible(false);
        actionRef.current.reload();
      } else {
        message.warning(res.msg);
      }
    });
  };
  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    setDefaultValues(null);
  };

  const columns = [
    {
      title: '电信工号',
      dataIndex: 'businessTelecomNumber',
      valueType: 'text',
      width: 150,
      ellipsis: true,
    },
    {
      title: '所属部门',
      dataIndex: 'departId',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <SelectPage
            getData={departList}
            childRef={childRef}
            selectProps={{
              placeholder: '输入所属部门搜索',
              allowClear: true,
              showSearch: true,
              optionFilterProp: 'children',
            }}
            labeltitle="name"
            labelvalue="id"
          />
        );
      },
    },
    {
      title: '所属部门',
      dataIndex: 'departName',
      search: false,
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        const res = departs.find((item) => item.id === record.departId);
        let titletxt = '-';
        let longTxt = '';
        if (res) {
          longTxt = res.name;
          titletxt = longTxt.length > 8 ? `${longTxt.substring(0, 8)}...` : longTxt;
        }
        return (
          <Tooltip title={longTxt}>
            <span>{titletxt}</span>
          </Tooltip>
        );
      },
    },
    {
      title: '业务项目',
      dataIndex: 'settleDomain',
      ellipsis: true,
      hideInTable: true,
      // initialValue:localStorage.getItem('projectId'),
      search: {
        transform: (value) => {
          return { settleDomainId: value };
        },
      },
      renderFormItem: () => {
        return (
          <SelectPage
            getData={getProjectList}
            childRef={departRef}
            selectProps={{
              placeholder: '输入业务项目搜索',
              allowClear: true,
              showSearch: true,
              optionFilterProp: 'children',
            }}
            labeltitle="departName"
            labelvalue="id"
          />
        );
      },
    },
    {
      title: '业务项目',
      search: false,
      dataIndex: 'settleDomainName',
      ellipsis: true,
      width: 150,
    },
    {
      title: '姓名',
      dataIndex: 'empName',
      ellipsis: true,
      width: 100,
    },
    {
      title: '身份证号',
      dataIndex: 'empIdcard',
      ellipsis: true,
      width: 160,
    },
    {
      title: '岗位',
      dataIndex: 'businessPost',
      search: false,
      width: 100,
      ellipsis: true,
    },
    {
      title: '标签名称',
      dataIndex: 'employeeTags',
      valueType: 'select',
      ellipsis: true,
      width: 150,
      search: {
        transform: (value) => {
          return { employeeTagName: value };
        },
      },
      valueEnum: employeeAllTags,
      render: (text, record) => {
        if (record.employeeTags) {
          const res = record.employeeTags.split(',').map((item) => {
            return employeeAllTags[Number(item)];
          });
          const titletxt = res.join(',');
          let longTxt = titletxt;
          if (titletxt.length > 5) {
            longTxt = `${longTxt.substring(0, 5)}...`;
          }
          return (
            <Tooltip title={titletxt}>
              <span>{longTxt}</span>
            </Tooltip>
          );
        }
        return '-';
      },
    },
    {
      title: '证件类型',
      dataIndex: 'documentType',
      search: false,
      width: 150,
      render: (text, record) => {
        const res = record.documentType
          ? record.documentType.split(',').map((item) => {
              return certType[Number(item)];
            })
          : [];
        const titletxt = res.join(',');
        return <Ellipsis title={titletxt} length={10} />;
      },
    },
    {
      title: '在职状态',
      dataIndex: 'businessWorkingStatus',
      valueType: 'select',
      width: 150,
      valueEnum: workingStatusOption,
      render: (text, record) => {
        return String(record.businessWorkingStatus) === '1' ? '离职' : '在职';
      },
    },
    {
      title: '入职时间',
      dataIndex: 'businessEnjoinDate',
      search: false,
      width: 150,
      render: (text, record) => {
        return record.businessEnjoinDate ? record.businessEnjoinDate.substring(0, 10) : '-';
      },
    },
    {
      title: '离职时间',
      dataIndex: 'businessLeaveDate',
      search: false,
      width: 150,
      render: (text, record) => {
        return record.businessLeaveDate ? record.businessLeaveDate.substring(0, 10) : '-';
      },
    },
    {
      title: '是否持证',
      dataIndex: 'documentStatus',
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        0: '否',
        1: '是',
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (text, record) => [
        <a key="view" onClick={() => handleDetail(record)}>
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

  const handleTags = (tags) => {
    if (tags) {
      const arr = tags.split(',').map((item) => {
        return employeeAllTags[Number(item)];
      });
      return arr.join(',');
    }
  };

  // 导出
  const exportExcel = async () => {
    const res1 = await getDepartAll();
    let parents = [];
    if (res1.code === 200) {
      parents = res1.data;
    }
    const exportQuery = formRef.current.getFieldsValue();
    // console.log('[exportQuery ] >',exportQuery)

    const res2 = await exportEmployee(exportQuery);
    if (res2.code === 200 && res2.data) {
      const tableData = res2.data.map((item) => {
        const res = item.documentType
          ? item.documentType.split(',').map((item) => {
              return certType[Number(item)];
            })
          : [];

        const obj = {
          businessWorkingStatus: String(item.businessWorkingStatus) === '1' ? '离职' : '在职',
          employeeTags: handleTags(item.employeeTags),
          departName: getParents(parents, item.departId, []).reverse().join('-'),
          businessLeaveDate: item.businessLeaveDate ? item.businessLeaveDate.substring(0, 10) : '',
          documentType: res.join(','),
        };
        return { ...item, ...obj };
      });
      // 封面数据
      const excelDatas = [
        {
          tHeader: [
            '电信工号',
            '所属部门',
            '业务项目',
            '姓名',
            '身份证号',
            '岗位',
            '第一学历及专业',
            '第一学历毕业院校',
            '最高学历及专业',
            '最高学历毕业院校',
            '联系方式',
            '档案托管地',
            '标签名称',
            '证件类型',
            '在职状态',
            '入职时间',
            '离职时间',
          ],
          filterVal: [
            'businessTelecomNumber',
            'departName',
            'settleDomainName',
            'empName',
            'empIdcard',
            'businessPost',
            'firstDegreeAndMajor',
            'firstDegreeGraduateSchool',
            'highestDegreeAndMajor',
            'highestDegreeGraduateSchool',
            'contactInfo',
            'archivesAddr',
            'employeeTags',
            'documentType',
            'businessWorkingStatus',
            'businessEnjoinDate',
            'businessLeaveDate',
          ],
          tableDatas: tableData,
          sheetName: '单位信息',
        },
      ];
      json2excel(excelDatas, '人员', true, 'xlsx', true);
    } else {
      message.warning(res1.msg);
    }
  };

  // 请求列表
  const requestList = async (params) => {
    setExportQuery(params);
    const query = { ...params };
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    const listRes = await employeeList(query);
    let records = [];
    let resTotal = 0;
    if (listRes.code === 200) {
      records = listRes.data.records;
      resTotal = listRes.data.total;
      // if(resTotal){
      //   const settleDomain = await tsettledomain(records[0].settleDomain);
      //   if(settleDomain.code === 200 && settleDomain.data){
      //     records = records.map(item=>{
      //       return {...item,...{settleDomainId:item.settleDomain,settleDomain:settleDomain.data.departName}};
      //     })
      //   }
      // }
    } else {
      message.warning(listRes.msg);
    }
    return { data: records, total: resTotal };
  };

  const showMsg = (mtitle, list) => {
    Modal.info({
      title: '导入提示：数据导入结果：',
      content: (
        <div
          style={{
            marginTop: '20px',
            maxHeight: '450px',
            overflowY: list.length > 20 ? 'scroll' : 'hidden',
          }}
        >
          {list.length
            ? list.map((item, index) => {
                return (
                  <div key={index}>
                    第{item.lineNum}行: {item.message}
                  </div>
                );
              })
            : mtitle}
        </div>
      ),
    });
  };

  // 导入
  const uploadProps = {
    showUploadList: false,
    action: '/yifu-business/method/tbusdept/getParentList',
    method: 'get',
    headers: token,
    beforeUpload(file) {
      setFileObj(file);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        // 通过FileReader对象读取文件
        const fileReader = new FileReader();
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(fileObj);
        fileReader.onload = (event) => {
          try {
            const { result } = event.target;
            // 以二进制流方式读取得到整份excel表格对象
            const workbook = XLSX.read(result, { type: 'binary' });
            // 存储获取到的数据
            const data = {};
            let sheetName = '';
            // 遍历获取每张工作表 除去隐藏表
            const allSheets = workbook.Workbook.Sheets;
            Object.keys(allSheets).every((key) => {
              const { name } = allSheets[key];
              if (workbook.Sheets.hasOwnProperty(name) && allSheets[key].Hidden === 0) {
                sheetName = name;
                // 利用 sheet_to_json 方法将 excel 转成 json 数据
                data[name] = [].concat(
                  XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: '', blankrows: true }),
                );
                return false;
              }
            });
            // 处理数据前后空格以及最后一行空白
            const list = handleBlankRow(data[sheetName]);

            // 转换数据
            const resArr = list.map((item) => {
              const obj = {};
              Object.keys(item).forEach((elemnet) => {
                obj[fieldParams[elemnet]] = item[elemnet];
              });
              return obj;
            });
            setBtnLoading(true);
            batchFlashEmployee(resArr)
              .then((res) => {
                showMsg(res.msg, res.data || []);
                if (res.code === 200) {
                  actionRef.current.reload();
                }
              })
              .finally(() => {
                setBtnLoading(false);
              });
          } catch (e) {
            message.error('文件上传错误！');
          }
        };
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name}上传失败`);
      }
    },
  };

  const menu = () => {
    return (
      <Menu>
        <Menu.Item key="1">
          <Upload {...uploadProps}>
            <ToTopOutlined /> 批量更新
          </Upload>
        </Menu.Item>
        <Menu.Item key="2">
          <a href="/templates/人员信息批量更新.xls" target="_blank" rel="noopener noreferrer">
            <DownloadOutlined /> 下载模板
          </a>
        </Menu.Item>
      </Menu>
    );
  };

  const onReset = () => {
    setExportQuery({});
  };

  return (
    <PageHeader title="人员信息">
      <ProTable
        rowClassName="gesture"
        rowKey="id"
        tableClassName="xscrollbar"
        columns={columns}
        options={false}
        formRef={formRef}
        actionRef={actionRef}
        search={{
          span: 6,
          optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
          className: 'searchForm',
        }}
        onReset={onReset}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        request={(params) => requestList(params)}
        headerTitle={
          <>
            <Button
              key="export"
              onClick={() => exportExcel()}
              loading={btnLoading}
              icon={<DownloadOutlined />}
              type="primary"
              style={{ marginRight: '10px' }}
            >
              导出
            </Button>
            <Dropdown overlay={menu}>
              <Button loading={btnLoading}>
                批量更新
                <DownOutlined />
              </Button>
            </Dropdown>
          </>
        }
      />
      <Edit
        visible={visible}
        childRef={childRef}
        title={title}
        treeData={treeData}
        defaultValues={defaultValues}
        handleCancel={() => {
          handleCancel();
        }}
        handleOk={handleOk}
      />
    </PageHeader>
  );
};

const employeeListComponent = (props) => {
  return (
    <>
      <KeepAlive>
        <List {...props} />
      </KeepAlive>
    </>
  );
};

export default connect(({ tagList }) => {
  return {
    allTagList: tagList,
  };
})(employeeListComponent);
