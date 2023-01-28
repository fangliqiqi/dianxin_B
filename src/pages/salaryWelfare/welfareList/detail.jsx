import React, { useState,useImperativeHandle } from 'react';
import { Form, Row,Col,Upload,Tooltip } from 'antd';
import { ModalForm } from '@ant-design/pro-form';
import styles from './index.less';

const Detail = (props) => {
  const { title, visible,defaultValues, close:handleCancel, childRef } = props;  

  const [certTypeOption, setCertTypeOption] = useState({});
  const [certStatusOption, setCertStatusOption] = useState({});

  useImperativeHandle(childRef,()=>{
    return {
      showCertTypeOption:(arr)=>{
        setCertTypeOption(arr);
      },
      showCertStatusOption:(arr)=>{
        setCertStatusOption(arr);
      },
    }
  })

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        labelCol={{span: 10}}
        wrapperCol={{span: 14}}
        width={800}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          onCancel: () => handleCancel(),
        }}
        submitter={{
          submitButtonProps: {
            style: {
              display: 'none',
            },
          },
          searchConfig: {
            resetText: '关闭',
          },
        }}
        initialValues={defaultValues}
      >
      <div style={{maxHeight:'600px',overflowY:'auto'}}>
        <p style={{paddingBottom:'15px',borderBottomStyle:'solid',borderBottomWidth:'1px',borderBottomColor:'#dddddd',}}>匹配项</p>
        <Row className={styles.rowsty}  >
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>电信工号</span>
            <span className={styles.text}>：{defaultValues.teleNo}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>姓名</span>
            <span className={styles.text} >：{defaultValues.empName}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>身份证号</span>
            <span className={styles.text} >：{defaultValues.empIdCard}</span>
          </Col> 
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>工资月份</span>
            <span className={styles.text}>：{defaultValues.salaryMonth}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>所属部门</span>
            <span className={styles.text}>：{defaultValues.deptName}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>岗位</span>
            <span className={styles.text}>：{defaultValues.post}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>薪酬应发</span>
            <span className={styles.text}>：{defaultValues.relaySalary}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>激励应发</span>
            <span className={styles.text}>：{defaultValues.relayIncent}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>其他应发</span>
            <span className={styles.text}>：{defaultValues.relayOther}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>应发合计</span>
            <span className={styles.text}>：{defaultValues.relaySum}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>代扣个人社保</span>
            <span className={styles.text}>：{defaultValues.withholidPersonSocial}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>代扣个人公积金</span>
            <span className={styles.text}>：{defaultValues.withholidPersonFund}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>代扣个税</span>
            <span className={styles.text}>：{defaultValues.withholidPersonTax}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>其他应扣</span>
            <span className={styles.text}>：{defaultValues.withholidOther}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>扣款合计</span>
            <span className={styles.text}>：{defaultValues.withholidSum}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>实发工资</span>
            <span className={styles.text}>：{defaultValues.actualSalary}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>单位社保</span>
            <span className={styles.text}>：{defaultValues.unitSocial}</span>
          </Col>
          <Col span={11} className={styles.colsty}>
            <span className={styles.label}>单位公积金 </span>
            <span className={styles.text}>：{defaultValues.unitFund}</span>
          </Col>
        </Row>
        <p style={{paddingBottom:'15px',borderBottomStyle:'solid',borderBottomWidth:'1px',borderBottomColor:'#dddddd',}}>自定义项</p>
        <Row className={styles.rowsty}>
          {
            (defaultValues.resList&&defaultValues.resList.length>0)?defaultValues.resList.map(item=>{
              return (
                <Col span={11} key={item.id} className={styles.colsty}>
                  <span className={styles.label}>
                      <Tooltip title={item.cnName}>{item.cnName}</Tooltip>
                  </span>
                  <span className={styles.text}> ：{item.textValue}</span>
                  
                </Col> 
              )
              }):'无'
          } 
        </Row>
      </div>
        
      </ModalForm>
    </React.Fragment>
  )
}

export default Detail;

