import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import ComContainer from '@/components/ComContainer';
import { DatePicker } from 'antd';
import ProTable from '@ant-design/pro-table';
import { getAccountByIdCardPage } from '@/services/members';
import moment from 'moment';
import CloumnOrder from '@/components/CloumnOrder';
import styles from './index.less';
import IconFont from "@/components/IconFont";
import Pagination from '@/components/PaginationB';
import Money2Dec from '@/components/Money2Dec';
import Time from '@/components/Time';
import { CaretDownOutlined } from '@ant-design/icons';
import { KeepAlive } from 'umi';

moment.updateLocale('zh-CN', {
    months: [
        "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
    ]
});

const columns = [
    {
        title: '工资月份',
        dataIndex: 'salaryDate',
        render: (text) => {
            // 默认的语言环境为英语。
            const localLocale = moment().local('zh-CN');
            return localLocale.localeData().months(moment(text, 'YYYYMM'));
        }
    },
    {
        title: '应发工资',
        dataIndex: 'relaySalary',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '实发工资',
        dataIndex: 'actualSalarySum',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '社保企业',
        dataIndex: 'unitSocial',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '公积金企业',
        dataIndex: 'unitFund',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '社保个人',
        dataIndex: 'personalSocial',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '公积金个人',
        dataIndex: 'personalFund',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '个税',
        dataIndex: 'salaryTax',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
];

// 表格展开数据
const expandColumns = [
    {
        title: '社保扣缴月份',
        dataIndex: 'deduSocialMonth',
    },
    {
        title: '单位社保',
        dataIndex: 'unitSocial',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '个人社保',
        dataIndex: 'personalSocial',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '公积金扣缴月份',
        dataIndex: 'deduProvidentMonth',
    },
    {
        title: '单位公积金',
        dataIndex: 'unitFund',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
    {
        title: '个人公积金',
        dataIndex: 'personalFund',
        render: (text) => {
            return <Money2Dec>{text}</Money2Dec>
        }
    },
];

const Mpay = (props) => {
    const { location } = props;
    const actionRef = useRef();
    const [year, setYear] = useState(null);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    // 日期选择回调
    const onYearChange = (_, dateString) => {

        setCurrent(1);
        setYear(dateString);

        if (actionRef.current) { // 刷新列表
            actionRef.current.reload();
        }
    };

    useEffect(() => {
        setYear(moment().format('YYYY'));
    }, []);

    // 处理详情的非固定项目的排版
    const handleList = (list) => {
        if (list && Array.isArray(list)) {
            var resultColumns = [];
            list.forEach((record) => {
                const obj = {
                    title: record.cnName,
                    dataIndex: 'salaryMoney',
                    render: () => {
                        return <Money2Dec>{record.salaryMoney}</Money2Dec>
                    }
                };
                resultColumns.push(obj);
            })

            return (
                <CloumnOrder
                    data={{}}
                    isCenter={true}
                    titleAlignRight={true}
                    cloumns={resultColumns}
                    rowGutter={30}
                    colSpan={8} />
            )
        }

        return null;
    };

    // 详情布局
    const expandedDetailRender = (record) => {
        return (
            <div style={{
                textAlign: 'center'
            }}>

                <CloumnOrder
                    data={record}
                    isCenter={true}
                    titleAlignRight={true}
                    cloumns={expandColumns}
                    rowGutter={30}
                    colSpan={8} />
                {
                    handleList(record.saiList)
                }
                {
                    (record.revenueTime) ?
                        <div className={styles.mpayRevenueTime}>
                            <div className={styles.text}>已于&nbsp;<Time className={styles.time} type="YYYY-MM-DD HH:mm">{record.revenueTime}</Time>&nbsp;向员工发放了工资 </div>
                        </div> : null
                }
            </div>
        )
    };


    return (
        <ComContainer className={styles.mPayContainer}>
            <PageHeader
                title="个人薪酬"
                hideDivider={true}
                rightRender={
                    <DatePicker
                        onChange={onYearChange}
                        inputReadOnly={true}
                        allowClear={false}
                        picker="year"
                        defaultValue={moment()}
                        suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
                    />}
            >

                <ProTable
                    rowClassName='gesture'
                    columns={columns}
                    rowKey="id"
                    options={false}
                    search={false}
                    actionRef={actionRef}
                    // pagination={false}
                    request={() => getAccountByIdCardPage({
                        current: current,
                        size: pageSize,
                        years: year,
                        empIdcard: location.query.empIdcard
                    }).then((res) => {
                        let records = [];
                        if (res.code === 200) {
                            const data = res.data;
                            if (data) {
                                records = data.records;
                                setTotal(data.total);
                                setCurrent(data.current);
                                setPageSize(data.size);
                            }
                        }
                        return {
                            data: records,
                        };
                    })}
                    toolBarRender={false}
                    expandable={{
                        expandRowByClick: true,
                        expandedRowRender: expandedDetailRender,
                        expandIcon: ({ expanded, onExpand, record }) =>
                            expanded ? (
                                <IconFont type='iconzhankai_icon' onClick={e => onExpand(record, e)} />
                            ) : (
                                    <IconFont type='iconyoujiantou' onClick={e => onExpand(record, e)} />
                                )
                    }}
                />
                {/* <Pagination
                    title="工资"
                    current={current}
                    pageSize={pageSize}
                    total={total}
                    actionRef={actionRef}
                    onChange={(page, pagesize) => {
                        setCurrent(page)
                        setPageSize(pagesize)
                    }}
                /> */}
            </PageHeader>
        </ComContainer>
    )
}

export default (props) => {
    return (
        <>
            <KeepAlive>
                <Mpay {...props} />
            </KeepAlive>
        </>
    )
}
