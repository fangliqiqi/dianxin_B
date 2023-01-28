import React from 'react';
import styles from './index.less';
import classnames from 'classnames';
import IconFont from "@/components/IconFont";

const ProcessItem = props => {

    const {
        title,
        time,
        select
    } = props;

    return (<div className={styles.processItem}>
        <IconFont type={(select) ? 'iconyiwanchengbeifen' : 'iconweiwancheng'} className={classnames(styles.icon, (select) ? styles.select : null)} />
        <div className={classnames(styles.title, (select) ? styles.select : null)}>{title}</div>
        <div className={styles.time}>{time}</div>
    </div>)
}

export default ProcessItem;
