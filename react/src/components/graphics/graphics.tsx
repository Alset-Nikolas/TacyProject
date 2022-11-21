import { useEffect, useState } from "react";
import { GanttD3 } from "../../d3/GanttD3/GanttD3";
import { getGraphicsThunk } from "../../redux/graphics-slice";
import { ganttDataCreator } from "../../utils/ganttData";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomBarChart from "../custom-bar-chart/custom-bar-chart";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './graphics.module.scss';

const data = [];
// {
//   value1: [
//     {
//       name: 'metric1',
//       value: 0.0,
//     },
//     {
//       name: 'metric2',
//       value: 0.0,
//     },
//   ],
//   value2: [
//     {
//       name: 'metric1',
//       value: 0.0,
//     },
//     {
//       name: 'metric2',
//       value: 0.0,
//     },
//   ],

// }
//   {
//     "name": "A",
//     "uv": 4000,
//   },
//   {
//     "name": "B",
//     "uv": 3000,
//   },
//   {
//     "name": "C",
//     "uv": 2000,
//   },
//   {
//     "name": "D",
//     "uv": 2780,
//   },
//   {
//     "name": "E",
//     "uv": 1890,
//   },
//   {
//     "name": "F",
//     "uv": 2390,
//   },
//   {
//     "name": "G",
//     "uv": 3490,
//   }
// ]

export default function Graphics() {
  const dispatch = useAppDispatch();
  const { graphics } = useAppSelector((store) => store.graphics);
  const project = useAppSelector((store) => store.state.project.value);
  const chartsProperties = graphics.map((el) => el.propertieName);
  const [ currentPropertieIndex, setCurrentPropertieIndex ] = useState<number>(0);

  useEffect(() => {
    if (project) dispatch(getGraphicsThunk(project.id))
  }, [project]);

  return (
    <div className={`${styles.wrapper}`}>
      {/* <SectionHeader>
        Построение графика
      </SectionHeader> */}
      <SectionContent
        className={`${styles.content}`}
      >
        {/* <GanttD3 data={ganttData} /> */}

      {graphics.length && (
      <div>
        {/* <div>
          {graphics[currentPropertieIndex].propertieName}
        </div> */}
        <div
          className={`${styles.chartsWrapper}`}
        >
          {graphics[currentPropertieIndex].graphicData.map((el, index) => {
            return (
              <div
                key={index}
              >
                <div
                  className={`${styles.metricNameGraphic}`}
                >
                  {el.metricName}
                </div>
                <div
                  className={`${styles.chartWrapper}`}
                >
                  <CustomBarChart data={el.data} />
                </div>
              </div>
            )
          })}
        </div>
        <div style={{display: 'flex',  gap: '20px'}}>
          {chartsProperties.map((el: string, index: number) => {
            return (
              <div
                key={el}
                className={`${styles.propertieGraphic} ${currentPropertieIndex === index ? styles.active : ''}`}
                style={{cursor: 'pointer'}}
                onClick={() => setCurrentPropertieIndex(index)}
              >
                {el}
              </div>
            )
          })}
        </div>
      </div>)}
      </SectionContent>
    </div>
  );
}
