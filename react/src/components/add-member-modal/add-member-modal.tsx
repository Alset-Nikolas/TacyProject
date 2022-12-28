import { SelectChangeEvent } from "@mui/material";
import { setDefaultResultOrder } from "dns/promises";
import { ChangeEvent, useState } from "react";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { closeModal } from "../../redux/state/state-slice";
import { addMember } from "../../redux/team-slice";
import { TTeamMember } from "../../types";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import SelectUnits from "../select-units/select-units";
import CustomizedSelect from "../select/Select";

// Styles
import styles from './add-member-modal.module.scss';

type TAddMemberProps = {
  addMember: any;
};

export default function AddMemberModal({ addMember }: TAddMemberProps) {
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId ? currentId : -1);
  const [stage, setStage] = useState(1);
  const [isError, setIsError] = useState(false);
  const [name, setName] = useState({
    'first-name': '',
    'second-name': '',
    'surname': '',
  });
  const [newMember, setNewMember] = useState<TTeamMember>({
    id: -1,
    name: '  ',
    // firstName: '',
    // secondName: '',
    // surname: '',
    rights: [],
    role: project ? project.roles[0].name : '',
    email: '',
    phone: '',
    properties: project!.properties.map((propertie) => {
      const item = {} as {
        id: number;
        title: string;
        values: Array<string>;
      };

      item.id = propertie.id;
      item.title = propertie.title;
      item.values = [];
      return item;
    }),
  });

  const selectStyle = {
    width: '100%',
    height: '32px',
    border: '1px solid #504F4F',
    borderRadius: 0,
    paddingBottom: 0,
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIsError(false);
    if (name === 'surname') {
      setName((prevState) => {
        return { ...prevState, [name]: value }
      });
      setNewMember(((prevState) => {
        const memberName = prevState.name.split(' ');
        memberName[0] = value;
        return { ...prevState, name: memberName.join(' ') }
      }));
    } else if (name === 'first-name') {
      setName((prevState) => {
        return { ...prevState, [name]: value }
      });
      setNewMember(((prevState) => {
        const memberName = prevState.name.split(' ');
        memberName[1] = value;
        return { ...prevState, name: memberName.join(' ') }
      }));
    } else if (name === 'second-name') {
      setName((prevState) => {
        return { ...prevState, [name]: value }
      });
      setNewMember(((prevState) => {
        const memberName = prevState.name.split(' ');
        memberName[2] = value;
        return { ...prevState, name: memberName.join(' ') }
      }));
    } else {
      setNewMember(((prevState) => {
        return { ...prevState, [name]: value }
      }));
    }
  };

  const handleSelectorInput = (e: SelectChangeEvent<string | Array<string>>) => {
    const name = e.target.name;
    const value = e.target.value;
    
    setNewMember(((prevState) => {
      return { ...prevState, [name]: value }
    }));
  };

  const validate = (currentStage: number): boolean => {
    let isValidated = true;
    switch (currentStage) {
      case 1:
        if (!name['first-name']) isValidated = false;
        if (!name['second-name']) isValidated = false;
        if (!name.surname) isValidated = false;
        break;
      case 2:
        if (!newMember.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)) isValidated = false;
        if (!newMember.phone.match(/\d+/g)) isValidated = false;
        break;
      case 3:
        if (!newMember.rights.length) isValidated = false;
        break;
    }
    return isValidated;
  };

  const onAddClickHandler = () => {
    dispatch(closeModal());
    // dispatch(addMember(newMember));
    addMember(newMember);
  };

  const modalButtonHandler = () => {
    const check = () => {
      if (validate(stage)) {
        setStage((prevStage) => prevStage + 1)
      } else {
        setIsError(true);
      }
    };

    const checkStage3 = () => {
      if(validate(stage)) {
        onAddClickHandler();
      } else {
        setIsError(true);
      }
    }
    stage < 3 ?
      check()
    :
      checkStage3();
  }

  return (
    <div className={`${styles.wrapper}`}>
      <div className="stage">

      </div>
      {
        stage === 1 && (
          <form
            className={`${styles.modalForm}`}
          >
            <label
              className={`${styles.inputLabel}`}
              htmlFor="surname"
            >
              <p>Фамилия *</p>
              <input
                className={`${styles.modalInput}`}
                id="surname"
                name="surname"
                value={newMember.name.split(' ')[0] ? newMember.name.split(' ')[0] : ''}
                onChange={handleInputChange}
              />
            </label>
            <label
              className={`${styles.inputLabel}`}
              htmlFor="first-name"
            >
              <p>Имя *</p>
              <input
                className={`${styles.modalInput}`}
                id="first-name"
                name="first-name"
                value={newMember.name.split(' ')[1] ? newMember.name.split(' ')[1] : ''}
                onChange={handleInputChange}
              />
            </label>
            <label
              className={`${styles.inputLabel}`}
              htmlFor="second-name"
            >
              <p>Отчество *</p>
              <input
                className={`${styles.modalInput}`}
                id="second-name"
                name="second-name"
                value={newMember.name.split(' ')[2] ? newMember.name.split(' ')[2] : ''}
                onChange={handleInputChange}
              />
            </label>
          </form>
        )
      }
      {
        stage === 2 && (
          <form
            className={`${styles.modalForm}`}          
          >
            <label
              className={`${styles.inputLabel}`}
              htmlFor="email"
            >
              <p>E-mail *</p>
              <input
                className={`${styles.modalInput}`}
                id="email"
                name="email"
                value={newMember.email}
                onChange={handleInputChange}
              />
            </label>
            <label
              className={`${styles.inputLabel}`}
              htmlFor="phone"
            >
              <p>Телефон *</p>
              <input
                className={`${styles.modalInput}`}
                id="phone"
                name="phone"
                value={newMember.phone}
                onChange={handleInputChange}
              />
            </label>
          </form>
        )
      }
      {
        stage === 3 && (
          <form
            className={`${styles.modalForm}`}
          >
            <label
              className={`${styles.inputLabel}`}
              htmlFor="role"
            >
              <p>Роль *</p>
              <CustomizedSelect
                id="role"
                name="role"
                value={newMember.role}
                items={project?.roles.map((role) => role.name)}
                onChange={handleSelectorInput}
                style={selectStyle}
              />
            </label>
            <label
              className={`${styles.inputLabel}`}
              htmlFor="rights"
            >
              <p>Права *</p>
              <SelectUnits
                id="rights"
                name="rights"
                value={newMember.rights}
                items={project?.rights.map((right) => right.name)}
                onChange={handleSelectorInput}
                style={selectStyle}
              />
            </label>
          </form>
        )
      }
      {isError && (
        <div
          className={`${styles.error}`}
        >
          Заполните обязательные поля
        </div>
      )}
      <CustomizedButton
        className={`${styles.button}`}
        value={`${stage < 3 ? 'Далее' : 'Добавить'}`}
        color="blue"
        onClick={modalButtonHandler}
      />
    </div>
  );
}
