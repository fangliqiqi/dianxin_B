import React, { useState, useImperativeHandle, useEffect, useRef } from 'react';
import { Form, message, Row, Col, Upload, Checkbox, DatePicker, Button } from 'antd';
import { ModalForm, ProFormSelect } from '@ant-design/pro-form';
import { UploadOutlined } from '@ant-design/icons';
import SelectPage from '@/components/SelectPage';
import { departList } from '@/services/depart';
import styles from './index.less';
import { handleBlankRow } from '@/utils/utils';
import { getResListByDeptId, getConfigList } from '@/services/welfare';
import XLSX from 'xlsx';
import moment from 'moment';
import { List } from 'rc-field-form';

const Edit = (props) => {
  const { title, visible, defaultValues, handleCancel, handleOk, childRef } = props;

  const [defaultChecked, setDefaultChecked] = useState(true);
  const [token, setToken] = useState({});
  const [preVal, setPreVal] = useState({});
  const [arrEnum, setArrEnum] = useState([]);
  const [arrEnumall, setarrEnumall] = useState([]);
  const [fileObj, setFileObj] = useState({});
  const [contentList, setContentList] = useState([]);
  // 选中部门信息
  const [departInfo, setDepartInfo] = useState({});
  // 系统表头
  const [configList, setConfigList] = useState([]);
  // 对应字段关系
  const [relateFields, setRelateFields] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const formRef = useRef();

  useEffect(() => {}, []);

  useImperativeHandle(childRef, () => {
    return {
      showToken: (obj) => {
        setToken(obj);
      },
      getRelateFields: () => {
        getConfigList()
          .then((res) => {
            if (res.code === 200) {
              setConfigList(res.data);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      },
      // 清空下拉选项
      clearOptions: () => {
        setArrEnum([]);
        setRelateFields([]);
      },
    };
  });

  // 处理导入数据 去除空格 最后的空格行
  const handleRow = (data) => {
    // 去除空格
    const newData = data.map((item) => {
      const obj = {};
      Object.keys(item).forEach((elemnt) => {
        const newKey = typeof elemnt === 'string' ? elemnt.trim() : elemnt;
        obj[newKey] = typeof item[elemnt] === 'string' ? item[elemnt].trim() : item[elemnt];

        if (new RegExp('__EMPTY').test(newKey)) {
          delete obj[newKey];
        }
      });
      return obj;
    });
    return newData;
  };

  const changeSelect = (index, val) => {
    if (!val) {
      return false;
    }
    const afterArrEnum = [...arrEnum];
    console.log('[ arrEnum ] >', arrEnum);

    const res = arrEnum.map((item, i) => {
      if (index !== i) {
        // 删除其他数组里值
        arrEnum.forEach((items, j) => {
          if (i !== index) {
            afterArrEnum[j] = afterArrEnum[j].filter((itemss) => itemss.value !== val);
          }
        });
        // change前的值添加上
        if (Object.keys(preVal).length) {
          afterArrEnum[i].push(preVal);
        }
        return afterArrEnum[i];
      } else {
        return item;
      }
    });
    console.log('[ res ] >', res);
    setArrEnum(res);
  };

  // 下拉清空
  const onClear = (index) => {
    console.log('[ index ] >', index);

    const value = formRef.current.getFieldValue(`select${index}`);
    console.log('[ value ] >', value);

    const obj = {};
    obj.label = value;
    obj.value = value;
    const afterArrEnum = [...arrEnum];
    console.log('arrEnum', arrEnum);
    arrEnum.map((item, i) => {
      if (i !== index) {
        afterArrEnum[i].push(obj);
      }
    });
    setArrEnum(afterArrEnum);
    console.log(afterArrEnum);
    console.log('arrEnum', arrEnum);
  };

  // 判断字符串是否在数组对象中
  const inArrObj = (arr, str) => {
    let flag = false;
    const res = arr.find((item) => {
      return item.value === str;
    });
    if (res) flag = true;
    return flag;
  };

  // 部门选择
  const changeDepart = (val, option) => {
    const leng = configList.length;
    if (val) {
      setDepartInfo(option.item);
      // 切换部门时，清空选中项以及下拉
      for (let i = 0; i < leng; i++) {
        const obj = {};
        obj[`select${i}`] = null;
        formRef.current.setFieldsValue(obj);
      }
      const afterArrEnum = [...arrEnumall];
      getResListByDeptId({ deptId: val }).then((res) => {
        if (res.code === 200 && res.data.length) {
          setRelateFields(res.data);
          // 存在下拉选项时设置选中状态
          if (arrEnum.length) {
            configList.map((item, index) => {
              res.data.map((field) => {
                if (field.configId === item.id) {
                  const flag = inArrObj(arrEnum[index], field.excelTitle);
                  if (flag) {
                    const obj = {};
                    obj[`select${index}`] = field.excelTitle;
                    formRef.current.setFieldsValue(obj);
                  }
                  arrEnumall.forEach((item, i) => {
                    if (i !== index) {
                      afterArrEnum[i] = afterArrEnum[i].filter(
                        (items) => items.value !== field.excelTitle,
                      );
                    }
                  });
                }
              });
            });
            setArrEnum(afterArrEnum);
          }
        } else {
          setRelateFields([]);
          setArrEnum(afterArrEnum);
          // 取消选中状态
          configList.map((config, index) => {
            const obj = {};
            obj[`select${index}`] = null;
            formRef.current.setFieldsValue(obj);
          });
        }
      });
    } else {
      setDepartInfo({});
      // 取消选中状态
      configList.map((config, index) => {
        const obj = {};
        obj[`select${index}`] = null;
        formRef.current.setFieldsValue(obj);
      });
    }
  };

  // 关系保存
  const onCheckChange = (e) => {
    setDefaultChecked(e.target.checked);
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // 导入
  const uploadProps = {
    action: '/api/yifu-business/method/tbusdept/getParentList',
    method: 'get',
    headers: token,
    maxCount: 1,
    beforeUpload(file) {
      setFileObj(file);
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
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

            if (list.length === 0) {
              message.warning('导入的表中无数据!');
              return;
            }
            // 设置下拉选项并选中 下拉项去除已选中的
            const optionList = Object.keys(handleRow(data[sheetName])[0]); // 默认所有的下拉选项 excel表头
            const options = []; // 每项下拉选项
            const selected = {}; // 选中

            // 设置选中项
            configList.forEach((item, index) => {
              selected[`select${index}`] = null;
              relateFields.map((field) => {
                if (field.configId === item.id) {
                  const flag = optionList.find((opt) => opt === field.excelTitle);
                  if (flag) {
                    selected[`select${index}`] = field.excelTitle;
                  }
                }
              });
            });
            // const allSelected = Object.values(selected)
            const allSelected = Object.values(selected).filter((sel) => sel !== null);

            // 设置下拉选项
            const optionsAll = [];
            configList.forEach((element, index) => {
              options[index] = [];
              optionsAll[index] = [];
              optionList.map((items) => {
                optionsAll[index].push({ label: items, value: items });
                if (!allSelected.includes(items)) {
                  options[index].push({ label: items, value: items });
                }
              });
              if (allSelected && allSelected.length) {
                options[index].push({
                  label: selected[`select${index}`],
                  value: selected[`select${index}`],
                });
                options[index].pop();
              }
            });
            setarrEnumall(optionsAll);
            setArrEnum(options);

            formRef.current.setFieldsValue(selected);

            // 转换数据
            const contLists = [];

            list.map((items) => {
              const contList = [];
              for (const key in items) {
                items[key] =
                  !isNaN(items[key]) && String(items[key]).indexOf('.') != -1
                    ? Number(items[key]).toFixed(2)
                    : items[key];
                contList.push({ title: key, content: items[key].toString() });
              }
              contLists.push(contList);
            });
            // 获取表格内容
            setContentList(contLists);
          } catch (e) {
            message.error('文件上传错误！');
          }
        };
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name}上传失败`);
      }
    },
    onRemove() {
      const arr = [];
      configList.map((item, index) => {
        const obj = {};
        obj[`select${index}`] = null;
        formRef.current.setFieldsValue(obj);
        arr[index] = [];
      });
      setArrEnum(arr);
    },
  };

  const onDropdownVisibleChange = (open, index) => {
    if (open) {
      const fieldValue = formRef.current.getFieldValue(`select${index}`);
      if (fieldValue) {
        setPreVal({ label: fieldValue, value: fieldValue });
      } else {
        setPreVal({});
      }
    }
  };

  const waitTime = (time = 100, values) => {
    return setTimeout(() => {
      handleOk(values);
      setConfirmLoading(false);
    }, time);
  };

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}
        layout="horizontal"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        width={670}
        formRef={formRef}
        modalProps={{
          destroyOnClose: true,
          maskClosable: false,
          okText: '导入',
          onCancel: () => handleCancel(),
        }}
        submitter={{
          submitButtonProps: {
            loading: confirmLoading,
          },
        }}
        onFinish={async (values) => {
          setConfirmLoading(true);
          // 导入提交
          const salaryMonth = moment(values.salaryMonth).format('YYYYMM');
          const saveType = defaultChecked ? 0 : 1;
          const resLists = [];
          configList.map((item, index) => {
            const obj = {};
            const res = relateFields.find((field) => field.configId === item.id);
            if (res) {
              obj.id = res.id;
            }
            obj.configId = item.id;
            obj.configName = item.dbFiedName;
            obj.deptId = values.deptId;
            obj.deptName = departInfo.name;
            obj.deptNo = departInfo.treeLogo;
            obj.excelTitle = values[`select${index}`];
            resLists.push(obj);
          });
          const params = {
            ...{ saveType, salaryMonth, contentList, resList: resLists, deptId: values.deptId },
          };
          await waitTime(1000, params);
          // handleOk(params);
          return true;
        }}
        initialValues={defaultValues}
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label="所属部门"
              name="deptId"
              rules={[{ required: true, message: '请选择所属部门!' }]}
            >
              <SelectPage
                onChange={changeDepart}
                getData={departList}
                selectProps={{
                  placeholder: '输入部门搜索',
                  allowClear: true,
                  showSearch: true,
                  optionFilterProp: 'children',
                }}
                labeltitle="name"
                labelvalue="id"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label="工资月份"
              name="salaryMonth"
              rules={[{ required: true, message: '请选择工资月份！' }]}
            >
              <DatePicker picker="month" format="YYYYMM" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              name="upload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              label="导入数据"
              rules={[{ required: true, message: '请导入数据!' }]}
            >
              <Upload setyle={{ width: '100%' }} {...uploadProps}>
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="信息匹配"></Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Row className={styles.middle}>
              <Col span={4}>序号</Col>
              <Col span={10}>系统表头</Col>
              <Col span={10}>导入表头</Col>
            </Row>
            {configList.map((item, index) => {
              return (
                <Row className={styles.middle} key={item.id}>
                  <Col span={4}>{index + 1}</Col>
                  <Col span={10}>
                    {' '}
                    <span
                      style={{
                        color: 'red',
                        display:
                          item.isMustNeed === 1 || item.isMustNeed === 3 ? 'inline-block' : 'none',
                      }}
                    >
                      *
                    </span>{' '}
                    {item.dbFiedName}
                  </Col>
                  <Col span={10} className={styles.marginBottm}>
                    <ProFormSelect
                      name={`select${index}`}
                      options={arrEnum[index]}
                      fieldProps={{
                        showSearch: true,
                        optionFilterProp: 'children',
                        onChange: (val, option) => changeSelect(index, val, option),
                        onClear: (val) => onClear(index, val),
                        onDropdownVisibleChange: (open) => onDropdownVisibleChange(open, index),
                        getPopupContainer: (triggerNode) => triggerNode.parentElement,
                      }}
                      placeholder={`请选择对应的${item.dbFiedName}`}
                      rules={[
                        {
                          required: item.isMustNeed === 1 || item.isMustNeed === 3,
                          message: `请选择对应的${item.dbFiedName}!`,
                        },
                      ]}
                    />
                  </Col>
                </Row>
              );
            })}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Row>
              <Col span={3}>&nbsp;&nbsp;</Col>
              <Col span={12} className={styles.checkox}>
                <Form.Item>
                  <Checkbox onChange={onCheckChange} checked={defaultChecked}>
                    是否保存对应关系
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </ModalForm>
    </React.Fragment>
  );
};

export default Edit;
