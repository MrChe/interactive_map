import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './Tooltip.scss';

const cx = classNames.bind(styles);

export default class Tooltip extends PureComponent {
  constructor() {
    super();
    this.state = {
      tipDataSt: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { tipDataSt } = this.state;
    const { tipData } = nextProps;

    if (Object.keys(tipData).length !== 0 && tipData !== tipDataSt) {
      this.setState({ tipDataSt: tipData });
    }
  }

 renderProviders = (tipProviders) => (
   <div className={styles.providers}>
     {tipProviders.map((prov) => (
       <div key={prov[prov.length - 1]} className={styles.singleProvider}>
         <span className={styles.provTitle}>{prov[0]}</span>
         <span className={styles.provData}>Total-qty: {prov[1]}</span>
         <span className={styles.provData}>Warnings-qty: {prov[2]}</span>
         <span className={styles.provData}>Warnings-ratio: {prov[3]}</span>
       </div>
     )
     )}
   </div>
 );

 render() {
   const { tipVis, mode } = this.props;
   const { tipDataSt } = this.state;

   const toolTip = cx('toolTipMain', {
     ttvis: tipVis,
     tthidden: !tipVis,
   });

   if (tipDataSt) {
     const { tipRatio, tipPos, tipTotalQty, tipWarnQty, tipWarnRatio, tipProviders } = tipDataSt;

     return (
       <div className={toolTip} style={{ top: tipPos[1], left: tipPos[0] }}>
         {mode === 'days' ? <span>Day-night-ratio: {tipRatio}</span> : ''}
         <span>Total-qty: {tipTotalQty}</span>
         <span>Warnings-qty: {tipWarnQty}</span>
         <span>Warnings-ratio: {tipWarnRatio}</span>
         {this.renderProviders(tipProviders)}
       </div>
     );
   }
   return false;
 }
}

Tooltip.propTypes = {
  mode: PropTypes.string.isRequired,
  tipData: PropTypes.object.isRequired,
  tipVis: PropTypes.bool.isRequired,
};
