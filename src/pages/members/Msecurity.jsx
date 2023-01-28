import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import ComContainer from '@/components/ComContainer';
import { DatePicker, Table } from 'antd';
import ProTable from '@ant-design/pro-table';
import { getPaymentByYearAndEmpId, getPaymentByMonthAndEmpId, getSocialAddOrReduceByEmpId, getFundAddOrReduceByEmpId } from '@/services/members';
import moment from 'moment';
import styles from './index.less';
import IconFont from "@/components/IconFont";
import Security from './components/Security';
import Area from '@/components/Area';
import Money2Dec from '@/components/Money2Dec';
import Time from '@/components/Time';
import { CaretDownOutlined } from '@ant-design/icons';
import { KeepAlive } from 'umi';

const columns = [
    {
        title: '缴费月份',
        dataIndex: 'month',
        render: text => <Time type="YYYY-MM">{text}</Time>
    },
    {
        title: '社保个人缴费',
        dataIndex: 'socialPersonalSum',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
    {
        title: '社保公司缴费',
        dataIndex: 'socialUnitSum',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
    {
        title: '公积金个人缴费',
        dataIndex: 'fundPersonalSum',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
    {
        title: '公积金公司缴费',
        dataIndex: 'fundUnitSum',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
    {
        title: '合计缴费',
        dataIndex: 'sum',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
];

const expandedColumns = [
    {
        title: '缴费科目',
        dataIndex: 'name',
        render: (text) => (text || text === 0) ? `${text}` : '-'
    },
    {
        title: '缴纳基数',
        dataIndex: 'basic',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
    {
        title: '个人比例',
        dataIndex: 'personalPropor',
        render: (text) => (text || text === 0) ? `${text}` : '-'
    },
    {
        title: '个人缴纳',
        dataIndex: 'personalPay',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
    {
        title: '公司比例',
        dataIndex: 'companyPropor',
        render: (text) => (text || text === 0) ? `${text}` : '-'
    },
    {
        title: '公司缴纳',
        dataIndex: 'companyPay',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
    {
        title: '合计缴纳',
        dataIndex: 'sumPay',
        render: (text) => <Money2Dec>{text}</Money2Dec>
    },
];

const expandedData = (data) => {
    const temp = [];

    temp.push({
        id: 0,
        name: '养老',
        basic: data.personalPensionSet,
        personalPropor: data.personalPensionPer,
        personalPay: data.personalPensionMoney,
        companyPropor: data.unitPensionPer,
        companyPay: data.unitPensionMoney,
        sumPay: data.personalPensionMoney + data.unitPensionMoney
    })

    temp.push({
        id: 1,
        name: '医疗',
        basic: data.personalMedicalSet,
        personalPropor: data.personalMedicalPer,
        personalPay: data.personalMedicalMoney,
        companyPropor: data.unitMedicalPer,
        companyPay: data.unitMedicalMoney,
        sumPay: data.personalMedicalMoney + data.unitMedicalMoney
    })

    temp.push({
        id: 2,
        name: '大病医疗保险',
        basic: '',
        personalPropor: data.personalBigailmentPer,
        personalPay: data.personalBigmailmentMoney,
        companyPropor: data.unitBigailmentPer,
        companyPay: data.unitBigmailmentMoney,
        sumPay: data.personalBigmailmentMoney + data.unitBigmailmentMoney
    })

    temp.push({
        id: 3,
        name: '失业',
        basic: data.personalUnemploymentSet,
        personalPropor: data.personalUnemploymentPer,
        personalPay: data.personalUnemploymentMoney,
        companyPropor: data.unitUnemploymentPer,
        companyPay: data.unitUnemploymentMoney,
        sumPay: data.personalUnemploymentMoney + data.unitUnemploymentMoney
    })

    temp.push({
        id: 4,
        name: '工伤',
        basic: data.injuryAloneSet,
        personalPropor: data.injuryAlonePer,
        personalPay: data.injuryAloneMoney,
        companyPropor: data.unitInjuryPer,
        companyPay: data.unitInjuryMoney,
        sumPay: data.injuryAloneMoney + data.unitInjuryMoney
    })

    temp.push({
        id: 5,
        name: '生育',
        basic: data.unitBirthSet,
        personalPropor: '-',
        personalPay: '-',
        companyPropor: data.unitBirthPer,
        companyPay: data.unitBirthMoney,
        sumPay: data.unitBirthMoney
    })

    temp.push({
        id: 6,
        name: '公积金',
        basic: data.personalProidentSet,
        personalPropor: data.providentPercent,
        personalPay: data.fundPersonalSum,
        companyPropor: data.providentPercent,
        companyPay: data.fundUnitSum,
        sumPay: data.fundPersonalSum + data.fundUnitSum
    })

    temp.push({
        id: 7,
        name: '退费',
        basic: ' ',
        personalPropor: ' ',
        personalPay: data.personalRefund,
        companyPropor: ' ',
        companyPay: data.unitRefund,
        sumPay: ' '
    })

    return temp;
}

const staticData = (data) => {
    return {
        0: { // 派增
            info: [
                {
                    title: "社保缴纳户",
                    value: (
                        <div className={styles.staticBox}>{data.socialHouse || '-'}</div>
                    ),
                    divider: true
                },
                {
                    title: "社保缴纳地",
                    value: (
                        <div className={styles.staticBox}>
                            <div className={styles.areaContainer}>
                                <Area>{data.socialProvince}</Area>
                                {data.socialCity && (<>&nbsp;<Area>{data.socialCity}</Area></>)}
                                {data.socialTown && (<>&nbsp;<Area>{data.socialTown}</Area></>)}
                            </div>
                        </div>
                    ),
                    divider: true
                },
                {
                    title: "社保起缴日期",
                    value: (
                        <div className={styles.staticBox}>{data.socialStartDate || '-'}</div>
                    )
                }
            ],
            status: Number(data.socialAddStatus || -1),
            time: data.socialAddDispatchDate,
        },
        1: { // 派减
            status: Number(data.socialReduceStatus || -1),
            time: data.socialReduceDispatchDate,
        }

    }
}

const fundData = data => {
    return {
        0: { // 派增
            info: [
                {
                    title: "公积金缴纳户",
                    value: (
                        <div className={styles.staticBox}>{data.fundHouse || '-'}</div>
                    ),
                    divider: true
                },
                {
                    title: "公积金缴纳地",
                    value: (
                        <div className={styles.staticBox}>
                            <div className={styles.areaContainer}>
                                <Area>{data.fundProvince}</Area>
                                {(data.fundCity) && <>&nbsp;<Area>{data.fundCity}</Area></>}
                                {(data.fundTown) && <>&nbsp;<Area>{data.fundTown}</Area></>}
                            </div>
                        </div>
                    ),
                    divider: true
                },
                {
                    title: "公积金起缴日期",
                    value: (
                        <div className={styles.staticBox}>{data.fundStartDate || '-'}</div>
                    ),
                }
            ],
            status: Number(data.fundAddStatus || -1),
            time: data.fundAddDispatchDate,
        },
        1: { // 派减
            status: Number(data.fundReduceStatus || -1),
            time: data.fundReduceDispatchDate,
        }
    }
}

const Msecurity = (props) => {
    const { location } = props;
    const actionRef = useRef();
    const [year, setYear] = useState(null);
    const [securityStatistics, setSecurityStatistics] = useState({ 0: { info: [] }, 1: { info: [] } }); // 社保派增派减信息
    const [fundStatistics, setFundStatistics] = useState({ 0: { info: [] }, 1: { info: [] } }); // 公积金派增派减信息
    const [spinningSocial, setSpinningSocial] = useState(true);
    const [spinningFund, setSpinningFund] = useState(true);

    // 日期选择回调
    const onYearChange = (_, dateString) => {

        setYear(dateString);

        if (actionRef.current) { // 刷新列表
            actionRef.current.reload();
        }
    };

    useEffect(() => {
        setYear(moment().format('YYYY'));
        // 社保派增派减数据
        getSocialAddOrReduceByEmpId({
            empId: location.query.empId
        }).then((res) => {

            setSpinningSocial(false);

            if (res.code === 200) {
                setSecurityStatistics(staticData(res.data));
            }
        })

        // 公积金派增派减数据
        getFundAddOrReduceByEmpId({
            empId: location.query.empId
        }).then((res) => {

            setSpinningFund(false);

            if (res.code === 200) {
                setFundStatistics(fundData(res.data));
            }
        })

    }, []);

    // 详情布局
    const expandedDetailRender = (record) => {
        return (
            <div className={styles.expendContainer}>
                <ProTable
                    columns={expandedColumns}
                    rowKey={Math.random()}
                    className="expendContainer"
                    options={false}
                    search={false}
                    pagination={false}
                    toolBarRender={false}
                    request={() => getPaymentByMonthAndEmpId({
                        month: record.month,
                        empId: location.query.empId
                    }).then((res) => {
                        return {
                            data: expandedData(res.data)
                        };
                    })}

                    summary={pageData => {
                        let totalPerSum = 0;
                        let totalUnitSum = 0;
                        pageData.forEach(({ personalPay, companyPay }) => {
                            const tempPer = (personalPay === null || personalPay === '-') ? 0 : parseFloat(personalPay);
                            const tempUnit = (companyPay === null || companyPay === '-') ? 0 : parseFloat(companyPay);
                            totalPerSum += tempPer;
                            totalUnitSum += tempUnit;
                        });

                        return (
                            <>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell colSpan={3}>合计缴费</Table.Summary.Cell>
                                    <Table.Summary.Cell colSpan={2}><Money2Dec>{totalPerSum.toFixed(2)}</Money2Dec></Table.Summary.Cell>
                                    <Table.Summary.Cell><Money2Dec>{totalUnitSum.toFixed(2)}</Money2Dec></Table.Summary.Cell>
                                    <Table.Summary.Cell><Money2Dec>{(totalPerSum + totalUnitSum).toFixed(2)}</Money2Dec></Table.Summary.Cell>
                                </Table.Summary.Row>
                            </>
                        )
                    }}
                />
            </div>
        )
    };

    return (
        <>
            <Security name="社保"
                spinning={spinningSocial}
                data={securityStatistics}
                title="社保详情"
                status="1"
                options={[
                    { label: '社保增员', value: '0' },
                    { label: '社保减员', value: '1' }
                ]} />

            <Security
                name="公积金"
                spinning={spinningFund}
                data={fundStatistics}
                title="公积金详情"
                status="2"
                options={[
                    { label: '公积金增员', value: '0' },
                    { label: '公积金减员', value: '1' }
                ]} />

            <ComContainer>
                <PageHeader
                    title="个人社保账单"
                    hideDivider={true}
                    rightRender={
                        <DatePicker
                            onChange={onYearChange}
                            inputReadOnly={true}
                            allowClear={false}
                            picker="year"
                            defaultValue={moment()}
                            suffixIcon={<CaretDownOutlined style={{ color: '#323232' }} />}
                        />}>

                    <ProTable
                        rowClassName='gesture'
                        key="month"
                        columns={columns}
                        rowKey="month"
                        options={false}
                        search={false}
                        actionRef={actionRef}
                        pagination={false}
                        request={() => getPaymentByYearAndEmpId({
                            year: year,
                            empId: location.query.empId
                        }).then((res) => {
                            return {
                                data: res.data
                            };
                        })}
                        toolBarRender={false}
                        expandable={{
                            expandRowByClick: true,
                            expandedRowRender: expandedDetailRender,
                            expandIcon: ({ expanded, onExpand, record }) =>
                                expanded ? (<IconFont type='iconzhankai_icon' onClick={e => onExpand(record, e)} />)
                                    : (<IconFont type='iconyoujiantou' onClick={e => onExpand(record, e)} />)
                        }}
                    />

                </PageHeader>
            </ComContainer>
        </>
    )
}

export default (props) => {
    return (
        <>
            {/* <KeepAlive> */}
                <Msecurity {...props} />
            {/* </KeepAlive> */}
        </>
    )
}
