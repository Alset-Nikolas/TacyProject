import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomizedButton from "../../components/button/button";
import SelectUnits from "../../components/select-units/select-units";
import CustomizedSelect from "../../components/select/Select";
import { paths } from "../../consts";
import { addInitiativeThunk, setInitiativesState } from "../../redux/initiatives-slice";
import {
  useGetProjectInfoQuery,
  useAddInitiativeMutation,
  useGetInitiativesListQuery,
  useGetComponentsQuery
} from "../../redux/state/state-api";
import {
  TInitiativeMetricsFields, 
  IRegistryPropertie
} from "../../types";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

// Styles
import styles from './add-initiative-page.module.scss';

export default function AddInitiativePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentProjectId = useAppSelector((store) => store.state.project.currentId);
  // const project = useAppSelector((store) => store.state.project.value);
  const { data: project } = useGetProjectInfoQuery(currentProjectId);
  const { data: components } = useGetComponentsQuery(currentProjectId ? currentProjectId : -1);
  // const { addInitiativeRequestSuccess } = useAppSelector((store) => store.initiatives)
  const [newInitiativeState, setNewInitiativeState] = useState({
    initiative: {
      id: -1,
      project: currentProjectId,
      name: '',
      current_state: '',
      reasons: '',
      description: '',
    },
    properties_fields: components ? components.table_registry.properties.map((propertieField) => {
      const returnField = {} as { 
        id: number;
        title: IRegistryPropertie & { project: number };
        values: Array<{
          id: number;
          value: string;
          propertie: number;
        }>;
      };
      returnField.id = propertieField.id;
      returnField.title = { ...propertieField, project: currentProjectId ? currentProjectId : -1 };
      returnField.values = [];

      // returnField.values = propertieField. {
      //   id: propertieField.items[0].id,
      //   value: propertieField.items[0].value,
      //   propertie: propertieField.items[0].propertie,
      // };

      return returnField;
    }) : [],
    metric_fields: components ? components.table_registry.metrics.map((metricField: any) => {
      const returnField = {} as (Omit<TInitiativeMetricsFields, 'value'> & { value: number | string }) ;
      const metricUnits = project?.metrics.find((el) => el.title === metricField.title)?.units;
      returnField.metric = { ...metricField, units: metricUnits ? metricUnits : 'бм' };
      returnField.value = '0';

      return returnField;
    }) : [],
    addfields: !!components && !! components.settings ? components.settings.initiative_addfields.map((addfield: any) => {
      const returnField = {
        title: addfield,
        value: '',
      };

      return returnField
    }) : [],
    files: [],
  });
  const { refetch: refetchInitiativesList } = useGetInitiativesListQuery(currentProjectId ? currentProjectId : -1, {
    skip: !currentProjectId,    
  });
  const [addInitiative, { isSuccess: addInitiativeRequestSuccess }] = useAddInitiativeMutation();

  const onCancelClickHandler = () => {
    navigate(`/${paths.registry}`);
  }

  const onReadyClickHandler = () => {
    dispatch(addInitiativeThunk(newInitiativeState));
  }

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    // dispatch(addInitiativeThunk(newInitiativeState));
    addInitiative(newInitiativeState);
  }

  const onInitiativeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInitiativeState((prevState) => {
      return {
        ...prevState,
        initiative: {
          ...prevState.initiative,
          [name]: value,
        }
      };
    })
  };

  const onAddfieldInputChange = (value: string, index: number) => {
    setNewInitiativeState((prevState) => {
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

  const onPropertieInputChange = (value: string | Array<string>, index: number) => {
    setNewInitiativeState((prevState) => {
      const propertiesArray = [ ...prevState.properties_fields ];
      const currentPropertie = { ...propertiesArray[index] };

      if (value instanceof Array && typeof index !== 'undefined') {
        currentPropertie.values = value.map((item) => {
          const foundPropertie = project?.properties.find((el) => el.id === currentPropertie.id);
          const valueId = foundPropertie?.items.find((el) => el.value === item)?.id;
          return {
            id: valueId ? valueId : -1,
            value: item,
            propertie: currentPropertie.id,
          };
        });
      }
      propertiesArray[index] = currentPropertie;
      return {
        ...prevState,
        properties_fields: propertiesArray,
      };
    });
  };

  const onMetricsInputChange = (value: string, index: number) => {
    setNewInitiativeState((prevState) => {
      const metricsArray = [ ...prevState.metric_fields ];
      const currentMetric = { ...metricsArray[index] };
      const valueMatch = value.match(/-?[0-9]*[.,]?[0-9]*/);
      const valueNumber = valueMatch ? valueMatch[0] : '';

      // const valueNumber: any = valueMatch ? Number.parseFloat(valueMatch[0]) : '';
      currentMetric.value = valueNumber;// Number.parseFloat(value);
      metricsArray[index] = currentMetric;
      return {
        ...prevState,
        metric_fields: metricsArray,
      };
    });
  };

  useEffect(() => {
    if (addInitiativeRequestSuccess) {
      refetchInitiativesList();
      navigate(`/${paths.registry}`);
    }
    // return () => {
    //   dispatch(setInitiativesState({
    //     addInitiativeRequest: false,
    //     addInitiativeRequestSuccess: false,
    //     addInitiativeRequestFailed: false,
    //   }));
    // }
  }, [addInitiativeRequestSuccess]);

  return (
    <div
      className={`${styles.wrapper}`}
    >
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
                <div>Название инициативы*</div>
                <input
                  name="name"
                  value={newInitiativeState.initiative.name}
                  onChange={onInitiativeInputChange}
                />
              </label>
              {/* <label>
                <li>Дата регистрации</li>
                <input
                  value=""
                  readOnly
                />
              </label> */}
              <label
                className={`${styles.label}`}
              >
                <li>Текущее состояние*</li>
                <input
                  name="current_state"
                  value={newInitiativeState.initiative.current_state}
                  onChange={onInitiativeInputChange}
                />
              </label>
              <label
                className={`${styles.label}`}
              >
                <li>Предпосылки инициативы*</li>
                <input
                  name="reasons"
                  value={newInitiativeState.initiative.reasons}
                  onChange={onInitiativeInputChange}
                />
              </label>
              <label
                className={`${styles.label}`}
              >
                <li>Описание инициативы*</li>
                <input
                  name="description"
                  value={newInitiativeState.initiative.description}
                  onChange={onInitiativeInputChange}
                />
              </label>
              {/* <label>
                <li>Дата начала</li>
                <input
                  value={newInitiativeState.initiative.name}
                />
              </label>
              <label>
                <li>Дата окончания</li>
                <input
                  value={newInitiativeState.initiative.name}
                />
              </label> */}
              {/* <label>
                <li>Длительность инициативы</li>
                <input
                  value=""
                />
              </label> */}
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
                {!newInitiativeState.addfields.length && 'Список дополнительных полей пуст'}
                {newInitiativeState.addfields.map((field, index) => (
                  <label
                    className={`${styles.label}`}
                    key={field.title.id}
                  >
                    <li>{`${field.title.title}*`}</li>
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
                Атрибуты инициатив
              </div>
              <div
                className={`${styles.section}`}
              >
                {!newInitiativeState.properties_fields.length && 'Атрибуты инициатив отсутствуют'}
                {newInitiativeState.properties_fields.map((field, index) => (
                  <label
                    className={`${styles.label}`}
                    key={field.id}
                  >
                    <li>{field.title.title}</li>
                    {/* <input
                      value={field.value.value}
                      onChange={(e) => onPropertieInputChange(e.target.value, index)}
                    /> */}
                    <SelectUnits
                      value={field.values.map((item) => item.value)}
                      items={components?.table_registry.properties[index].items.map((item) => item.value)}
                      onChange={(e) => onPropertieInputChange(e.target.value, index)}
                    />
                  </label>
                ))}
              </div>
              {/* <div
                className={`${styles.sectionHeader}`}
              >
                Метрики
              </div>
              <div
                className={`${styles.section}`}
              >
                {!newInitiativeState.metric_fields.length && 'Список метрик пуст'}
                {newInitiativeState.metric_fields.map((field, index) => (
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
              </div> */}
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
  );
}
