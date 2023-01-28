import React from 'react';
import classnames from 'classnames';
import styles from './styles.less';

const Kvalue = props => {

    const {
        title,
        children,
        style,
        className,
        titleStyle,
        titleClassName,
        direction, // k v 方向
        align // 对齐方式
    } = props

    return (
        (direction === 'vertical') ?
            < div className={
                classnames(
                    styles.kvContainer,
                    styles.vertical,
                    (align === 'center') && styles.center,
                    (align === 'right') && styles.right,
                    (align === 'left') && styles.left,
                    className)
            }
                style={style} >
                <div className={styles.children}>{children}</div>
                <div className={classnames(styles.title, titleClassName)} style={titleStyle}>{title}</div>
            </div >
            :
            < div className={
                classnames(
                    styles.kvContainer,
                    styles.horizontal,
                    styles.left,
                    className)
            }
                style={style} >
                <div className={classnames(styles.title, titleClassName)} style={titleStyle}>{title}</div>
                <div className={styles.children}>{children}</div>
            </div >
    );
}

export default Kvalue;
