import React from 'react';
import IconFont from '@/components/IconFont';
import styles from './index.less';
import classnames from 'classnames';

const MenuItem = props => {

    const { icon, children, onClick } = props;

    return (<div className={classnames(styles.menuitem, (onClick) ? styles.onClick : null)} onClick={onClick}>
        <IconFont type={icon || 'iconwarning'} style={{ marginRight: "8px", fontSize: "14px", color: "#969696" }} />
        {children}
    </div>)
}

export default MenuItem;
