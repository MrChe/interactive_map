import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from './FiltersBar.scss';

export default class FiltersBar extends PureComponent {
  constructor() {
    super();
    this.state = {
      day_night_ratio: 0,
      mode: 'days',
    };
  }

 setMode = (e) => {
   const { handleMode } = this.props;

   this.setState({ mode: e.target.value });
   handleMode(e.target.value);
 };

 validateForNumbers = (event) => {
   if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 9 || event.keyCode === 27 ||
   (event.keyCode === 65 && event.ctrlKey === true) ||
   (event.keyCode >= 35 && event.keyCode <= 39)) {
     /* empty */
   } else if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
     event.preventDefault();
   }
 };

 handleRatioChange = (e) => {
   const { dnFilterHandler } = this.props;

   if (e.target.value !== '') {
     dnFilterHandler(parseInt(e.target.value, 10));
   } else {
     dnFilterHandler(0);
   }
 };

 render() {
   const { mode } = this.state;
   return (
     <div>
       <h2 className={styles.title}>Filters:</h2>
       <div className={styles.line}>
         <span className={styles.lineText}>day-night-ratio &gt;=</span>
         <input className={styles.ratioInput} type="text" onKeyDown={this.validateForNumbers} onBlur={this.handleRatioChange} />
         <span className={styles.lineText}>%</span>
       </div>
       <h2 className={styles.title}>Change mode:</h2>
       <div className={styles.modeLine}>
         <input type="radio" onChange={this.setMode} name="type" checked={mode === 'days'} value="days" />
         <span>By days</span>
       </div>
       <div className={styles.modeLine}>
         <input type="radio" onChange={this.setMode} name="type" checked={mode === 'hours'} value="hours" />
         <span>By hours</span>
       </div>
     </div>
   );
 }
}

FiltersBar.propTypes = {
  handleMode: PropTypes.func.isRequired,
  dnFilterHandler: PropTypes.func.isRequired,
};
