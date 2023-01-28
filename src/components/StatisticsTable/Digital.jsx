import React from 'react';
import styles from './style.less';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import classnames from 'classnames';

const Digital = (props) => {
    const {
        title,
        value,
        tip,
        icon,
        onClick,
        select,
        divider
    } = props;

    function iconView() {

        let iconView = null;

        if (tip) {
            iconView = (<Tooltip title={tip}>
                { icon || <QuestionCircleOutlined style={{ color: "#969696" }} />}
            </Tooltip>);
        } else {
            iconView = icon || null
        }

        return (iconView) && <div className={styles.icon}>{iconView}</div>;
    }

    return (
        <div className={classnames(styles.digitalContainer, (divider) && styles.divider)}>
            <div className={classnames(styles.content, (onClick) && styles.click)} onClick={onClick}>
                <div className={classnames(styles.titleContainer)}>
                    <div className={classnames(styles.title, (select) && styles.select)}>{title}</div>
                    {iconView()}
                </div>
                <div className={classnames(styles.value, (select) && styles.select)}>{value || '0'}</div>
            </div>
        </div>
    );
}

export default Digital;
