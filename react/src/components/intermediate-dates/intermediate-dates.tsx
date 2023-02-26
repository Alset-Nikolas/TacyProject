import SectionHeader from '../section/section-header/section-header';
import SectionContent from '../section/section-content/section-content';

// Styles
import styles from './intermediate-dates.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import TimelineTableRow from '../timeline-table-row/timeline-table-row';
import TimelineStageRow from '../timeline-stage-row/timeline-stage-row';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { GanttD3 } from '../../d3/GanttD3/GanttD3';
import { addPropertie, isStage } from '../../utils';
import CustomizedButton from '../button/button';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { TProjectValidationErrors } from '../../types';

type TIntermediateDatesProps = {
  edit?: boolean;
  create?: boolean;
  error?: TProjectValidationErrors;
}

export default function IntermediateDates({
  edit,
  create,
  error,
}: TIntermediateDatesProps) {
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
          <div
            style={{
              marginRight: 10,
            }}
          >
            Промежуточные даты проекта
          </div>
          {!projectForEdit.intermediate_dates.length && (
            <div>
              <CustomizedButton
                value="Добавить"
                onClick={() => addPropertie(projectForEdit, 'intermediate_dates', dispatch)}
              />
            </div>
          )}
        </SectionHeader>
        {/* </div> */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: 8,
            paddingLeft: 20,
          }}
        >
          {!!projectForEdit.intermediate_dates.length && (
            <div className={`${styles.tableRow}`}>
              <div className={`${styles.tableHeader}`}>
                Название
              </div>
              <div className={`${styles.tableHeader}`}>
                Дата
              </div>
              <div />
            </div>
          )}
        
          {projectForEdit.intermediate_dates.map((el: any, index: number) => {
            const currentError = error?.intermediate_dates.find((error) => error.index === index);

            return (
            <TimelineTableRow
              item={el}
              index={index}
              pictogramType={index === projectForEdit.intermediate_dates.length - 1 ? 'add' : 'delete'}
              key={index}
              error={currentError}
            />
            );
          })}
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

  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const startDate = project ? new Date(project.date_start) : new Date();
  const endDate = project ? new Date(project.date_end) : new Date();

  const diffDays = Math.round(Math.abs((startDate.getMilliseconds() - endDate.getMilliseconds()) / oneDay));

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
          startDate={startDate}
          endDate={endDate}
          daysNumber={diffDays}
        />
      </div>
      {/* </SectionContent> */}
    </div>
  );
}
