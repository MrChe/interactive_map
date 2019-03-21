import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { geoConicEqualArea, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import styles from './Map.scss';


const width = 850;
const height = 600;
const geometryCenter = { latitude: 48.360833, longitude: 31.1809725 };
const projection = geoConicEqualArea()
  .center([0, geometryCenter.latitude])
  .rotate([-geometryCenter.longitude, 0])
  .parallels([46, 52])
  .scale(4000)
  .translate([width / 2, height / 2]);

export default class Map extends PureComponent {
  constructor() {
    super();
    this.state = {
      ukraineDataCt: [],
      ukraineDataRv: [],
      ukraineDataLk: [],
      ukraineDataRg: [],
      statData: [],
      hourStatData: [],
      weekStart: null,
      minMaxWarn: [1, 1],
      minDate: null,
      constMin: null,
      filter: 0,
    };
  }

  componentDidMount() {
    const { getDate } = this.props;

    fetch('assets/json/ukraine.json')
      .then((response) => {
        if (response.status !== 200) {
          return;
        }
        response.json().then((ukraineData) => {
          this.setState({
            ukraineDataCt: this.addIndex(feature(ukraineData, ukraineData.objects.countries).features),
            ukraineDataRv: this.addIndex(feature(ukraineData, ukraineData.objects.rivers).features),
            ukraineDataRg: this.addIndex(feature(ukraineData, ukraineData.objects.regions).features),
            ukraineDataLk: this.addIndex(feature(ukraineData, ukraineData.objects.lakes).features),
          });
        });
      });
    fetch('assets/json/st-by-day.json')
      .then((response) => {
        if (response.status !== 200) {
          return;
        }
        response.json().then((statData) => {
          this.setState({
            minDate: this.getMinDate(statData),
          });
          getDate(this.getMinDate(statData), this.getMinDate(statData));

          const tempData = statData;

          tempData.map((data, i) => {
            tempData[i].id = i;

            return true;
          });

          this.setState({
            statData: tempData,
            minMaxWarn: this.getMinMaxWarn(tempData),
          });
        });
      });

    fetch('assets/json/st-by-hour.json')
      .then((response) => {
        if (response.status !== 200) {
          return;
        }
        response.json().then((statData) => {
          const tempData = statData;

          tempData.map((data, i) => {
            tempData[i].id = i;

            return true;
          });

          this.setState({
            hourStatData: tempData,
            minMaxWarn: this.getMinMaxWarn(tempData),
          });
        });
      });
  }

  componentWillReceiveProps(nextProps) {
    const { filter, minDate } = this.state;
    const { getDate, dateFilter } = nextProps;

    if (dateFilter !== filter) {
      getDate(this.mapFilter(dateFilter, minDate));
      this.setState({ filter: dateFilter });
    }
  }

 getMinMaxWarn = (arr) => {
   let lowest = 1000000;
   let highest = 0;
   let tmp;

   arr.map((data) => {
     tmp = data.total_qty;
     if (tmp < lowest) lowest = tmp;
     if (tmp > highest) highest = tmp;

     return true;
   });

   return [lowest, highest];
 };

 getMinDate = (arr) => {
   let lowestDay = 32;
   let lowestMonth = 13;
   let tmp;
   const tmp2 = arr[0].month;

   arr.map((data) => {
     tmp = data.month;
     if (tmp < tmp2) { lowestMonth = tmp; }
     if (tmp > tmp2) { lowestMonth = tmp2; }
     if (tmp === tmp2) { lowestMonth = tmp; }

     return true;
   });

   arr.map((data) => {
     if (data.month === lowestMonth) {
       tmp = data.day;
       if (tmp < lowestDay) lowestDay = tmp;
     }

     return true;
   });

   return [lowestDay, lowestMonth];
 };

 getColor = (value) => {
   const coef = ((1 - (value * 3.5)) * 80) < 0 ? 0 : ((1 - (value * 3.5)) * 80);
   const hue = (coef).toString(10);
   return ['hsl(', hue, ',100%,50%)'].join('');
 };

 getDotsSize = (value) => {
   const { minMaxWarn } = this.state;

   const power = 9;
   const size = Math.round(((((((Math.exp((power * value) / minMaxWarn[1])) - 1) / (Math.exp(power) - 1)) * minMaxWarn[1])) * 100) + 4);
   if (size < 5) {
     return 5;
   }
   if (size > 35) {
     return 35;
   }
   return size;
 };

 getProviders = (list) => {
   const ispList = [];

   list.map((data, key) => {
     if (key < 3) ispList[key] = data.join('`');

     return true;
   });

   return ispList.join(';');
 };

 addIndex = (arr) => {
   arr.map((data, i) => {
     arr[i].index = i;
     return true;
   });

   return arr;
 };

 addIndexArray = (arr) => {
   const arrTemp = [];

   arr.map((data, i) => {
     arrTemp[i] = Object.create({ name: data, index: i });
     return true;
   });

   return arrTemp;
 };

 daysInMonth = (month, year) => new Date(year, month, 0).getDate();

 mapFilter = (filter, date) => {
   const filterData = Number(filter);
   const day = date[0];
   const month = date[1];
   const days = this.daysInMonth(month, 2017);

   if (day + filterData <= days) {
     return [filterData + day, month];
   }
   return [days - filterData - day, month + 1];
 };

 toolTipShow = (e) => {
   const { getToolTip } = this.props;

   const obj = e.target;
   const isp = obj.getAttribute('data-providers').split(';');

   isp.map((data, key) => {
     isp[key] = data.split('`');
     isp[key].push(key);
     return true;
   });

   getToolTip(true,
     { tipRatio: obj.getAttribute('data-ratio'),
       tipTotalQty: obj.getAttribute('data-total'),
       tipWarnQty: obj.getAttribute('data-warn-qty'),
       tipWarnRatio: obj.getAttribute('data-warn-ratio'),
       tipIsp: isp,
       tipProviders: isp,
       tipPos: [e.clientX, e.clientY] });
 };

 toolTipHide = () => {
   const { getToolTip } = this.props;

   getToolTip(false);
 };

 renderPaths = (data, style, fill) => (
   <g>
     {
       data.map((d) => (
         <path
           key={`path-${d.index}`}
           d={geoPath().projection(projection)(d)}
           className={style}
           fill={fill ? `rgba(43, 61, 84,${(1 / data.length) * 2 * d.index})` : ''}
         />
       )
       )
     }
   </g>
 );

 renderLabels = (ukraineDataRg) => (
   <g>
     {
       ukraineDataRg.map((d) => (
         <text
           key={`text-${d.index}`}
           transform={`translate(${projection(d.properties.label_point)})`}
           className={styles.regionLabel}
         >
           {this.addIndexArray(d.properties.localized_name.ua.split(' ')).map((data) => (
             <tspan
               key={`tspan-${data.index}`}
               x={0}
               dy={data.index > 0 ? '1.1em' : '0'}
             >
               {data.name}
             </tspan>
           ))
           }
         </text>
       )
       )
     }
   </g>
 );

 renderDots = (statData, filter, dnFilter, minDate, mode) => (
   <g>
     {statData.map((d) => {
       let filtering = '';
       let coefFilter = '';

       if (mode === 'days') {
         filtering = d.day === this.mapFilter(filter, minDate)[0] && Math.round(d.day_night_ratio) >= dnFilter;
         coefFilter = d.day_night_ratio;
       } else {
         filtering = d.hour === filter;
         coefFilter = d.warnings_ratio * 100;
       }
       return (
         (filtering) ?
           <circle
             onMouseEnter={this.toolTipShow}
             onMouseLeave={this.toolTipHide}
             data-ratio={d.day_night_ratio}
             data-total={d.total_qty}
             data-warn-qty={d.warnings_qty}
             data-warn-ratio={d.warnings_ratio}
             data-providers={(d.isp_list) ? this.getProviders(d.isp_list) : ''}
             cx="0"
             cy="0"
             r={Math.round(this.getDotsSize(d.warnings_ratio * 1000))}
             fill={this.getColor(Math.round(coefFilter) / 100)}
             stroke="rgba(33,33,33,0.5)"
             key={`marker-${d.id}`}
             transform={`translate(${projection([d.location_lon, d.location_lat])})`}
           /> : ''
       );
     })
     }
     {statData.map((d) => {
       let filtering = '';
       let text = '';

       if (mode === 'days') {
         filtering = d.day === this.mapFilter(filter, minDate)[0] && Math.round(d.day_night_ratio) >= dnFilter;
         text = `${Math.round(d.day_night_ratio)}%`;
       } else {
         filtering = d.hour === filter;
         text = '';
         /* `${Math.round(d.warnings_ratio * 100)}%` */
       }
       return (
         (filtering && Math.round(this.getDotsSize(d.warnings_ratio * 1000))) > 8 ?
           <text
             className={styles.percent}
             key={`marker-txt-${d.id}`}
             transform={`translate(${projection([d.location_lon, d.location_lat])})`}
           >
             <tspan
               x={0}
               dy={4}
             >
               {text}
             </tspan>
           </text> : ''
       );
     })
     }
   </g>
 );

 render() {
   const { ukraineDataCt, ukraineDataRg, ukraineDataRv, ukraineDataLk, statData, hourStatData, minDate } = this.state;
   const { dateFilter, dnFilter, mode, hourFilter } = this.props;

   return (
     <svg className={styles.svgWrap} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
       {this.renderPaths(ukraineDataCt, '', true)}
       {this.renderPaths(ukraineDataRg, styles.regionBoundary)}
       {this.renderPaths(ukraineDataRv, styles.river)}
       {this.renderPaths(ukraineDataLk, styles.lake)}
       {this.renderLabels(ukraineDataRg)}
       {this.renderDots(mode === 'days' ? statData : hourStatData, mode === 'days' ? dateFilter : hourFilter, dnFilter, minDate, mode)}
     </svg>
   );
 }
}

Map.propTypes = {
  mode: PropTypes.string.isRequired,
  getDate: PropTypes.func.isRequired,
  dnFilter: PropTypes.number.isRequired,
  hourFilter: PropTypes.number.isRequired,
  getToolTip: PropTypes.func.isRequired,
  dateFilter: PropTypes.number.isRequired,
};
