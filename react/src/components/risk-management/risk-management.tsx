import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { getRisksListThunk } from "../../redux/risks-slice";
import { useGetComponentsQuery, useGetInitiativeByIdQuery, useGetRisksListQuery } from "../../redux/state/state-api";
import { setInitiativeEdit } from "../../redux/state/state-slice";
import { TComponentsSettings } from "../../types";
import { addComponentItem, handleComponentInputChange, removeComponentItem } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './risk-management.module.scss';
import sectionStyles from '../../styles/sections.module.scss';

type TRiskManagementProps = {
  edit?: boolean;
  editButton?: boolean;
  isSettings?: boolean;
  components: TComponentsSettings;
}

export default function RiskManagement({ edit, editButton, isSettings, components }: TRiskManagementProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  // const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  // const { value: components } = useAppSelector((store) => store.components);
  // const { initiative } = useAppSelector((store) => store.initiatives);
  const {
      currentInitiativeId
    } = useAppSelector((store) => store.initiatives);
    const {
      data: initiative,
      isFetching: isFetchingInitiative,
    } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
      skip: !currentInitiativeId,
    });
  // const risksList = useAppSelector((store) => store.risks.list);
  const { data: risksList } = useGetRisksListQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  })

  const handleRiskEditClick = (riskIndex: number, riskId: number) => {
    navigate(`/${paths.registry}/risk-info/${riskId}`);
  };

  useEffect(() => {
    if (initiative?.initiative.id) dispatch(getRisksListThunk(initiative.initiative.id));
  }, [initiative?.initiative.id]);

  if (!components) return null;

  const { settings } = components;

  if (!settings) {
    return (
      <div>No settings</div>
    )
  }

  if (edit) return (
    <section className={`${sectionStyles.wrapper} ${sectionStyles.edit}`}>
      <SectionHeader
       className={`${styles.header}`}
       edit
      >
        Риски
      </SectionHeader>
      <div
        className={`${sectionStyles.fieldsContent}`}
      >
        <div>
          <div className={`${sectionStyles.addfieldsHeader}`}>
            Постоянные поля
          </div>
          <div>
            <ol className={`${sectionStyles.sectionList}`}>
              {/* <li>
                №
              </li> */}
              <li>
                Название
              </li>
            </ol>
          </div>
        </div>
        <div>
          <div className={`${sectionStyles.addfieldsHeader}`}>
            Дополнительные поля
            {/* {!settings.risks_addfields.length && ( */}
              <CustomizedButton
                value="Добавить"
                onClick={() => addComponentItem(settings.risks_addfields, 'risks_addfields', dispatch)}
              />
            {/* )} */}
          </div>
          <div>
            
            {settings.risks_addfields.map((addfield, index) => (
              <div
                key={addfield.id !== -1 ? addfield.id : `new_item_${index}`}
                className={`${styles.addfieldInputWrapper}`}
              >
                <input
                  value={addfield.title}
                  onChange={(e) => handleComponentInputChange(
                    index,
                    e.target.value,
                    settings.risks_addfields,
                    'risks_addfields',
                    dispatch
                  )}
                />
                <Pictogram
                  type="delete"
                  cursor="pointer"
                  onClick={() => removeComponentItem(index, settings.risks_addfields, 'risks_addfields', dispatch)}
                />
                {/* {index === settings.risks_addfields.length - 1 && (
                  <Pictogram
                    type="add"
                    cursor="pointer"
                    onClick={() => addComponentItem(settings.risks_addfields, 'risks_addfields', dispatch)}
                  />
                )} */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  if (isSettings) return (
    <section className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        Риски
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
      >
        <ol
          className={`${styles.markedRisksList}`}
        >
          {/* <li>
            №
          </li> */}
          <li>
            Название
          </li>
          {settings.risks_addfields.map((addfield) => {
            return (
              <li
                key={addfield.id}
              >
                {addfield.title}
              </li>
            )
          })}
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
                initiative: false,
                risks: true,
              }))
            }}
          />
        </div>
        
      )}
    </section>
  );

  return (
    <section className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        Риски
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
      >
        <ol 
          className={`${styles.risksList}`}
        >
          {!risksList?.length && (
            <div>
               Список рисков пуст
            </div>
          )}
          {risksList?.map((risk, riskIndex) => {
            return (
              <li
                key={risk.risk.id}
                className={`${styles.riskElement}`}  
              >
                {`${riskIndex+1}. ${risk.risk.name}`}
                <ol>
                  {risk.addfields.map((addfield) => {
                    return (
                      <li key={addfield.id}>
                        {addfield.title.title}:&nbsp;{addfield.value}
                      </li>
                    )
                  })}
                </ol>
                {!editButton && (
                  <div
                    className={`${styles.editButtonWrapper}`}
                  >
                    <Pictogram
                      type="edit"
                      cursor="pointer"
                      onClick={() => handleRiskEditClick(riskIndex, risk.risk.id)}
                    />
                  </div>
                )}
              </li>
            )
          })}
          {/* {settings.risks_addfields.map((addfield) => (
            <li key={addfield.id}>
              {addfield.title}
            </li>
          ))} */}
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
                initiative: false,
                risks: true,
              }))
            }}
          />
        </div>
        
      )}
    </section>
  );
}
