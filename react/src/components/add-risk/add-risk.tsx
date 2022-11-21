import { ChangeEvent, FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

//Styles
import sectionStyles from '../../styles/sections.module.scss'
import styles from './add-risk.module.scss';
import { addRiskRequest, addRiskThunk } from "../../redux/risks-slice";
import CustomizedButton from "../button/button";

type TAddRiskProps = {
  setAddRisk: (state: boolean) => void;
}

export default function AddRisk({ setAddRisk }: TAddRiskProps) {
  const dispatch = useAppDispatch();
  const initiative = useAppSelector((store) => store.initiatives.initiative);
  const components = useAppSelector((store) => store.components.value);
  const [newRiskState, setNewRiskState] = useState({
    risk: {
      id: -1,
      name: '',
      initiative: initiative ? initiative.initiative.id : -1,
    },
    addfields: !components || !components.settings ? [] : components?.settings?.risks_addfields.map((addfield) => {
      return {
        id: addfield.id,
        value: '',
      };
    }),
  });

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    dispatch(addRiskThunk(newRiskState));
    setAddRisk(false);
  }

  const permanentInputHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; 
    setNewRiskState((prevState) => {
      const state = { ...prevState };
      state.risk[name as 'name'] = value;
      return state;
    })
  };

  const inputHandler = (value: string, index: number) => {
    setNewRiskState((prevState) => {
      const state = { ...prevState };
      state.addfields[index].value = value;
      return state;
    })
  };

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
            value="Готово"
            type="submit"
          />
        </div>
      </form>
    </div>
  );
  }
