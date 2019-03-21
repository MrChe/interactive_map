import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Slider from 'material-ui/Slider';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import styles from './Slider.scss';

export default class SliderComp extends PureComponent {
  constructor() {
    super();
    this.state = {
    };
  }

 getMax = (date) => {
   const day = date[0];
   const month = date[1];
   const year = 2017;
   const days = new Date(year, month, 0).getDate();

   if (day + 6 <= days) {
     return [6 + day, month];
   }
   return [days - 6 - day, month + 1];
 };

 getMaxDayHour = (mode) => {
   let maxValue = 0;

   if (mode === 'days') {
     maxValue = 6;
   } else {
     maxValue = 23;
   }

   return maxValue;
 };

 getCurrentValue = (mode, value, date) => {
   let curValue = 0;

   if (mode === 'days') {
     curValue = date ? `${date[0]}.${(date[1] < 10) ? `0${date[1]}` : date[1]}` : '';
   } else {
     curValue = String(value);
     if (curValue.length < 2) {
       curValue = `0${curValue}:00`;
     } else {
       curValue = `${curValue}:00`;
     }
   }

   return curValue;
 };

 dayHourMax = (mode, date) => {
   let maxValue = 0;

   if (mode === 'days') {
     maxValue = date ? `${this.getMax(date)[0]}.${(this.getMax(date)[1] < 10) ? `0${this.getMax(date)[1]}` : this.getMax(date)[1]}` : '';
   } else {
     maxValue = '23:00';
   }

   return maxValue;
 };

 dayHourMin = (mode, date) => {
   let minValue = 0;

   if (mode === 'days') {
     minValue = date ? `${date[0]}.${(date[1] < 10) ? `0${date[1]}` : date[1]}` : '';
   } else {
     minValue = '00:00';
   }

   return minValue;
 };

 render() {
   const { constDate, date, value, handleSlider, mode } = this.props;
   return (
     <div className={styles.slideSection}>
       <span className={styles.currDate}>
         {this.getCurrentValue(mode, value, date)}
       </span>
       <div className={styles.slideCover}>
         <span className={styles.minmaxdate}>
           {this.dayHourMin(mode, constDate)}
         </span>
         <MuiThemeProvider>
           <Slider
             className={styles.slideWrap}
             min={0}
             max={this.getMaxDayHour(mode)}
             step={1}
             value={value}
             onChange={handleSlider}
           />
         </MuiThemeProvider>
         <span className={styles.minmaxdate}>
           {this.dayHourMax(mode, constDate)}
         </span>
       </div>
     </div>
   );
 }
}

SliderComp.propTypes = {
  mode: PropTypes.string.isRequired,
  constDate: PropTypes.array.isRequired,
  date: PropTypes.array.isRequired,
  value: PropTypes.number.isRequired,
  handleSlider: PropTypes.func.isRequired,
};
