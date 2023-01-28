import React from "react";
import { Form, TreeSelect  } from 'antd';
import ProForm, { ModalForm, ProFormText ,ProFormSelect,ProFormTextArea} from '@ant-design/pro-form';



const Edit = (props) => {
  const { title, visible,defaultValues,handleCancel, handleOk } = props;  
  
  const fieldProp = {
    maxLength:50,
    allowClear:true,
    showCount:true,
    autoSize:{minRows: 3, maxRows: 6}
  }

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        labelCol={{span:4}}
        wrapperCol={{span:18}}
        layout="horizontal"
        width={500}
        modalProps={{
          destroyOnClose: true,
          okText:'保存',
          onCancel: () => handleCancel(),
        }}
        onFinish={async (values) => {
          if(defaultValues.id){
            values.id = defaultValues.id
          }
          values.status= Number(values.status)
          handleOk(values)
        }}
        initialValues={defaultValues}
      >
        <ProFormText
            width="md"
            name="name"
            label="标签名称"
            placeholder="请输入标签名称"
            rules={[{ required: true, message: '请输入标签名称!' },{max:20,message:'最多不超过20个字符!'}]}
          />
        <ProFormTextArea
            name="remark"
            width="md"
            label="标签说明"
            style={{boxSizing: 'borderBox'}}
            placeholder="请输入标签说明(最多50字)"
            fieldProps = {fieldProp}
          />
        <ProFormSelect
              width="md"
              label="标签状态"
              name="status"
              valueEnum={{
                '0': '启用',
                '1': '禁用',
              }}
              placeholder="选择标签状态"
              rules={[{ required: true, message: '请选择标签状态' }]}
        />
      </ModalForm>
    </React.Fragment>
  )
}

export default Edit;

