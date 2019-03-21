import React, { PureComponent } from 'react';
import Map from 'components/Map';
import SliderComp from 'components/Slider';
import FiltersBar from 'components/FiltersBar';
import Tooltip from 'components/Tooltip';
import styles from './App.scss';

export default class App extends PureComponent {
  constructor() {
    super();
    this.state = {
      value: 0,
      dateValue: 0,
      hourValue: 0,
      date: [0, 0],
      constDate: [0, 0],
      dnFilter: 0,
      tipVis: false,
      tipData: {},
      mode: 'days',
    };
  }

  componentDidUpdate() {
    const { value, mode } = this.state;

    this.setDayHour(value, mode);
  }

  setDayHour = (value, mode) => {
    if (mode === 'days') {
      this.setState({ dateValue: value });
    } else {
      this.setState({ hourValue: value });
    }
  };

 handleSlider = (event, value) => {
   this.setState({ value });
 };

 handleDate = (date, constDate) => {
   this.setState({ date });
   if (constDate) {
     this.setState({ constDate });
   }
 };

 handleMode = (mode) => {
   const { dateValue } = this.state;

   this.setState({ mode });

   if (mode === 'days') {
     this.setState({ value: dateValue });
   } else {
     this.setState({ value: 0 });
   }
 };

 dnFilterHandler = (ratio) => {
   this.setState({ dnFilter: ratio });
 };

 handleTip = (vis, params) => {
   this.setState({ tipVis: vis });
   if (params) this.setState({ tipData: params });
 };


 render() {
   const { dnFilter, value, mode, constDate, date, tipVis, tipData, dateValue, hourValue } = this.state;
   return (
     <div className={styles.mainWrap}>
       <div className={styles.mapCover}>
         <Map dnFilter={dnFilter} mode={mode} dateFilter={dateValue} hourFilter={hourValue} getDate={this.handleDate} getToolTip={this.handleTip} />
         <FiltersBar handleMode={this.handleMode} dnFilterHandler={this.dnFilterHandler} />
       </div>
       <Tooltip
         mode={mode}
         tipVis={tipVis}
         tipData={tipData}
       />
       <SliderComp
         mode={mode}
         date={date}
         constDate={constDate}
         value={value}
         handleSlider={this.handleSlider}

       />
     </div>
   );
 }
}
