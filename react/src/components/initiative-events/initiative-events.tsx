import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { GanttD3 } from "../../d3/GanttD3/GanttD3";
import { getEventsListThunk } from "../../redux/evens-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import SectionHeader from "../section/section-header/section-header";

// styles
import sectionStyles from '../../styles/sections.module.scss';
import styles from './initiative-events.module.scss';
import { useGetProjectInfoQuery } from "../../redux/state/state-api";

export default function EventsDiagram() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const { user, userRights } = useAppSelector((store) => store.auth);
  const initiative = useAppSelector((store) => store.initiatives.initiative);
  const eventsList = useAppSelector((store) => store.events.list);
  const listForDiagram = eventsList.map((item) => {
    return {
      id: item.event.id,
      start: item.event.date_start,
      end: item.event.date_end,
      name: item.event.name,
    }
  });
 
  useEffect(() => {
    if (initiative) dispatch(getEventsListThunk(initiative.initiative.id))
  }, [initiative]);

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
      <div
        className={`${styles.toEventsLinkWrapper}`}
      >
        <Link
          to={`/${paths.events}`}
        >
          К списку мероприятий
        </Link>
      </div>
      <div>
        <GanttD3
          data={listForDiagram}
          startDate={startDate}
          endDate={endDate}
          daysNumber={diffDays}
        />
        {/* {(tasks.length !== 0) && <Gantt tasks={tasks} />} */}
        {/* <TimeLine data={listForDiagram} /> */}
      </div>
      {(userRights?.user_is_author || user?.user.is_superuser) && (
        <div
          className={`${styles.buttonWraper}`}
        >
          <CustomizedButton
            value="Добавить"
            color="blue"
            onClick={() => {
              navigate(`/${paths.events}/add`);
            }}
          />
        </div>
      )}
    </div>
    
  )
}