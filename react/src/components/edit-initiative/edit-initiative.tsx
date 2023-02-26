import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { useAddInitiativeMutation, useDeleteInitiativeMutation, useGetComponentsQuery, useGetInitiativeByIdQuery, useGetProjectInfoQuery } from "../../redux/state/state-api";
import { closeLoader, openErrorModal, showLoader } from "../../redux/state/state-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import SelectUnits from "../select-units/select-units";
import { TInitiativeInfo } from '../../types';
import { setInitiativeValidationErrors } from "../../redux/initiatives-slice";

//Styles
import styles from './edit-initiative.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
//

export default function EditInitiative() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { validationErrors } = useAppSelector((store) => store.initiatives);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const { data: project } = useGetProjectInfoQuery(currentId ? currentId : -1);
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const [
    addInitiative,
    {
      isError: addInitiativeRequestError,
      isSuccess: addInitiativeRequestSuccess,
      isLoading: addInitiativeLoading,
    }
  ] = useAddInitiativeMutation();
  const [
    deleteInitiative,
    {
      isError: deleteInitiativeRequestError,
      isSuccess: deleteInitiativeRequestSuccess,
    }
  ] = useDeleteInitiativeMutation();

  if (!initiative) return null;

  const [newInitiativeState, setNewInitiativeState] = useState({
    initiative: initiative.initiative,
    properties_fields: initiative.properties_fields.map((field) => {
      return {
        ...field,
        id: field.title.id,
      };
    }),
    metric_fields: initiative.metric_fields,
    addfields: initiative.addfields,
    files: [],
  });

  const onCancelClickHandler = () => {
    navigate(`/${paths.registry}`);
  }

  const onDeleteClickHandler = () => {
    if (currentInitiativeId) {
      deleteInitiative(currentInitiativeId);
    }
  }

  const validate = () => {
    const validationErrorsTemp = { ...validationErrors };
    if (!newInitiativeState.initiative.name) {
      validationErrorsTemp.name = true;
    }
    dispatch(setInitiativeValidationErrors(validationErrorsTemp));
  }

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    validate();
    // dispatch(addInitiativeThunk(newInitiativeState));
    const tempInitiativeState = {...newInitiativeState};
    const { author, ...initiative } = tempInitiativeState.initiative;
    tempInitiativeState.initiative = initiative as TInitiativeInfo;
    const metrics = [...tempInitiativeState.metric_fields];
    const convertedMetrics = metrics.map((item) => {
      return {
        ...item,
        value: Number.parseFloat(item.value as string),
      };
    })
    tempInitiativeState.metric_fields = convertedMetrics
    // dispatch(addEventThunk(newEventState));
    addInitiative(tempInitiativeState);
    // addInitiative(newInitiativeState);
  }

  const onInitiativeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setInitiativeValidationErrors({
      ...validationErrors,
      [name]: false,
    }));
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

      // if (currentPropertie.values.length) {
      //   currentPropertie.values.push({ propertie: prevState.properties_fields[index].id } as {
      //     id: number;
      //     value: string;
      //     propertie: number;
      //   });
      // }
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
      // currentPropertie.value = {
      //   ...currentPropertie.value,
      //   value: value,
      // };
      // const currentPropertieValueId = components?.table_registry.properties[index].items.find((item) => item.value === value)?.id;
      // currentPropertie.value.id = currentPropertieValueId ? currentPropertieValueId : -1;
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
    if (addInitiativeRequestSuccess) navigate(`/${paths.registry}`);
    // return () => {
    //   dispatch(setInitiativesState({
    //     addInitiativeRequest: false,
    //     addInitiativeRequestSuccess: false,
    //     addInitiativeRequestFailed: false,
    //   }));
    // }
    if (deleteInitiativeRequestError) {
      navigate(`/${paths.registry}`);
    }
    if (deleteInitiativeRequestError) {
      dispatch(openErrorModal('Произошла ошибка при удалении инициативы'));
    }
    if (addInitiativeRequestError) {
      dispatch(openErrorModal('Произошла ошибка. Проверьте заполнение полей'));
    }
    if (addInitiativeLoading) {
      dispatch(showLoader());
    } else {
      dispatch(closeLoader());
    }
  }, [
    addInitiativeRequestSuccess,
    addInitiativeRequestError,
    addInitiativeLoading,
    deleteInitiativeRequestError,
    deleteInitiativeRequestSuccess]);

  return (
    // <div className={`${styles.wrapper}`}>
      <div
        className={`${styles.initiativeWrapper}`}
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
                    className={`${validationErrors.name ? inputStyles.error : ''}`}
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
                {/* <label
                  className={`${styles.label}`}
                >
                  <li>Текущее состояние</li>
                  <input
                    name="current_state"
                    value={newInitiativeState.initiative.current_state}
                    onChange={onInitiativeInputChange}
                  />
                </label> */}
                {/* <label
                  className={`${styles.label}`}
                >
                  <li>Предпосылки инициативы</li>
                  <input
                    name="reasons"
                    value={newInitiativeState.initiative.reasons}
                    onChange={onInitiativeInputChange}
                  />
                </label> */}
                {/* <label
                  className={`${styles.label}`}
                >
                  <li>Описание инициативы</li>
                  <input
                    name="description"
                    value={newInitiativeState.initiative.description}
                    onChange={onInitiativeInputChange}
                  />
                </label> */}
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
                      <li>{field.title.title}</li>
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
                      {/* <CustomizedSelect
                        value={field.value ? field.value.value : ''}
                        items={components?.table_registry.properties[index].items.map((item) => item.value)}
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
      // <div className={`${styles.riskWrapper}`}></div>
      // </div>
  );
}
