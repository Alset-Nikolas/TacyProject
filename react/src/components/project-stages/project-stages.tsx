import SectionHeader from '../section/section-header/section-header';
import SectionContent from '../section/section-content/section-content';

// Styles
import styles from './project-stages.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import TimelineTableRow from '../timeline-table-row/timeline-table-row';
import TimelineStageRow from '../timeline-stage-row/timeline-stage-row';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { GanttD3 } from '../../d3/GanttD3/GanttD3';
import { addPropertie, isStage } from '../../utils';
import CustomizedButton from '../button/button';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import IntermediateDates from '../intermediate-dates/intermediate-dates';

type TProjectStagesProps = {
  edit?: boolean;
  create?: boolean;
}

export default function ProjectStages({
  edit,
  create,
}: TProjectStagesProps) {
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const timeline = project?.intermediate_dates;
  const stages = project?.stages;

  if (edit) {
    if (!projectForEdit) return null;

    return (
      <section className={`${styles.editWrapper}`}>
        {/* <div className={`${styles.tableRow}`}> */}
        <SectionHeader
          className={`${sectionStyles.editHeaderWithButton}`}
          edit
        >
          Этапы проекта
          {!projectForEdit.stages.length && (
            <div>
              <CustomizedButton
                value="Добавить"
                onClick={() => addPropertie(projectForEdit, 'stages', dispatch)}
              />
            </div>
          )}
        </SectionHeader>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingLeft: 20,
          }}
        >
          {!!projectForEdit.stages?.length && (
            <div className={`${styles.tableRow} ${styles.stageRow}`}>
              <div className={`${styles.tableHeader} ${styles.name}`}>
                Название этапа
              </div>
              <div className={`${styles.tableHeader} ${styles.date}`}>
                Дата начала
              </div>
              <div className={`${styles.tableHeader} ${styles.date}`}>
                Дата окончания
              </div>
              {/* <div /> */}
            </div>
          )}
          
          {projectForEdit.stages?.map((el: any, index: number) => (
            <TimelineStageRow
              item={el}
              index={index}
              pictogramType={index === projectForEdit.stages.length - 1 ? 'add' : 'delete'}
              key={index}
            />
          ))}
        </div>
      </section>
    );
  }

  if (create) {
    if (!projectForEdit) return null;

    return (
      <section className={`${styles.wrapper} ${styles.create}`}>
        <div className={`${styles.table}`}>
          <div className={`${styles.tableRow}`}>
            Добавить промежуточные даты
          </div>
          <div className={`${styles.tableRow}`}>
            <div className={`${styles.tableHeader}`}>
              Название
            </div>
            <div className={`${styles.tableHeader}`}>
              Дата
            </div>
            <div />
          </div>
          {!projectForEdit.intermediate_dates.length && (
            <div>
              <CustomizedButton
                value="Добавить"
                onClick={() => addPropertie(projectForEdit, 'intermediate_dates', dispatch)}
              />
            </div>
          )}
          {projectForEdit.intermediate_dates.map((el: any, index: number) => (
            <div
              className={`${styles.tableRow}`}
              key={index}
            >
              <div className={`${styles.tableRow}`}>
                <TimelineTableRow
                  item={el}
                  index={index}
                  pictogramType={index === projectForEdit.intermediate_dates.length - 1 ? 'add' : 'delete'}
                  key={index}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!timeline || !stages) return null;

  const listForDiagram = stages.map((item) => {
    return {
      id: item.id,
      start: item.date_start,
      end: item.date_end,
      name: item.name_stage,
    }
  });

  return (
    <div className={`${styles.wrapper}`}>
      <SectionHeader>
        Этапы проекта
      </SectionHeader>
      {/* <SectionContent> */}
      <div>
        {/* {timeline?.map((el, index) => (
          <div key={index}>
            {el.title}
            {el.date}
          </div>
        ))} */}
        <GanttD3
          data={listForDiagram}
          intermediateDates={timeline}  
        />
      </div>
      {/* </SectionContent> */}
    </div>
  );
}
