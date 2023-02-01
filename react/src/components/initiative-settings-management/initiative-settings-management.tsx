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
import styles from './initiative-settings-management.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { setInitiativeEdit } from "../../redux/state/state-slice";
import CustomizedButton from "../button/button";
import { useGetComponentsQuery, useGetInitiativeByIdQuery, useGetInitiativesListQuery } from "../../redux/state/state-api";
import { TComponentsSettings } from "../../types";

type TInitiativeManagementProps = {
  edit?: boolean;
  editButton?: boolean
  components: TComponentsSettings;
}

export default function InitiativeSettingsManagement({ edit, editButton, components }: TInitiativeManagementProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  // const { value: components } = useAppSelector((store) => store.components);
  // const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);

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

  // if (!components) return null;

  const { settings } = components;

  if (!settings) {
    return (
      <div>No settings</div>
    )
  }

  if (edit) {
    return (
      <section className={`${sectionStyles.wrapper} ${sectionStyles.edit}`}>
        <SectionHeader
          className={`${styles.header}`}
          edit
        >
          Управление инициативой
        </SectionHeader>
        <div className={`${styles.content}`}>
          <div>
            <div className={`${sectionStyles.addfieldsHeader}`}>
              Постоянные поля
            </div>
            <div>
              <div>
                <div className={`${styles.initiativeName}`}>
                  {/* {currentInitiative ? currentInitiative.initiative.name : 'Инициатива не выбрана'} */}
                  Название инициативы
                </div>
                {/* <div className={`${styles.initiativeNumber}`}> */}
                  {/* Номер инициативы: {currentInitiative?.initiative.id} */}
                  {/* Номер инициативы */}
                {/* </div> */}
              </div>
              <ol className={`${styles.paramsList}`}>
                <li>
                  Дата регистрации
                </li>
                {/* <li>
                  Текущее состояние
                </li>
                <li>
                  Предпосылки инициативы
                </li>
                <li>
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
            </div>
          </div>
          <div>
            <div className={`${sectionStyles.addfieldsHeader}`}>
              Дополнительные поля
              {/* {!settings.initiative_addfields.length && ( */}
                <CustomizedButton
                  value="Добавить"
                  onClick={() => addComponentItem(settings.initiative_addfields, 'initiative_addfields', dispatch)}
                />
              {/* )} */}
            </div>
            <div>
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
                  {/* {index === settings.initiative_addfields.length - 1 && (
                    <Pictogram
                      type="add"
                      cursor='pointer'
                      onClick={() => addComponentItem(settings.initiative_addfields, 'initiative_addfields', dispatch)}
                    />
                  )} */}
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
            {/* {currentInitiative ? currentInitiative.initiative.name : 'Инициатива не выбрана'} */}
            {/* {currentInitiative.initiative.name} */}
            Название инициативы
          </div>
          {/* {currentInitiative && (
            <div className={`${styles.initiativeNumber}`}>
              Номер инициативы
            </div>
          )} */}
        </div>
          <ol className={`${styles.paramsList}`}>
            <li>
              <div>
                <div>
                  Дата регистрации
                </div>
                {/* <div>
                  {currentInitiative.initiative.date_registration}
                </div> */}
              </div>
            </li>
            {/* <li>
              <div>
                <div>Текущее состояние</div>
              </div>
            </li>
            <li>
              <div>
                <div>Предпосылки инициативы</div>
              </div>
            </li>
            <li>
              <div>
                <div>Описание инициативы</div>
              </div>
            </li> */}
            <li>
              <div>
                <div>Дата начала</div>
                {/* <div>{currentInitiative.initiative.date_start}</div> */}
              </div>
            </li>
            <li>
              <div>
                <div>Дата окончания</div>
                {/* <div>{currentInitiative.initiative.date_end}</div> */}
              </div>
            </li>
            {/* <li>
              Длителность инициативы
            </li> */}
            {/* {settings.initiative_addfields.map((addfield, index) => ( */}
            {settings.initiative_addfields.map((addfield, index) => (
              <li key={addfield.id}>
                <div>
                  <div>{addfield.title}</div>
                  {/* <div>{currentInitiative.addfields[index].value}</div> */}
                </div>
                
              </li>
            ))}
          </ol>
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
