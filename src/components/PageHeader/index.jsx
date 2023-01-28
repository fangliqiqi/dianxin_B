import React from 'react';
import classNames from 'classnames';
import styles from './index.less';
import { Spin } from 'antd';

// 含列表表头的组件
const PageHeader = props => {
    const {
        style,
        children,
        title,
        rightRender,
        className,
        hideDivider,
        spinning = false // 加载动画，默认不加载
    } = props;

    return (
        <div className={classNames(className, styles.pageContainer)} style={style}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>{title}</div>
                {rightRender}
            </div>
            <div className={classNames(styles.divider)} style={{
                display:hideDivider?'none':'block'
            }}></div>
            <Spin spinning={spinning}>
                {children}
            </Spin>
        </div>
    );
};
export default PageHeader;
