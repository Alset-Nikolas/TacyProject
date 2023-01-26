import { useEffect, useState } from "react";
import { SelectChangeEvent, Tooltip } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
import { TInitiative, TPropertie } from "../../types";
import { getInitiativeByIdThunk, setCurrentInitiativeId } from "../../redux/initiatives-slice";
import {
  useGetComponentsQuery,
  useGetExportUrlQuery,
  useGetFilesSettingsQuery,
  useGetInitiativeFilesQuery,
  useGetProjectInfoQuery,
  useGetSortedInitiativesQuery,
  useLazyGetExportUrlQuery,
  useLazyGetSortedInitiativesQuery
} from "../../redux/state/state-api";
import Pictogram from "../pictogram/pictogram";
import { REACT_APP_BACKEND_BASE_URL } from "../../consts";
import { InitiativeTableHoverPopup } from "../initiative-table-hover-popup/initiative-table-hover-popup";
import { InitiativeTableHoverFilePopup } from "../initiative-table-hover-file-popup/initiative-table-hover-file-popup";
import SelectUnits from "../select-units/select-units";
import CustomizedButton from "../button/button";
import CustomizedSelect from "../select/Select";
import SelectRoles from "../select-roles/select-roles";
import { useGetTeamListQuery } from "../../redux/state/state-api";

// Styles
import styles from './initiatives-table.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import SelectFiles from "../select-files/select-files";

type TInitiativesTableProps = {
  externalInitiativesList: Array<TInitiative>;
};

export default function InitiativesTable({ externalInitiativesList }: TInitiativesTableProps) {
  const dispatch = useAppDispatch();
  const { currentInitiativeId } = useAppSelector((store) => store.initiatives);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const { data: teamList } = useGetTeamListQuery({ id: currentId ? currentId : -1, project: project ? project : null });
  const [ getUrl, { isSuccess: isUrlReady, data: exportData } ] = useLazyGetExportUrlQuery();
  const { data: filesSettings} = useGetFilesSettingsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [filesList, setFilesList] = useState<Array<{id: number, title: string}>>([]);
  const [isShowFilter, setIsShowFilter] = useState(false);
  const [
    filterProperties,
    setfilterProperties
  ] = useState<Array<TPropertie & {selectedItems: Array<{
    id: number;
    value: string;
    propertie: number;
  }>}>>(project ? project.properties.map((property) => {
    return {
      ...property,
      selectedItems: [],
    }
  }) : []);
  const [sortMetrics, setSortMetrics] = useState<{
    metric: {
      id: number;
      name: string;
    };
    type: {
      title: string;
      value: number;
    }
  }>({
    metric: {
      id: -1,
      name: 'Не выбрано',
    },
    type: {
      title: 'По возрастанию',
      value: 0,
    }
  });
  const [statusFilter, setStatusFilter] = useState<Array<{id: number, name: string}>>([]);
  const [isSortQuery, setIsSortQuery] = useState(false);
  const [initiativeFilter, setInitiativeFilter] = useState('');
  const [rolesFilter, setRolesFilter] = useState<Array<{role: number, items: Array<{id: number, item: string}>}>>(project ? project.roles.map((role) => {return {role: role.id, items: []}}) : []);
  const [filesFilter, setFilesFilter] = useState<Array<{ title: string, id: number }>>([]);

  const getRolesForQuery = () => {
    let queryParam = '';
    rolesFilter.forEach((role) => {
      role.items.forEach((item) => {
        // queryParam += `${role.role},${item.id};`
        queryParam += `${item.id},${role.role};`
      });
    });

    return queryParam;
  };
  const getPropertiesForQuery = () => {
    let queryParam = '';
    filterProperties.forEach((property) => {
      property.selectedItems.forEach((item) => {
        queryParam += `${property.id},${item.id};`
      });
    });

    return queryParam;
  };
  const [isShowFilteredList, setIsShowFilteredList] = useState(false);
  const [
     sortInitiatives,
    {
      isSuccess: isSortQuerySuccess,
      isError: isSortQueryFailed,
      data: sortedInitiatives,
    }
   ] = useLazyGetSortedInitiativesQuery();
  // const {
  //   data: sortedInitiatives,
  //   isSuccess: isSortQuerySuccess,
  //   isError: isSortQueryFailed,
  // } = useGetSortedInitiativesQuery({
  //   id:  currentId ? currentId : -1,
  //   name: initiativeFilter,
  //   status: statusFilter.map((el) => el.id),
  //   roles: getRolesForQuery(),
  //   properties: getPropertiesForQuery(),
  //   metrics: sortMetrics.metric.id !== -1 ?`${sortMetrics.metric.id},${sortMetrics.type.value}` : '',
  // }, {
  //   skip: !isSortQuery || !currentId,
  // });
  const initiativesList = isShowFilteredList && sortedInitiatives ? sortedInitiatives.project_initiatives : externalInitiativesList;
  const [isShowPopup, setIsShowPopup] = useState<Array<Array<boolean>>>(initiativesList ? initiativesList.map((initiative) => {
    const arrayOfRoleFlags = initiative.roles.map(() => false);
    return arrayOfRoleFlags;
  }) : []);
  const [isShowFileStatusPopup, setIsShowFileStatusPopup] = useState<Array<boolean>>(initiativesList ? initiativesList.map(() => false) : []);

  const onInitiativeClickHandler = (initiative: TInitiative) => {
    dispatch(setCurrentInitiativeId(initiative.initiative.id));
    
    // dispatch(getInitiativeByIdThunk(initiative.initiative.id));
  }

  const exportHandler = () => {
    if (currentId) getUrl(currentId);
    
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

  const applyFilter = () => {
    sortInitiatives({
      id:  currentId ? currentId : -1,
      name: initiativeFilter,
      status: statusFilter.map((el) => el.id),
      roles: getRolesForQuery(),
      properties: getPropertiesForQuery(),
      metrics: sortMetrics.metric.id !== -1 ?`${sortMetrics.metric.id},${sortMetrics.type.value}` : '',
      files: filesFilter.map((el) => el.id),
    });
    // setIsSortQuery(true);
    setIsShowFilteredList(true);
  };

  const onPropertyFilterChange = (e: SelectChangeEvent<string[]>, propertyIndex: number) => {
    const value = e.target.value as string[];
    setfilterProperties((prevState) => {
      const newState = [...prevState];
      const currentProperty = { ...newState[propertyIndex] };
      const newSelectedItems = [] as typeof currentProperty.selectedItems;
      value.forEach((el) => {
        const foundItem = currentProperty.items.find((item) => item.value === el);
        if (foundItem) newSelectedItems.push(foundItem);
      });
      currentProperty.selectedItems = newSelectedItems;
      newState[propertyIndex] = currentProperty;
      return newState;
    })
    
  };

  const onMetricSortChange = (e: SelectChangeEvent<string>) => {
    setSortMetrics((prevState) => {
      const newState ={...prevState};
      const foundMetric = project?.metrics.find((metric) => metric.title === e.target.value);
      if (foundMetric) {
        newState.metric = {
          id: foundMetric.id,
          name: foundMetric.title,
        };
      } else {
        newState.metric = {
          id: -1,
          name: 'Не выбрано',
        };
      }
      return newState;
    });
  };

  const onMetricSortTypeChange = (e: SelectChangeEvent<string>) => {
    setSortMetrics((prevState) => {
      const newState ={...prevState};
      newState.type = {
        title: e.target.value,
        value: e.target.value === 'По возрастанию' ? 0 : 1,
      };
      return newState;
    });
  };

  const onStatusFilterChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[];
      const newStatuses = value.map((statusName) => {
        const foundStatus = components?.settings?.initiative_status.find((item) => item.name === statusName);

        if (!foundStatus) return {
          id: -1,
          name: 'error',
        }

        return {
          id: foundStatus.id,
          name: foundStatus.name,
        }
      })
      setStatusFilter(newStatuses);
  };

  const onRoleFilterChange = (e: SelectChangeEvent<string[]>, roleId: number) => {
    const value = e.target.value as string[];
    const newValues = value.map((item) => {
      const itemObject = JSON.parse(item) as {id: number, name: string};
      return {
        id: itemObject.id,
        item,
      };
    })
    setRolesFilter((prevState) => {
      const newState = [...prevState];
      const foundIndex = newState.findIndex((item) => item.role === roleId);

      if (foundIndex !== -1) newState[foundIndex] = { role: roleId, items: newValues };
      return newState;
    });
  };

  const onFileleFilterChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[];

    const newValues = value.map((item) => {
      const itemObject = JSON.parse(item) as {id: number, title: string};
      return itemObject;
    });

    setFilesFilter(newValues);
  }

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
    if (isSortQuerySuccess || isSortQueryFailed) setIsSortQuery(false);
  }, [isSortQuerySuccess, isSortQueryFailed])

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

  useEffect(() => {
    setIsShowPopup(initiativesList ? initiativesList.map((initiative) => {
      const arrayOfRoleFlags = initiative.roles.map(() => false);
      return arrayOfRoleFlags;
    }) : []);
    setIsShowFileStatusPopup(initiativesList ? initiativesList.map(() => false) : []);
  }, [initiativesList])

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
              <button
                className={`${styles.filterButton}`}
                onClick={onFilterClick}
              >
                Фильтр
                <div>
                  <Pictogram
                    type="show"
                    cursor="pointer"
                  />
                </div>
              </button>
              {isShowFilter && (
                <div
                  className={`${styles.filterPopup}`}
                >
                  <div
                    className={`${styles.filtersInputsWrapper}`}
                  >
                    <div
                      className={`${styles.filterRow}`}
                    >
                      <div
                        className={`${styles.singleFilter}`}
                      >
                        Название инициативы
                        <input
                          className={`${inputStyles.textInput}`}
                          value={initiativeFilter}
                          onChange={(e) => setInitiativeFilter(e.target.value)}
                        />
                      </div>
                      <div
                        className={`${styles.singleFilter}`}
                      >
                        Статус
                        <SelectUnits
                          value={statusFilter.map((item) => item.name)}
                          items={components && components.settings ? components.settings?.initiative_status.map((item) => item.name) : []}
                          onChange={(e) => onStatusFilterChange(e)}
                        />
                      </div>
                    </div>
                    <div
                      className={`${styles.filterRow}`}
                    >
                    {filterProperties.map((property, index) => (
                      <div
                        key={`filter-${property.id}`}
                        className={`${styles.singleFilter}`}
                      >
                        {property.title}
                        <SelectUnits
                          value={property.selectedItems.map((item) => item.value)}
                          items={property.items.map((item) => item.value)}
                          onChange={(e) => onPropertyFilterChange(e, index)}
                        />
                      </div>
                    ))}
                    </div>
                    <div
                      className={`${styles.filterRow}`}
                    >
                    {project && (
                      <div
                        style={{
                          display: 'flex',
                          gap: 20,
                        }}
                      >
                        {/* {metric.title} */}
                        <div
                          className={`${styles.singleFilter}`}
                        >
                          Метрики
                          <CustomizedSelect
                            value={sortMetrics.metric.name}
                            items={[...project.metrics.map(metric => metric.title), 'Не выбрано']}
                            onChange={onMetricSortChange}
                          />
                        </div>
                        <div
                          className={`${styles.singleFilter}`}
                        >
                          Сортировать
                          <CustomizedSelect
                            value={sortMetrics.type.title}
                            items={['По возрастанию', 'По убыванию']}
                            onChange={onMetricSortTypeChange}
                          />
                        </div>
                      </div>
                    )}
                    </div>
                    <div
                      className={`${styles.filterRow}`}
                    >
                    {project?.roles.map((item) => {
                      const value = rolesFilter.find((filterItem) => filterItem.role === item.id);
                      return (
                        <div
                          key={item.id}
                          className={`${styles.singleFilter}`}
                        >
                          {item.name}
                          <SelectRoles
                            value={value ? value.items.map((el) => el.item) : []}
                            items={teamList}
                            onChange={(e) => onRoleFilterChange(e, item.id)}
                          />
                        </div>
                      )
                    })}
                    </div>
                    <div
                      className={`${styles.filterRow}`}
                    >

                        <div
                          className={`${styles.singleFilter}`}
                        >
                          Документы
                          <SelectFiles
                            value={filesFilter.map((el) => JSON.stringify(el))}
                            items={filesList}
                            onChange={(e) => onFileleFilterChange(e)}
                          />
                        </div>
                      
                    
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: 20,
                    }}
                  >
                    <CustomizedButton
                      value="Применить"
                      color="blue"
                      onClick={() => applyFilter()}
                    />
                  </div>
                </div>
              )}
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
                  className={`${styles.tableCol}`}
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
              {/* {!initiativesList.length && (
                <div>
                  Список инициатив пуст
                </div>
              )} */}
              {initiativesList.map((item, index) => {
                const isActive = currentInitiativeId === item.initiative.id;
                const isFilesUpload = () => {
                  let isUploaded = true;
                  item.files.forEach((el) => {
                    if (!el.file) isUploaded = false;
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
                    {item.metric_fields.map((metric) => (
                      metric.metric.initiative_activate ? (
                        <td key={`${index}_${metric.metric.id}`}>
                          {metric.value}
                        </td>
                      ) : (
                        null
                      )
                    ))}
                    {item.roles.map((item, roleIndex) => {
                      const memberNames = item.community.map((el) => `${el.user_info?.user.last_name} ${el.user_info?.user.first_name[0]}. ${el.user_info?.user.second_name[0]}.`);
                      if (!item.role.initiative_activate) return null;
                      return (
                      <td
                        key={item.role.id}
                        className={`${styles.userRole}`}
                        id={`role-${index}-${roleIndex}`}
                        onMouseEnter={() => roleMouseEnterHandler(index, roleIndex)}
                        onMouseLeave={() => roleMouseLeaveHandler(index, roleIndex)}
                      >
                        {/* <ModalHover onHover={<h3>Hello World</h3>}>
                          <div> */}
                            {memberNames.join('/')}
                          {/* </div>
                        </ModalHover> */}
                        {!!isShowPopup.length && !!isShowPopup[index] && !!isShowPopup[index].length && isShowPopup[index][roleIndex] && (
                          <InitiativeTableHoverPopup
                            community={item.community}
                            initiativeIndex={index}
                            roleIndex={roleIndex}
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
            <div style={{ textAlign: 'center', margin: '20px 0 0 0'}}>
              Таблица пуста
            </div>
          )}
        </div>
      </div>
  );
}
