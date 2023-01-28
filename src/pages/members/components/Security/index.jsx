import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import ComContainer from '@/components/ComContainer';
import Kvalue from '@/components/Kvalue';
import { Row, Col, Radio } from 'antd';
import styles from './index.less';
import classnames from 'classnames';
import ProcessItem from './ProcessItem';

const Security = props => {

    const {
        title,
        data,
        options,
        name,
        status,
        spinning
    } = props;

    const [type, setType] = useState(0)

    const optionsChange = e => {
        setType(Number(e.target.value))
    };

    return (
        <>
            <ComContainer>
                <PageHeader title={title} spinning={spinning}>
                    <Row className={styles.tableRow}>
                        {
                            data[0].info.map((item, index) => {
                                return <Col span={8} key={index} className={classnames(styles.tables, item.divider ? styles.tablesDirver : null)}>
                                    <Kvalue
                                        title={item.title}
                                        direction="vertical"
                                        align="center"
                                        titleStyle={{ marginTop: "14px" }}
                                    >
                                        {item.value || '-'}
                                    </Kvalue>
                                </Col>
                            })
                        }
                    </Row>

                    <div className={classnames(styles.propressContainer, 'processWrap')}>

                        <Radio.Group
                            defaultValue={'0'}
                            options={options}
                            onChange={optionsChange}
                            optionType="button"
                            buttonStyle="solid"
                        />

                        <div className={styles.processLayout}>

                            {/* 社保 0 派单开始  1 办理中 2 办理成功 3 办理失败 4 部分办理成功 */}
                            {/* 公积金 0 派单开始  1 办理成功 2 办理失败 */}
                            
                            { status === '1' ? (
                                <>
                                <div className={styles.divider}>
                                    <div className={classnames(styles.divider1, (data[type].status >= 0) ? styles.select : null)} />
                                    <div className={classnames(styles.divider2, (data[type].status >= 2) ? styles.select : null)} />
                                </div>
                                <div className={styles.processItemBox}>
                                    <ProcessItem title={`${name}派单`} time={data[type].time} select={(data[type].status >= 0)} />
                                    <ProcessItem title="办理中" select={(data[type].status > 0)} />
                                    <ProcessItem title={`${type === 0 ? "增员" : "减员"}${data[type].status === 3 ? "办理失败" : (data[type].status === 4 ? '部分办理成功' : (data[type].status === 2 ? '办理成功' : ''))}`} select={(data[type].status > 1)} />
                                </div>
                                </>
                            ) : (
                                <>
                                <div className={styles.divider}>
                                    <div className={classnames(styles.divider1, (data[type].status >= 0) ? styles.select : null)} />
                                    <div className={classnames(styles.divider2, (data[type].status >= 1) ? styles.select : null)} />
                                </div>
                                <div className={styles.processItemBox}>
                                    <ProcessItem title={`${name}派单`} time={data[type].time} select={(data[type].status >= 0)} />
                                    <ProcessItem title="办理中" select={(data[type].status > 0)} />
                                    <ProcessItem title={`${type === 0 ? "增员" : "减员"}${data[type].status === 1 ? "办理成功" : (data[type].status === 2 ? '办理失败' : '') }`} select={data[type].status > 0} />
                                </div>
                                </>
                            ) }
                            

                            
                        </div>
                    </div>

                </PageHeader>
            </ComContainer>

        </>
    )
}

export default Security;
