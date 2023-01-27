import { GanttD3 } from "../../d3/GanttD3/GanttD3";
import { useAppSelector } from "../../utils/hooks";
import SectionHeader from "../section/section-header/section-header";

// Styles
import sectionStyles from '../../styles/sections.module.scss';
import styles from './personal-events.module.scss';

export default function PersonalEventsDiagram() {
  const events = useAppSelector((store) => store.personal.personalStats.events);
  const listForDiagram = events.map((item) => {
    return {
      id: item.id,
      start: item.date_start,
      end: item.date_end,
      name: item.name,
    }
  });
  return (
    <div
      className={`${sectionStyles.wrapperBorder} ${styles.wrapper}`}
    >
      <SectionHeader>
        Мероприятия
      </SectionHeader>
      <GanttD3
        data={listForDiagram}
      />
    </div>
  )
}