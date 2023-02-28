import { ChangeEvent, useEffect, useState } from "react";
import { GanttD3 } from "../../d3/GanttD3/GanttD3";
import { getGraphicsThunk, getPersonalGraphicsThunk } from "../../redux/graphics-slice";
import { useGetProjectInfoQuery, useLazyGetPersonalDiagramsListQuery } from "../../redux/state/state-api";
import { ganttDataCreator } from "../../utils/ganttData";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import CustomBarChart from "../custom-bar-chart/custom-bar-chart";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
import GraphicSelectorButton from "../ui/graphic-selector-button/graphic-selector-button";

// Styles
import styles from './personal-graphics.module.scss';
import sectionStyles from '../../styles/sections.module.scss';

export default function PersonalGraphics() {
  const dispatch = useAppDispatch();
  const [barsQuantity, setBarsQuantity] = useState<string>('');
  // const { personalGraphics, personalStatusGraphics } = useAppSelector((store) => store.graphics);
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const [getGraphics, { data: diagramData }] = useLazyGetPersonalDiagramsListQuery();
  const chartsProperties = diagramData?.graphics.map((el) => el.propertieName);
  const [ currentPropertieIndex, setCurrentPropertieIndex ] = useState<number>(0);

  const onShowTopClick = () => {
    const value = Number.parseInt(barsQuantity);

    if (value) getGraphics({
      projectId: currentId,
      project: project,
      quantity: value,
    });
  };

  const onChangeTop = (e: ChangeEvent<HTMLInputElement>) => {
    setBarsQuantity(e.target.value);
  }

  useEffect(() => {
    if (project && currentId) {
      getGraphics({
        projectId: currentId,
        project: project,
      });
    }
  }, [project]);

  return (
    <div className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        <div
          className={`${styles.topWrapper}`}
        >
          Топ
          <input
            className={`${styles.topInput}`}
            value={barsQuantity}
            onChange={onChangeTop}
          />
          <CustomizedButton
            value="Показать"
            color="blue"
            onClick={onShowTopClick}
          />
        </div>
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
      >
        {/* <GanttD3 data={ganttData} /> */}
      {!diagramData?.graphics.length && !diagramData?.statusGraphics.length && (
        <div>Атрибуты инициатив отвутствуют</div>
      )}
      {!!diagramData?.graphics.length || diagramData?.statusGraphics.length && (
      <div>
        {/* <div>
          {graphics[currentPropertieIndex].propertieName}
        </div> */}
        {currentPropertieIndex === chartsProperties?.length ? (
          <div
            className={`${styles.chartsWrapper}`}
          >
            {diagramData.statusGraphics.map((el, index) => {
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
            {diagramData?.graphics[currentPropertieIndex].graphicData.map((el: any, index: number) => {
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
          {chartsProperties?.map((el: string, index: number) => {
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
            active={currentPropertieIndex === chartsProperties?.length}
            onClick={() => setCurrentPropertieIndex(chartsProperties ? chartsProperties.length : -1)}
          />
        </div>
      </div>)}
      </SectionContent>
    </div>
  );
}
