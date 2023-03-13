import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { dateFormat, paths } from "../../consts";
import { GanttD3 } from "../../d3/GanttD3/GanttD3";
import { getEventsListThunk } from "../../redux/evens-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import SectionHeader from "../section/section-header/section-header";
import {
  useGetComponentsQuery,
  useGetInitiativeByIdQuery,
  useGetAuthInfoByIdQuery,
} from "../../redux/state/state-api";
import moment from "moment";

// styles
import sectionStyles from '../../styles/sections.module.scss';
import styles from './events-table.module.scss';
import {
  useGetEventsListQuery,
  useGetProjectInfoQuery
} from "../../redux/state/state-api";
import Pictogram from "../pictogram/pictogram";
import { formatDate } from "../../utils";

export default function EventsTable() {
  const localion = useLocation();
  const isPersonal = localion.pathname.includes('personal-stats');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const { userRights } = useAppSelector((store) => store.auth);
  const { data: user } = useGetAuthInfoByIdQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
    isFetching: isFetchingInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  // const eventsList = useAppSelector((store) => store.events.list);
  const { data: eventsList } = useGetEventsListQuery(initiative?.initiative.id ? initiative?.initiative.id : -1, {
    skip: !initiative?.initiative.id,
  });
  const statusStyles = new Map([
    ['В работе', styles.inProgress],
    ['Просрочено', styles.outdated],
    ['Выполнено', styles.ready],
    ['Запланировано', styles.planned],
  ]);

  const onEventClickHandler = (eventId: number) => {
    navigate(`/${paths.events}/info/${eventId}`);
    // if (currentInitiativeId) localStorage.setItem('initiative-id', currentInitiativeId.toString());
  }
 
  useEffect(() => {
    if (currentInitiativeId) dispatch(getEventsListThunk(currentInitiativeId))
  }, [currentInitiativeId]);

  return (
    <div
      className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}
    >
      <SectionHeader>
        <div
          className={`${sectionStyles.hideContentHeader}`}
          onClick={() => setIsOpen((prevState) => !prevState)}
        >
          Мероприятия
          <Pictogram
            type={isOpen ? 'hide' : 'show'}
            cursor="pointer"
          />
        </div>
      </SectionHeader>
      {isOpen && (
        <>
          <div
            className={`${styles.content}`}
          >
            <div
              className={`${styles.tableWrapper}`}
            >

              <table
                className={`${styles.table}`}
              >
                <thead>
                  <tr
                    className={`${styles.tableHeader}`}
                  >
                    <th
                      className={`${styles.titleCol}`}
                    >
                      Название мероприятия
                    </th>
                    <th
                      className={`${styles.statusCol}`}
                    >
                      Статус
                    </th>
                    <th
                      className={`${styles.dateCol}`}
                    >
                      Дата начала
                    </th>
                    <th
                      className={`${styles.dateCol}`}
                    >
                      Дата окончания
                    </th>
                    {!!components && components.settings?.event_addfields.map((addfield) => (
                      <th
                        key={addfield.id}
                        className={`${styles.additionalCol}`}
                      >
                        {addfield.title}
                      </th>
                    ))}
                    {components && components.table_registry.metrics.map((metric, index) => {
                      const foundMetric = project ? project.metrics.find((item) => item.id === metric.id) : undefined;
                      return (
                        metric.initiative_activate && foundMetric?.is_aggregate ? (
                          <th
                            key={`${index}_${metric.id}`}
                            className={`${styles.tableCol}`}
                          >
                            {metric.title}
                          </th>
                        ) : (
                          null
                        )
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {!eventsList?.length && (
                    <tr>
                      <td
                        className={`${styles.emptyEvents}`}
                      >
                        Список мероприятий пуст
                      </td>
                    </tr>
                  )}
                  {eventsList?.map((event, index) => (
                    <tr
                      key={event.event.id}
                      className = {`${styles.tableRow} ${(index % 2) ? styles.oddRow : styles.evenRow}`}
                      onClick={() => onEventClickHandler(event.event.id)}
                    >
                      <td
                        className={`${styles.titleCol}`}
                      >
                        
                          {event.event.name}
                      </td>
                      <td
                        className={`${statusStyles.get(event.event_status)} ${styles.statusCol}`}
                      >
                        {event.event_status}
                      </td>
                      <td
                        className={`${styles.dateCol}`}
                      >
                        {formatDate(event.event.date_start, dateFormat)}
                      </td>
                      <td
                        className={`${styles.dateCol}`}
                      >
                        {formatDate(event.event.date_end, dateFormat)}
                      </td>
                      {event.addfields.map((addfield) => (
                        <td
                          key={addfield.id}
                          className={`${styles.additionalCol}`}
                        >
                          {addfield.value}
                        </td>
                      ))}
                      {components && components.table_registry.metrics.map((metric) => {
                        const foundMetric = event.metric_fields.find((el) => el.metric.id === metric.id);
                        const metricFromProject = project ? project.metrics.find((item) => item.id === metric.id) : undefined;
                        return metric.initiative_activate && metricFromProject?.is_aggregate ? (
                          <td
                            key={foundMetric?.metric.id}
                            className={`${styles.additionalCol}`}
                          >
                            {metricFromProject.is_percent ? (
                              <>
                                {(typeof foundMetric?.value === 'number') ? Math.round(foundMetric?.value * 100) : 'NaN'}
                              </>
                            ) : (
                              <>
                                {foundMetric?.value}
                              </>
                            )}
                          </td>
                        ) : (
                          null
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {(userRights?.user_is_author || user?.user.is_superuser) && (initiative?.initiative.status?.value !== -2) && !isPersonal && (
            <div
              className={`${styles.buttonWraper}`}
            >
              <CustomizedButton
                value="Добавить"
                color="blue"
                onClick={() => {
                  navigate(`/${paths.events}/add`, { state: { initiativeId: currentInitiativeId }});
                }}
              />
            </div>
          )}
        </>
      )}      
    </div>
    
  )
}