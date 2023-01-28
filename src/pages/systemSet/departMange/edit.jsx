import React from "react";
import { Form, TreeSelect,Select  } from 'antd';
import ProForm, { ModalForm, ProFormText } from '@ant-design/pro-form';

const Edit = (props) => {
  const { title, visible,treeData,defaultValues,disabledLabel, handleCancel, handleOk } = props;  

  const { Option } = Select;

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        labelCol={{span: 5}}
        wrapperCol={{span: 19}}
        width={540}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          okText:'保存',
          onCancel: () => handleCancel(),
        }}
        onFinish={async (values) => {
          const obj = { name:values.name };
          if(disabledLabel){
            obj.id = defaultValues.id;
            obj.pid = values.pid;
          }else{
            obj.pid = values.pid;
          }
          handleOk(obj);
        }}
        initialValues={defaultValues}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="name"
            label="部门名称"
            placeholder="请输入部门名称"
            rules={[{ required: true, message: '请输入部门名称!' },{max:50,message:'最多不超过50个字符!'}]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <Form.Item name="pid" label="上级部门" rules={[{ required: (defaultValues && defaultValues.pid == -1) ? false : true, message: '请选择上级部门!' }]}>
            { !defaultValues.id ? (
              <TreeSelect
                style={{ width: 326 }}
                allowClear={true}
                showSearch={true}
                disabled={(defaultValues && defaultValues.pid == -1) ? true : false}
                treeNodeFilterProp="title"
                placeholder="请选择上级部门"
                treeDefaultExpandAll
                treeData={treeData}
              />
            ) : (
              <Select
                showSearch
                style={{ width: 326 }}
                placeholder="请选择上级部门"
                optionFilterProp="children"
              >
                { treeData.length ? treeData.map(item=>{
                  return (<Option key={item.id} value={item.id}>{item.name}</Option>);
                }) : <Option value={-1}>{defaultValues.name}</Option> }
              </Select>
            ) }
          </Form.Item>
        </ProForm.Group>
      </ModalForm>
    </React.Fragment>
  )
}

export default Edit;

