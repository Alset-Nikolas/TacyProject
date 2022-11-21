import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomizedButton from "../../components/button/button";
import Modal from "../../components/modal/modal";
import Pictogram from "../../components/pictogram/pictogram";
import { paths } from "../../consts";
import { deleteEventByIdThunk, getEventsListThunk, setEventsList } from "../../redux/evens-slice";
import { closeModal, openDeleteEventModal } from "../../redux/state-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

// Styles
import styles from './events-page.module.scss';

export default function EventsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const eventsList = useAppSelector((store) => store.events.list);
  const initiative = useAppSelector((store) => store.initiatives.initiative);
  const modal = useAppSelector((store) => store.state.app.modal);
  const [deleteIndex, setDeleteIndex] = useState(-1);

  const onRemoveClickHandler = (index: number) => {
    setDeleteIndex(index);
    dispatch(openDeleteEventModal());
  };

  const removeEvent = (index: number) => {
    const newList = [ ...eventsList ];
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

  useEffect(() => {
    if (initiative) dispatch(getEventsListThunk(initiative.initiative.id));
  } ,[]);

  return (
    <div
      className={styles.wrapper}
    >
      <div
      >
        <CustomizedButton
          value="Добавить мероприятие"
          color="blue"
          onClick={() => navigate(`add`)}
        />
      </div>
      <div
        className={`${styles.tableWrapper}`}
      >
        <table>
          <thead>
            <th>
              Название мероприятия
            </th>
            <th>
              Дата начала
            </th>
            <th>
              Дата окончания
            </th>
            <th
              className={`${styles.deleteCell}`}
            />
          </thead>
          <tbody>
            {eventsList.map((event, index) => {
              return (
                <tr
                  key={event.event.id}
                >
                  <td>
                    {event.event.name}
                  </td>
                  <td>
                    {event.event.date_start}
                  </td>
                  <td>
                    {event.event.date_end}
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
