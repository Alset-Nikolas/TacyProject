import { ChangeEvent, useEffect } from "react";
import { setComponentsState, updateTableRegistry } from "../../redux/components-slice";
import { useGetComponentsQuery, useGetProjectInfoQuery, useUpdateComponentsMutation } from "../../redux/state/state-api";
import { TComponentsSettings } from "../../types";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './initiatives-table-configuration.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import Checkbox from "../ui/checkbox/checkbox";

type TInitiativesTableConfigurationProps = {
  edit?: boolean;
  components: TComponentsSettings
}

export default function InitiativesTableConfiguration({ edit, components }: TInitiativesTableConfigurationProps) {
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const tableRegistry = components.table_registry;

  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    key: 'properties' | 'metrics' | 'roles',
  ) => {
    const checked = e.target.checked;
    if (tableRegistry) {
      const newArray = [ ...tableRegistry[key] ];
      const newItem = { ...newArray[index] };

      newItem.initiative_activate = checked;
      newArray[index] = newItem;

      dispatch(updateTableRegistry({ key, array: newArray }));
    }
  };
  
  if (edit) return (
    <div
      className={`${styles.wrapper} ${styles.edit}`}
    >
      <SectionHeader
        className={`${styles.header}`}
        edit
      >
        Таблица реестра инициатив
      </SectionHeader>
      <div
        className={`${styles.content}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div>
          <div className={`${sectionStyles.addfieldsHeader}`}>
            Постоянные поля
          </div>
          <div>
            <ol className={`${sectionStyles.sectionList}`}>
              <li>
                Номер инициативы
              </li>
              <li>
                Название инициативы
              </li>
              <li>
                Статус инициативы
              </li>
            </ol>
          </div>
        </div>
        <div
          className={`${styles.parametersWrapper}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
          <div>
            <div
              className={`${sectionStyles.addfieldsHeader}`}
            >
              Атрибуты инициатив
            </div>
            <div
              className={`${styles.listWrapper}`}
            >
              {project?.properties.map((propertie, index) => (
                <div key={propertie.id}>
                  <div
                    className={`${styles.checkboxWrapper}`}
                  >
                    {/* <input
                      type="checkbox"
                      checked={tableRegistry?.properties[index].initiative_activate}
                      onChange={(e) => handleCheckboxChange(e, index, 'properties')}
                    /> */}
                    <Checkbox
                      checked={tableRegistry?.properties[index].initiative_activate}
                      onChange={(e) => handleCheckboxChange(e, index, 'properties')}
                    />
                    {propertie.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div
              className={`${sectionStyles.addfieldsHeader}`}
            >
              Метрики
            </div>
            <div
              className={`${styles.listWrapper}`}
            >
              {project?.metrics.map((metrica, index) => (
                <div key={metrica.title}>
                  <div
                    className={`${styles.checkboxWrapper}`}
                  >
                    {/* <input
                      type="checkbox"
                      checked={tableRegistry?.metrics[index].initiative_activate}
                      onChange={(e) => handleCheckboxChange(e, index, 'metrics')}
                    /> */}
                    <Checkbox
                      checked={tableRegistry?.metrics[index].initiative_activate}
                      onChange={(e) => handleCheckboxChange(e, index, 'metrics')}
                    />
                    {metrica.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div
              className={`${sectionStyles.addfieldsHeader}`}
            >
              Роли
            </div>
            <div
              className={`${styles.listWrapper}`}
            >
              {tableRegistry?.roles.map((role, index) => (
                <div key={role.id}>
                  <div
                    className={`${styles.checkboxWrapper}`}
                  >
                    {/* <input
                      type="checkbox"
                      checked={tableRegistry?.roles[index].initiative_activate}
                      onChange={(e) => handleCheckboxChange(e, index, 'roles')}
                    /> */}
                    <Checkbox
                      checked={tableRegistry?.roles[index].initiative_activate}
                      onChange={(e) => handleCheckboxChange(e, index, 'roles')}
                    />
                    {role.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );

  return (
    <div
      className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}
    >
      <SectionHeader>
        Таблица реестра инициатив
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
        // style={{
        //   display: 'flex',
        //   flexDirection: 'column',
        // }}
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
                Номер инициативы
              </li>
              <li>
                Название инициативы
              </li>
              <li>
                Статус инициативы
              </li>
            </ol>
          </div>
        </div>
        <div
          className={`${styles.parametersWrapper}`}
        >
          <div
            
          >
            <div
              className={`${sectionStyles.sectionHeader}`}
            >
              Атрибуты инициатив
            </div>
            <ol
              className={`${sectionStyles.sectionList}`}
            >
              {tableRegistry?.properties.map((propertie, index) => {
                if (!propertie.initiative_activate) return null;
                return (
                  <li
                    key={propertie.id}
                  >
                    {propertie.title}
                  </li>
                );
              })}
            </ol>
          </div>
          <div>
            <div
              className={`${sectionStyles.sectionHeader}`}
            >
              Метрики
            </div>
            <ol
              className={`${sectionStyles.sectionList}`}
            >
              {tableRegistry?.metrics.map((metrica, index) => {
                if (!metrica.initiative_activate) return null;
                return (
                  <li key={metrica.title}>
                    {metrica.title}
                  </li>
                );
              })}
            </ol>
          </div>
          <div>
            <div
              className={`${sectionStyles.sectionHeader}`}
            >
              Роли
            </div>
            <ol
              className={`${sectionStyles.sectionList}`}
            >
              {tableRegistry?.roles.map((role, index) => {
                if (!role.initiative_activate) return null;
                return (
                  <li key={role.id}>
                    {role.name}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </SectionContent>
    </div>
  )
}
