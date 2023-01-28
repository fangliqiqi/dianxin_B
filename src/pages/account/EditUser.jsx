import React, { useState, useEffect } from 'react';
import { Switch, Checkbox, Button, message, Select, Divider, Pagination, Space } from 'antd';
import {
    updateLock, getRoleAndMenu, saveRoleMenu, searchCustomer, getSettleDomain,
    saveMSetttleCustomerUser, customerForBusinessVo, userInfo
} from '@/services/admin';
import PageHeader from '@/components/PageHeader';
import Kvalue from "@/components/Kvalue";
import { history, connect } from 'umi';
import styles from './styles.less';
import classnames from 'classnames';
import moment from 'moment';

const { Option } = Select;

const EditUser = (props) => {

    // MOdels的命名空间唯一标识符
    const modelsSpaceName = 'accountModels/accountChangeToRefresh';

    const { location } = props;
    const [id, setId] = useState(null); // 当前用户id
    const [userName, setUserName] = useState(); // 用户名称
    const [userPhone, setUserPhone] = useState(); // 用户手机号
    const [switchLoading, setSwitchLoading] = useState(false); // 启用禁用动画
    const [switchChecked, setSwitchChecked] = useState(false);// 开关选中状态
    const [roleNameMap, setRoleNameMap] = useState(null); // 用户权限组数据
    const [roleMenuMap, setRoleMenuMap] = useState(null); // 用户权限
    const [selectRoleGroupMap] = useState({}); // 选中的用户权限组
    const [selectRoleMap, setSelectRoleMap] = useState(null); // 选中的用户权限
    const [saveRoleLoading, setSaveRoleLoading] = useState(false);

    const [searchCustomerLoading, setSearchCustomerLoading] = useState(false); // 搜索客户单位加载动画
    const [searchCustomerData, setSearchCustomerData] = useState([]); // 搜索客户单位数据
    const [searchCurrent, setSearchCurrent] = useState(1); // 搜索客户单位 分页1
    const [searchDataTotal, setSearchDataTotal] = useState(0); // 搜索结果总数
    const [searchValue, setSearchValue] = useState(); // 搜索词
    const [customerID, setCustomerID] = useState(); // 选中的客户单位id
    const [customerValue, setCustomerValue] = useState(); // 选中的客户单位名称

    const [settleLoading, setSettleLoading] = useState(false); // 结算主体加载动画
    const [settleData, setSettleData] = useState([]); // 结算主体数据
    const [settleID, setSettleID] = useState([]); // 选中的结算主体id
    const [settleValue, setSettleValue] = useState([]); // 选中的结算单数据
    const [saveSetttleCustomerLoading, setSaveSetttleCustomerLoading] = useState(false); // 保存结算单动画

    const [spinning0, setSpinning0] = useState(true); // 用户基础信息回显数据动画
    const [spinning1, setSpinning1] = useState(true); // 访问权限回显数据动画
    const [spinning2, setSpinning2] = useState(true); // 结算单信息回显数据动画

    useEffect(() => {
        const userId = location.query.id
        setId(userId)

        if (!userId) { // 没有id就回到用户列表页
            history.replace({ pathname: '/account', })
        }
        role(userId);
        getUserData(userId);
    }, [])

    // 获取已保存的用户配置
    const getUserData = _id => {
        // 用户结算单数据
        customerForBusinessVo(_id).then((res) => {
            if (res.code === 200) {
                // 客户单位数据
                if (res.data.customerInfoPage) {
                    const customer = res.data.customerInfoPage.records
                    if (customer) {

                        setCustomerID(customer[0].id);
                        setCustomerValue(customer[0].customerName);
                        setSettleData(res.data.settleDomainList || [])
                        // 选中的结算单数据

                        const hs = res.data.hadSettle;
                        const sdl = res.data.settleDomainList;
                        const names = [];
                        const datas = [];

                        for (let j = 0; j < sdl.length; j++) {
                            const item = sdl[j];
                            if (hs.indexOf(item.id) !== -1) {
                                // 数组中有这个值,取出来
                                names.push(item.departName);
                                item["key"] = item.id;
                                datas.push(item);
                            }
                        }

                        setSettleValue(names) // 选中的名称
                        setSettleID(datas) // 选中的数据，这里包含id
                    }
                }
            }

            setSpinning2(false);
        });

        // 用户信息
        userInfo(_id).then((res) => {
            if (res.code === 200) {
                // 禁用状态 1启用
                setSwitchChecked(Number(res.data.lockFlag) === 0);
                setUserName(res.data.nickname);
                setUserPhone(res.data.phone)
            }
            setSpinning0(false);
        });
    }

    // 改变用户启用禁用状态
    const switchClick = (checked) => {

        setSwitchLoading(true);
        setSwitchChecked(checked);
        updateLock({
            id: id,
            lockFlag: checked ? 0 : 1
        }).then((res) => {
            props.dispatch({ // 通知列表刷新
                type: modelsSpaceName,
                payload: { accountChanged: moment().format() }
            })

            setSwitchLoading(false);
            if (res.code !== 200) { // 数据回滚
                setSwitchChecked(!checked);
            }
        })
    }

    // 用户权限组控制数据
    const role = (_id) => {
        getRoleAndMenu({
            type: 0,
            userId: _id
        }).then(res => {
            if (res.code === 200) {

                // 用户选中的权限组数据
                const temp = {};
                res.data.havaRole.forEach((key) => {
                    selectRoleGroupMap[key] = key;
                    res.data.roleMenuMap[key].forEach((item) => {
                        temp[item.menuId] = item.name;
                    })
                })

                setSelectRoleMap(temp)
                setRoleNameMap(res.data.roleNameMap);
                setRoleMenuMap(res.data.roleMenuMap);
            }

            setSpinning1(false);
        })
    }

    // 选中的权限数据
    const roleOnClick = (e, key) => {

        if (e.target.checked) {
            selectRoleGroupMap[key] = key;
        } else {
            // 去掉之前添加的数据
            delete selectRoleGroupMap[key];
        }

        const temp = {};
        Object.keys(selectRoleGroupMap).forEach((indexKey) => {
            roleMenuMap[indexKey].forEach((item) => {
                temp[item.menuId] = item.name;
            })
        });
        setSelectRoleMap(temp);
    }

    // 判断用户权限组是否被选中
    const roleCheck = (key) => {
        if (selectRoleGroupMap) {
            return (selectRoleGroupMap[key]);
        }
        return false;
    }

    // 保存选中的用户权限
    const saveRole = () => {
        const params = []
        setSaveRoleLoading(true);
        Object.keys(selectRoleGroupMap).forEach((key) => {
            params.push(Number(key))
        })
        saveRoleMenu({ userId: id }, params)
            .then((res) => {
                if (res.code === 200) {
                    props.dispatch({ // 通知列表刷新
                        type: modelsSpaceName,
                        payload: { accountChanged: moment().format() }
                    })
                    message.success('保存成功')
                }
                setSaveRoleLoading(false);
            })
    }

    // 执行搜索输入框中的内容
    const searchText = (page, value) => {
        setSearchCustomerLoading(true);
        setSearchValue(value);
        searchCustomer({
            customerName: value,
            current: page,
            size: 10
        }).then((res) => {
            setSearchCustomerLoading(false)
            if (res.code === 200) {
                setSearchCurrent(res.data.current);
                setSearchDataTotal(res.data.total);
                setSearchCustomerData(res.data.records);
            }
        });
    }

    // 搜索结果选中回调
    const onCustomerSelect = (key, value) => {
        setSettleLoading(true);
        setCustomerID(key);
        setCustomerValue(value.children);

        uncheckAll(); // 重置选中状态

        getSettleDomain(key).then((res) => {
            setSettleLoading(false);
            if (res.code === 200) {
                setSettleData(res.data)

                // 默认全选
                checkAll(res.data);
            }
        });
    }

    // 结算主体选中回调
    const onSettleSelect = (key, value) => {
        setSettleValue(key); // 选中的名称
        setSettleID(value);
    }

    // 全选
    const checkAll = (arrayDatas) => {
        const names = [];
        const datas = [];

        arrayDatas.forEach((item) => {
            names.push(item.departName);
            item["key"] = item.id;
            datas.push(item);
        })
        setSettleValue(names) // 选中的名称
        setSettleID(datas) // 选中的数据，这里包含id
    }

    // 全不选
    const uncheckAll = () => {
        setSettleValue([]) // 选中的名称
        setSettleID([]) // 选中的数据，这里包含id
    }


    // 全选结算单监听
    const onCheckAllSettle = (e) => {
        if (e.target.checked) {
            checkAll(settleData); // 全选
        } else {
            uncheckAll();
        }
    }

    // 保存选中的结算主体
    const saveSetttleCustomer = () => {

        if (customerID && settleID && settleID.length > 0) {
            setSaveSetttleCustomerLoading(true)

            const mBody = [];

            settleID.forEach((item) => {
                mBody.push({
                    customerId: customerID,
                    settleId: item.key,
                    userId: id
                });
            })

            saveMSetttleCustomerUser({
                list: mBody
            }).then((res) => {
                setSaveSetttleCustomerLoading(false)
                if (res.code === 200) {
                    props.dispatch({ // 通知列表刷新
                        type: modelsSpaceName,
                        payload: { accountChanged: moment().format() }
                    })
                    message.success('保存成功')
                }
            })
        } else {
            message.warn('请选择结算主体')
        }
    }

    return (
        <div className={classnames(styles.editUser, 'accountContainer')}>
            <PageHeader
                spinning={spinning0}
                className={classnames(styles.pageHeader, styles.divider)}
                hideDivider
                title="账号设置">
                <Space direction="vertical" size={22} style={{ marginTop: '25px' }}>
                    <Kvalue titleStyle={{ width: '70px' }} title="客户单位">{customerValue || '-'}</Kvalue>
                    <Kvalue titleStyle={{ width: '70px' }} title="账号姓名">{userName || '-'}</Kvalue>
                    <Kvalue titleStyle={{ width: '70px' }} title="手机号">{userPhone || '-'}</Kvalue>
                    <Kvalue titleStyle={{ width: '70px' }} title="启用 / 禁用">
                        <Switch
                            checkedChildren="开启"
                            unCheckedChildren="关闭"
                            checked={switchChecked}
                            loading={switchLoading}
                            onClick={switchClick} />
                    </Kvalue>
                </Space>
            </PageHeader>

            <PageHeader
                spinning={spinning1}
                className={classnames(styles.pageHeader, styles.divider)}
                hideDivider
                style={{ marginTop: "14px" }}
                title="访问组权限">
                <div className={styles.role} style={{ marginTop: '25px' }}>
                    {
                        (roleNameMap) ?
                            Object.keys(roleNameMap).map((key) => {
                                return <Checkbox
                                    style={{ minWidth: "166px", margin: "8px 8px 0 0" }}
                                    checked={roleCheck(key)}
                                    onChange={(e) => {
                                        roleOnClick(e, key);
                                    }}
                                >
                                    {roleNameMap[key]}
                                </Checkbox>
                            }) : null
                    }
                </div>

                <div className={styles.role} style={{ marginTop: "17px" }}>
                    {
                        (selectRoleMap) ?
                            Object.keys(selectRoleMap).map((key) => {
                                return <Checkbox defaultChecked disabled style={{ minWidth: "166px", margin: "8px 8px 0 0" }}>{selectRoleMap[key]}</Checkbox>
                            }) : null
                    }
                </div>
                <Button type="primary" style={{ margin: "30px 0 10px", width: "100px" }} onClick={saveRole} loading={saveRoleLoading}>保存</Button>
            </PageHeader>

            <PageHeader
                spinning={spinning2}
                className={styles.pageHeader}
                hideDivider
                style={{ marginTop: "14px" }}
                title="数据权限">
                <Space direction="vertical" size={22} style={{ marginTop: '25px' }}>
                    <Kvalue title="客户单位" className={styles.select} titleClassName={styles.title}>
                        <Select
                            showSearch
                            value={customerValue}
                            onSearch={(text) => searchText(1, text)}
                            onSelect={onCustomerSelect}
                            loading={searchCustomerLoading}
                            placeholder='搜索客户单位'
                            style={{ width: 310 }}
                            defaultActiveFirstOption={false}
                            showArrow={false}
                            filterOption={false}
                            notFoundContent={null}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <div className={styles.pagination}>
                                        <Divider style={{ margin: '4px 0' }} />
                                        <Pagination
                                            hideOnSinglePage={true}
                                            onChange={(page) => {
                                                setSearchCurrent(page);
                                                searchText(page, searchValue)
                                            }}
                                            current={searchCurrent}
                                            pageSize={10}
                                            total={searchDataTotal}
                                            size="small"
                                            showSizeChanger={false} />
                                    </div>
                                </>
                            )}
                        >
                            {
                                searchCustomerData.map(item => {
                                    return <Option key={item.id}>{item.customerName}</Option>
                                })
                            }
                        </Select>
                    </Kvalue>

                    <Kvalue title="结算主体" className={styles.select} titleClassName={styles.title}>
                        <Select
                            value={settleValue}
                            mode="multiple"
                            loading={settleLoading}
                            placeholder='请选择结算主体'
                            showArrow={true}
                            onChange={onSettleSelect}
                            showSearch={false}
                            style={{ width: 310 }}
                        >
                            {settleData.map(item => {
                                return <Option key={item.id} value={item.departName}>
                                    {item.departName}
                                </Option>
                            }
                            )}
                        </Select>

                        <Checkbox
                            style={{ marginLeft: "10px" }}
                            checked={settleValue && settleValue.length > 0 && settleData && settleValue.length === settleData.length}
                            onChange={(e) => { onCheckAllSettle(e) }}
                        >
                            全选
                    </Checkbox>
                    </Kvalue>

                    <Button type="primary" style={{ margin: "8px 0 12px", width: "100px" }} onClick={saveSetttleCustomer} loading={saveSetttleCustomerLoading}>保存</Button>
                </Space>
            </PageHeader>

        </div >
    );
};

export default connect(() => {
    return ({})
})(EditUser);
