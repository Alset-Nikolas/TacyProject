import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { GanttD3 } from "../../d3/GanttD3/GanttD3";
import { getEventsListThunk } from "../../redux/evens-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import SectionHeader from "../section/section-header/section-header";
import { useGetAuthInfoByIdQuery } from "../../redux/auth/auth-api";
import { useGetInitiativeByIdQuery } from "../../redux/state/state-api";
import moment from "moment";

// styles
import sectionStyles from '../../styles/sections.module.scss';
import styles from './events-table.module.scss';
import { useGetEventsListQuery } from "../../redux/events/events-api";


export default function EventsTable() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { value: components } = useAppSelector((store) => store.components);
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
  // const tableData = useMemo(() => {
  //   return eventsList.map((item) => {
  //     return {
  //       title: item.event.name,
  //       dateStart: item.event.date_start,
  //       dateEnd: item.event.date_end,
  //     }
  //   });
  // }, [eventsList]);
  const statusStyles = new Map([
    ['В работе', styles.inProgress],
    ['Просрочено', styles.outdated],
    ['Выполнено', styles.ready],
    ['Запланировано', styles.planned],
  ]);
 
  useEffect(() => {
    if (initiative) dispatch(getEventsListThunk(initiative.initiative.id))
  }, [initiative]);

  return (
    <div
      className={`${styles.wrapper}`}
    >
      <div
        className={`${sectionStyles.wrapperBorder}`}
      >
      <SectionHeader>
        Мероприятия
      </SectionHeader>

      <div
        className={`${styles.content}`}
      >
        {/* <div
          className={`${styles.firstColumn}`}
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
              </tr>
            </thead>
            <tbody>
              {eventsList.map((event) => (
                <tr
                  key={event.event.id}
                >
                  <td
                    className={`${styles.titleCol}`}
                  >
                    {event.event.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}
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
              {eventsList?.map((event) => (
                <tr
                  key={event.event.id}
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
                    {moment(event.event.date_start).format('MM.DD.YYYY')}
                  </td>
                  <td
                    className={`${styles.dateCol}`}
                  >
                    {moment(event.event.date_end).format('MM.DD.YYYY')}
                  </td>
                  {event.addfields.map((addfield) => (
                  <td
                    key={addfield.id}
                    className={`${styles.additionalCol}`}
                  >
                    {addfield.value}
                  </td>
                ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {(userRights?.user_is_author || user?.user.is_superuser) && (
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
    </div>
    
  )
}