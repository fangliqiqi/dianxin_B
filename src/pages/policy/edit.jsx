import React, { createRef } from 'react';
import E from 'wangeditor';
import PageHeader from '@/components/PageHeader';
import { withRouter, history, connect } from 'umi';
import styles from './index.less';
import { Form, Input, Button, Select, message, Space } from 'antd';
import {
  loadAreaDatas,
  getAreaMap,
  addPolicy,
  editPolicy,
  loadPolicyDetailData,
} from '@/services/policy';
import escape2Html from '@/utils/escape2Html';
import { CaretDownOutlined } from '@ant-design/icons';
import moment from 'moment';

class EditPolicy extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      pageType: 0, // 0：添加，1：编辑
      editorContent: '', // 输入的编辑器中的内容
      areaData: [], // 省市区地址数据
      cityList: [], // 存储选择省份后对应的城市数组
      provinceName: '', // 选中的省份名称
      areaMapData: {}, // 所有省市区在同一级的字典数据，用于页面上的数据回显
      detailData: {}, // 政策详情数据
      saveLoading: false, // 保存按钮loading
    };
    this.formRef = createRef(); // form 的ref
    this.editorRef = createRef(); // form.item 的ref

    this.editorElemMenu = createRef();
    this.editorElemBody = createRef();
  }

  // 废弃的生命周期
  // componentWillMount() {
  //   // 页面类型 0：添加，1：编辑
  //   const pageType = Number(this.props.location.query.pageType);
  //   this.setState({
  //     pageType: pageType,
  //   })
  // }

  // 正确的生命周期
  UNSAFE_componentWillMount() {
    // 页面类型 0：添加，1：编辑
    const pageType = Number(this.props.location.query.pageType);
    this.setState({
      pageType: pageType,
    });
  }

  componentDidMount() {
    // 获取省市区地址
    loadAreaDatas().then((res) => {
      if (Number(res.code) === 200) {
        this.setState({ areaData: res.data });
      }
    });

    if (this.state.pageType) {
      // 获取政策详情数据
      loadPolicyDetailData(this.props.location.query.policyID).then((res) => {
        if (Number(res.code) === 200) {
          this.setState({
            isLoading: false,
            detailData: res.data ? res.data : {},
          });
          // 初始化文本编辑器
          this.initEditor(this.state.detailData.content);

          // 获取所有省市字典
          getAreaMap().then((_res) => {
            if (Number(_res.code) === 200) {
              this.setState({
                areaMapData: _res.data ? _res.data : {},
              });
              this.handleEditAreaData();
            }
          });
        } else {
          // 初始化文本编辑器
          this.initEditor();
          message.error('政策详情数据获取失败！');
        }
      });
    } else {
      // 新增
      this.setState({
        isLoading: false,
      });

      // 初始化文本编辑器
      this.initEditor();
    }
  }

  // 处理详情数据中的省份和城市数据（编辑赋值）
  handleEditAreaData() {
    const { detailData, areaMapData } = this.state;
    // 省
    const object = areaMapData[detailData.province];
    // 市
    const citys = detailData.city ? detailData.city.split(',') : [];
    const cityArray = citys.map((item) => {
      return Number(item);
    });

    this.setState({
      provinceName: object ? object.areaName : '',
    });
    // 选择省份后，存储当前选中的省份下的城市列表数据
    this.setState({
      cityList: object.id ? this.state.areaData[object.id - 1].children || [] : [],
    });
    // 设置form的区域值
    this.formRef.current.setFieldsValue({
      title: detailData.title,
      content: detailData.content,
      province: object.id,
      city: cityArray,
    });
  }

  // 初始化文本编辑器
  initEditor = (content = null) => {
    // const elemMenu = this.refs.editorElemMenu; refs已经废弃
    // const elemBody = this.refs.editorElemBody;
    const elemMenu = this.editorElemMenu.current;
    const elemBody = this.editorElemBody.current;

    const editor = new E(elemMenu, elemBody);
    editor.customConfig.zIndex = 100;
    // 使用 onchange 函数监听内容的变化，并实时更新到 state 中
    editor.customConfig.onchange = (html) => {
      this.setState({
        editorContent: editor.txt.html(),
      });
      // 设置form的区域值
      this.formRef.current.setFieldsValue({
        content: editor.txt.html(),
      });
    };

    editor.customConfig.menus = [
      'head', // 标题
      'bold', // 粗体
      'fontSize', // 字号
      'fontName', // 字体
      'italic', // 斜体
      'underline', // 下划线
      'strikeThrough', // 删除线
      'foreColor', // 文字颜色
      'backColor', // 背景颜色
      'link', // 插入链接
      'list', // 列表
      'justify', // 对齐方式
      'quote', // 引用
      'code', // 插入代码
      'undo', // 撤销
      'redo', // 重复
    ];
    editor.create();
    // 编辑政策页面赋值
    if (content != null) {
      editor.txt.html(escape2Html(`${content}`));
    }
  };

  // 省份下拉框选择项目
  provinceOnChange = (keyName, value) => {
    if (value.children !== this.state.provinceName) {
      // 切换了省份，清空城市列表
      this.formRef.current.setFieldsValue({
        city: undefined,
      });
    }
    this.setState({
      provinceName: value.children,
    });
    // 选择省份后，存储当前选中的省份下的城市列表数据
    const list = this.state.areaData[keyName - 1].children;
    this.setState({
      cityList: list ? list : [],
    });
  };

  // 城市选择回调
  cityOnChange = (keyName, value) => {
    // 设置form的区域值
    this.formRef.current.setFieldsValue({});
  };

  // 表单finish方法
  onFinish = (values) => {
    if (!values.title) {
      message.error('请输入标题');
      return;
    }
    if (!values.content) {
      message.error('请输入正文内容');
      return;
    }
    if (!values.province) {
      message.error('请选择省份');
      return;
    }
    if (!values.city || values.city.length <= 0) {
      message.error('请选择城市');
      return;
    }
    if (values.city && Array.isArray(values.city)) {
      values.city = values.city.join(',');
    }
    this.setState({
      saveLoading: true,
    });
    if (this.state.pageType) {
      Object.assign(values, { id: this.props.location.query.policyID });
      this.handleEditPolicy(values);
    } else {
      // 发布新增
      this.handleAdd(values);
    }
  };

  // 表单onFinishFailed方法
  onFinishFailed = (errorInfo) => {};

  // 调用编辑政策接口
  handleEditPolicy = (rows) => {
    const that = this;
    const hide = message.loading('正在编辑');
    try {
      hide();
      editPolicy(rows).then((resp) => {
        if (Number(resp.code) === 200) {
          that.props.dispatch({
            type: 'policyModels/policyChangeToRefresh',
            payload: { policyChanged: moment().format() },
          });
          message.success('编辑成功！');
          history.goBack();
        } else {
          message.error(resp.msg || '编辑失败，请重试!');
        }
      }).finally(() => {
        this.setState({
          saveLoading: false,
        });
      });
    } catch (error) {
      hide();
      this.setState({
        saveLoading: false,
      });
      message.error('编辑失败，请重试');
    }
  };

  handleAdd = (params) => {
    const that = this;
    const hide = message.loading('正在添加');
    try {
      hide();
      const fetchAddInterface = async () => {
        const res = await addPolicy(params);
        if (Number(res.code) === 200) {
          that.props.dispatch({
            type: 'policyModels/policyChangeToRefresh',
            payload: { policyChanged: moment().format() },
          });
          message.success('添加成功');
          history.goBack();
          this.setState({
            saveLoading: false,
          });
        } else {
          message.error(res.msg || '更新失败，请重试！');
          this.setState({
            saveLoading: false,
          });
        }
      };
      fetchAddInterface();
    } catch (error) {
      hide();
      message.error('添加失败，请重试');
      this.setState({
        saveLoading: false,
      });
    }
  };

  render() {
    const { pageType, detailData, areaData, cityList ,saveLoading} = this.state;
    const { Option } = Select;
    const layout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    };
    const tailLayout = {
      wrapperCol: { offset: 2, span: 22 },
    };
    return (
      <React.Fragment>
        {
          <PageHeader title={pageType ? '政策编辑' : '政策添加'}>
            <div className={styles.editContentWrap}>
              <Form
                {...layout}
                ref={this.formRef}
                layout="horizontal"
                onFinish={(values) => this.onFinish(values)}
                onFinishFailed={(errorInfo) => this.onFinishFailed(errorInfo)}
              >
                <Form.Item
                  className="mylabel"
                  label="标题:"
                  name="title"
                  initialValue={detailData.title ? detailData.title : ''}
                >
                  <Input className="mylabel_input" maxLength="200" />
                </Form.Item>

                <Form.Item
                  name="content"
                  label="正文"
                  className="mylabel"
                  initialValue={detailData.content ? detailData.content : ''}
                >
                  <div
                    // ref="editorElemMenu" 这样写会报错
                    ref={this.editorElemMenu}
                    style={{ backgroundColor: '#FAFAFA', border: '1px solid #E6E6E6' }}
                    className="editorElem-menu"
                  ></div>

                  <div
                    style={{
                      height: 300,
                      border: '1px solid #E6E6E6',
                      borderTop: 'none',
                      zIndex: '1 !important',
                    }}
                    // ref="editorElemBody"  这样写会报错
                    ref={this.editorElemBody}
                    className="editorElem-body"
                  ></div>
                </Form.Item>

                <Form.Item label="区域" className="mylabel area">
                  <Space size={15} className={styles.areaContentWrap}>
                    <Form.Item name="province" noStyle>
                      <Select
                        placeholder="省份"
                        onChange={this.provinceOnChange}
                        suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
                        style={{
                          width: 150,
                        }}
                      >
                        {areaData
                          ? areaData.map((item, index) => (
                              <Option key={item.id} value={item.id}>
                                {item.areaName}
                              </Option>
                            ))
                          : ''}
                      </Select>
                    </Form.Item>

                    <Form.Item name="city" noStyle>
                      <Select
                        mode="multiple"
                        showSearch={false}
                        allowClear
                        placeholder="城市"
                        onChange={this.cityOnChange}
                      >
                        {cityList
                          ? cityList.map((item, index) => (
                              <Option key={item.id} value={item.id}>
                                {item.areaName}
                              </Option>
                            ))
                          : ''}
                      </Select>
                    </Form.Item>
                  </Space>
                </Form.Item>

                <Form.Item {...tailLayout}>
                  <Button htmlType="submit" type="primary"  loading={saveLoading}>
                    {pageType ? '编辑发布' : '保存发布'}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </PageHeader>
        }
      </React.Fragment>
    );
  }
}
export default connect(() => ({}))(withRouter(EditPolicy));
