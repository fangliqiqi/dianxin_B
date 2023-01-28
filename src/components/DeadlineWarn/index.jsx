import React from 'react';
import { WarningFilled } from '@ant-design/icons';
import styles from './index.less';
import { Tooltip } from 'antd';

const DeadlineWarn = props => {

    const { children, title, style } = props;

    return <div className={styles.warn} style={style}>

        <Tooltip title={title}>
            <WarningFilled style={{ color: "#FF6E4C" }} />
        </Tooltip>

        <div style={{ marginLeft: "8px" }}>{children}</div>
    </div>
}

export default DeadlineWarn;
