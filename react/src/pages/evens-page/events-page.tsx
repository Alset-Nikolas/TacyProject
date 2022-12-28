import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomizedButton from "../../components/button/button";
import Modal from "../../components/modal/modal";
import Pictogram from "../../components/pictogram/pictogram";
import { paths } from "../../consts";
import { addEventThunk, deleteEventByIdThunk, getEventsListThunk, postEventByIdThunk, setEventsList } from "../../redux/evens-slice";
import { closeModal, openDeleteEventModal } from "../../redux/state/state-slice";
import { TEvent } from "../../types";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

// Styles
import styles from './events-page.module.scss';

export default function EventsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const eventsList = useAppSelector((store) => store.events.list);
  const initiative = useAppSelector((store) => store.initiatives.initiative);
  const modal = useAppSelector((store) => store.state.app.modal);
  const { userRights, user } = useAppSelector((store) => store.auth);
  const [deleteIndex, setDeleteIndex] = useState(-1);
  const statusStyles = new Map([
    ['В работе', styles.inProgress],
    ['Просрочено', styles.outdated],
    ['Выполнено', styles.ready],
    ['Запланировано', styles.planned],
  ]);

  const onRemoveClickHandler = (index: number) => {
    setDeleteIndex(index);
    dispatch(openDeleteEventModal());
  };

  const removeEvent = (index: number) => {
    const newList = [...eventsList];
    newList.splice(index, 1);
    dispatch(setEventsList(newList));
  };

  const onConfirmClickHandler = () => {
    // removeEvent(deleteIndex);
    const eventId = eventsList[deleteIndex].event.id;
    dispatch(deleteEventByIdThunk(eventId));
    dispatch(closeModal());
  }

  const onDeclineClickHandler = () => {
    dispatch(closeModal());
  };

  const checkboxChangeHandler = (event: TEvent) => {
    const newEventState = {
      event: { ... event.event },
      metric_fields: event.metric_fields.map((field) => {
        return {
          metric: field.metric,
          value: field.value,
        }
      }),
      addfields: event.addfields.map((field) => {
        return {
          id: field.title.id,
          value: field.value,
        }
      }),
    };

    const newEventInfo = { ...event.event };
    newEventInfo.ready = !newEventInfo.ready;
    newEventState.event = newEventInfo;
    dispatch(addEventThunk(newEventState));
  }

  useEffect(() => {
    if (initiative) dispatch(getEventsListThunk(initiative.initiative.id));
  }, []);

  return (
    <div
      className={styles.wrapper}
    >
      {(userRights?.user_is_author || user?.user.is_superuser) && (
        <div
        >
          <CustomizedButton
            value="Добавить мероприятие"
            color="blue"
            onClick={() => navigate(`add`)}
          />
        </div>
      )}

      <div
        className={`${styles.tableWrapper}`}
      >
        <table>
          <thead>
            <tr>
              <th>
                Название мероприятия
              </th>
              <th>
                Статус
              </th>
              <th>
                Дата начала
              </th>
              <th>
                Дата окончания
              </th>
              {userRights?.user_is_author && (
                <>
                  <th>
                    Отметить как выполненное
                  </th>
                  <th
                    className={`${styles.deleteCell}`}
                  />
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {eventsList.map((event, index) => {
              return (
                <tr
                  key={event.event.id}
                >
                  <td>
                    <Link
                      to={`/${paths.events}/info/${event.event.id}`}
                    >
                      {event.event.name}
                    </Link>
                  </td>
                  <td
                    className={`${statusStyles.get(event.event_status)} ${styles.statusCell}`}
                  >
                    {event.event_status}
                  </td>
                  <td>
                    {event.event.date_start}
                  </td>
                  <td>
                    {event.event.date_end}
                  </td>
                  {userRights?.user_is_author && (
                    <>
                      <td>
                        <input
                          type="checkbox"
                          checked={event.event.ready}
                          onChange={() => checkboxChangeHandler(event)}
                        />
                      </td>
                      <td
                        className={`${styles.deleteCell}`}
                      >
                        <Pictogram
                          type="delete"
                          cursor="pointer"
                          onClick={() => onRemoveClickHandler(index)}
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div
          className={`${styles.readyButtonWrapper}`}
        >
          <CustomizedButton
            value="Готово"
            onClick={() => {
              navigate(`/${paths.registry}`);
            }}
          />
        </div>
      </div>

      {modal.isOpen && modal.type.deleteEvent && (
        <Modal>
          <div className={`${styles.modalWrapper}`}>
            <div>
              Вы уверены,что хотите удалить элемент?
            </div>
            <div className={`${styles.modalButtonsWrapper}`}>
              <CustomizedButton
                className={`${styles.modalButton}`}
                value="Да"
                onClick={onConfirmClickHandler}
              />
              <CustomizedButton
                className={`${styles.modalButton}`}
                value="Нет"
                onClick={onDeclineClickHandler}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
