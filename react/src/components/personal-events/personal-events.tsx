import { GanttD3 } from "../../d3/GanttD3/GanttD3";
import { useAppSelector } from "../../utils/hooks";
import SectionHeader from "../section/section-header/section-header";

// Styles
import sectionStyles from '../../styles/sections.module.scss';
import styles from './personal-events.module.scss';
import { useGetProjectInfoQuery } from "../../redux/state/state-api";

export default function PersonalEventsDiagram() {
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const events = useAppSelector((store) => store.personal.personalStats.events);
  const listForDiagram = events.map((item) => {
    return {
      id: item.id,
      start: item.date_start,
      end: item.date_end,
      name: item.name,
    }
  });

  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const startDate = project ? new Date(project.date_start) : new Date();
  const endDate = project ? new Date(project.date_end) : new Date();

  const diffDays = Math.round(Math.abs((startDate.getMilliseconds() - endDate.getMilliseconds()) / oneDay));
  return (
    <div
      className={`${sectionStyles.wrapperBorder} ${styles.wrapper}`}
    >
      <SectionHeader>
        Мероприятия
      </SectionHeader>
      <GanttD3
        data={listForDiagram}
        startDate={startDate}
        endDate={endDate}
        daysNumber={diffDays}
      />
    </div>
  )
}