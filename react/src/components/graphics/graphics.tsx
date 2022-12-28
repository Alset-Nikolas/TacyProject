import { IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { getGraphicsThunk } from "../../redux/graphics-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomBarChart from "../custom-bar-chart/custom-bar-chart";
import SectionContent from "../section/section-content/section-content";
import GraphicSelectorButton from "../ui/graphic-selector-button/graphic-selector-button";

// Styles
import styles from './graphics.module.scss';

export default function Graphics() {
  const dispatch = useAppDispatch();
  const { graphics, statusGraphics } = useAppSelector((store) => store.graphics);
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
      {!graphics.length && (
        <div>Данные для аналитики отвутствуют</div>
      )}
      {!!graphics.length && (
      <div>
        {/* <div>
          {graphics[currentPropertieIndex].propertieName}
        </div> */}
        {currentPropertieIndex === chartsProperties.length ? (
          <div
            className={`${styles.chartsWrapper}`}
          >
            {statusGraphics.map((el, index) => {
              return (
                <div
                  key={`${el.metricName}_${index}`}
                >
                  <Tooltip
                    title={el.metricName}
                    placement="bottom-start"
                  >
                    <div
                      className={`${styles.metricNameGraphic}`}
                    >
                      {el.metricName}
                    </div>
                  </Tooltip>
                  <div
                    className={`${styles.chartWrapper}`}
                  >
                    <CustomBarChart data={el.data} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className={`${styles.chartsWrapper}`}
          >
            {graphics[currentPropertieIndex].graphicData.map((el, index) => {
              return (
                <div
                  key={index}
                >
                  <Tooltip
                    title={el.metricName}
                    placement="bottom-start"
                  >
                    <div
                      className={`${styles.metricNameGraphic}`}
                    >
                      {el.metricName}
                  </div>
                 </Tooltip>
                  <div
                    className={`${styles.chartWrapper}`}
                  >
                    <CustomBarChart data={el.data} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div
          className={`${styles.graphicSelectorButtonWrapper}`}
        >
          {chartsProperties.map((el: string, index: number) => {
            return (
              <GraphicSelectorButton
                key={`${el}_${index}`}
                title={el}
                active={currentPropertieIndex === index}
                onClick={() => setCurrentPropertieIndex(index)}
              />
            )
          })}
          <GraphicSelectorButton
            title="Статус"
            active={currentPropertieIndex === chartsProperties.length}
            onClick={() => setCurrentPropertieIndex(chartsProperties.length)}
          />
          {/* <div
            className={`${styles.propertieGraphic} ${currentPropertieIndex === chartsProperties.length ? styles.active : ''}`}
            style={{cursor: 'pointer'}}
            onClick={() => setCurrentPropertieIndex(chartsProperties.length)}
          >
            Статус
          </div> */}
        </div>
      </div>)}
      </SectionContent>
    </div>
  );
}
