import { SelectChangeEvent } from "@mui/material";
import { ChangeEvent } from "react";
import { closeModal, openDeleteMemberModal } from "../../redux/state/state-slice";
import { addNotExistingPropertie, setList } from "../../redux/team-slice";
import { TTeamMember } from "../../types";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import Modal from "../modal/modal";
import Pictogram from "../pictogram/pictogram";
import SelectUnits from "../select-units/select-units";
import CustomizedSelect from "../select/Select";

import styles from './team-row.module.scss';

type TTeamRowProps = {
  member?: TTeamMember;
  edit?: boolean;
  header?: boolean;
  index?: number;
  removeMember?: (index: number) => void;
};

export default function TeamRow({ index, member, edit, header, removeMember }: TTeamRowProps) {
  const project = useAppSelector((store) => store.state.project.value);
  const membersList = useAppSelector((store) => store.team.list); 
  const modal = useAppSelector((store) => store.state.app.modal);
  const dispatch = useAppDispatch();
  const selectStyle = {
    width: '186px',
    height: '24px',
    border: '1px solid #504F4F',
    borderRadius: 0,
    paddingBottom: 0,
    background: '#FFF',
  };

  if (!project) return null;

  if (header) return (
    <tr className={`${styles.wrapper} ${styles.header} ${edit ? styles.edit : ''}`}>
      <th className={`${styles.name}`}>
        ФИО
      </th>
      <th className={`${styles.rights}`}>
        Права
      </th>
      <th className={`${styles.role}`}>
        Роль
      </th>
      <th className={`${styles.email}`}>
        E-mail
      </th>
      <th className={`${styles.phone}`}>
        Телефон
      </th>
      {
        project.properties.map((propertie) => (
          <th className={`${styles.cellWrapper}`} key={propertie.id}>
            {propertie.title}
          </th>
        ))
      }
      {/* <div className={`${styles.unit}`}>
        Подразделение
      </div> */}
      <th className={`${styles.delete}`} />
    </tr>
  );

  if (!member || typeof index === 'undefined') return null;
  const { name, phone, email, role, rights, properties } = member;

  const onRemoveClickHandler = () => {
    dispatch(openDeleteMemberModal());
  };

  const onConfirmClickHandler = () => {
    // const newList = [...membersList];
    // newList.splice(index, 1);
    // dispatch(setList(newList));
    if (typeof removeMember === 'function') removeMember(index);
    dispatch(closeModal());
  };

  const onDeclineClickHandler = () => {
    dispatch(closeModal());
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMemberState = { ...member };
    const name = e.target.name as keyof typeof newMemberState;
    const value = e.target.value;
    const newList = [...membersList];

    if ((name === 'name' || name === 'email' || name === 'phone') && typeof index !== 'undefined') {
      newMemberState[name] = value;
      newList[index] = newMemberState;
      dispatch(setList([
        ...newList,
      ]));
    }
  };

  const handleSelectorInput = (e: SelectChangeEvent<string | Array<string>>) => {
    const newMemberState = { ...member };
    const name = e.target.name as keyof typeof newMemberState;
    const value = e.target.value;
    const newList = [...membersList];

    if ((name === 'role') && typeof index !== 'undefined' && typeof value === 'string') {
      newMemberState[name] = value;
      newList[index] = newMemberState;
      dispatch(setList([
        ...newList,
      ]));
    }

    if ((name === 'rights') && typeof index !== 'undefined' && value instanceof Array) {
      newMemberState[name] = value;
      newList[index] = newMemberState;
      dispatch(setList([
        ...newList,
      ]));
    }
  };

  const handlePropertieSelectorInput = (e: SelectChangeEvent<string | Array<string>>, propIndex: number) => {
    const newMemberState = { ...member };
    // const name = e.target.name as keyof typeof newMemberState;
    const value = e.target.value;
    const newList = [...membersList];

    const propertiesArray = [...newMemberState.properties]
    const propertie = {...propertiesArray[propIndex]};

    if (value instanceof Array && typeof index !== 'undefined') {
      propertie.values = value;
      propertiesArray[propIndex] = propertie;
      newMemberState.properties = propertiesArray;
      newList[index] = newMemberState;
      dispatch(setList([
        ...newList,
      ]));
    }
  };
    
  return (
    <>
      <tr className={`${styles.wrapper}`}>
        <td className={`${styles.name}`}>
          {edit ? (
            <input
              value={name}
              name="name"
              onChange={handleInputChange}
              autoComplete="off"
            />
          ) : (
            <div className={`${styles.cell}`}>
              {`${name}`}
            </div>
          )}
        </td>
        <td className={`${styles.rights}`}>
          {edit ? (
            <SelectUnits 
              value={rights}
              items={project.rights.map((right) => right.name)}
              style={selectStyle}
              name="rights"
              onChange={handleSelectorInput}
            />
          ) : (
            <div className={`${styles.cell}`}>
              {rights.join(', ')}
            </div>
          )}
        </td>
        <td className={`${styles.role}`}>
          {edit ? (
            <CustomizedSelect
              value={role}
              items={project.roles.map((role) => role.name)}
              style={selectStyle}
              name="role"
              onChange={handleSelectorInput}
            />
          ) : (
            <div className={`${styles.cell}`}>
              {role}
            </div>
          )}
          
        </td>
        <td className={`${styles.email}`}>
          {edit ? (
            <input
              value={email}
              name="email"
              onChange={handleInputChange}
              autoComplete="off"
            />
          ) : (
            <div className={`${styles.cell}`}>
              {email}
            </div>
          )}
        </td>
        <td className={`${styles.phone}`}>
          {edit ? (
            <input
              value={phone}
              name="phone"
              onChange={handleInputChange}
              autoComplete="off"
            />
          ) : (
            <div className={`${styles.cell}`}>
              {phone}
            </div>
          )}
        </td>
        {!!project.properties.length && project.properties.map((propertie, propIndex) => {
          const outputPropertie = properties.find((prop) => prop.title === propertie.title);
          if (!outputPropertie) {
            return <td key={`null_${propIndex}`}/>;
          }
          if (!project.properties[propIndex]) {
            console.log(`propertie ${propIndex} is undefined`);
            return <td key={`null_${propIndex}`}/>;
          }
          return (
            <td
              className={`${styles.cellWrapper} ${propIndex === properties.length - 1 ? styles.last : ''}`}
              key={`${outputPropertie.id}_${outputPropertie.title}`}
            >
              {edit ? (
                <SelectUnits
                  value={outputPropertie.values}
                  items={project.properties[propIndex].items.map((item) => item.value)}
                  style={selectStyle}
                  onChange={(e) => handlePropertieSelectorInput(e, propIndex)}
                />
              ) : (
                <div className={`${styles.cell}`}>
                  {outputPropertie.values.join(', ')}
                </div>
              )}
            </td>
          )
        })}
        {edit && (
          <td className={`${styles.delete}`}>
            <Pictogram
              type="delete"
              cursor="pointer"
              onClick={onRemoveClickHandler}
            />
          </td>
        )}
        
      </tr>
      {modal.isOpen && modal.type.deleteMember && (
        <Modal>
          <div className={`${styles.modalWrapper}`}>
            <div>
              Вы уверены,что хотите удалить элемент?
            </div>
            <div className={`${styles.modalButtonsWrapper}`}>
              <CustomizedButton
                className={`${styles.modalButton}`}
                value="Да"
                onClick={onConfirmClickHandler}
              />
              <CustomizedButton
                className={`${styles.modalButton}`}
                value="Нет"
                onClick={onDeclineClickHandler}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
