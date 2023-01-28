import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Button, Dropdown,Menu,Upload,Modal,Spin} from 'antd';
import ProTable from '@ant-design/pro-table';
import { ToTopOutlined,DownloadOutlined,DownOutlined ,PlusOutlined } from '@ant-design/icons';
import PageHeader from '@/components/PageHeader';
import { exportFormatJson,handleBlankRow,resetFormSearch } from '@/utils/utils';
import { departList,allDeparts} from '@/services/depart';
import { tbusleaveList,doexportLeaveList,importExcel,editTbusleave,addTbusleave } from '@/services/departure';
// import { employeeList,exportEmployee,batchFlashEmployee,editEmployee } from '@/services/members';
// import { loadDictionaryValue, filterMultiDictText,loadProject } from '@/services/global';

import SelectPage from '@/components/SelectPage';

import XLSX from 'xlsx';
import Edit from './edit'; 
import Detail from './detail';

const List = (props) => {

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const [detailVisible,setDetailvisible] = useState(false);
  const [detailTitle,setDetailtitle] = useState(false);

  const [defaultValues, setDefaultValues] = useState({});
  const [disabledLabel, setDisabledLabel] = useState(true);
  const [readOnly,setReadonly] = useState(false)
  const [exportQuery, setExportQuery] = useState({});
  const [fileObj, setFileObj] = useState({});
  const [token, setToken] = useState({});
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [isFinishLoading, setIsFinishLoading] = useState(true);

  const fieldParams = {
    '电信工号':'teleNo','姓名':'name','身份证号':'idCard','所属部门':'deptName',
    '岗位':'post','离职日期':'leaveDate','离岗日期':'leavePostDate','离职原因':'leaveReason'
  }

  const actionRef = useRef();

  useEffect(() => {
    const obj = {};
    obj.Authorization = `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`;
    setToken(obj);
  }, [] )

  // 编辑/添加/ 操作
  const editRow = async (type,record) => {
    if(type==='add'){
      setTitle('添加离职人员信息');
      setDisabledLabel(false)
      setReadonly(false)
    }else if(type ==='edit'){
      setTitle(`离职信息更新`);
      setDisabledLabel(true)
      setReadonly(false)
      setDefaultValues(record)
    }
    setVisible(true);
  }
  // 详情查看
  const detailRow = async(record)=>{
    if(record){
      setDetailtitle(`离职信息详情`);
      setDefaultValues(record)
      setDetailvisible(true);
    }
  }
  // 保存
  const handleOk = (values) => {
    if(values.id){
      editTbusleave(values).then(res=>{
        if(res.code === 200){
          message.success('更新成功');
          setVisible(false);
          setDefaultValues(null);
          actionRef.current.reload();
        }else{
          message.warning(res.msg);
        }
      })
    }else{
      if(isFinishLoading){
        setIsFinishLoading(false)
          addTbusleave(values).then(res=>{
            if(res.code === 200){
              message.success('添加成功');
              setVisible(false);
              setDefaultValues({});
              // actionRef.current.reload();
              actionRef.current.reloadAndRest();
            }else{
              message.warning(res.msg);
            }
          }).finally(()=>{
            setIsFinishLoading(true)
          })
        }
      }

  }

  // 关闭弹窗
  const handleCancel = () => {
    setVisible(false);
    setDetailvisible(false);
    setDefaultValues({});
  }


  const columns = [
    {
      title: '电信工号',
      dataIndex: 'teleNo',
      valueType: 'text',
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
            message: '请输入正确的身份证号码',
          }
        ],
      },
    },
    {
      title: '所属部门',
      dataIndex: 'deptId',
      hideInTable: true,
      renderFormItem: () => {
        return (
          <SelectPage getData={departList}  selectProps={{placeholder:'输入所属部门搜索',allowClear:true,showSearch:true,optionFilterProp:'children'}} labeltitle="name" labelvalue="id"/>  
        )
      },
    },
    {
      title: '所属部门',
      dataIndex: 'deptName',
      search: false,
    },
    {
      title: '岗位',
      dataIndex: 'post',
      ellipsis: true,
      search:false,
    },
    {
      title: '离职日期',
      dataIndex: 'leaveDates',
      valueType: 'dateRange',
      hideInTable:true,
      search: {
        transform: (value) => ({ leaveDateStart: value[0], leaveDateEnd: value[1] }),
      },
    },
    {
      title: '离职日期',
      dataIndex: 'leaveDate',
      search:false,
      ellipsis: true,
      render: (text,record) => {
        return record.leaveDate ? record.leaveDate.substring(0,10) : '-';
      }
    },
    {
      title: '离岗日期',
      dataIndex: 'leavePostDates',
      valueType: 'dateRange',
      hideInTable:true,
      search: {
        transform: (value) => ({ leavePostStart: value[0], leavePostEnd: value[1] }),
      },
    },
    {
      title: '离岗日期',
      dataIndex: 'leavePostDate',
      search:false,
      ellipsis: true,
      render: (text,record) => {
        return record.leavePostDate ? record.leavePostDate.substring(0,10) : '-';
      }
    },
    {
      title: '离职原因',
      dataIndex: 'leaveReason',
      search:false,
      ellipsis: true,
      hideInTable:true
    },
    {
      title: '操作',
      valueType: 'option',
      colSize:'0.75',
      render: (text, record) => [
        <a key="view" onClick={()=>detailRow(record)}>详情</a>,
        <a key="edit" onClick={() => { editRow('edit',record) }}>更新</a>,
      ],
    }
  ];

  // 导出
  const json2excel = (tableJson, filenames, autowidth, bookTypes,typeLength) => {
    import('@/utils/exportCommonExcel').then(excel => {
      const tHeader = [];
      const dataArr = [];
      const sheetnames = [];
      tableJson.forEach((item,index)=>{
        tHeader.push(tableJson[index].tHeader);
        dataArr.push(exportFormatJson(tableJson[index].filterVal, tableJson[index].tableDatas));
        sheetnames.push(tableJson[index].sheetName);
      })
      excel.export_json_to_excel_more_sheet({
        header: tHeader,
        data: dataArr,
        sheetname: sheetnames,
        filename: filenames,
        bookType: bookTypes,
        autoLength: typeLength, // 所有类型长度
      })
    }).finally(()=>{
      message.success('导出成功！');
      actionRef.current.reload();
    })
  }

  const getParents = (list,id,arr) => {
    const res = list.find(item => String(item.id) === String(id));
    if(res){
      arr.push(res.name);
      if(res.pid > 0){
        getParents(list,res.pid,arr);
      }
    }
    return arr;
  }

  // 导出
  const exportExcel = async () => {
    const res1 = await allDeparts();
    let parents = []
    if(res1.code === 200){
      parents = res1.data;
    }
    const res2 = await doexportLeaveList(resetFormSearch(formRef,exportQuery));
    if(res2.code === 200 && res2.data){
      const tableData = res2.data.map(item=>{
        const obj = {
          deptName: getParents(parents,item.deptId,[]).reverse().join('-'),
        }
        return {...item,...obj};
      });
      // 封面数据
      const excelDatas = [{
        tHeader: ['部门','姓名','电信工号','离职日期','离岗日期','离职原因'],
        filterVal: ['deptName','name','teleNo','leaveDate','leavePostDate','leaveReason'],
        tableDatas: tableData,
        sheetName: '离职信息'
      }];
      json2excel(excelDatas, '离职人员信息表', true, "xlsx",true);
    }else{
      message.warning(res1.msg);
    }
  }

  // 请求列表
  const requestList = async (params) => {
    const query = {...params};
    if(params.pageSize){
      query.size = params.pageSize;
    }
    setExportQuery(query);
    setLoading(true)
    const listRes = await tbusleaveList(resetFormSearch(formRef,query)); //resetFormSearch(formRef,query)
    setLoading(false)
    let records = [];
    let totalAll = 0;
    if (listRes.code === 200 && listRes.data && listRes.data.total) {
      records = listRes.data.records;
      totalAll = listRes.data.total;
    }
    return { data: records,total:totalAll };
  }
  
  const showMsg = (errTitle,list) => {
    Modal.info({
      title: '导入提示：数据导入结果：',
      content: (
        <div style={{marginTop:'20px',maxHeight:'450px',overflowY:list.length>20 ? 'scroll' : 'hidden'}}>
          {list.length ? list.map((item,index)=>{
            return (
              <div key={index}>第{item.lineNum}行: {item.message}</div>
            )
          }): errTitle }
        </div>
      )
    });
  }

  // 导入
  const uploadProps = {
    showUploadList:false,
    action: '/api/yifu-business/method/tbusdept/getParentList',
    method:'get',
    headers: token,
    beforeUpload(file){
      setFileObj(file);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        // 通过FileReader对象读取文件
        const fileReader = new FileReader();
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(fileObj);
        fileReader.onload = event => {
          try {
            const { result } = event.target;
            // 以二进制流方式读取得到整份excel表格对象
            const workbook = XLSX.read(result, { type: 'binary' });
            // 存储获取到的数据
            const data = {};
            let sheetName = '';
            // 遍历获取每张工作表 除去隐藏表
            const allSheets = workbook.Workbook.Sheets;
            Object.keys(allSheets).every(key => {
              const {name} = allSheets[key];
              if (workbook.Sheets.hasOwnProperty(name) && allSheets[key].Hidden === 0) {
                sheetName = name;
                // 利用 sheet_to_json 方法将 excel 转成 json 数据
                data[name] = [].concat(XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: '', blankrows: true }));
                return false;
              }
            })
            // 处理数据前后空格以及最后一行空白
            const list = handleBlankRow(data[sheetName]);
            const errorMsg = []
            // 转换数据
            const resArr = list.map((item,index)=>{
              
              const obj = {}
              Object.keys(item).forEach(elemnet=>{
                if(/日期/.test(elemnet)){
                  if(!/^(\d{4})-(\d{2})-(\d{2})$/.test(item[elemnet])){
                    errorMsg.push({line:index+2,message:`${elemnet}只能是XXXX-XX-XX格式`});
                  }
                }
                obj[fieldParams[elemnet]] = item[elemnet];
              })
              return obj;
            });
            if(errorMsg.length){
              showMsg('',errorMsg);
              return false;
            }
            setBtnLoading(true);
            importExcel(resArr).then(res=>{

              // showMsg(res.msg,res.errorMessageList||[]);
              if (res.data && res.data.length != 0) {
                showMsg(res.msg, res.data || []);
              } else {
                message.success('导入成功');
              }
              // if(res.code === 200){
              //   actionRef.current.reload();
              // }
            }).finally(()=>{
              actionRef.current.reload();
              setBtnLoading(false);
            })
          } catch (e) {
            message.error('文件上传错误！')
          }
        }
      } else if (info.file.status === 'error') {f
        message.error(`${info.file.name}上传失败`);
      }
    },
  }
  
  const menu = () => {
    return (
      <Menu>
        <Menu.Item key="1">
          <Upload {...uploadProps}><ToTopOutlined /> 导入&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Upload>
        </Menu.Item>
        <Menu.Item key="2">
          {/* 这个模板需要后台给过来 放到puilc 中去 */}
          <a href="/templates/离职信息导入模板.xlsx" target="_blank" rel="noopener noreferrer">
            <DownloadOutlined /> 下载模板
          </a>
        </Menu.Item>
      </Menu>
    )
  }

  return (
    <PageHeader title="离职信息">
      <Spin spinning={loading}>
        <ProTable
          rowClassName='gesture'
          rowKey='id'
          columns={columns}
          options={false}
          actionRef={actionRef}
          loading ={false}
          formRef={formRef}
          search={{
            span:6,
            optionRender: (searchConfig, formProps, dom) => [
              ...dom.reverse(),
            ],
            className:'searchForm'
          }}
          form={{
            ignoreRules: false,
          }}
          pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
          request={(params) => requestList(params)}
          headerTitle={(<>
            <Button key="add" onClick={()=>editRow('add','部门添加')} icon={<PlusOutlined />} type="primary" style={{marginRight:'10px'}}>添加</Button>
            <Dropdown overlay={menu}>
              <Button loading={btnLoading}> 导 入 <DownOutlined /></Button>
            </Dropdown>
            <Button key="export" onClick={()=>exportExcel()}  icon={<DownloadOutlined />}  style={{marginLeft:'10px'}}>导出</Button>
          </>)}
        />
      </Spin>
      
      <Edit visible={visible} title={title} disabledLabel={disabledLabel} readOnly={readOnly}   defaultValues={defaultValues} handleCancel={() => {handleCancel()}} handleOk={handleOk}/>
      <Detail   detailVisible={detailVisible}  detailTitle={detailTitle} defaultValues={defaultValues} handleCancel={() => {handleCancel()}}/>

    </PageHeader>
  );

}

const employeeListComponent = (props) => {
  return (
    <>
      <KeepAlive>
        <List {...props} />
      </KeepAlive>
    </>
  )
}

export default connect(({ tagList }) => {
  return ({
    allTagList: tagList,
  })
})(employeeListComponent);