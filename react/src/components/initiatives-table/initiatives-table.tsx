import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './initiatives-table.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { TInitiative } from "../../types";
import { getInitiativeByIdThunk, setCurrentInitiativeId } from "../../redux/initiatives-slice";
import { useGetExportUrlQuery, useGetProjectInfoQuery, useLazyGetExportUrlQuery } from "../../redux/state/state-api";
import { Tooltip } from "@mui/material";
import Pictogram from "../pictogram/pictogram";
import { REACT_APP_BACKEND_BASE_URL } from "../../consts";
import { useEffect } from "react";

type TInitiativesTableProps = {
  initiativesList: Array<TInitiative>;
};

export default function InitiativesTable({ initiativesList }: TInitiativesTableProps) {
  const dispatch = useAppDispatch();
  // const initiativesList = useAppSelector((store) => store.initiatives.list);
  // const initiative = useAppSelector((store) => store.initiatives.initiative);
  // const {
  //   currentInitiativeId
  // } = useAppSelector((store) => store.initiatives);
  // const {
  //   data: initiative,
  //   isFetching: isFetchingInitiative,
  // } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
  //   skip: !currentInitiativeId,
  // });
  const { currentInitiativeId } = useAppSelector((store) => store.initiatives);
  const components = useAppSelector((store) => store.components.value);
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const [ getUrl, { isSuccess: isUrlReady, data: exportData } ] = useLazyGetExportUrlQuery();

  // if (!components) return null;

  const onInitiativeClickHandler = (initiative: TInitiative) => {
    dispatch(setCurrentInitiativeId(initiative.initiative.id));
    
    // dispatch(getInitiativeByIdThunk(initiative.initiative.id));
  }

  const exportHandler = () => {
    if (currentId) getUrl(currentId);
    
  };

  useEffect(() => {
    if (isUrlReady) {
      if (exportData) fetch(`${REACT_APP_BACKEND_BASE_URL}/${exportData.url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })
      .then((response) => response.blob())
      .then((blob) => {
        // Create blob link to download
        const url = window.URL.createObjectURL(
          new Blob([blob]),
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `FileName.xlsx`,
        );
  
        // Append to html link element page
        document.body.appendChild(link);
  
        // Start download
        link.click();
  
        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });
    }
  }, [isUrlReady]);

  return (
    <div className={`${sectionStyles.wrapperBorder} ${styles.wrapper}`}>
        <SectionHeader
          className={`${styles.tableHeader}`}
        >
            <div>
              Список инициатив
            </div>
            <div
              className={`${styles.tableControls}`}
            >
              <div>
                Фильтр
              </div>
              <Tooltip
                title="Экспортировать"
                placement="bottom-start"
              >
                <Pictogram
                  type="export"
                  cursor="pointer"
                  onClick={exportHandler}
                />
              </Tooltip>
            </div>
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
                <th
                  className={`${styles.initiativeName}`}
                >
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
                    <th
                      key={`${index}_${metric.id}`}
                      className={`${styles.tableCol}`}
                    >
                      {metric.title}
                    </th>
                  ) : (
                    null
                  )
                ))}
                {project?.roles.map((item) => (
                  <th
                    key={item.id}
                    className={`${styles.tableCol}`}
                  >
                    {item.name}
                  </th>
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
                const isActive = currentInitiativeId === item.initiative.id;
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
                    <td
                      className={`${styles.initiativeName}`}
                    >
                      {item.initiative.name}
                    </td>
                    <td>
                      {/* {item.initiative.current_state} */}
                      {item.initiative.status?.name}
                    </td>
                    {item.properties_fields.map((propertie) => (
                      propertie.title.initiative_activate ? (
                        <td
                          key={`${index}_${propertie.id}`}
                          className={`${styles.tableCol}`}
                        >
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
                    {item.roles.map((item) => {
                      const memberNames = item.community.map((el) => `${el.user_info?.user.last_name} ${el.user_info?.user.first_name[0]}. ${el.user_info?.user.second_name[0]}.`);
                      return (
                      <td key={item.role.id}>
                        {memberNames.join('/')}
                      </td>
                      );
                    })}
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
