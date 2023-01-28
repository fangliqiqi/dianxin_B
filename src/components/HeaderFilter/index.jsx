import React, { useImperativeHandle, useState, useEffect } from 'react';
import { Select, Input, Form } from 'antd';
import styles from './index.less';
import { CloseOutlined, CaretDownOutlined } from '@ant-design/icons';
import { loadCustomerAll } from '@/services/global';

const HeaderFilter = (props) => {
  const { columns, filterParam, desc,
    settleNames: handleSettleNameArray,
    selectChange: handleChange,
    onSearch: handleSearch, showProject,
    itemClose: handleCloseItem, cRef } = props; // 传入的控件布局数据和描述文字
  const [settleName, setSettleName] = useState(''); // 选中的结算主题名称(项目名称)
  const [settleNameArray, setSettleNameArray] = useState([]); //  结算主题的选择项 

  const [form] = Form.useForm();
  const { Option } = Select;
  const { Search } = Input;

  useImperativeHandle(cRef, () => ({
    // 重置表单
    formReset: () => {
      form.resetFields();
      setSettleName('');
    }
  }));

  // 获取项目
  const getProjectData = (settleName) => {
    loadCustomerAll({ settleName: settleName, limit: 20 }).then(res => {
      if (Number(res.code) === 200 && res.data) {
        setSettleNameArray(res.data);
        if (handleSettleNameArray) {
          handleSettleNameArray(res.data);
        }
      }
    });
  };
  
  useEffect(() => {
    // 获取项目
    getProjectData();

  }, []);

  // 选择项目
  const onChange = (keyName, value) => {
    handleChange(form, keyName);
  };
  // 带搜索的下拉框选择项目
  const selectOnChange = (keyName, value) => {
    setSettleName(value.children);
    handleChange(form, keyName);
  };

  
  // 点击了筛选项的叉号按钮
  const closeItem = (keyName, isSettleName) => {
    if (isSettleName) {
      setSettleName('');
    }
    const obj = {}
    obj[keyName] = null
    form.setFieldsValue(obj); // 删除的时候把form表单上的对应输入内容清空
    handleCloseItem(form, keyName);
  };

  // 点击搜索或点击回车
  const onSearch = () => {
    closeItem('settlementOrgan', true)
    handleSearch(form);
  };

  // 带搜索的下拉框搜索事件
  const selectOnSearch = (val) => {
    getProjectData(val);
  };


  return (
    <div className={styles.filterContainer}>
      <Form form={form} layout="inline">
        {
          showProject && (
            <Form.Item name='settlementOrgan' key='settlementOrgan'>
              <Select
                showSearch
                filterOption={false}
                style={{ width: 200 }}
                suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
                placeholder="全部项目"
                onSearch={text => selectOnSearch(text)}
                onSelect={selectOnChange}
                dropdownRender={menu => (
                  <>
                    {menu}
                  </>
                )}
              >

                {
                  settleNameArray && settleNameArray.map((item, index) => (
                    <Option key={index} value={item.id}>{item.departName}</Option>
                  ))
                }
              </Select>
            </Form.Item>
          )
        }

        {
          columns.map((item, index) => {
            if (item.hideInForm) {
              return null
            }
            if (item.valueEnum) { // 下拉选择框
              return (
                <Form.Item name={item.key} key={index}>
                  <Select
                    placeholder={item.placeholder ? item.placeholder : '请选择'}
                    suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
                    style={{ width: item.width ? item.width : 200 }}
                    onSelect={onChange}
                  >
                    {
                      Object.keys(item.valueEnum).map(key => (
                        <Option key={key} value={key}>{item.valueEnum[key]}</Option>
                      ))
                    }
                  </Select>
                </Form.Item>
              )
            } else { // 输入框
              return (
                <Form.Item name={item.key} key={index}>
                  <Search
                    placeholder={item.placeholder ? item.placeholder : '请选择'}
                    style={{ width: item.width ? item.width : 200 }}
                    onSearch={onSearch}
                  />
                </Form.Item>
              )
            }
          })
        }
      </Form>

      <div style={{ display: 'flex', }}>
        {
          desc ? <span>{desc}</span> : ''
        }

        { // 筛选的结算主体（项目）
          settleName ? (
            <div className={styles.filterItem}>
              <span className={styles.filterText}>{settleName}</span>
              <CloseOutlined className={styles.btnClose} onClick={() => closeItem('settlementOrgan', true)} />
            </div>
          ) : ''
        }

        { // 除了结算主体，其他筛选项
          Object.keys(filterParam).filter(key => key !== 'settlementOrgan').map((key, idx) => {
            const valueIndex = filterParam[key];
            let resultText = '';
            if (valueIndex) { // 排除value为undefined
              // 根据key 取columns中的数据项
              const dataItem = columns.filter(item => item['key'] === key);
              // 当前选中的value下标，在dataItem数据项中对应的文字
              const enumObject = dataItem[0].valueEnum;
              if (enumObject) { // 区分是下拉还是输入，下拉取字典的值
                resultText = enumObject[valueIndex];
              } else { // 输入框直接去valueIndex文字
                resultText = valueIndex;
              }
              return enumObject ? (
                <div className={styles.filterItem} key={idx}>
                  <span className={styles.filterText}>{resultText}</span>
                  <CloseOutlined className={styles.btnClose} onClick={() => closeItem(key)} />
                </div>

              ) : (
                  <div className={styles.filterItem} key={idx}>
                    <div className={styles.userNameItem}>
                      符合<span className={styles.filterText}>{resultText}</span>人员信息
                    <CloseOutlined className={styles.btnClose} onClick={() => closeItem(key)} />
                    </div>
                  </div>
                )
            } else {
              return null
            }
          })
        }
      </div>
    </div>
  )
}
export default HeaderFilter
