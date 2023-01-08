import { useEffect, useState } from "react";
import { GanttD3 } from "../../d3/GanttD3/GanttD3";
import { getGraphicsThunk, getPersonalGraphicsThunk } from "../../redux/graphics-slice";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { ganttDataCreator } from "../../utils/ganttData";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomBarChart from "../custom-bar-chart/custom-bar-chart";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
import GraphicSelectorButton from "../ui/graphic-selector-button/graphic-selector-button";

// Styles
import styles from './personal-graphics.module.scss';

export default function PersonalGraphics() {
  const dispatch = useAppDispatch();
  const { personalGraphics, personalStatusGraphics } = useAppSelector((store) => store.graphics);
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const chartsProperties = personalGraphics.map((el) => el.propertieName);
  const [ currentPropertieIndex, setCurrentPropertieIndex ] = useState<number>(0);

  useEffect(() => {
    if (project) dispatch(getPersonalGraphicsThunk(project.id))
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
      {!personalGraphics.length && (
        <div>Данные для аналитики отвутствуют</div>
      )}
      {!!personalGraphics.length && (
      <div>
        {/* <div>
          {graphics[currentPropertieIndex].propertieName}
        </div> */}
        {currentPropertieIndex === chartsProperties.length ? (
          <div
            className={`${styles.chartsWrapper}`}
          >
            {personalStatusGraphics.map((el, index) => {
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
        ) : (
          <div
            className={`${styles.chartsWrapper}`}
          >
            {personalGraphics[currentPropertieIndex].graphicData.map((el, index) => {
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
        </div>
      </div>)}
      </SectionContent>
    </div>
  );
}
