import React, { useImperativeHandle, useState, useEffect } from 'react';
import { Select, Input, Form, Row, Col, Button,DatePicker } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import styles from './index.less';
import { loadProject } from '@/services/global';

import SelectPage from '@/components/SelectPage';

const SearchForm = (props) => {
  const { columns, onSearch: handleSearch,cRef } = props;
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [rangeVal, setRangeVal] = useState([]);
  const [dateVal, setDateVal] = useState('');

  const { Option } = Select;
  const { RangePicker } = DatePicker;

  useImperativeHandle(cRef, () => ({
    // 重置表单
    formReset: () => {
      form.resetFields();
    }
  }));
  
  useEffect(() => {
    console.log(columns,123)
  }, []);

  // 收起或展开
  const collapsedChange = (flag) => {
    setCollapsed(flag)
  };

  // 点击搜索或重置
  const onSearch = (flag) => {
    if(flag){
      form.resetFields();
    }
    handleSearch(form);
  };

  const changeRange = (dates,dateStrings,option) => {
    const obj = {};
    obj[option[0]] = dateStrings[0];
    obj[option[1]] = dateStrings[1];
    // 传递数据给父组件
    console.log(obj)
  }

  const changeDate = (date, dateString) => {
    setDateVal(date)
  }

  // 是否显示更多
  const showMore = () => {
    if(columns.length > 3){
      return collapsed ? (<span><a onClick={() => collapsedChange(false)}>收起 <UpOutlined /></a></span>) : (<span><a onClick={() => collapsedChange(true)}>展开 <DownOutlined /></a></span>)
    }
    return null
  }

  return (
    <div className={styles.filterContainer}>
      <Form form={form}>
        <Row gutter={[16, 16]}>
          {
            columns.map((item, index) => {
              if (item.hideInForm) {
                return null
              }
              if(index > 2 && !collapsed){
                return null
              }
              switch (item.valueType) {
                case 'date':
                  return (<Col span={6} key={item.key}>
                    <Form.Item name={item.key} label={item.label}>
                      <DatePicker onChange={changeDate} format={item.format} value={dateVal} style={{width:'100%'}} picker={item.picker}/>
                    </Form.Item>
                  </Col>)
                case 'dateRange':
                  return (<Col span={6} key={item.key}>
                    <Form.Item name={item.key} label={item.label}>
                      <RangePicker format={item.format} value={rangeVal} onChange={(dates,dateStrings)=>changeRange(dates,dateStrings,item.searchField)}/>
                    </Form.Item>
                  </Col>)
                case 'select':
                  return (<Col span={6} key={item.key}>
                    <Form.Item name={item.key} label={item.label}>
                      <Select
                        showSearch
                        optionFilterProp="children"
                        allowClear={true}
                        placeholder={item.placeholder ? item.placeholder : '请选择'}
                      >
                        {
                          Object.keys(item.valueEnum).map(key => (
                            <Option key={key} value={key}>{item.valueEnum[key]}</Option>
                          ))
                        }
                      </Select>
                    </Form.Item>
                  </Col>)
                case 'selectPage':
                  return (
                    <Col span={6} key={item.key}>
                      <Form.Item name={item.key} label={item.label}>
                        <SelectPage getData={item.getData} selectProps={{placeholder:item.placeholder,allowClear:true,showSearch:true,optionFilterProp:'children'}} labeltitle={item.labelTitle} labelvalue={item.labelValue}/>
                      </Form.Item>
                    </Col>
                  )
                default :
                  return (
                    <Col span={6} key={item.key}>
                      <Form.Item name={item.key} label={item.label}>
                        <Input
                          placeholder={item.placeholder ? item.placeholder : '请选择'}
                        />
                      </Form.Item>
                    </Col>
                  )
              }

            })
          }
          <Col span={6}>
            <Button className={styles.btnGuster} type="primary" onClick={() => onSearch(false)}>查询</Button>
            <Button className={styles.btnGuster} onClick={() => onSearch(true)}>重置</Button>
            { showMore() }
          </Col>
        </Row>
      </Form>

    </div>
  )
}
export default SearchForm
