
import React, { useState, useRef, useEffect } from 'react';
import { Row,Col,Checkbox } from 'antd';
import ProForm, { ModalForm, ProFormText ,ProFormSelect,ProFormTextArea} from '@ant-design/pro-form';


// import styles from 'index.less'; // 告诉 umi 编译这个 less

const Details = (props) => {
  const { title, visibleDetail,defaultValues,handleCancel,roleName } = props;  
  

  // 写个判断类型的方法 进行提醒规则显示
  const typeRulesFun = () => {
    const type = defaultValues.remindType*1
    switch(type){
      case 0 : return (<Col span={16}>距复审到期日{defaultValues.remindRules}天，早上8:00 提醒{defaultValues.type*1 === 0?'短信':'系统'}提醒一次</Col>)
      case 1 : return (<Col span={16}>距到期日{defaultValues.remindRules}天，早上8:00 提醒{defaultValues.type*1 === 0?'短信':'系统'}提醒一次</Col>)
      case 2 : return (<Col span={16}>每年6月30日，早上8:00 提醒{defaultValues.type*1 === 0?'短信':'系统'}提醒一次</Col>)
      case 3 : return (<Col span={16}>结束日期后{defaultValues.remindRules}天，早上8:00 提醒{defaultValues.type*1 === 0?'短信':'系统'}提醒一次</Col>)
      default:
    }
  }

  // 写个判断类型的方法 进行提醒类型显示
  const typeShowFun = () => {
    const type = defaultValues.remindType*1
    switch(type){
      case 0 : return (<Col span={16}>复审到期日提醒</Col>)
      case 1 : return (<Col span={16}>证件到期日提醒</Col>)
      case 2 : return (<Col span={16}>年假未休提醒</Col>)
      case 3 : return (<Col span={16}>假期结束提醒</Col>)
      default:
    }
  }

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visibleDetail}
        layout="horizontal"
        width={600}
        submitter={{
          submitButtonProps: {
            style: {
              display: 'none',
            },
          },
          resetButtonProps: {
            style: {
              display: 'none',
            },
          },
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => handleCancel(),
        }}
      >
         <Row gutter={12} style={{marginTop:'5px'}}>
          <Col span={4} >提醒类型:</Col>
          {
            typeShowFun()
          }
        </Row>
        <Row gutter={12} style={{marginTop:'5px'}}>
          <Col span={4} >提醒规则:</Col>
          {
            typeRulesFun()
          }
        </Row>
        <Row gutter={12} style={{marginTop:'5px'}}>
          <Col span={4} >提醒模板:</Col>
          <Col span={16}>
            {defaultValues.remindTemplate}
          </Col>
        </Row>
        <Row gutter={12} style={{marginTop:'5px'}}>
          <Col span={4} >提醒对象:</Col>
          <Col span={16}>
            {
              defaultValues.remindObject?roleName.map((item,index)=>{
                return <Checkbox defaultChecked checked key={index}>{item}</Checkbox>
              }):<Checkbox defaultChecked checked>本人</Checkbox>
            }
          </Col>
        </Row>
        
      </ModalForm>
    </React.Fragment>
  )
}

export default Details;

