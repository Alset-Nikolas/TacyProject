import { SelectChangeEvent } from '@mui/material';
import { updateProjectForEdit } from '../../redux/state/state-slice';
import { TRight, TRole } from '../../types';
import {
  addComponentItem,
  addPropertie,
  handlePropertieInutChange,
  removePropertie,
} from '../../utils';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import CustomizedButton from '../button/button';
import Pictogram from '../pictogram/pictogram';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import SelectUnits from '../select-units/select-units';
import { rights as rightsObj } from '../../consts';

// Styles
import styles from './projects-elements.module.scss';
import inputStyles from '../../styles/inputs.module.scss';

type TProjectsElementsProps = {
  // units: Array<any>;
  roles: Array<TRole>;
  rights: Array<TRight>;
  // properties: Array<any>;
  edit?: boolean;
};

export default function ProjectsElements({ roles, rights, edit }: TProjectsElementsProps) {
  const dispatch = useAppDispatch();
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const SelectStyle = {
    width: '230px',
    height: '32px',
    border: '1px solid #504F4F',
    borderRadius: 0,
    paddingBottom: 0,
  };

  const handleRightsSelectorInput = (e: SelectChangeEvent<string | Array<string>>, index: number) => {
    try {     
      if (!projectForEdit) throw new Error('Internal project error'); 

      const value = e.target.value;
      const roles = [...projectForEdit.roles];
      const currentRole = {...roles[index]};

      if (value instanceof Array && typeof index !== 'undefined') {
        // value.forEach((el) => {
          if (value.includes(rightsObj.approve)) {
            currentRole.is_approve = true;
          } else {
            currentRole.is_approve = false;
          }
          if (value.includes(rightsObj.update)) {
            currentRole.is_update = true;
          } else {
            currentRole.is_update = false;
          }
        // });

        roles[index] = currentRole;
        
        dispatch(updateProjectForEdit({
          roles,
        }))
      } else {
        throw new Error('Wrong value or index is undefined'); 
      }
    } catch (e) {
      console.log(e);
    }
  };

  if (edit) {
    if (!projectForEdit) return (
      <div>Отсутствует проект для редактирования</div>
    )
    return (
      <div className={`${styles.wrapper} ${styles.edit}`}>
      {/* <SectionHeader
        edit
      >
        Роли
      </SectionHeader> */}
      <div className={`${styles.contentWrapper} ${styles.edit}`}>
        {/* <SectionContent>
          {units.map((el) => el)}
        </SectionContent> */}
        <div
          style={{
            width: 525,
          }}
        >
          <div
            className={`${styles.sectionHeader}`}
          >
            <div
              className={`${styles.rolesHeader}`}
            >
              Роли
            </div>
            <div>
              Права
            </div>
            {!projectForEdit.roles.length && (
              <div
                style={{
                  marginLeft: 70,
                }}
              >
                <CustomizedButton
                  value="Добавить"
                  onClick={() => addPropertie(projectForEdit, 'roles', dispatch)}
                />
              </div>
            )}
          </div>
          <div
            className={`${styles.rolesList}`}
          >
            
            {projectForEdit.roles.map((el, index) => {
              const selectorValue = [];
              if (el.is_approve) selectorValue.push(rightsObj.approve);
              if (el.is_update) selectorValue.push(rightsObj.update);

              return (
              <div
                key={el.id}
                className={`${styles.roleWrapper}`}
              >
                <div
                  className={`${styles.roleInputWrapper}`}
                >
                  <input
                    className={`${inputStyles.textInput}`}
                    value={el.name}
                    onChange={(e) => handlePropertieInutChange(index, projectForEdit, 'roles', 'name', e.target.value, dispatch)}
                  />
                  
                </div>
                <div
                  className={`${styles.rightsInputWrapper}`}
                >
                  {/* {el.name} */}
                  <SelectUnits
                    style={SelectStyle}
                    value={selectorValue}
                    items={[rightsObj.approve, rightsObj.update]}
                    onChange={(e) => handleRightsSelectorInput(e, index)}
                  />
                </div>
                <div
                  className={`${styles.controls}`}
                >
                <Pictogram
                  type="delete"
                  cursor="pointer"
                  onClick={() => removePropertie(index, projectForEdit, 'roles', dispatch)}
                />
                {(projectForEdit.roles.length - 1 === index) && (
                  <Pictogram
                    type="add"
                    cursor="pointer"
                    onClick={() => addPropertie(projectForEdit, 'roles', dispatch)}
                  />
                )}
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
    );
  }
  return (
    <div className={`${styles.wrapper}`}>
      <SectionHeader>
        Роли
      </SectionHeader>
      <div className={`${styles.contentWrapper}`}>
        {/* <SectionContent>
          {units.map((el) => el)}
        </SectionContent> */}
        {/* <SectionContent>
          <div className={`${styles.sectionName}`}>
            Права
          </div>
          <div className={`${styles.valuesContainer}`}>
            {rights?.map((el, index) => (
              <div key={index}>
                {el.name}
              </div>
            ))}
          </div>
        </SectionContent> */}
        <SectionContent>
          <div className={`${styles.valuesContainer}`}>
            {roles?.map((el, index) => (
              <div
                key={index}
                className={`${styles.roleWrapper}`}
              >
                <div
                  className={`${styles.roleName}`}
                >
                  {el.name}
                </div>
                <div
                  className={`${styles.rights}`}
                >
                  {el.is_approve && (
                    <span>
                      {rightsObj.approve}
                    </span>
                  )}
                  {el.is_update && (
                    <span>
                      {rightsObj.update}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionContent>
      </div>
    </div>
  );
}
