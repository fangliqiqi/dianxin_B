import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Button, Dropdown, Menu, Upload, Modal, Popconfirm } from 'antd';
import ProTable from '@ant-design/pro-table';
import { PlusOutlined, ToTopOutlined, DownOutlined, DownloadOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { handleTreeData, handleBlankRow ,resetFormSearch} from '@/utils/utils';
import {
  departList,
  getDepartAll,
  addDepart,
  getTreeDepart,
  addBatchDepart,
  getParentDepart,
  deleteDepart,
} from '@/services/depart';
import XLSX from 'xlsx';

import Edit from './edit';

const List = () => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const [allDepart, setAllDepart] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [defaultValues, setDefaultValues] = useState({});
  const [disabledLabel, setDisabledLabel] = useState(true);
  const [fileObj, setFileObj] = useState({});
  const [token, setToken] = useState({});
  const [num, setNum] = useState(0);

  const actionRef = useRef();
  const formRef = useRef();

  const getAllList = (flag) => {
    getDepartAll(flag)
      .then((res) => {
        if (res.code === 200) {
          setAllDepart(res.data);
        }
      })
      .finally(() => {
        if (flag) {
          actionRef.current.reloadAndRest();
        }
      });
  };

  useEffect(() => {
    getAllList();
    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
  }, []);

  // 编辑操作
  const editRow = async (mtitle, record) => {
    setTitle(mtitle);
    let parentDeparts;
    if (record) {
      // const res = allDepart.find(item=>item.id === record.pid);
      // const value = {name:record.name,pid:res?res.name:'',id:record.id,ppid:record.pid};
      const value = { name: record.name, pid: record.pid, id: record.id };
      setDefaultValues(value);
      const resparentDeparts = await getParentDepart({ pid: record.pid });
      if (resparentDeparts.code === 200 && resparentDeparts.data) {
        parentDeparts = resparentDeparts.data;
      } else {
        parentDeparts = [];
      }
      setDisabledLabel(true);
    } else {
      parentDeparts = 'all';
      setDisabledLabel(false);
    }
    const treeDeparts = await getTreeDepart();
    if (treeDeparts.code === 200 && treeDeparts.data) {
      const result = handleTreeData(
        treeDeparts.data.children,
        'id',
        'name',
        parentDeparts,
        record ? record.pid : 0,
        record ? record.id : 0,
      );
      // 判断顶级是否在可以选择的范围内
      let resAll = [];
      if (parentDeparts === 'all') {
        resAll = [{ value: treeDeparts.data.id, title: treeDeparts.data.name, children: result }];
      } else {
        // const findRes = parentDeparts ? parentDeparts.find(item=>item.id === treeDeparts.data.id) : null;
        // resAll = findRes ? [{value:treeDeparts.data.id,title:treeDeparts.data.name,children:result}] : [{disabled:true,value:treeDeparts.data.id,title:treeDeparts.data.name,children:result}];
        resAll = parentDeparts;
      }
      setTreeData(resAll);
    }
    setVisible(true);
  };

  // 保存
  const handleOk = (values) => {
    let method = 'post';
    let msg = '添加成功!';
    if (values.id) {
      method = 'put';
      msg = '修改成功!';
    }

    addDepart(values, method)
      .then((res) => {
        if (res.code === 200) {
          message.success(msg);
          setVisible(false);
          getAllList(true);
          setDefaultValues({});
        } else {
          message.warning(res.msg);
        }
      })
      .finally(() => {
        // setDefaultValues({});
      });
  };
  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    setDefaultValues({});
  };

  // 删除
  const handleDelete = (record) => {
    deleteDepart(record.id).then((res) => {
      if (res.code === 200) {
        message.success('删除成功！');
        actionRef.current.reload();
      } else {
        message.warning(res.msg);
      }
    });
  };

  const columns = [
    {
      title: '部门',
      dataIndex: 'name',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '部门等级',
      dataIndex: 'level',
      valueType: 'input',
      formItemProps: {
        rules: [
          {
            pattern: /^-?[1-9]\d{0,9}$|0$/,
            message: '部门等级只能输入数字',
          },
        ],
      },
    },
    {
      title: '上级部门',
      dataIndex: 'pid',
      ellipsis: true,
      search: false,
      render: (text, record) => {
        const res = allDepart.find((item) => item.id === record.pid);
        return res ? res.name : '';
      },
    },
    {
      title: '操作',
      valueType: 'option',
      colSize: '0.75',
      render: (text, record) => {
        let node;
        if (record.level === 0) {
          node = null;
        } else {
          node = (
            <Popconfirm
              key="delete"
              placement="top"
              title="确认删除？"
              onConfirm={() => handleDelete(record)}
            >
              <a key="delete">删除</a>
            </Popconfirm>
          );
        }
        return [
          <a
            key="edit"
            onClick={() => {
              editRow('编辑', record);
            }}
          >
            编辑
          </a>,
          node,
        ];
      },
    },
  ];

  const showMsg = (errTitle, list) => {
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
            ? list.map((item) => {
                return (
                  <div key={item.lineNum}>
                    第{item.lineNum}行: {item.message}
                  </div>
                );
              })
            : errTitle}
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
            const resArr = list.map((item) => {
              return {
                name: item['部门名称'],
                parentName: item['上级部门名称'],
              };
            });
            setBtnLoading(true);
            addBatchDepart(resArr, 'post')
              .then((res) => {
                if (res.data && res.data.length != 0) {
                  showMsg(res.msg, res.data || []);
                } else {
                  message.success('导入成功');
                }
                // if(res.code === 200){
                //   message.success('导入成功');
                // }else{
                //   showMsg(res.msg,res.errorMessageList||[]);
                // }
              })
              .finally(() => {
                actionRef.current.reload();
                getAllList(true);
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
            <ToTopOutlined /> 导入&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </Upload>
        </Menu.Item>
        <Menu.Item key="2">
          <a href="/templates/部门导入模板.xlsx" target="_blank" rel="noopener noreferrer">
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
    return departList(resetFormSearch(formRef,query)).then((res) => {
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
    <PageHeader title="部门管理">
      <ProTable
        rowClassName="gesture"
        rowKey="id"
        columns={columns}
        options={false}
        actionRef={actionRef}
        request={(params) => requestList(params)}
        search={{
          labelWidth: 'auto',
          optionRender: (searchConfig, formProps, dom) => [...dom.reverse()],
        }}
        form={{
          ignoreRules: false,
        }}
        formRef={formRef}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        headerTitle={
          <>
            <Button
              key="add"
              onClick={() => editRow('部门添加')}
              icon={<PlusOutlined />}
              type="primary"
              style={{ marginRight: '10px' }}
            >
              添加
            </Button>
            <Dropdown overlay={menu}>
              <Button loading={btnLoading}>
                {' '}
                导 入 <DownOutlined />
              </Button>
            </Dropdown>
          </>
        }
      />
      <Edit
        visible={visible}
        title={title}
        disabledLabel={disabledLabel}
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

const departMange = (props) => {
  return (
    <>
      <KeepAlive>
        <List {...props} />
      </KeepAlive>
    </>
  );
};

export default connect(({ exampleModels }) => {
  return {
    exampleStatus: exampleModels,
  };
})(departMange);
