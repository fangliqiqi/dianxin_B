import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Button, Spin, Menu, Upload, Modal, Popconfirm, Dropdown } from 'antd';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { exportFormatJson, handleBlankRow, getParents } from '@/utils/utils';
import {
  attendanceList,
  addAttendance,
  getAttendance,
  delAttendance,
  cancelAttendance,
  exportAttendance,
  importAttendance,
} from '@/services/attendance';
import { loadDictionaryValue, uploadFile } from '@/services/global';
import { departList, getDepartAll } from '@/services/depart';
import { getBusAttaList } from '@/services/settlement';
import SelectPage from '@/components/SelectPage';
import Edit from './edit';
import Detail from './detail';
import XLSX from 'xlsx';
import Ellipsis from '@/components/Ellipsis';
import moment from 'moment';

const List = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [defaultValues, setDefaultValues] = useState({});
  const [defaultDetailValues, setDetailValues] = useState({});
  const [exportQuery, setExportQuery] = useState({});
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [vacationTypeObj, setVacationTypeObj] = useState({});
  const [fileObj, setFileObj] = useState({});
  const [token, setToken] = useState({});
  const [btnLoading, setBtnLoading] = useState(false);
  const [allDepart, setAllDepart] = useState([]);

  const actionRef = useRef();
  const formRef = useRef();
  const childRef = useRef();
  const detailRef = useRef();

  const vacationStatusObj = { 0: '待休', 1: '休假中', 2: '到期待销假', 3: '已销假' };

  useEffect(() => {
    // 获取字典
    loadDictionaryValue('HROB_VACATION_TYPE')
      .then((res) => {
        if (res.code === 200) {
          const obj = {};
          res.data.map((item) => {
            obj[item.value] = item.label;
          });
          setVacationTypeObj(obj);
        }
      })
      .catch((err) => {
        console.log('[ 获取字典失败 ] >', err);
      });
    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
    getDepartAll().then((res) => {
      if (res.code === 200) {
        setAllDepart(res.data);
      }
    });
  }, []);

  const fieldParams = {
    姓名: 'empName',
    身份证号: 'empIdcard',
    电信工号: 'businessTelecomNumber',
    所属部门名称: 'departName',
    假勤类型: 'vacationType',
    假勤开始时间: 'vacationStartTime',
    假勤结束时间: 'vacationEndTime',
    假勤时长: 'vacationDuration',
    假勤事由: 'vacationReason',
  };

  // 编辑操作
  const editRow = async (mtitle, record) => {
    setTitle(mtitle);
    if (record) {
      childRef.current.isEdit(true);
      // 人员销假
      const res1 = await getAttendance(record.id);
      if (res1.code === 200) {
        const res2 = await getBusAttaList({ relationId: record.id });
        let files = [];
        if (res2.code === 200) {
          files = res2.data;
        }
        setDefaultValues(res1.data);
        childRef.current.showAnual(res1.data.vacationType, res1.data.empIdcard);
        childRef.current.showFileList(files);
      } else {
        message.warning(res1.msg);
      }
    } else {
      childRef.current.isEdit(false);
    }
    childRef.current.showVacationType(vacationTypeObj);
    setVisible(true);
  };

  // 上传附件
  const uploadFiles = (files, domain) => {
    files.forEach((item) => {
      const formData = new FormData();
      formData.append('file', item);
      formData.append('type', 7);
      formData.append('domain', domain);
      uploadFile(formData).then((res) => {
        if (res.code === 200) {
          // message.success(`${item.name}上传成功`);
        } else {
          message.warning(res.msg);
        }
      });
    });
  };

  // 保存
  const handleOk = async (values, files) => {
    const params = { ...values };
    if (params.id) {
      // 销假
      const query = {
        id: params.id,
        vacationNote: params.vacationNote,
        acturalVacationEndTime: `${params.acturalVacationEndTime} 00:00:00`,
      };
      const res = await cancelAttendance(params.id, query);
      if (res.code === 200) {
        message.success('销假成功！');
        setVisible(false);
        actionRef.current.reload();
        setDefaultValues({});
        childRef.current.cleaFile();
      } else {
        message.warning(res.msg);
      }
    } else {
      const res = await addAttendance(params);
      if (res.code === 200) {
        message.success('保存成功！');
        // 上传文件
        uploadFiles(files, res.data.id);
        setVisible(false);
        actionRef.current.reload();
        setDefaultValues({});
        childRef.current.cleaFile();
      } else {
        message.warning(res.msg);
      }
    }
  };

  // 查看详情
  const handleDetail = async (mtitle, record) => {
    setTitle(mtitle);
    detailRef.current.showVacationType(vacationTypeObj);
    detailRef.current.showVacationStatus(vacationStatusObj);
    const res1 = await getAttendance(record.id);
    if (res1.code === 200) {
      if (res1.data.departId) {
        const departRes = allDepart.find((item) => String(item.id) === String(res1.data.departId));
        res1.data.departName = departRes ? departRes.name : '';
      }
      const res2 = await getBusAttaList({ relationId: record.id });
      let files = [];
      if (res2.code === 200) {
        files = res2.data;
      }
      setDetailValues(res1.data);
      detailRef.current.showAnual(res1.data.vacationType, res1.data.empIdcard);
      detailRef.current.showFileList(files);

      setDetailVisible(true);
    } else {
      message.warning(res1.msg);
    }
  };
  const handleDetailCancel = () => {
    setDetailVisible(false);
    setDetailValues({});
  };

  // 删除
  const handleDelete = (record) => {
    delAttendance(record.id).then((res) => {
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
    childRef.current.cleaFile();
    childRef.current.cleaAnual();
  };

  const renderOperator = (record) => {
    const arr = [
      <a
        key="detail"
        onClick={() => {
          handleDetail('详情', record);
        }}
      >
        详情
      </a>,
    ];
    if (record.vacationStatus === '1' || record.vacationStatus === '2') {
      arr.push(
        <a
          key="edit"
          onClick={() => {
            editRow('人员销假', record);
          }}
        >
          销假
        </a>,
      );
    }
    arr.push(
      <Popconfirm
        key="delete"
        placement="top"
        title="确认删除？"
        onConfirm={() => handleDelete(record)}
      >
        <a key="delete">删除</a>
      </Popconfirm>,
    );
    return arr;
  };

  const columns = [
    {
      title: '电信工号',
      dataIndex: 'businessTelecomNumber',
      valueType: 'text',
      width: 100,
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'empName',
      valueType: 'text',
      width: 100,
      ellipsis: true,
    },
    {
      title: '身份证号',
      dataIndex: 'empIdcard',
      valueType: 'text',
      width: 180,
      ellipsis: true,
    },
    {
      title: '所属部门',
      dataIndex: 'departName',
      valueType: 'text',
      search: false,
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        const res = allDepart.find((item) => String(item.id) === String(record.departId));
        return res ? <Ellipsis title={res.name} length={5} /> : '';
      },
    },
    {
      title: '所属部门',
      dataIndex: 'departId',
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
      title: '岗位',
      dataIndex: 'businessPost',
      valueType: 'text',
      search: false,
      width: 150,
      ellipsis: true,
    },
    {
      title: '假勤类型',
      dataIndex: 'vacationType',
      valueType: 'select',
      valueEnum: vacationTypeObj,
      width: 150,
    },
    {
      title: '假勤开始时间',
      dataIndex: 'vacationStartTime',
      valueType: 'text',
      search: false,
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        return record.vacationStartTime ? record.vacationStartTime.substring(0, 10) : '';
      },
    },
    {
      title: '假勤结束时间',
      dataIndex: 'vacationEndTime',
      valueType: 'text',
      search: false,
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        return record.vacationEndTime ? record.vacationEndTime.substring(0, 10) : '';
      },
    },
    {
      title: '假勤时长',
      dataIndex: 'vacationDuration',
      valueType: 'text',
      width: 150,
      search: false,
      ellipsis: true,
      render: (text, record) => {
        return record.vacationDuration ? `${record.vacationDuration}h` : '';
      },
    },
    {
      title: '假勤周期',
      dataIndex: 'vacationDuration',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => ({
          vacationStartTime: `${value[0]} 00:00:00`,
          vacationEndTime: `${value[1]} 23:59:59`,
        }),
      },
    },
    {
      title: '假勤状态',
      dataIndex: 'vacationStatus',
      valueType: 'select',
      valueEnum: vacationStatusObj,
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        return vacationStatusObj[record.vacationStatus];
      },
    },
    {
      title: '实际结束时间',
      dataIndex: 'acturalVacationEndTime',
      valueType: 'text',
      search: false,
      width: 150,
      ellipsis: true,
      render: (text, record) => {
        return record.acturalVacationEndTime ? record.acturalVacationEndTime.substring(0, 10) : '';
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (text, record) => {
        return renderOperator(record);
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
    // 去除空值
    const exportQuery = Object.keys(query).reduce((obj, key) => {
      if (query[key] !== undefined && query[key] !== null && query[key] !== '') {
        obj[key] = query[key];
      }
      return obj;
    }, {});
    if (exportQuery.vacationDuration) {
      exportQuery.vacationStartTime =
        moment(exportQuery.vacationDuration[0]).format('YYYY-MM-DD') + ' 00:00:00';
      exportQuery.vacationEndTime =
        moment(exportQuery.vacationDuration[1]).format('YYYY-MM-DD') + ' 23:59:59';
      delete exportQuery.vacationDuration;
    }

    const res2 = await exportAttendance(exportQuery);
    if (res2.code === 200) {
      const tableData = res2.data.map((item) => {
        const obj = {
          departName: getParents(allDepart, item.departId, []).reverse().join('-'),
          vacationStartTime: item.vacationStartTime ? item.vacationStartTime.substring(0, 10) : '',
          vacationEndTime: item.vacationEndTime ? item.vacationEndTime.substring(0, 10) : '',
          acturalVacationEndTime: item.acturalVacationEndTime
            ? item.acturalVacationEndTime.substring(0, 10)
            : '',
          vacationStatus: vacationStatusObj[item.vacationStatus],
          vacationType: vacationTypeObj[item.vacationType],
          vacationDuration: `${item.vacationDuration}h`,
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
            '假勤类型',
            '假勤开始时间',
            '假勤结束时间',
            '假勤时长',
            '假勤状态',
            '实际结束时间',
            '销假说明',
            '假勤事由',
          ],
          filterVal: [
            'businessTelecomNumber',
            'empName',
            'empIdcard',
            'departName',
            'businessPost',
            'vacationType',
            'vacationStartTime',
            'vacationEndTime',
            'vacationDuration',
            'vacationStatus',
            'acturalVacationEndTime',
            'vacationNote',
            'vacationReason',
          ],
          tableDatas: tableData,
          sheetName: '假勤信息',
        },
      ];
      json2excel(excelDatas, '假勤信息', true, 'xlsx', true);
    } else {
      message.warning(res2.msg);
    }
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
    action: '/api/yifu-business/method/tbusdept/getParentList',
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
            importAttendance(resArr)
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
            <UploadOutlined /> 导入&nbsp;&nbsp;&nbsp;&nbsp;
          </Upload>
        </Menu.Item>
        <Menu.Item key="2">
          <a href="/templates/假勤信息导入模板.xlsx" target="_blank" rel="noopener noreferrer">
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
    return attendanceList(query).then((res) => {
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
    <PageHeader title="假勤信息">
      <ProTable
        rowClassName="gesture"
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
          <>
            <Button
              key="add"
              onClick={() => editRow('添加')}
              icon={<PlusOutlined />}
              type="primary"
              style={{ marginRight: '8px' }}
            >
              添加
            </Button>
            <Dropdown overlay={menu}>
              <Button loading={btnLoading}>
                导入
                <UploadOutlined />
              </Button>
            </Dropdown>
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
      />
      <Spin spinning={loading}>
        <Edit
          title={title}
          childRef={childRef}
          visible={visible}
          handleCancel={handleCancel}
          handleOk={handleOk}
          defaultValues={defaultValues}
          allDepart={allDepart}
        />
        <Detail
          title={title}
          childRef={detailRef}
          visible={detailVisible}
          handleCancel={handleDetailCancel}
          defaultValues={defaultDetailValues}
        />
      </Spin>
    </PageHeader>
  );
};

const annual = (props) => {
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
})(annual);
