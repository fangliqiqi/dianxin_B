import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Button, Dropdown, Menu, Upload, Modal, Popconfirm } from 'antd';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined, UploadOutlined, RedoOutlined, DownOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { exportFormatJson, handleBlankRow, getParents } from '@/utils/utils';
import { departList, getDepartAll, allDeparts } from '@/services/depart';
import {
  getCertList,
  importCert,
  editCertInfo,
  batchEditCert,
  delCert,
  getDetail,
  exportCert,
} from '@/services/credentials';
import { getAllTags } from '@/services/tags';
import { getDictMap } from '@/services/global';
import XLSX from 'xlsx';
import SelectPage from '@/components/SelectPage';
import RemoteFieldName from '@/components/RemoteFieldName';
import Ellipsis from '@/components/Ellipsis';

import Edit from './edit';
import Detail from './detail';

const List = () => {
  const [visible, setVisible] = useState(false);
  const [detailVisble, setDetailVisble] = useState(false);
  const [title, setTitle] = useState('');
  const [defaultValues, setDefaultValues] = useState({});
  const [exportQuery, setExportQuery] = useState({});

  const [employeeAllTags, setEmployeeAllTags] = useState([]);
  const [allDepartList, setAllDepartList] = useState([]);
  const [token, setToken] = useState({});
  const [certStatus, setCertStatus] = useState({});
  const [certType, setCertType] = useState({});
  const [ifileObj, setIfileObj] = useState({});
  const [ffileObj, setFfileObj] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);

  const actionRef = useRef();
  const childRef = useRef();
  const detailRef = useRef();
  const formRef = useRef();

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
    // 获取数据字典
    getDictMap({ itemType: 'cert_status', type: 0 })
      .then((res) => {
        if (res.code === 200) {
          setCertStatus(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    getDictMap({ itemType: 'cert_type', type: 0 })
      .then((res) => {
        if (res.code === 200) {
          setCertType(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    // 获取所有的部门
    getDepartAll()
      .then((res) => {
        if (res.code === 200) {
          setAllDepartList(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
  }, []);

  const handleOption = (obj) => {
    const arr = [];
    // eslint-disable-next-line
    for (const key in obj) {
      arr.push({
        value: key,
        label: obj[key],
      });
    }
    return arr;
  };
  // 编辑操作
  const editRow = async (mtitle, record) => {
    setTitle(mtitle);
    childRef.current.showCertTypeOption(handleOption(certType));
    childRef.current.showCertStatusOption(handleOption(certStatus));
    childRef.current.showToken(token);
    getDetail(record.id).then((res) => {
      if (res.code === 200 && res.data) {
        const file = res.data.attaInfos.map((item) => {
          return {
            uid: item.id,
            name: item.attaName,
            src: item.attaSrc,
            status: 'done',
            thumbUrl: item.attaSrc,
          };
        });
        childRef.current.showFileList(file);
        setDefaultValues({
          ...res.data.certInfo,
          ...{
            termValidity: [res.data.certInfo.termValidityStart, res.data.certInfo.termValidityEnd],
          },
        });
        setVisible(true);
      } else {
        message.warning(res.msg);
      }
    });
  };

  // 查看详情
  const showDetail = (record) => {
    detailRef.current.showCertTypeOption(certType);
    detailRef.current.showCertStatusOption(certStatus);
    getDetail(record.id).then((res) => {
      if (res.code === 200 && res.data) {
        const file = res.data.attaInfos.map((item) => {
          return {
            uid: item.id,
            name: item.attaName,
            src: item.attaSrc,
            status: 'done',
            thumbUrl: item.attaSrc,
          };
        });
        setDefaultValues({ ...res.data.certInfo, ...{ fileList: file } });
        setDetailVisble(true);
      } else {
        message.warning(res.msg);
      }
    });
  };

  // 保存
  const handleOk = async (values) => {
    const res = await editCertInfo(values);
    if (res.code === 200) {
      message.success('保存成功!');
      setVisible(false);
      actionRef.current.reload();
    } else {
      message.warning(res.msg);
    }
  };

  // 删除
  const handleDelete = (record) => {
    delCert(record.id).then((res) => {
      if (res.code === 200) {
        message.success('删除成功！');
        actionRef.current.reloadAndRest();
      } else {
        message.warning(res.msg);
      }
    });
  };

  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    setDefaultValues({});
  };
  const closeDialog = () => {
    setDetailVisble(false);
    setDefaultValues({});
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'empName',
      valueType: 'text',
      hideInTable: true,
    },
    {
      title: '电信工号',
      dataIndex: 'businessTelecomNumber',
      valueType: 'text',
      search: false,
      width: 100,
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'empName',
      valueType: 'text',
      search: false,
      width: 100,
      ellipsis: true,
    },
    {
      title: '身份证号',
      dataIndex: 'empIdcard',
      valueType: 'text',
      ellipsis: true,
      width: 180,
    },
    {
      title: '所属部门',
      dataIndex: 'organId',
      valueType: 'text',
      search: false,
      ellipsis: true,
      width: 150,
      render: (text, record) => {
        return (
          <RemoteFieldName
            allList={allDepartList}
            id="id"
            fieldName="name"
            value={record.organId}
          ></RemoteFieldName>
        );
      },
    },
    {
      title: '岗位',
      dataIndex: 'post',
      valueType: 'text',
      ellipsis: true,
      search: false,
      width: 150,
    },
    {
      title: '标签名称',
      dataIndex: 'label',
      valueType: 'text',
      search: false,
      ellipsis: true,
      width: 150,
      render: (text, record) => {
        if (record.label) {
          const res = record.label.split(',').map((item) => {
            return employeeAllTags[Number(item)];
          });
          const titletxt = res.join(',');
          return <Ellipsis title={titletxt} length={5} />;
        }
      },
    },
    {
      title: '所属部门',
      dataIndex: 'organId',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <SelectPage
            getData={departList}
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
      title: '证件状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInTable: true,
      valueEnum: certStatus,
    },
    {
      title: '证件类型',
      dataIndex: 'certType',
      valueType: 'select',
      ellipsis: true,
      valueEnum: certType,
      width: 150,
      render: (text, record) => {
        return certType[record.certType];
      },
    },
    {
      title: '证件号',
      dataIndex: 'certNum',
      valueType: 'text',
      search: false,
      ellipsis: true,
      width: 150,
    },
    {
      title: '证件状态',
      dataIndex: 'status',
      search: false,
      valueType: 'select',
      ellipsis: true,
      width: 150,
      render: (text, record) => {
        return certStatus[record.status];
      },
    },
    {
      title: '准操项目',
      dataIndex: 'operationItem',
      valueType: 'text',
      ellipsis: true,
      width: 150,
    },
    {
      title: '初领日期',
      dataIndex: 'receiveTime',
      valueType: 'text',
      search: false,
      ellipsis: true,
      width: 150,
    },
    {
      title: '复审日期',
      dataIndex: 'reviewDate',
      valueType: 'text',
      search: false,
      ellipsis: true,
      width: 150,
    },
    {
      title: '有效期',
      dataIndex: 'termValidity',
      search: false,
      width: 200,
      render: (text, record) => {
        return `${record.termValidityStart || ''}~${record.termValidityEnd || ''}`;
      },
    },
    {
      title: '标签名称',
      dataIndex: 'employeeTags',
      valueType: 'select',
      hideInTable: true,
      search: {
        transform: (value) => {
          return { label: value };
        },
      },
      valueEnum: employeeAllTags,
    },

    {
      title: '电信工号',
      dataIndex: 'businessTelecomNumber',
      valueType: 'text',
      hideInTable: true,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (text, record) => [
        <a
          key="detail"
          onClick={() => {
            showDetail(record);
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
        <Popconfirm
          key="delete"
          placement="top"
          title="确认删除？"
          onConfirm={() => handleDelete(record)}
        >
          <a key="delete">删除</a>
        </Popconfirm>,
      ],
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
    const res1 = await getDepartAll();
    let allparents = [];
    if (res1.code === 200) {
      allparents = res1.data;
    }
    const exportQuery = formRef.current?.getFieldsValue();
    exportQuery.label = exportQuery.employeeTags;
    delete exportQuery.employeeTags;
   
    const res2 = await exportCert(exportQuery);
    if (res2.code === 200) {
      const tableData = res2.data.map((item) => {
        const temp = item.label
          ? item.label.split(',').map((items) => {
              return employeeAllTags[Number(items)];
            })
          : [];
        const obj = {
          departName: getParents(allparents, item.organId, []).reverse().join('-'),
          certType: certType[item.certType],
          status: certStatus[item.status],
          label: temp.join(','),
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
            '所属部门',
            '岗位',
            '标签名称',
            '证件类型',
            '证件号',
            '证件状态',
            '准操项目',
            '初领日期',
            '复审日期',
            '有效期-开始日',
            '有效期-截止日',
          ],
          filterVal: [
            'businessTelecomNumber',
            'empName',
            'empIdcard',
            'departName',
            'post',
            'label',
            'certType',
            'certNum',
            'status',
            'operationItem',
            'receiveTime',
            'reviewDate',
            'termValidityStart',
            'termValidityEnd',
          ],
          tableDatas: tableData,
          sheetName: '证件信息',
        },
      ];

      json2excel(excelDatas, '证件信息', true, 'xlsx', true);
    } else {
      message.warning(res2.msg);
    }
  };

  const showMsg = (mtitle, list) => {
    Modal.info({
      title: '导入提示：数据导入结果:',
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

  const uploadFlashProps = {
    showUploadList: false,
    action: '/api/yifu-business/method/tbusdept/getParentList',
    method: 'get',
    headers: token,
    beforeUpload(file) {
      setFfileObj(file);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        // 通过FileReader对象读取文件
        const fileReader = new FileReader();
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(ffileObj);
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
            setBtnLoading(true);
            batchEditCert(list)
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

  const batchFlash = () => {
    return (
      <Menu>
        <Menu.Item key="1">
          <Upload {...uploadFlashProps}>
            <RedoOutlined /> 批量更新
          </Upload>
        </Menu.Item>
        <Menu.Item key="2">
          <a href="/templates/证件信息批量更新模板.xls" target="_blank" rel="noopener noreferrer">
            <DownloadOutlined /> 下载模板
          </a>
        </Menu.Item>
      </Menu>
    );
  };
  const uploadImportProps = {
    showUploadList: false,
    action: '/api/yifu-business/method/tbusdept/getParentList',
    method: 'get',
    headers: token,
    beforeUpload(file) {
      setIfileObj(file);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        // 通过FileReader对象读取文件
        const fileReader = new FileReader();
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(ifileObj);
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
            setBtnLoading(true);
            importCert(list)
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
  const importMune = () => {
    return (
      <Menu>
        <Menu.Item key="1">
          <Upload {...uploadImportProps}>
            <UploadOutlined /> 导入
          </Upload>
        </Menu.Item>
        <Menu.Item key="2">
          <a href="/templates/证件信息批量导入模板.xls" target="_blank" rel="noopener noreferrer">
            <DownloadOutlined /> 下载模板
          </a>
        </Menu.Item>
      </Menu>
    );
  };

  // 请求列表
  const requestList = async (params) => {
    const query = { ...params };
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    setExportQuery(query);
    return getCertList(query).then((res) => {
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
    <PageHeader title="证件信息">
      <ProTable
        tableClassName="xscrollbar"
        rowKey="id"
        columns={columns}
        options={false}
        actionRef={actionRef}
        formRef={formRef}
        request={(params) => requestList(params)}
        search={{
          span: 6,
          optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
          className: 'searchForm',
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        headerTitle={
          <div style={{ width: '290px', justifyContent: 'space-between', display: 'flex' }}>
            <Dropdown overlay={importMune}>
              <Button loading={btnLoading}>
                导入
                <DownOutlined />
              </Button>
            </Dropdown>
            <Dropdown overlay={batchFlash} style={{ margin: '0 10px' }}>
              <Button loading={btnLoading}>
                批量更新
                <DownOutlined />
              </Button>
            </Dropdown>
            <Button
              key="export"
              loading={btnLoading}
              onClick={() => exportExcel()}
              icon={<DownloadOutlined />}
              type="primary"
            >
              导出
            </Button>
          </div>
        }
      />
      <Edit
        title={title}
        childRef={childRef}
        visible={visible}
        handleCancel={handleCancel}
        handleOk={handleOk}
        defaultValues={defaultValues}
      />
      <Detail
        title="详情"
        childRef={detailRef}
        defaultValues={defaultValues}
        visible={detailVisble}
        close={closeDialog}
      />
    </PageHeader>
  );
};

const list = (props) => {
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
})(list);
