import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { addRiskThunk } from "../../redux/risks-slice";
import CustomizedButton from "../button/button";
import { useNavigate, useParams } from "react-router-dom";

//Styles
import sectionStyles from '../../styles/sections.module.scss'
import styles from './edit-risk.module.scss';
import { paths } from "../../consts";
import { useAddRiskMutation, useDeleteRiskMutation, useGetComponentsQuery } from "../../redux/state/state-api";
import { openErrorModal } from "../../redux/state/state-slice";

export default function EditRisk() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // const components = useAppSelector((store) => store.components.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const riskList = useAppSelector((store) => store.risks.list);
  const { riskId } = useParams();
  const currentRisk = riskId ? riskList.find((risk) => risk.risk.id === Number.parseInt(riskId)) : null;
  const [
    addRisk,
    {
      isError: addRiskError,
      isSuccess: addRiskSuccess,
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

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    addRisk(newRiskState);
  }

  const permanentInputHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; 
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
    }
    if (deleteRiskError) {
      dispatch(openErrorModal('Произошла ошибка при удалении риска'));
    }
  }, [
    addRiskError,
    addRiskSuccess,
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
          Название риска
          <input
            className={`${styles.formElement}`}
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
      </form>
    </div>
  );
  }
