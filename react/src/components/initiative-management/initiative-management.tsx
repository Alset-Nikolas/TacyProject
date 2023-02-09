import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getInitiativeByIdThunk, setCurrentInitiativeId } from "../../redux/initiatives-slice";
import { addComponentItem, handleComponentInputChange, removeComponentItem } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
import { paths } from "../../consts";

// Styles
import styles from './initiative-management.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { setInitiativeEdit } from "../../redux/state/state-slice";
import CustomizedButton from "../button/button";
import { useGetComponentsQuery, useGetInitiativeByIdQuery, useGetInitiativesListQuery } from "../../redux/state/state-api";
import moment from "moment";

type TInitiativeManagementProps = {
  edit?: boolean;
  editButton?: boolean
}

export default function InitiativeManagement({ edit, editButton }: TInitiativeManagementProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);

  const {
    data: initiativesList,
    isFetching: isFetchingInitiativesList,
  } = useGetInitiativesListQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: currentInitiative,
    isFetching: isFetchingInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });

  // useEffect(() => {
  //   if (!currentInitiativeId && initiativesList?.length) {
  //     dispatch((getInitiativeByIdThunk(initiativesList[0].initiative.id)));
  //     dispatch(setCurrentInitiativeId(initiativesList[0].initiative.id));
  //   }
  // }, [currentInitiativeId, initiativesList]);

  if (!components) return null;

  const { settings } = components;

  if (!settings) {
    return (
      <div>No settings</div>
    )
  }

  if (edit) {
    return (
      <section className={`${styles.wrapper} ${styles.edit}`}>
        <SectionHeader
          className={`${styles.header}`}
          edit
        >
          Управление инициативой
        </SectionHeader>
        <div className={`${styles.content}`}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className={`${styles.addfieldsHeader}`}>
              Постоянные поля
            </div>
            <SectionContent
              edit
            >
              <div>
                <div className={`${styles.initiativeName}`}>
                  {currentInitiative ? currentInitiative.initiative.name : 'Инициатива не выбрана'}
                  {/* Название инициативы */}
                </div>
                {/* <div className={`${styles.initiativeNumber}`}>
                  Номер инициативы
                </div> */}
              </div>
              <ol className={`${styles.paramsList}`}>
                <li>
                  Автор
                </li>
                <li>
                  Дата реистрации
                </li>
                {/* <li>
                  Текущее состояние
                </li> */}
                {/* <li>
                  Предпосылки инициативы
                </li> */}
                {/* <li>
                  Описание инициативы
                </li> */}
                <li>
                  Дата начала
                </li>
                <li>
                  Дата окончания
                </li>
                {/* <li>
                  Длителность инициативы
                </li> */}
                
              </ol>
            </SectionContent>
          </div>
          <div>
            <div className={`${styles.addfieldsHeader}`}>
              Дополнительные поля
            </div>
            <div>
              {!settings.initiative_addfields.length && (
                <CustomizedButton
                  value="Добавить"
                  onClick={() => addComponentItem(settings.initiative_addfields, 'initiative_addfields', dispatch)}
                />
              )}
              {settings.initiative_addfields.map((addfield, index) => (
                <div
                  key={addfield.id !== -1 ? addfield.id : `new_item_${index}`}
                  className={`${styles.addfieldInputWrapper}`}

                >
                  <input
                    value={addfield.title}
                    onChange={(e) => handleComponentInputChange(
                      index,
                      e.target.value,
                      settings.initiative_addfields,
                      'initiative_addfields',
                      dispatch
                    )}
                  />
                  <Pictogram
                    type="delete"
                    cursor="pointer"
                    onClick={() => removeComponentItem(index, settings.initiative_addfields, 'initiative_addfields', dispatch)}
                  />
                  {index === settings.initiative_addfields.length - 1 && (
                    <Pictogram
                      type="add"
                      cursor='pointer'
                      onClick={() => addComponentItem(settings.initiative_addfields, 'initiative_addfields', dispatch)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </section>
    );
  }
  return (
    <section className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        Управление инициативой
      </SectionHeader>
      <SectionContent>
        <div>
          <div className={`${styles.initiativeName}`}>
            {currentInitiative ? currentInitiative.initiative.name : 'Инициатива не выбрана'}
            {/* {currentInitiative.initiative.name} */}
            {/* Название инициативы */}
          </div>
          {/* {currentInitiative && (
            <div className={`${styles.initiativeNumber}`}>
              Номер инициативы: {currentInitiative.initiative.id}
            </div>
          )} */}
        </div>
        {currentInitiative && (
          <ol className={`${styles.paramsList}`}>
            {currentInitiative.addfields.map((addfield, index) => (
              <li key={addfield.id}>
                <div>
                  <div>{addfield.title.title}</div>
                  <div
                    className={`${styles.fieldsContent}`}
                  >
                    {currentInitiative.addfields[index].value}
                  </div>
                </div>
                
              </li>
            ))}
            <li>
              <div>
                <div>
                  Автор:
                </div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {`${currentInitiative.initiative.author.last_name} ${currentInitiative.initiative.author.first_name[0]}. ${currentInitiative.initiative.author.second_name[0]}.`}
                </div>
              </div>
            </li>
            <li>
              <div>
                <div>
                  Дата регистрации:
                </div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {/* {currentInitiative.initiative.date_registration} */}
                  {moment(new Date(currentInitiative.initiative.date_registration)).format('DD.MM.YYYY')}
                </div>
              </div>
            </li>
            {/* <li>
              <div>
                <div>Текущее состояние:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {currentInitiative.initiative.current_state}
                </div>
              </div>
            </li> */}
            {/* <li>
              <div>
                <div>Предпосылки инициативы:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {currentInitiative.initiative.reasons}
                </div>
              </div>
            </li> */}
            {/* <li>
              <div>
                <div>Описание инициативы:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {currentInitiative.initiative.description}
                </div>
              </div>
            </li> */}
            <li>
              <div>
                <div>Дата начала:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {/* {currentInitiative.initiative.date_start} */}
                  {moment(new Date(currentInitiative.initiative.date_start)).format('DD.MM.YYYY')}
                </div>
              </div>
            </li>
            <li>
              <div>
                <div>Дата окончания:</div>
                <div
                  className={`${styles.fieldsContent}`}
                >
                  {/* {currentInitiative.initiative.date_end} */}
                  {moment(new Date(currentInitiative.initiative.date_end)).format('DD.MM.YYYY')}
                </div>
              </div>
            </li>
            {/* <li>
              Длителность инициативы
            </li> */}
            {/* {settings.initiative_addfields.map((addfield, index) => ( */}
            
          </ol>
        )}
      </SectionContent>
      {editButton && (
        <div className={styles.editButton}>
          <Pictogram
            type="edit"
            cursor="pointer"
            onClick={() => {
              navigate(`/${paths.registry}/edit`);
              dispatch(setInitiativeEdit({
                initiative: true,
                risks: false,
              }))
            }}
          />
        </div>
        
      )}
    </section>
  );
}
