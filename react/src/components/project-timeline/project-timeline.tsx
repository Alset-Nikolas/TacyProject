import SectionHeader from '../section/section-header/section-header';

// Styles
import styles from './project-timeline.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { GanttD3 } from '../../d3/GanttD3/GanttD3';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import IntermediateDates from '../intermediate-dates/intermediate-dates';
import ProjectStages from '../project-stages/project-stages';
import { TProjectValidationErrors } from '../../types';

type TProjectTimelineProps = {
  edit?: boolean;
  error?: TProjectValidationErrors;
}

export default function ProjectTimeline({
  edit,
  error,
}: TProjectTimelineProps) {
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
        <div className={`${styles.table}`}>
          <div className={`${styles.tableCol}`}>
            <IntermediateDates
              edit
              error={error}
            />
          </div>
          <div className={`${styles.tableCol}`}>
            <ProjectStages
              edit
              error={error}
            />
          </div>
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
  const startDate = new Date(project.date_start)
  const endDate = new Date(project.date_end);
  // const a = startDate - endDate;
  const diffDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));

  return (
    <div className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        Этапы проекта
      </SectionHeader>
      {/* <SectionContent> */}
      {listForDiagram.length || timeline.length ? (
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
      ) : (
        <div
          style={{
            padding: 20,
          }}
        >Нет этапов и промежуточных дат</div>
      )}
      {/* </SectionContent> */}
    </div>
  );
}
