import React from 'react';
import classnames from 'classnames';
import styles from './index.less';

const ComContainer = (props) => {

    const {
        children,
        className,
        style
    } = props;

    return (
        <div className={classnames(styles.comContainer, className)} style={style}>
            {children}
        </div>
    )
}

export default ComContainer;
