import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { paths } from "../../consts";
import { addInitiativeThunk, setInitiativesState } from "../../redux/initiatives-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../../components/button/button";
import CustomizedSelect from "../../components/select/Select";

//Styles
import styles from './event-info-page.module.scss';
import { addEventThunk, getEventsListThunk, setEventsState } from "../../redux/evens-slice";
import InitiativeManagement from "../../components/initiative-management/initiative-management";
import DateInput from "../../components/date-input/date-input";
import { useAddEventMutation, useDeleteEventMutation, useGetComponentsQuery } from "../../redux/state/state-api";
import Checkbox from '../../components/ui/checkbox/checkbox';
import moment from "moment";
import { openErrorModal } from "../../redux/state/state-slice";

export default function EventInfoPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { eventId } = useParams();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const eventsList = useAppSelector((store) => store.events.list);
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const currentEvent = eventId ? eventsList.find((item) => item.event.id === Number.parseInt(eventId)) : null;
  const { addInitiativeRequestSuccess, initiative } = useAppSelector((store) => store.initiatives)
  // const { addEventRequestSuccess } = useAppSelector((store) => store.events);
  const [
    addEvent,
    {
      isSuccess: addEventRequestSuccess,
      isError: addEventRequestError,
    }] = useAddEventMutation();
  const [ deleteEvent, { isSuccess: isEventDeleteSuccess } ] = useDeleteEventMutation();

  if (!initiative || !currentEvent) return null;

  const [newEventState, setNewEventState] = useState({
    event: {
      ...currentEvent.event,
      date_start: moment(currentEvent.event.date_start).format('DD.MM.YYYY'),
      date_end: moment(currentEvent.event.date_end).format('DD.MM.YYYY'),
    },
    metric_fields: currentEvent.metric_fields.map((field) => {
      return {
        metric: field.metric,
        value: field.value.toString() as number | string,
      }
    }),
    addfields: currentEvent.addfields.map((field) => {
      return {
        id: field.title.id,
        value: field.value,
      }
    }),
  });

  const onCancelClickHandler = () => {
    navigate(`/${paths.registry}`);
  }

  const onDeleteClickHandler = () =>{
    if (eventId) {
      deleteEvent(Number.parseInt(eventId));
    }
  }

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    const tempEventState = {...newEventState};
    const metrics = [...tempEventState.metric_fields];
    const convertedMetrics = metrics.map((item) => {
      return {
        ...item,
        value: Number.parseFloat(item.value as string),
      };
    })
    tempEventState.metric_fields = convertedMetrics
    // dispatch(addEventThunk(newEventState));
    addEvent(tempEventState);
  }

  const onInitiativeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // const formatDate = (dateString: string) => {
    //   const dateParts = dateString.split('.');
    //   return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    // }
    setNewEventState((prevState) => {
      return {
        ...prevState,
        event: {
          ...prevState.event,
          [name]: value,
        }
      };
    })
  };

  const onReadyCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setNewEventState((prevState) => {
      return {
        ...prevState,
        event: {
          ...prevState.event,
          ready: checked,
        }
      };
    })
  };

  const onAddfieldInputChange = (value: string, index: number) => {
    setNewEventState((prevState) => {
      const addfieldsArray = [ ...prevState.addfields ];
      const currentAddfield = { ...addfieldsArray[index] };
      currentAddfield.value = value;
      addfieldsArray[index] = currentAddfield;
      return {
        ...prevState,
        addfields: addfieldsArray,
      };
    });
  };

  const onMetricsInputChange = (value: string, index: number) => {
    setNewEventState((prevState) => {
      const metricsArray = [ ...prevState.metric_fields ];
      const currentMetric = { ...metricsArray[index] };
      const valueMatch = value.match(/-?[0-9]*[.,]?[0-9]*/);
      const valueNumber = valueMatch ? valueMatch[0] : '';
      currentMetric.value = valueNumber;// Number.parseFloat(value);
      metricsArray[index] = currentMetric;
      return {
        ...prevState,
        metric_fields: metricsArray,
      };
    });
  };

  useEffect(() => {
    if (addEventRequestSuccess) {
      // navigate(`/${paths.events}`);
      navigate(`/${paths.registry}`);
      if (currentInitiativeId) dispatch(getEventsListThunk(currentInitiativeId))

    }
    if (addEventRequestError) {
      dispatch(openErrorModal('Ошибка при сохранении мероприятия'));
    }
  }, [
    addEventRequestSuccess,
    addEventRequestError,
  ]);

  useEffect(() => {
      if (isEventDeleteSuccess) navigate(`/${paths.registry}`);
  }, [isEventDeleteSuccess]);

  return (
    // <div className={`${styles.wrapper}`}>
      <div
        className={`${styles.wrapper}`}
      >
        <InitiativeManagement />

        <form
          onSubmit={onSubmitHandler}
        >
          <ol
            style={{
              padding: 0,
            }}
          >
            <div
              className={`${styles.col}`}
            >
              <div
                className={`${styles.section}`}
              >
                <label
                  className={`${styles.label}`}
                >
                  <div>Название мероприятия</div>
                  <input
                    name="name"
                    value={newEventState.event.name}
                    onChange={onInitiativeInputChange}
                  />
                </label>
                <label
                  className={`${styles.label}`}
                >
                  <div>Дата начала</div>
                  <DateInput
                    name="date_start"
                    value={newEventState.event.date_start}
                    onChange={onInitiativeInputChange}
                  />
                </label>
                <label
                  className={`${styles.label}`}
                >
                  <div>Дата окончания</div>
                  <DateInput
                    name="date_end"
                    value={newEventState.event.date_end}
                    onChange={onInitiativeInputChange}
                  />
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  Выполнено
                  <Checkbox
                    checked={newEventState.event.ready}
                    onChange={onReadyCheckboxChange}
                  />
                </div>
              </div>
              
              <div>
                <div
                  className={`${styles.sectionHeader}`}
                >
                  Дополнительные поля
                </div>
                <div
                  className={`${styles.section}`}
                >
                  {!newEventState.addfields.length && 'Список дополнительных полей пуст'}
                  {newEventState.addfields.map((field, index) => (
                    <label
                      className={`${styles.label}`}
                      key={field.id}
                    >
                      <li>{components?.settings?.event_addfields.find((settingsField) => settingsField.id === field.id)?.title}</li>
                      <input
                        value={field.value}
                        onChange={(e) => onAddfieldInputChange(e.target.value, index)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div
              className={`${styles.col}`}
            >
              <div>
                <div
                  className={`${styles.sectionHeader}`}
                >
                  Метрики
                </div>
                <div
                  className={`${styles.section}`}
                >
                  {!newEventState.metric_fields.length && 'Список метрик пуст'}
                  {newEventState.metric_fields.map((field, index) => (
                    <div
                      key={field.metric.id}
                      className={`${styles.label}`}
                    >
                      <li>{field.metric.title}</li>
                      <input
                        value={field.value}
                        onChange={(e) => onMetricsInputChange(e.target.value, index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ol>
          <div
            className={`${styles.buttonWrapper}`}
          >
            <CustomizedButton
              value="Удалить"
              color="transparent"
              onClick={onDeleteClickHandler}
            />
            <CustomizedButton
              className={`${styles.cancelButton}`}
              value="Отменить"
              color="blue"
              onClick={onCancelClickHandler}
            />
            <CustomizedButton
              value="Готово"
              type="submit"
            />
          </div>
        </form>
      </div>
      // <div className={`${styles.riskWrapper}`}></div>
      // </div>
  );
}
