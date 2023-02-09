import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../../components/button/button";
import { setEventsState } from "../../redux/evens-slice";
import InitiativeManagement from "../../components/initiative-management/initiative-management";
import DateInput from "../../components/date-input/date-input";
import { useGetComponentsQuery, useGetInitiativeByIdQuery, useGetProjectInfoQuery } from "../../redux/state/state-api";
import { useAddEventMutation, useGetEventsListQuery } from "../../redux/state/state-api";

//Styles
import styles from './add-event-page.module.scss';
import { openErrorModal } from "../../redux/state/state-slice";

export default function AddEventPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const { data: project } = useGetProjectInfoQuery(currentId ? currentId : -1, {
    skip: !currentId, 
  });
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
    // isFetching: isFetchingInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  // const { addEventRequestSuccess } = useAppSelector((store) => store.events);
  const { refetch: refetchEventsList } = useGetEventsListQuery(initiative?.initiative.id ? initiative.initiative.id : -1, {
    skip: !initiative?.initiative.id,
  });
  const [
    addEvent,
    {
      isSuccess: addEventRequestSuccess,
      isError: addEventRequestError,
    }] = useAddEventMutation();

  if (!initiative) return null;

  const [newEventState, setNewEventState] = useState({
    event: {
      id: -1,
      initiative: initiative.initiative.id,
      name: '',
      date_start: '',
      date_end: '',
    },
    metric_fields: initiative.metric_fields.map((field) => {
      const foundMetric = project?.metrics.find((metric) => metric.id === field.metric.id);

      return {
        metric: field.metric,
        value: foundMetric?.is_aggregate ? ('' as number | string) : 0,
      }
    }),
    addfields: components && components.settings ?
      components.settings.event_addfields.map((field) => {
        return {
          id: field.id,
          value: '',
        }
      }) 
    :
      [],
  });

  const onCancelClickHandler = () => {
    navigate(`/${paths.registry}`);
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
    if (currentInitiativeId) localStorage.setItem('initiative-id', currentInitiativeId.toString());
    addEvent(tempEventState);
  }

  const onInitiativeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formatDate = (dateString: string) => {
      const dateParts = dateString.split('.');
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
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
      refetchEventsList()
      // navigate(`/${paths.events}`);
      navigate(`/${paths.registry}`, { state: { initiativeId: location.state?.initiativeId }});
    }
    if (addEventRequestError) {
      dispatch(openErrorModal('Произошла ошибка. Проверьте заполнение полей'));
    }
    return () => {
      dispatch(setEventsState({
        addEventRequest: false,
        addEventRequestSuccess: false,
        addEventRequestFailed: false,
      }));
    }
  }, [addEventRequestSuccess, addEventRequestError]);

  return (
    // <div className={`${styles.wrapper}`}>
      <div
        className={`${styles.wrapper}`}
      >
        <InitiativeManagement />
        <form
          onSubmit={onSubmitHandler}
        >
          <div
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
                <ol
                  className={`${styles.section}`}
                >
                  {!newEventState.metric_fields.length && 'Список метрик пуст'}
                  {newEventState.metric_fields.map((field, index) => {
                    const foundMetric = project?.metrics.find((metric) => metric.id === field.metric.id);
                    if (!foundMetric?.is_aggregate) return null;
                    return (
                      <label
                        key={field.metric.id}
                        className={`${styles.label}`}
                      >
                        <li>{field.metric.title}</li>
                        <input
                          value={field.value}
                          disabled={!foundMetric?.is_aggregate}
                          onChange={(e) => onMetricsInputChange(e.target.value, index)}
                        />
                      </label>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
          <div
            className={`${styles.buttonWrapper}`}
          >
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
