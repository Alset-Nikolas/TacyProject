import { ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { updateTableCommunity } from "../../redux/components-slice";
import { getRisksListThunk } from "../../redux/risks-slice";
import { useGetComponentsQuery, useGetInitiativeByIdQuery } from "../../redux/state/state-api";
import { setInitiativeEdit } from "../../redux/state/state-slice";
import { TComponentsSettings } from "../../types";
import { addComponentItem, handleComponentInputChange, removeComponentItem } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './team-table-management.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import Checkbox from "../ui/checkbox/checkbox";

type TRiskManagementProps = {
  edit?: boolean;
  editButton?: boolean;
  components: TComponentsSettings
}

export default function TeamTableManagement({ edit, editButton, components }: TRiskManagementProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  // const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  // const componentsEdit = useAppSelector((store) => store.components.value);
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
    isFetching: isFetchingInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const risksList = useAppSelector((store) => store.risks.list);

  const handleRiskEditClick = (riskIndex: number, riskId: number) => {
    navigate(`/${paths.registry}/risk-info/${riskId}`);
  };

  const addAddfieldCommunity = (
    addfieldsArray: Array<{id: number, title: string}>,
  ) => {
    const newAddfields = [...addfieldsArray];
    newAddfields.push({
      id: -1,
      title: '',
    });

    dispatch(updateTableCommunity({ settings_addfields_community: newAddfields }));
  };

  const removeAddfieldCommunnity = (
    addfieldsArray: Array<{id: number, title: string}>,
    index: number,
  ) => {
    const newAddfields = [...addfieldsArray];
    newAddfields.splice(index, 1);

    dispatch(updateTableCommunity({ settings_addfields_community: newAddfields }));
  };

  const handleComponentInputChange = (
    addfieldsArray: Array<{id: number, title: string}>,
    value: string,
    index: number,
  ) => {
    const newAddfields = [...addfieldsArray];
    const currentAddfield = { ...newAddfields[index] };
    currentAddfield.title = value;
    newAddfields[index] = currentAddfield;

    dispatch(updateTableCommunity({ settings_addfields_community: newAddfields }));
  };

  const onPropertyActivationChange = (e: ChangeEvent<HTMLInputElement> , index: number) => {
    const newProperties = components ? [...components.table_community.properties] : [];
    const currentProperty = { ...newProperties[index] };
    currentProperty.is_community_activate = e.target.checked;
    newProperties[index] = currentProperty;

    dispatch(updateTableCommunity({ properties: newProperties }));
  };

  useEffect(() => {
    if (initiative?.initiative.id) dispatch(getRisksListThunk(initiative.initiative.id));
  }, [initiative?.initiative.id]);

  // if (!components) return null;

  const { settings, table_community } = components;

  if (!settings) {
    return (
      <div>No settings</div>
    )
  }

  if (edit) {
    // if (!componentsEdit) return null;

    // const { settings, table_community } = components;

    return (
      <section className={`${styles.wrapper} ${styles.edit}`}>
        <SectionHeader
        className={`${styles.header}`}
        edit
        >
          Таблица команды проекта
        </SectionHeader>
        <div
          className={`${sectionStyles.tableSettingsWraper}`}
        >
          <div
            className={`${sectionStyles.fieldsContent}`}
          >
            <div>
              <div
                className={`${sectionStyles.addfieldsHeader}`}
              >
                Постоянные поля
              </div>
              <div>
                <ol className={`${sectionStyles.sectionList}`}>
                  <li>
                    ФИО
                  </li>
                  <li>
                    Права
                  </li>
                  <li>
                    Email
                  </li>
                  <li>
                    Телефон
                  </li>
                </ol>
              </div>
            </div>
            <div>
              <div className={`${sectionStyles.addfieldsHeader}`}>
                Дополнительные поля
                <CustomizedButton
                  value="Добавить"
                  onClick={() => addAddfieldCommunity(table_community.settings_addfields_community)}
                />
              </div>
              <div>
                {table_community.settings_addfields_community.map((addfield, index) => (
                  <div
                    key={addfield.id !== -1 ? addfield.id : `new_item_${index}`}
                    className={`${styles.addfieldInputWrapper}`}
                  >
                    <input
                      value={addfield.title}
                      onChange={(e) => handleComponentInputChange(table_community.settings_addfields_community, e.target.value, index)}
                    />
                    <Pictogram
                      type="delete"
                      cursor="pointer"
                      onClick={() => removeAddfieldCommunnity(table_community.settings_addfields_community, index)}
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
          <div>
            <div
              className={`${sectionStyles.addfieldsHeader}`}
            >
              Атрибуты инициатив
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {table_community.properties.map((property, index) => (
                <div
                  key={property.id}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <Checkbox
                    checked={property.is_community_activate}
                    onChange={(e) => onPropertyActivationChange(e, index)}
                  />
                  <div>
                    {property.title}  
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        Таблица команды проекта
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
      >
        <div>
          <div
            className={`${sectionStyles.fieldsInfo}`}
          >
            <div>
              <div
                className={`${sectionStyles.sectionHeader}`}
              >
                Постоянные поля
              </div>
              <div>
                <ol
                  className={`${sectionStyles.sectionList}`}
                >
                  <li>
                    ФИО
                  </li>
                  <li>
                    Права
                  </li>
                  <li>
                    Email
                  </li>
                  <li>
                    Телефон
                  </li>
                </ol>
              </div>
            </div>
            <div
              className={`${styles.addfieldsHeader}`}
            >
              <div className={`${sectionStyles.sectionHeader}`}>
                Дополнительные поля
              </div>
              <ol
                className={`${sectionStyles.sectionList}`}
              >
                {table_community.settings_addfields_community.map((addfield, index) => (
                  <li
                    key={addfield.id !== -1 ? addfield.id : `new_item_${index}`}
                  >
                    {addfield.title}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div>
            <div
              className={`${sectionStyles.sectionHeader}`}
            >
              Атрибуты инициатив
            </div>
            <ol
              className={`${sectionStyles.sectionList}`}
            >
              {table_community.properties.map((property, index) => (
                <li
                  key={property.id}
                >
                  {property.title}  
                </li>
              ))}
            </ol>
          </div>
          
        </div>
      </SectionContent>
    </section>
  );
}
