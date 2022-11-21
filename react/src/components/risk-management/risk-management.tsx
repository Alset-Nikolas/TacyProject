import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { getRisksListThunk } from "../../redux/risks-slice";
import { setInitiativeEdit } from "../../redux/state-slice";
import { addComponentItem, handleComponentInputChange, removeComponentItem } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './risk-management.module.scss';

type TRiskManagementProps = {
  edit?: boolean;
  editButton?: boolean;
  isSettings?: boolean;
}

export default function RiskManagement({ edit, editButton, isSettings }: TRiskManagementProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const components = useAppSelector((store) => store.components.value);
  const { initiative } = useAppSelector((store) => store.initiatives);
  const risksList = useAppSelector((store) => store.risks.list);

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
    <section className={`${styles.wrapper} ${styles.edit}`}>
      <SectionHeader
       className={`${styles.header}`}
       edit
      >
        Риски
      </SectionHeader>
      <div>
        <div className={`${styles.addfieldsHeader}`}>
          Дополнительные поля
        </div>
        <div>
          {!settings.risks_addfields.length && (
            <CustomizedButton
              value="Добавить"
              onClick={() => addComponentItem(settings.risks_addfields, 'risks_addfields', dispatch)}
            />
          )}
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
              {index === settings.risks_addfields.length - 1 && (
                <Pictogram
                  type="add"
                  cursor="pointer"
                  onClick={() => addComponentItem(settings.risks_addfields, 'risks_addfields', dispatch)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (isSettings) return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        Риски
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
      >
        <ol>
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
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        Риски
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
      >
        <ul 
          className={`${styles.risksList}`}
        >
          {risksList.map((risk) => {
            return (
              <li
                key={risk.risk.id}
                className={`${styles.riskElement}`}  
              >
                {risk.risk.name}
                <ol>
                  {risk.addfields.map((addfield) => {
                    return (
                      <li key={addfield.id}>
                        {addfield.title.title}:{addfield.value}
                      </li>
                    )
                  })}
                </ol>
              </li>
            )
          })}
          {/* {settings.risks_addfields.map((addfield) => (
            <li key={addfield.id}>
              {addfield.title}
            </li>
          ))} */}
        </ul>
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
