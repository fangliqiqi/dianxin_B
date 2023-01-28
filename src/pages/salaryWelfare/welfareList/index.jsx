import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Button, Modal, Popconfirm } from 'antd';
import ProTable from '@ant-design/pro-table';
import { DownloadOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { exportFormatJson, getParents } from '@/utils/utils';
import { departList, getDepartAll } from '@/services/depart';
import {
  welfareList,
  getListBySalaryId,
  welfareDelByid,
  welfareDelByids,
  importBusSalary,
  doExport,
} from '@/services/welfare';

import { getDictMap } from '@/services/global';
import XLSX from 'xlsx';
import SelectPage from '@/components/SelectPage';

import moment from 'moment';

import Edit from './edit';
import Detail from './detail';
import Deletes from './deteles';

const { confirm } = Modal;

const List = () => {
  const [visible, setVisible] = useState(false);
  const [detailVisble, setDetailVisble] = useState(false);
  const [title, setTitle] = useState('');
  const [detelesVisble, setDetelesVisible] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [exportQuery, setExportQuery] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataLength, setDataLength] = useState(0);

  const [token, setToken] = useState({});
  const [certStatus, setCertStatus] = useState({});
  const [certType, setCertType] = useState({});

  const [btnLoading, setBtnLoading] = useState(false);

  const actionRef = useRef();
  const childRef = useRef();
  const detailRef = useRef();
  const formRef = useRef();

  useEffect(() => {
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

    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
  }, []);

  // 查看详情
  const showDetail = (record) => {
    if (record) {
      let values = record;
      getListBySalaryId({ salaryId: record.id })
        .then((res) => {
          if (res.code === 200 && res.data) {
            values.resList = res.data;
            setDefaultValues(values);
            setDetailVisble(true);
          } else {
            message.warning(res.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const showMsg = (errTitle, list) => {
    Modal.info({
      title: '导入提示：数据导入结果：',
      content: (
        <div
          style={{
            marginTop: '20px',
            maxHeight: '450px',
            overflowY: list.length > 10 ? 'scroll' : 'hidden',
          }}
        >
          {list.length
            ? list.map((item, index) => {
                return (
                  <div key={index}>
                    第{Number(item.lineNum) + 2}行: {item.message}
                  </div>
                );
              })
            : errTitle}
        </div>
      ),
    });
  };

  // 保存
  const handleOk = async (values) => {
    const res = await importBusSalary(values);
    if (res.code === 200) {
      message.success('保存成功!');
      setVisible(false);
      actionRef.current.reload();
      childRef.current.clearOptions();
      setDefaultValues({});
    } else {
      showMsg(res.msg, res.data || []);
    }
  };

  // 单个删除
  const handleDelete = (record) => {
    welfareDelByid(record.id).then((res) => {
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
    setDetelesVisible(false);
    setDefaultValues({});
  };
  // 关闭导入
  const handleEditCancel = () => {
    setVisible(false);
    setDefaultValues({});
    childRef.current.clearOptions();
  };
  const closeDialog = () => {
    setDetailVisble(false);
    setDefaultValues({});
  };

  const columns = [
    {
      title: '电信工号',
      dataIndex: 'teleNo',
      valueType: 'text',
      ellipsis: true,
      width: 150,
    },
    {
      title: '身份证号',
      dataIndex: 'empIdCard',
      valueType: 'text',
      ellipsis: true,
      width: 160,
    },
    {
      title: '工资月份',
      dataIndex: 'salaryMonth',
      valueType: 'date',
      width: 150,
      ellipsis: true,
      fieldProps: {
        format: 'YYYYMM',
        picker: 'month',
      },
      initialValue: moment().subtract(1, 'month'),
    },
    {
      title: '姓名',
      dataIndex: 'empName',
      valueType: 'text',
      ellipsis: true,
      width: 150,
    },
    {
      title: '所属部门',
      dataIndex: 'deptId',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <SelectPage
            getData={departList}
            selectProps={{
              placeholder: '输入部门搜索',
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
      dataIndex: 'deptName',
      valueType: 'text',
      ellipsis: true,
      width: 150,
      search: false,
    },
    {
      title: '岗位',
      dataIndex: 'post',
      valueType: 'text',
      width: 100,
      ellipsis: true,
      search: false,
    },

    {
      title: '薪酬应发',
      dataIndex: 'relaySalary',
      valueType: 'text',
      ellipsis: true,
      width: 150,
      search: false,
    },
    {
      title: '激励应发',
      dataIndex: 'relayIncent',
      valueType: 'text',
      ellipsis: true,
      width: 150,
      search: false,
    },
    {
      title: '其他应发',
      dataIndex: 'relayOther',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '应发合计',
      dataIndex: 'relaySum',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '单位社保',
      dataIndex: 'unitSocial',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '单位公积金',
      dataIndex: 'unitFund',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '代扣个人社保',
      dataIndex: 'withholidPersonSocial',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '代扣个人公积金',
      dataIndex: 'withholidPersonFund',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '代扣个税',
      dataIndex: 'withholidPersonTax',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '其他扣款',
      dataIndex: 'withholidOther',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '扣款合计',
      dataIndex: 'withholidSum',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
    },
    {
      title: '实发工资',
      dataIndex: 'actualSalary',
      valueType: 'text',
      width: 150,
      ellipsis: true,
      search: false,
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
        setSelectedRowKeys([]);
      });
  };

  // 导出
  const exportExcel = async () => {
    const res1 = await getDepartAll();
    let allparents = [];
    if (res1 && res1.code && res1.code === 200) {
      allparents = res1.data;
    }
    let res2;

    const exportQuery = formRef.current.getFieldsValue();
    for (const key in exportQuery) {
      // 时间转换 如果是moment对象
      if (exportQuery[key] && exportQuery[key]._isAMomentObject) {
        exportQuery[key] = exportQuery[key].format('YYYYMM');
      }
      // 去除没有值的参数
      if (!exportQuery[key]) {
        delete exportQuery[key];
      }
    }

    // 如果没有参数，提示
    if (Object.keys(exportQuery).length === 0) {
      message.warning('请至少选择一个查询条件');
      return;
    }
    setBtnLoading(true);
    if (selectedRowKeys.length > 0) {
      const ids = selectedRowKeys.join(',');
      res2 = await doExport({ idStr: ids });
    } else {
      res2 = await doExport(exportQuery);
    }

    if (res2.code === 200) {
      const tableData = res2.data.salaryList.map((item) => {
        const obj = {
          departName: getParents(allparents, item.organId, []).reverse().join('-'),
          certType: certType[item.certType],
          status: certStatus[item.status],
        };
        item.bisList.map((bis) => {
          res2.data.titleSet.map((field, index) => {
            if (bis.cnName === field) {
              item[`value${index}`] = bis.textValue;
            }
          });
        });
        return { ...item, ...obj };
      });
      // tableData.shift()
      // 封面数据
      const excelDatas = [
        {
          tHeader: [
            '电信工号',
            '姓名',
            '身份证号',
            '工资月份',
            '所属部门',
            '岗位',
            '薪酬应发',
            '激励应发',
            '其他应发',
            '应发合计',
            '代扣个人社保',
            '代扣个人公积金',
            '代扣个税',
            '其他应扣',
            '扣款合计',
            '实发工资',
            '单位社保',
            '单位公积金',
          ],
          filterVal: [
            'teleNo',
            'empName',
            'empIdCard',
            'salaryMonth',
            'deptName',
            'post',
            'relaySalary',
            'relayIncent',
            'relayOther',
            'relaySum',
            'withholidPersonSocial',
            'withholidPersonFund',
            'withholidPersonTax',
            'withholidOther',
            'withholidSum',
            'actualSalary',
            'unitSocial',
            'unitFund',
          ],
          tableDatas: tableData,
          sheetName: '薪酬福利表',
        },
      ];
      const titleVaule = [];
      res2.data.titleSet.map((title, index) => {
        titleVaule.push(`value${index}`);
      });
      excelDatas[0].tHeader = excelDatas[0].tHeader.concat(res2.data.titleSet);
      excelDatas[0].filterVal = excelDatas[0].filterVal.concat(titleVaule);

      json2excel(excelDatas, '薪酬福利表', true, 'xlsx', true);
      setBtnLoading(false);
    } else {
      message.warning(res2.msg);
      setBtnLoading(false);
    }
  };

  // 导入按钮
  const importOperate = () => {
    setTitle('薪酬福利数据导入');
    childRef.current.showToken(token);
    childRef.current.getRelateFields();
    setVisible(true);
  };

  // 批量删除 多选
  const onDeletes = () => {
    if (selectedRowKeys.length > 0) {
      const ids = selectedRowKeys.join(',');
      const params = `idStr=${ids}`;
      const allFlag = dataLength === selectedRowKeys.length ? 1 : 0;
      confirm({
        content: '确认删除么？',
        onOk() {
          welfareDelByids(params).then((res) => {
            if (Number(res.code === 200)) {
              message.success(res.msg || '删除成功');
              if (allFlag) {
                actionRef.current.reloadAndRest();
              } else {
                actionRef.current.reload();
              }
              setSelectedRowKeys([]);
            } else {
              message.warning(res.msg || '删除失败');
            }
          });
        },
        onCancel() {
          setSelectedRowKeys([]);
        },
      });
    } else {
      setDetelesVisible(true);
    }
  };
  // 批量删除 根据部门月份
  const handleDeteles = async (values) => {
    const params = `deptId=${values.deptId}&salaryMonth=${values.salaryMonth}`;
    const res = await welfareDelByids(params);
    if (res.code === 200) {
      message.success(res.msg || '删除成功');
      actionRef.current.reloadAndRest();
      setDetelesVisible(false);
      setSelectedRowKeys([]);
    } else {
      message.warning(res.msg || '删除失败');
    }
  };

  // 请求列表
  const requestList = async (params) => {
    // 如果忽略current,pageSize，还有没有其他的参数
    const paramsKeys = Object.keys(params).filter((key) => key !== 'current' && key !== 'pageSize');
    if (paramsKeys.length === 0) {
      message.warning('请至少选择一个查询条件');
      return { data: [], total: 0 };
    }
    const query = { ...params };
    if (params.pageSize) {
      query.size = params.pageSize;
    }
    setExportQuery(query);
    return welfareList(query).then((res) => {
      let records = [];
      let totalAll = 0;
      if (res.code === 200) {
        const dataRes = res.data;
        if (dataRes) {
          records = dataRes.records;
          setDataLength(records.length);
          totalAll = dataRes.total;
        } else {
          totalAll = 0;
        }
      }
      return { data: records, total: totalAll };
    });
  };

  return (
    <PageHeader title="薪酬福利表">
      <ProTable
        tableClassName="xscroll"
        rowKey="id"
        columns={columns}
        options={false}
        actionRef={actionRef}
        request={(params) => requestList(params)}
        formRef={formRef}
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
          <div style={{ width: '290px', justifyContent: 'space-between', display: 'flex' }}>
            <Button type="primary" loading={btnLoading} onClick={importOperate}>
              <UploadOutlined />
              导入
            </Button>
            <Button
              key="export"
              loading={btnLoading}
              onClick={() => exportExcel()}
              icon={<DownloadOutlined />}
              type="primary"
            >
              导出
            </Button>
            <Button type="primary" loading={btnLoading} onClick={onDeletes}>
              <DeleteOutlined />
              批量删除
            </Button>
          </div>
        }
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          fixed: true,
          columnWidth: 50,
          alwayShowAlert: false,
          selectedRowKeys, // 重点控制选中与否
          onChange: (selectedVal, selectedRows) => {},
          onSelect: (record, selected, selectedRows) => {
            if (selected) {
              const data = new Set([...selectedRowKeys, record.id]);
              setSelectedRowKeys([...data]);
            } else {
              const data = new Set([...selectedRowKeys]);
              data.delete(record.id);
              setSelectedRowKeys([...data]);
            }
          },
          onSelectAll: (selected, selectedRows, changeRows) => {
            if (selected) {
              const data = new Set([...selectedRowKeys, ...changeRows.map((item) => item.id)]);
              setSelectedRowKeys([...data]);
            } else {
              const data = new Set([...selectedRowKeys]);
              changeRows.forEach((item) => {
                data.delete(item.id);
              });
              setSelectedRowKeys([...data]);
            }
          },
        }}
        tableAlertOptionRender={({ selectedRowKeys, onCleanSelected }) => {
          return (
            <div>
              <a
                onClick={() => {
                  setSelectedRowKeys([]);
                  onCleanSelected();
                }}
              >
                取消选择
              </a>
            </div>
          );
        }}
      />

      <Edit
        title={title}
        childRef={childRef}
        visible={visible}
        handleCancel={handleEditCancel}
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
      <Deletes
        title="批量删除"
        visible={detelesVisble}
        handleCancel={handleCancel}
        handleDeteles={handleDeteles}
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
