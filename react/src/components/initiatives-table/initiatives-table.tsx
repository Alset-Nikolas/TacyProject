import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './initiatives-table.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { TInitiative } from "../../types";
import { getInitiativeByIdThunk } from "../../redux/initiatives-slice";

export default function InitiativesTable() {
  const dispatch = useAppDispatch();
  const initiativesList = useAppSelector((store) => store.initiatives.list);
  const initiative = useAppSelector((store) => store.initiatives.initiative);
  const components = useAppSelector((store) => store.components.value);
  const project = useAppSelector((store) => store.state.project.value);

  // if (!components) return null;

  const onInitiativeClickHandler = (initiative: TInitiative) => {
    
    dispatch(getInitiativeByIdThunk(initiative.initiative.id));
  }

  return (
    <div className={`${sectionStyles.wrapperBorder} ${styles.wrapper}`}>
        <SectionHeader>
          Таблица инициатив
        </SectionHeader>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th
                  className={`${styles.number}`}
                >
                  №
                </th>
                <th>
                  Название инициативы
                </th>
                <th>
                  Статус
                </th>
                {components && components.table_registry.properties.map((propertie, index) => (
                  propertie.initiative_activate ? (
                    <th key={`${index}_${propertie.id}`}>
                      {propertie.title}
                    </th>
                  ) : (
                    null
                  )
                ))}
                {components && components.table_registry.metrics.map((metric, index) => (
                  metric.initiative_activate ? (
                    <th key={`${index}_${metric.id}`}>
                      {metric.title}
                    </th>
                  ) : (
                    null
                  )
                ))}
              </tr>
            </thead>
            <tbody>
              {/* {!initiativesList.length && (
                <div>
                  Список инициатив пуст
                </div>
              )} */}
              {initiativesList.map((item, index) => {
                const isActive = initiative?.initiative.id === item.initiative.id;
                return (
                  <tr
                    key={item.initiative.id}
                    className={`${styles.tableRow} ${isActive ? styles.activeRow : ''}`}
                    onClick={() => onInitiativeClickHandler(item)}
                  >
                    <td
                      className={`${styles.number}`}
                    >
                      {item.initiative.id}
                    </td>
                    <td>
                      {item.initiative.name}
                    </td>
                    <td>
                      {/* {item.initiative.current_state} */}
                      {item.initiative.status?.name}
                    </td>
                    {item.properties_fields.map((propertie) => (
                      propertie.title.initiative_activate ? (
                        <td key={`${index}_${propertie.id}`}>
                          {propertie.value === null ? '' : propertie.value.value}
                        </td>
                      ) : (
                        null
                      )
                    ))}
                    {item.metric_fields.map((metric) => (
                      metric.metric.initiative_activate ? (
                        <td key={`${index}_${metric.metric.id}`}>
                          {metric.value}
                        </td>
                      ) : (
                        null
                      )
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!initiativesList.length && (
            <div style={{ textAlign: 'center', margin: '20px 0 0 0'}}>
              Таблица пуста
            </div>
          )}
        </div>
      </div>
  );
}
