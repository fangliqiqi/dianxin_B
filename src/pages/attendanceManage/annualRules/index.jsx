import React, { useState, useRef, useEffect } from 'react';
import { KeepAlive, connect } from 'umi';
import { message, Form, Row,Col,DatePicker,Checkbox  } from 'antd';
import ProForm, { ProFormText, ProFormSelect,ProFormGroup,ProFormCheckbox } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import PageHeader from '@/components/PageHeader';
import moment from 'moment';
import { annualRule,modifyAnnualRule } from '@/services/annual';


const List = () => {

  const [defaultValues, setDefaultValues] = useState({});

  useEffect(() => {

  }, [])

  const handleOk = (params) => {
    modifyAnnualRule(params).then(res=>{
      if(res.code === 200){
        message.success('保存成功!');
      }else{
        message.warning(res.msg);
      }
    })
  }

  return (
    <PageHeader title="年假规则设置">
      <ProCard>
        <ProForm
          layout="horizontal"
          onFinish={async (values) => {
            const params = {
              id: defaultValues.id,
              timeScale: values.timeScale,
              timeValue: values.timeValue,
              type: values.type,
              vacationAutoInit: values.vacationAutoInit.length === 0 ? 0 : 1,
              vacationInitDate: defaultValues.clearTime
            }
            handleOk(params);
          }}
          submitter={{
            searchConfig: {
              resetText: '取消',
              submitText: '保存',
            },
            render: (props, doms) => {
              return <div style={{textAlign:'center',display:'flex',justifyContent:'space-between',width:'150px',margin:'0 auto'}}>{doms.reverse()}</div>
            },
          }}
          request={async () => {
            const res = await annualRule();
            if(res.code === 200){
              res.data.clearTime = res.data.vacationInitDate;
              if(moment(res.data.vacationInitDate).isValid()){
                res.data.vacationInitDate = moment(res.data.vacationInitDate).format('M月D日');
              }
              res.data.vacationAutoInit = new Array(res.data.vacationAutoInit);
              setDefaultValues(res.data);
              return res.data;
            }
          }}
        > 
        <Row>
          <Col span={24}>
            <ProFormSelect
              width="md"
              name="type"
              label="类型名称"
              placeholder="请选择类型名称"
              rules={[{ required: true, message: '请选择类型名称!' }]}
              valueEnum={{
                '1':'年假'
              }}
            />
          </Col>
          <Col span={24}>
            <ProForm.Group>
              <ProFormSelect
                width="xs"
                name="timeScale"
                label="时间刻度"
                placeholder="请选择时间刻度"
                rules={[{ required: true, message: '请选择时间刻度!' }]}
                valueEnum={{
                  '1':'按小时'
                }}
              />
              <div style={{height:'56px',lineHeight:'33px',color:'#999999'}}>请假按小时请假</div>
              <ProFormText
                width="sm"
                name="timeValue"
                rules={[{ required: true, message: '请输入小时!' },{pattern:/^[1-2]([0-3])?(?:\.\d)?$|0.[1-9]$|^[1-9](?:\.\d)?$|^1[4-9](?:\.\d)?$/,message:'只能是0-24之间最多一位小数!'}]}
                fieldProps={{ addonAfter:'小时',addonBefore:'1天 ='}}
              /><div style={{height:'56px',lineHeight:'33px',color:'#999999'}}>将按此规则对天与小时进行转换</div>
            </ProForm.Group>
          </Col>
          <Col span={12}>
            <Form.Item label="发放规则" rules={[{ required: true, message: '请选择发放规则!' }]} name="vacationAutoInit" extra="发放时长：满1年不满10年的，年休假5天；已满10年不满20年的，年休假10天；已满20年的，年休假15天。">
              <Checkbox.Group>
                <Checkbox value="1">假期余额自动发放</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="　年假公式">
              <ul style={{paddingTop:'5px'}}>
                <li>入职=1年，年假天数=（年末-当前日期）/365天*休假天数5，四舍五入，立即发放</li>
                <li>入职年限＞1年＜10年，当年度已发放休假天数的，次年发放：年假天数5天</li>
                <li>入职年限≥10年＜20年，当年度已发放休假天数的，次年发放：年假天数10天</li>
                <li>入职年限＞＝20年，当年度已发放休假天数的，次年发放，年假天数15天</li>
              </ul>
            </Form.Item>
          </Col>
          <Col span={24}>
              <ProFormText
                width="md"
                disabled
                label="　清零规则"
                name="vacationInitDate"
                extra="年假申请时，剩余年假数不跨年"
                fieldProps={{ addonAfter:'清零剩余年假',addonBefore:'每年' }}
              />
          </Col>
        </Row>
        
        </ProForm>
      </ProCard>
    </PageHeader>
  );

}

const account = (props) => {
  return (
    <>
      <KeepAlive>
        <List {...props} />
      </KeepAlive>
    </>
  )
}

export default connect(() => {return {}})(account);