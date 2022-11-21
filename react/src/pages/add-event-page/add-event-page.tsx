import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { addInitiativeThunk, setInitiativesState } from "../../redux/initiatives-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../../components/button/button";
import CustomizedSelect from "../../components/select/Select";

//Styles
import styles from './add-event-page.module.scss';
import { addEventThunk, setEventsState } from "../../redux/evens-slice";
import InitiativeManagement from "../../components/initiative-management/initiative-management";
import DateInput from "../../components/date-input/date-input";

export default function AddEventPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const currentProjectId = useAppSelector((store) => store.state.project.currentId);
  // const project = useAppSelector((store) => store.state.project.value);
  const components = useAppSelector((store) => store.components.value);
  const { addInitiativeRequestSuccess, initiative } = useAppSelector((store) => store.initiatives)
  const { addEventRequestSuccess } = useAppSelector((store) => store.events)

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
      return {
        metric: field.metric,
        value: 0,
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
    dispatch(addEventThunk(newEventState));
  }

  const onInitiativeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEventState((prevState) => {
      return {
        ...prevState,
        event: {
          ...prevState.event,
          [name]: name.match('date') ? value.replaceAll('.', '-') : value,
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
      const valueMatch = value.match(/\d+/);
      const valueNumber = valueMatch ? Number.parseFloat(valueMatch[0]) : 0;
      currentMetric.value = valueNumber;// Number.parseFloat(value);
      metricsArray[index] = currentMetric;
      return {
        ...prevState,
        metric_fields: metricsArray,
      };
    });
  };

  useEffect(() => {
    if (addEventRequestSuccess) navigate(`/${paths.events}`);
    return () => {
      dispatch(setEventsState({
        addEventRequest: false,
        addEventRequestSuccess: false,
        addEventRequestFailed: false,
      }));
    }
  }, [addEventRequestSuccess]);

  return (
    // <div className={`${styles.wrapper}`}>
      <div
        className={`${styles.wrapper}`}
      >
        <InitiativeManagement />
        <form
          onSubmit={onSubmitHandler}
        >
          <ol>
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
                <div
                  className={`${styles.section}`}
                >
                  {!newEventState.metric_fields.length && 'Список метрик пуст'}
                  {newEventState.metric_fields.map((field, index) => (
                    <label
                      key={field.metric.id}
                      className={`${styles.label}`}
                    >
                      <li>{field.metric.title}</li>
                      <input
                        value={field.value}
                        onChange={(e) => onMetricsInputChange(e.target.value, index)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </ol>
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
