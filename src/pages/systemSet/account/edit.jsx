import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { Form, TreeSelect,Row,Col,Divider, message,Checkbox } from 'antd';
import ProForm, { ModalForm, ProFormText,ProFormSelect,ProFormSwitch,ProFormCheckbox } from '@ant-design/pro-form';
import SelectPage from '@/components/SelectPage';
import { searchCustomer,getSettleDomain,getRoleAndMenu,saveRoleMenu } from '@/services/admin';
import styles from './index.less';




const Edit = (props) => {
  const { title, visible,defaultValues, handleCancel, handleOk,childRef,disableForm } = props;  
  
  const [roleNameMap, setRoleNameMap] = useState([]);
  const [roleMenuMap, setRoleMenuMap] = useState([]);
  const [roleMenuObj, setRoleMenuObj] = useState({});
  const [roleMenuArr, setRoleMenuArr] = useState([]);
  const [settleList, setSettleList] = useState([]); // 结算主体列表
  const [saveList, setSaveList] = useState([]);
  
  let isDelete = false;

  const formRef = useRef();

  const handleRoleData = (data) => {
    const roleName = [];
    // eslint-disable-next-line
    for(const key in data){
      roleName.push({label:data[key],value:key});
    }
    return roleName;
  }

  const handleMuneData = (data) => {
    const roleName = [];
    // eslint-disable-next-line
    for(const item of data){
      roleName.push({label:item.name,value:item.menuId});
    }
    return roleName;
  }

  // 角色变化
  const changeRoleName = (val) => {
    if(val.length){
      let arr = [];
      val.forEach(item=>{
        arr = [...arr,...roleMenuObj[item]];
      })
      const obj = {};
      arr = arr.reduce((item, next) => {
        // eslint-disable-next-line no-unused-expressions
        obj[next.menuId] ? '' : obj[next.menuId] = true && item.push(next);
        return item;
      }, []);
      const res = handleMuneData(arr);
      const result = res.map(item=>{return item.value});
      setRoleMenuMap(res);
      setRoleMenuArr(result);
    }else{
      setRoleMenuMap([]);
    }
  }
  
  const handleList = (list) => {
    const arr = list.map(item=>{
      return {
        customerId: item.customerId,
        settleId: item.value
      };
    })
    setSaveList(arr);
  }

  useImperativeHandle(childRef,()=>{
    return {
      getSettleList:(list)=>{
        setSettleList(list);
        handleList(list);
      },
      transformRole:(arr)=>{
        changeRoleName(Object.values(arr));
      },
      colseDialog: ()=>{
        setRoleMenuMap([]);
      },
      initSaveList: (arr)=>{
        setSaveList(arr);
      },
      initData: ()=>{
        setRoleMenuMap([]);
        setSettleList([]);
        setSaveList([]);
      }
    }
  })

  useEffect(() => {
    getRoleAndMenu().then(res=>{
      if(res.code === 200){
        setRoleNameMap(handleRoleData(res.data.roleNameMap));
        setRoleMenuObj(res.data.roleMenuMap);
      }
    })
  }, [])


  // 客户单位变化时
  const changeCustomer = (val) => {
    if(val.length === 0){
      formRef.current.setFieldsValue({settleId:[]});
      setSettleList([]);
      return false;
    }
    // const params = {customerId:val[val.length-1]};
    getSettleDomain(val[val.length-1]).then(res=>{
      if(res.code === 200 && res.data && !isDelete){
        const list = res.data.map(item=>{
          return {value:item.id,label:item.departName,customerId:item.customerId};
        })
        // 去重
        let arr = [...settleList,...list];
        // let arr = list;
        const obj = {};
        arr = arr.reduce((item, next) => {
          obj[next.value] ? '' : obj[next.value] = true && item.push(next);
          return item;
        }, []);
        setSettleList(arr);
        const selectVal = arr.map(item=>{return item.value});
        formRef.current.setFieldsValue({settleId:selectVal});
        // 设置保存时list
        handleList(arr);
      }
    }).finally(()=>{
      isDelete = false
    })
  }
  // 删除客户单位
  const onDeselects = (val) => {
    isDelete = true;
    const list = settleList.filter(item=>item.customerId !== val);
    const arr = list.map(item=>{return item.value});
    setSettleList(list);
    handleList(list);
    formRef.current.setFieldsValue({settleId:arr});
  }

  const changeSettle = (val,option) => {
    handleList(option);
  }

  const getPopupContainers = (triggerNode) => {
    return triggerNode.parentElement;
  }

  const deselectSettle = (val) => {
    const arr = saveList.filter(item=>item.settleId !== val);
    setSaveList(arr);
  }
  
  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        labelCol={{span: 6}}
        wrapperCol={{span: 18}}
        width={850}
        formRef={formRef}
        submitter={!disableForm}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          okText:'保存',
          onCancel: () => handleCancel(),
        }}
        onFinish={async (values) => {
          const params = {
            user:{
              nickname: values.nickname,
              phone: values.phone,
              username: values.username,
              password: values.password,
            },
            customer:saveList,
            lockFlag: values.lockFlag === false ? 1 : 0,
            roleList:values.roleName,
          }
          if(Object.keys(defaultValues).length){
            const obj = {...params.user,...{userId:defaultValues.userId}};
            params.user = obj;
            const password = values.password ? values.password.replace(/(^\s*)|(\s*$)/g, "") : null;
            if(password){
              params.user.password = password;
            }else{
              delete params.user.password;
            }
          }
          handleOk(params);
        }}
        initialValues={defaultValues}
      >
        <Row>
          <Col span={24} className={styles.row}>
            <span className={styles.title}>数据范围</span>
          </Col>
          <Col span={12}>
            <Form.Item label="客户单位" name="customerId" rules={[{ required: true, message: '请选择客户单位!' }]}>
              <SelectPage getData={searchCustomer} resList={defaultValues?defaultValues.customerLists:[]} onChange={changeCustomer} selectProps={{placeholder:'输入客户单位搜索',mode:'multiple',allowClear:true,showSearch:true,maxTagCount:10,optionFilterProp:'children',onDeselect:onDeselects,disabled:disableForm,getPopupContainer:getPopupContainers}} labeltitle="customerName" labelvalue="id"/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormSelect
              options={settleList}
              name="settleId"
              label="结算主体"
              fieldProps={{mode:'multiple',onChange:changeSettle,disabled:disableForm,maxTagCount:10,onDeselect:deselectSettle,getPopupContainer:getPopupContainers}}
              rules={[{ required: true, message: '请选择结算主体!' }]}
            />
            
          </Col>
          <Col span={24} className={styles.row}>
            <span className={styles.title}>账号信息</span>
          </Col>
          <Col span={12}>
            <ProFormText
              name="nickname"
              label="用户名"
              disabled={disableForm}
              rules={[{ required: true, message: '请输入用户名!' },{max:20,message:'最多20个字符!'}]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              name="username"
              label="登录账号"
              disabled={disableForm||defaultValues.username}
              rules={[{ required: true, message: '请输入登录账号!' },{max:20,message:'最多20个字符!'},{pattern:/^[0-9a-zA-Z]*$/,message:'只能输入字母或数字!'}]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              name="password"
              label="初始密码"
              disabled={disableForm}
              tooltip="编辑时置空则不修改密码"
              rules={[{ required: (defaultValues && Object.keys(defaultValues).length) ? false : true, message: '请输入初始密码!' },{max:20,message:'最多20个字符!'}]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              name="phone"
              label="联系方式"
              disabled={disableForm}
              rules={[{ pattern: /^1\d{10}$/,message: '联系方式格式错误！' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormSwitch
              name="lockFlag"
              label="账号状态"
              disabled={disableForm}
              fieldProps={{checkedChildren:'正常',unCheckedChildren:'锁定',defaultChecked:(!Object.keys(defaultValues).length || (defaultValues && defaultValues.lockFlag === '0'))?true: false}}
            />
          </Col>
          <Col span={24} className={styles.row}>
            <span className={styles.title}>人员角色</span>
          </Col>
          <Col span={24}>
            <ProFormCheckbox.Group
              name="roleName"
              options={roleNameMap}
              disabled={disableForm}
              fieldProps={{onChange:changeRoleName}}
              rules={[{ required: true, message: '请选择人员角色!' }]}
            />
          </Col>
          <Col span={24} style={{marginBottom:'20px'}}>
            <Checkbox.Group
              className={styles.roleMenu}
              checked={true}
              disabled={true}
              options={roleMenuMap}
              value={roleMenuArr}
            />
          </Col>
        </Row>
      </ModalForm>
    </React.Fragment>
  )
}

export default Edit;
