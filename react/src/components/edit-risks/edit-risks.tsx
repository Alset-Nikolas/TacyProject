import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { addInitiativeThunk, setInitiativesState } from "../../redux/initiatives-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import CustomizedSelect from "../select/Select";

//Styles
import styles from './edit-risks.module.scss';

export default function EditRisks() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const currentProjectId = useAppSelector((store) => store.state.project.currentId);
  // const project = useAppSelector((store) => store.state.project.value);
  const components = useAppSelector((store) => store.components.value);
  const { addInitiativeRequestSuccess, initiative } = useAppSelector((store) => store.initiatives)

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
  });

  const onCancelClickHandler = () => {
    navigate(`/${paths.registry}`);
  }

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    dispatch(addInitiativeThunk(newInitiativeState));
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

  // const onPropertieInputChange = (value: string, index: number) => {
  //   setNewInitiativeState((prevState) => {
  //     const propertiesArray = [ ...prevState.properties_fields ];
  //     const currentPropertie = { ...propertiesArray[index] };
  //     if (!currentPropertie.value) {
  //       currentPropertie.value = { propertie: prevState.properties_fields[index].id } as {
  //         id: number;
  //         value: string;
  //         propertie: number;
  //       }
  //     }
  //     currentPropertie.value.value = value;
  //     const currentPropertieValueId = components?.table_registry.properties[index].items.find((item) => item.value === value)?.id;
  //     currentPropertie.value.id = currentPropertieValueId ? currentPropertieValueId : -1;
  //     propertiesArray[index] = currentPropertie;
  //     return {
  //       ...prevState,
  //       properties_fields: propertiesArray,
  //     };
  //   });
  // };

  const onMetricsInputChange = (value: string, index: number) => {
    setNewInitiativeState((prevState) => {
      const metricsArray = [ ...prevState.metric_fields ];
      const currentMetric = { ...metricsArray[index] };
      const valueMatch = value.match(/\d+/);
      const valueNumber: any = valueMatch ? Number.parseFloat(valueMatch[0]) : '';
      currentMetric.value = valueNumber;// Number.parseFloat(value);
      metricsArray[index] = currentMetric;
      return {
        ...prevState,
        metrics_fields: metricsArray,
      };
    });
  };

  useEffect(() => {
    if (addInitiativeRequestSuccess) navigate(`/${paths.registry}`);
    return () => {
      dispatch(setInitiativesState({
        addInitiativeRequest: false,
        addInitiativeRequestSuccess: false,
        addInitiativeRequestFailed: false,
      }));
    }
  }, [addInitiativeRequestSuccess]);

  return (
    <div
      className={`${styles.initiativeWrapper}`}
    >
      
    </div>
  );
}
