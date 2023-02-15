import { SelectChangeEvent } from "@mui/material";
import {
  ChangeEvent,
  useState,
} from "react";
import {
  useGetComponentsQuery,
  useGetProjectInfoQuery,
} from "../../redux/state/state-api";
import { closeModal } from "../../redux/state/state-slice";
import { TTeamMember } from "../../types";
import {
  useAppDispatch,
  useAppSelector,
} from "../../utils/hooks";
import CustomizedButton from "../button/button";

// Styles
import styles from './add-member-modal.module.scss';
//

type TAddMemberProps = {
  addMember: (newMember: TTeamMember) => void;
};

export default function AddMemberModal({ addMember }: TAddMemberProps) {
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId ? currentId : -1);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [stage, setStage] = useState(1);
  const [isError, setIsError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<Array<string>>([]);
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
    role: project && project.roles.length ? project.roles[0].name : '',
    email: '',
    phone: '',
    is_create: false,
    is_superuser: false,
    is_author: false,
    properties: project ? project.properties.map((propertie) => {
      const item = {} as {
        id: number;
        title: string;
        values: Array<{
          id: number,
          value: string,
        }>;
      };

      item.id = propertie.id;
      item.title = propertie.title;
      item.values = [];
      return item;
    }) : [],
    addfields: components ? components.table_community.settings_addfields_community.map((addfield, propIndex) => {
      const item = {} as {
        id: number;
        title: {
            id: number;
            title: string;
            project: number;
        };
        value: string;
      };

      item.id = addfield.id;
      item.title = {
        id: addfield.id,
        title: addfield.title,
        project: currentId ? currentId : -1,
      };
      item.value = '';

      return item;
    }) : [],
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
    setErrorMessages([]);
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
        if (!name['first-name']) {
          isValidated = false;
          setErrorMessages(prevState => {
            const newState = [...prevState];
            newState.push('Заполните имя');
            return newState;
          });
        }
        if (!name['second-name']) {
          isValidated = false;
          setErrorMessages(prevState => {
            const newState = [...prevState];
            newState.push('Заполните отчество');
            return newState;
          });
        }
        if (!name.surname) {
          isValidated = false;
          setErrorMessages(prevState => {
            const newState = [...prevState];
            newState.push('Заполните фамилию');
            return newState;
          });
        }
        break;
      case 2:
        if (!newMember.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
          isValidated = false;
          if (!newMember.email) {
            setErrorMessages(prevState => {
              const newState = [...prevState];
              newState.push('Заполните e-mail')
              return newState;
            });
          } else {
            setErrorMessages(prevState => {
              const newState = [...prevState];
              newState.push('Неверный формат e-mail')
              return newState;
            });
          }
        }
        if (!newMember.phone.match(/\d+/g)) {
          isValidated = false;
          if (!newMember.phone) {
            setErrorMessages(prevState => {
              const newState = [...prevState];
              newState.push('Заполните номер телефона')
              return newState;
            });
          } else {
            setErrorMessages(prevState => {
              const newState = [...prevState];
              newState.push('Номер телефона должен содержать только цифры')
              return newState;
            });
          }
        }
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
    setErrorMessages([]);
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
    stage < 2 ?
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
      {/* {
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
      } */}
      {isError && (
        <div
          className={`${styles.error} ${styles.errorWrapper}`}
        >
          {!errorMessages.length && (
            <span>Заполните обязательные поля</span>
          )}
          {errorMessages.map((message, index) => (
            <span
              key={`message-${index}`}
            >
              {message}
            </span>
          ))}
        </div>
      )}
      <CustomizedButton
        className={`${styles.button}`}
        value={`${stage < 2 ? 'Далее' : 'Добавить'}`}
        color="blue"
        onClick={modalButtonHandler}
      />
    </div>
  );
}
