import React from 'react';
import PageHeader from '@/components/PageHeader';
import styles from './index.less';
import classnames from 'classnames';
import CloumnOrder from '@/components/CloumnOrder';

const CardDetail = props => {
  const {
    title, titleRightRender, titleAlignRight,
    isCenter, data, cloumns,
    style, className, children,
    rowGutter, colSpan, status, statusColor,
    spinning = false // 加载动画，默认不加载
  } = props;

  return (
    <div className={classnames(styles.cardContainer, className)} style={style}>
      <PageHeader
        spinning={spinning}
        title={title}
        rightRender={titleRightRender}>
        <div className={styles.wrap}>
          <CloumnOrder
            data={data}
            titleAlignRight={titleAlignRight}
            isCenter={isCenter}
            cloumns={cloumns}
            rowGutter={rowGutter}
            colSpan={colSpan}
            status={status}
            statusColor={statusColor} />

        </div>
        {children}
      </PageHeader>
    </div>
  )
}

export default CardDetail;
