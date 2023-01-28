import React,{ useEffect, useState } from 'react';
import ComContainer from '@/components/ComContainer';
import PageHeader from '@/components/PageHeader';
import { loadPolicyDetailData } from '@/services/policy';
import AreaList from './components/AreaList';
import style from './index.less';
import Time from '@/components/Time';
import { Empty } from 'antd';

const Detail = props => {

    const { location } = props;
    const [detailData, setDetailData] = useState({}); // 政策详情数据
    const [spinning, setSpinning] = useState(true);

    useEffect(() => {
        // 获取政策详情数据
        loadPolicyDetailData(location.query.policyID).then(res => {
            setSpinning(false);
            if (Number(res.code) === 200) {
                setDetailData(res.data ? res.data : {})
            }
        })
    }, []);

    return <ComContainer>
        <PageHeader
            spinning={spinning}
            title={<AreaList str={detailData.city} className={style.detailHeader} />}
            rightRender={<Time type="YYYY-MM-DD" className={style.detailHeader}>{detailData.createTime}</Time>} >

            <div style={{ marginTop: "15px" }} dangerouslySetInnerHTML={{ __html: detailData.content }} />
        </PageHeader>

        {
            (Object.keys(detailData).length === 0)? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='该政策信息已不存在或加载有误' />:''
        }
    </ComContainer>
}

export default Detail;
