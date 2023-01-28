import React from 'react';
import Area from '@/components/Area';
import { Popover, Button } from 'antd';

const AreaList = props => {

    const { str, className } = props;
    const list = () => {
        return str ? str.split(',') : []
    }
    const text = (show) => {
        return list().map((id, index) => {

            if (!show && index > 4) {
                return null;
            }

            return <div key={id}># <Area>{id}</Area>&emsp;</div>
        })
    }
    return <div className={className}>{text(false)}
        {
            (list().length > 5) ?
                <Popover placement="bottom" title="区域" content={text(true)} trigger="click">
                    <Button type="text" size="small">更多</Button>
                </Popover>
                : null
        }
    </div>
}

export default AreaList;
