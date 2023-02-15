import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useAppDispatch,
  useAppSelector
} from "../../utils/hooks";
import SectionHeader from "../section/section-header/section-header";
import { TInitiative } from "../../types";
import { setCurrentInitiativeId } from "../../redux/initiatives-slice";
import {
  useGetComponentsQuery,
  useGetFilesSettingsQuery,
  useGetProjectInfoQuery,
  useLazyGetExportUrlQuery,
  useLazyGetSortedInitiativesQuery
} from "../../redux/state/state-api";
import Pictogram from "../pictogram/pictogram";
import { paths, REACT_APP_BACKEND_BASE_URL } from "../../consts";
import { InitiativeTableHoverPopup } from "../initiative-table-hover-popup/initiative-table-hover-popup";
import { InitiativeTableHoverFilePopup } from "../initiative-table-hover-file-popup/initiative-table-hover-file-popup";
import CustomizedButton from "../button/button";
import { useGetAuthInfoByIdQuery } from "../../redux/auth/auth-api";
import { useLocation, useNavigate } from "react-router-dom";
import InitiativesFilter from "../initiatives-filter/initiatives-filter";

// Styles
import styles from './initiatives-table.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
//

type TInitiativesTableProps = {
  externalInitiativesList: Array<TInitiative>;
  addButton?: boolean;
};

export default function InitiativesTable({ externalInitiativesList, addButton }: TInitiativesTableProps) {
  const localion = useLocation();
  const isPersonal = localion.pathname.includes('personal-stats');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentInitiativeId } = useAppSelector((store) => store.initiatives);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const [ getUrl, { isSuccess: isUrlReady, data: exportData } ] = useLazyGetExportUrlQuery();
  const { data: filesSettings} = useGetFilesSettingsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [filesList, setFilesList] = useState<Array<{id: number, title: string}>>([]);
  const [isShowFilter, setIsShowFilter] = useState(false);
  
  const { data: user } = useGetAuthInfoByIdQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  
  const [isShowFilteredList, setIsShowFilteredList] = useState(false);
  const [
     sortInitiatives,
    {
      isSuccess: isSortQuerySuccess,
      isError: isSortQueryFailed,
      data: sortedInitiatives,
    }
   ] = useLazyGetSortedInitiativesQuery();
  const [initiativesList, setInitiativesList] = useState(isShowFilteredList && sortedInitiatives ? sortedInitiatives.project_initiatives : externalInitiativesList);
  const [isShowPopup, setIsShowPopup] = useState<Array<Array<boolean>>>(initiativesList ? initiativesList.map((initiative) => {
    const arrayOfRoleFlags = initiative.roles.map(() => false);
    return arrayOfRoleFlags;
  }) : []);
  const [isShowFileStatusPopup, setIsShowFileStatusPopup] = useState<Array<boolean>>(initiativesList ? initiativesList.map(() => false) : []);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const onInitiativeClickHandler = (initiative: TInitiative) => {
    dispatch(setCurrentInitiativeId(initiative.initiative.id));
  }

  const makeLink = () => {
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

  const exportHandler = () => {
    if (isUrlReady) {
      makeLink();
    } else {
      if (currentId) getUrl(currentId);
    }
  };

  const roleMouseEnterHandler = (initiativeIndex: number, roleIndex: number) => {
    setIsShowPopup((prevState) => {
      const newState = [...prevState];
      if (newState.length && newState[initiativeIndex] && newState[initiativeIndex].length) newState[initiativeIndex][roleIndex] = true;
      return newState;
    });
  }

  const roleMouseLeaveHandler = (initiativeIndex: number, roleIndex: number) => {
    setIsShowPopup((prevState) => {
      const newState = [...prevState];
      if (newState.length && newState[initiativeIndex] && newState[initiativeIndex].length) newState[initiativeIndex][roleIndex] = false;
      return newState;
    });
  }

  const fileStatusMouseEnterHandler = (initiativeIndex: number) => {
    setIsShowFileStatusPopup((prevState) => {
      const newState = [...prevState];
      if (newState.length && typeof newState[initiativeIndex] !== 'undefined') newState[initiativeIndex] = true;
      return newState;
    });
  }

  const fileStatusMouseLeaveHandler = (initiativeIndex: number) => {
    setIsShowFileStatusPopup((prevState) => {
      const newState = [...prevState];
      if (newState.length && newState[initiativeIndex]) newState[initiativeIndex] = false;
      return newState;
    });
  }

  const onFilterClick = () => {
    setIsShowFilter(!isShowFilter);
  };

  const onAddClickHandler = () => {
    navigate(`/${paths.registry}/add`);
  };

  useEffect(() => {
    const newFilesList = [] as typeof filesList;
    filesSettings?.forEach((item) => {
      item.settings_file.forEach((file) => {
        newFilesList.push({
          id: file.id,
          title: file.title,
        });
      })
    })
    setFilesList(newFilesList);
  }, [filesSettings])

  useEffect(() => {
    if (isUrlReady) {
      makeLink();
    }
  }, [isUrlReady]);

  useEffect(() => {
    setIsShowPopup(initiativesList ? initiativesList.map((initiative) => {
      const arrayOfRoleFlags = initiative.roles.map(() => false);
      return arrayOfRoleFlags;
    }) : []);
    setIsShowFileStatusPopup(initiativesList ? initiativesList.map(() => false) : []);
  }, [initiativesList]);

  useEffect(() => {
    setInitiativesList(isShowFilteredList && sortedInitiatives ? sortedInitiatives.project_initiatives : externalInitiativesList);

  }, [externalInitiativesList, sortedInitiatives]);

  return (
    <div
      className={`${sectionStyles.wrapperBorder} ${styles.wrapper}`}
      ref={tableWrapperRef}
    >
        <SectionHeader
          className={`${styles.tableHeader}`}
        >
            <div>
              Список инициатив
            </div>
            <div
              className={`${styles.tableControls}`}
            >
              <button
                className={`${styles.filterButton}`}
                onClick={onFilterClick}
              >
                Фильтр
                <div>
                  <Pictogram
                    type={isShowFilter ? 'hide' : 'show'}
                    cursor="pointer"
                  />
                </div>
              </button>
              {isShowFilter && (
                <InitiativesFilter
                  setIsShowFilteredList={setIsShowFilteredList}
                  filesList={filesList}
                  parentElement={tableWrapperRef.current}
                  sortInitiatives={sortInitiatives}
                  closeFilter={() => setIsShowFilter(false)}
                />
              )}
              {!isPersonal && (
                // <Tooltip
                //   title="Экспортировать"
                //   placement="bottom-start"
                // >
                  <Pictogram
                    type="export"
                    cursor="pointer"
                    onClick={exportHandler}
                  />
                // </Tooltip>
              )}
            </div>
        </SectionHeader>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr
                className={styles.tableHead}
              >
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
                <th
                  className={`${styles.filesStatusCell}`}
                >
                  Статус файлов
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
                {components && components.table_registry.metrics.map((metric, index) => {
                  const foundMetric = project ? project.metrics.find((item) => item.id === metric.id) : undefined;
                  return (
                    metric.initiative_activate && foundMetric?.is_aggregate ? (
                      <th
                        key={`${index}_${metric.id}`}
                        className={`${styles.tableCol}`}
                      >
                        {metric.title},
                        &nbsp;
                        {(!foundMetric?.is_percent && foundMetric?.units !== 'бм') ? foundMetric?.units : ''}
                        {foundMetric?.is_percent && '%'}
                      </th>
                    ) : (
                      null
                    )
                  );
                })}
                {components && components.table_registry.roles.map((item) => {
                  if (!item.initiative_activate) return null;
                  return (
                  <th
                    key={item.id}
                    className={`${styles.tableCol}`}
                  >
                    {item.name}
                  </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {initiativesList.map((item, index) => {
                const isActive = currentInitiativeId === item.initiative.id;
                const isFilesUpload = () => {
                  let isUploaded = true;
                  item.files.forEach((el) => {
                    const fileStatus = components?.settings?.initiative_status.find((status) => status.id === el.title.id);
                    if (!el.file ||
                      (item.initiative.status &&
                      fileStatus &&
                      item.initiative.status.value > 0 &&
                      item.initiative.status.value > fileStatus.value)
                    ) isUploaded = false;
                  });
                  return isUploaded;
                };
                return (
                  <tr
                    key={item.initiative.id}
                    className={`${styles.tableRow} ${(index % 2) ? styles.oddRow : styles.evenRow} ${isActive ? styles.activeRow : ''}`}
                    onClick={() => onInitiativeClickHandler(item)}
                  >
                    <td
                      className={`${styles.number}`}
                    >
                      {index+1}
                    </td>
                    <td
                      className={`${styles.initiativeName}`}
                    >
                      {item.initiative.name}
                    </td>
                    <td>
                      {item.initiative.status?.name}
                    </td>
                    <td
                      className={`${styles.filesStatusCell}`}
                      id={`file-status-${index}`}
                      onMouseEnter={() => fileStatusMouseEnterHandler(index)}
                      onMouseLeave={() => fileStatusMouseLeaveHandler(index)}
                    >
                      <div
                        className={`${styles.statusIndicator} ${isFilesUpload() ? styles.statusApproved : styles.statusNotApproved}`}
                      />
                      {!!isShowFileStatusPopup.length && !!isShowFileStatusPopup[index] && (
                        <InitiativeTableHoverFilePopup
                          files={item.files}
                          initiativeIndex={index}
                          parent={tableWrapperRef.current}
                        />
                      )}
                    </td>
                    {item.properties_fields.map((propertie) => (
                      propertie.title.initiative_activate ? (
                        <td
                          key={`${index}_${propertie.id}`}
                          className={`${styles.tableCol}`}
                        >
                          {propertie.values.length === null ? '' : propertie.values.map((item) => item.value).join(', ')}
                        </td>
                      ) : (
                        null
                      )
                    ))}
                    {components && components.table_registry.metrics.map((metric) => {
                      const foundMetric = item.metric_fields.find((el) => el.metric.id === metric.id);
                      const metricFromProject = project ? project.metrics.find((el) => el.id === metric.id) : undefined;

                      return (
                        metric.initiative_activate && metricFromProject?.is_aggregate ? (
                          <td key={`${index}_${metric.id}`}>
                            {metricFromProject.is_percent ? (
                              <>
                                {(typeof foundMetric?.value === 'number') ? Math.round(foundMetric?.value * 100) : 'NaN'}
                              </>
                            ) : (
                              <>
                                {foundMetric?.value}
                              </>
                            )}
                          </td>
                        ) : (
                          null
                        )
                      );
                    })}
                    {components && components.table_registry.roles.map((role, roleIndex) => {
                      const currentRole = item.roles.find((el) => el.role.id === role.id);
                      const memberNames = currentRole?.community.map((el) => `${el.user_info?.user.last_name} ${el.user_info?.user.first_name[0]}. ${el.user_info?.user.second_name[0]}.`);
                      if (!currentRole || !role.initiative_activate) return null;
                      return (
                      <td
                        key={role.id}
                        className={`${styles.userRole}`}
                        id={`role-${index}-${roleIndex}`}
                        onMouseEnter={() => roleMouseEnterHandler(index, roleIndex)}
                        onMouseLeave={() => roleMouseLeaveHandler(index, roleIndex)}
                      >
                        {memberNames?.join('/')}
                        {!!isShowPopup.length && !!isShowPopup[index] && !!isShowPopup[index].length && isShowPopup[index][roleIndex] && (
                          <InitiativeTableHoverPopup
                            community={currentRole.community}
                            initiativeIndex={index}
                            roleIndex={roleIndex}
                            parent={tableWrapperRef.current}
                          />
                        )}
                      </td>
                      );
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!initiativesList.length && (
            <div style={{ textAlign: 'center', margin: '20px 0 20px 0'}}>
              Таблица пуста
            </div>
          )}
        </div>
        {(user && user.user_flags_in_project?.is_create || user?.user.is_superuser) && !isPersonal && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 25px'}}>
            <CustomizedButton
              value="Добавить"
              color="blue"
              onClick={onAddClickHandler}
              disabled={!project?.id}
            />
          </div>
        )}
      </div>
  );
}
