import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { addRiskThunk } from "../../redux/risks-slice";
import CustomizedButton from "../button/button";
import { useNavigate, useParams } from "react-router-dom";

//Styles
import sectionStyles from '../../styles/sections.module.scss'
import styles from './edit-risk.module.scss';
import { paths } from "../../consts";
import {
  useAddRiskMutation,
  useDeleteRiskMutation,
  useGetComponentsQuery,
  useGetRisksListQuery,
} from "../../redux/state/state-api";
import { closeLoader, openErrorModal, showLoader } from "../../redux/state/state-slice";

export default function EditRisk() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const components = useAppSelector((store) => store.components.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { currentInitiativeId } = useAppSelector((store) => store.initiatives);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const { data: riskList } = useGetRisksListQuery(currentInitiativeId ? currentInitiativeId : -1);
  const [ errors, setErrors ] = useState({ name: false });
  const { riskId } = useParams();
  const currentRisk = riskId && riskList ? riskList.find((risk) => risk.risk.id === Number.parseInt(riskId)) : null;
  const [
    addRisk,
    {
      isError: addRiskError,
      isSuccess: addRiskSuccess,
      isLoading: addRiskLoading,
      error: addRiskErrorResponse,
    }
  ] = useAddRiskMutation();
  const [
    deleteRisk,
    {
      isError: deleteRiskError,
      isSuccess: deleteRiskSuccess,
    } ] = useDeleteRiskMutation();

  if (!currentRisk) return (
    <div>Риск не найден</div>
  );

  const [newRiskState, setNewRiskState] = useState({
    risk: currentRisk.risk,
    addfields: currentRisk.addfields.map((addfield) => {
      return {
        id: addfield.title.id,
        value: addfield.value
      }
    }),
  });

  const onDeleteClickHandler = () => {
    if (riskId) {
      deleteRisk(Number.parseInt(riskId));
    }
  }
  const onCancelClickHandler = () => {
    navigate(`/${paths.registry}/edit`);
  }

  const validate = (): boolean => {
    let isValid = true;
    if (!newRiskState.risk.name) {
      isValid = false;
      setErrors((prevState) => {
        const newState = { ...prevState };
        newState.name = true;
        return newState;
      });
    }
    return isValid;
  }

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    validate();
    addRisk(newRiskState);
  }

  const permanentInputHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; 
    setErrors((prevState) => {
      const newState = { ...prevState };
      newState.name = false;
      return newState;
    });
    setNewRiskState((prevState) => {
      const state = { ...prevState };
      const tempRisk = { ...state.risk };
      tempRisk[name as 'name'] = value;
      state.risk = tempRisk;
      return state;
    })
  };

  const inputHandler = (value: string, index: number) => {
    setNewRiskState((prevState) => {
      const state = { ...prevState };
      const addfieldsArray = [ ...state.addfields ];
      const currentAddfield = { ...addfieldsArray[index] };
      currentAddfield.value = value;
      addfieldsArray[index] = currentAddfield;
      state.addfields = addfieldsArray;

      return state;
    })
  };

  useEffect(() => {
    if (addRiskSuccess || deleteRiskSuccess) {
      navigate(`/${paths.registry}/edit`);
    }
    if (addRiskError) {
      dispatch(openErrorModal('Произошла ошибка. Проверьте заполнение полей'));
      // console.log(addRiskErrorResponse);
    }
    if (deleteRiskError) {
      dispatch(openErrorModal('Произошла ошибка при удалении риска'));
    }
    if (addRiskLoading) {
      dispatch(showLoader());
    } else {
      dispatch(closeLoader());
    }
  }, [
    addRiskError,
    addRiskSuccess,
    addRiskLoading,
    deleteRiskError,
    deleteRiskSuccess,
  ])

  return (
    <div
      className={`${sectionStyles.wrapperBorder}`}
    >
      <form
        className={`${styles.formWrapper}`}
        onSubmit={submitHandler}
      >
        <label
          className={`${styles.formElement}`}
        >
          Название риска*
          <input
            className={`${styles.formElement} ${errors.name ? styles.error : ''}`}
            value={newRiskState.risk.name}
            name="name"
            onChange={permanentInputHandler}
          />
        </label>
        {newRiskState.addfields?.map((addfield, index) => {
          const addfieldName = components?.settings?.risks_addfields.find((addfieldSettings) => addfieldSettings.id === addfield.id)?.title;
          return (
            <label 
              className={`${styles.formElement}`}
              key={addfield.id}
            >
              {addfieldName}
              <textarea
                value={addfield.value}
                onChange={(e) => inputHandler(e.target.value, index)}
              />
            </label>
          )
        })}
        <div
          className={`${styles.buttonWrapper}`}
        >
          <CustomizedButton
            value="Удалить"
            color="transparent"
            onClick={onDeleteClickHandler}
          />
          <div
            className={`${styles.rightButtonBlock}`}
          >
            <CustomizedButton
              value="Отмена"
              color="blue"
              onClick={onCancelClickHandler}
            />
            <CustomizedButton
              value="Готово"
              type="submit"
            />
          </div>
        </div>
      </form>
    </div>
  );
  }
