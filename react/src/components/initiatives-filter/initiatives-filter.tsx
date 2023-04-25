import { FC, useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import CustomizedButton from "../button/button";
import SelectFiles from "../select-files/select-files";
import SelectRoles from "../select-roles/select-roles";
import SelectUnits from "../select-units/select-units";
import CustomizedSelect from "../select/Select";

import styles from './initiatives-filter.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { useGetComponentsQuery, useGetProjectInfoQuery, useGetTeamListQuery, useLazyGetSortedInitiativesQuery } from "../../redux/state/state-api";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { TPropertie } from "../../types";
import { SelectChangeEvent } from "@mui/material";
import { setFilesFilter, setfilterProperties, setFilters, setInitiativeFilter, setRolesFilter, setSortMetrics, setStatusFilter } from "../../redux/initiatives-slice";

type TInitiativesFilterProps = {
  setIsShowFilteredList: any;
  filesList: any;
  parentElement: HTMLDivElement | null;
  sortInitiatives: any;
  closeFilter: () => void;
}

const InitiativesFilter:FC<TInitiativesFilterProps> = ({ setIsShowFilteredList, filesList, sortInitiatives, parentElement, closeFilter }) => {
  const portalDiv = document.getElementById('modal-root')!;
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  // const [
  //   sortInitiatives,
  //  {
  //    isSuccess: isSortQuerySuccess,
  //    isError: isSortQueryFailed,
  //    data: sortedInitiatives,
  //  }
  // ] = useLazyGetSortedInitiativesQuery();
  const { data: teamList } = useGetTeamListQuery({ id: currentId ? currentId : -1, project: project ? project : null });

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

  const getApprovedByRolesForQuery = () => {
    let queryParam = '';
    rolesFilter.forEach((role) => {
        // queryParam += `${role.role},${item.id};`
        if (role.isApproved > -1) queryParam += `${role.role},${role.isApproved};`
    });

    return queryParam;
  }

  const getPropertiesForQuery = () => {
    let queryParam = '';
    filterProperties.forEach((property) => {
      property.selectedItems.forEach((item) => {
        queryParam += `${property.id},${item.id};`
      });
    });

    return queryParam;
  };

  const {
    properties: filterProperties,
    metrics: sortMetrics,
    status: statusFilter,
    initiative: initiativeFilter,
    roles: rolesFilter,
    files: filesFilter,
   } = useAppSelector((store) => store.initiatives.filter);

  const parentRect = parentElement?.getBoundingClientRect();
  const topOffset = parentRect ? parentRect.top : 0;
  const leftOffset = parentRect ? parentRect.left : 0;
  const rightOffset = parentRect ? parentRect?.right - parentRect?.width : 0;
  const approveStates = new Map([
    [1, 'Согласовал'],
    [0, 'Не согласовал'],
    [-1, 'Не выбрано'],
  ]);

  const applyFilter = () => {
    sortInitiatives({
      id:  currentId ? currentId : -1,
      name: initiativeFilter,
      status: statusFilter.map((el) => el.id),
      roles: getRolesForQuery(),
      approvedByRoles: getApprovedByRolesForQuery(),
      properties: getPropertiesForQuery(),
      metrics: sortMetrics.metric.id !== -1 ?`${sortMetrics.metric.id},${sortMetrics.type.value}` : '',
      files: filesFilter.map((el) => el.id),
    });
    // setIsSortQuery(true);
    setIsShowFilteredList(true);
    closeFilter();
  };

  const onPropertyFilterChange = (e: SelectChangeEvent<string[]>, propertyIndex: number) => {
    const value = e.target.value as string[];
    const newState = [...filterProperties];
    const currentProperty = { ...newState[propertyIndex] };
    const newSelectedItems = [] as typeof currentProperty.selectedItems;
    value.forEach((el) => {
      const foundItem = currentProperty.items.find((item) => item.value === el);
      if (foundItem) newSelectedItems.push(foundItem);
    });
    currentProperty.selectedItems = newSelectedItems;
    newState[propertyIndex] = currentProperty;
    
    dispatch(setfilterProperties(newState));
  };

  const onMetricSortChange = (e: SelectChangeEvent<string>) => {
    const newState ={...sortMetrics};
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
    dispatch(setSortMetrics(newState));
  };

  const onMetricSortTypeChange = (e: SelectChangeEvent<string>) => {
    const newState ={...sortMetrics};
    newState.type = {
      title: e.target.value,
      value: e.target.value === 'По возрастанию' ? 0 : 1,
      };
      dispatch(setSortMetrics(newState));
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
    });
    dispatch(setStatusFilter(newStatuses));
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
    const newState = [...rolesFilter];
    const foundIndex = newState.findIndex((item) => item.role === roleId);

    if (foundIndex !== -1) newState[foundIndex] = { role: roleId, items: newValues, isApproved: -1 };
    
    dispatch(setRolesFilter(newState));
  };

  const onRoleApproveStateChange = (value: string, roleId: number) => {
    const newState = [...rolesFilter];
    const foundIndex = newState.findIndex((item) => item.role === roleId);
    let isApprovedState = -1;

    if (value === 'Согласовал') isApprovedState = 1;
    if (value === 'Не согласовал') isApprovedState = 0;

    if (foundIndex !== -1) newState[foundIndex] = { ...newState[foundIndex], isApproved: isApprovedState };

    dispatch(setRolesFilter(newState));
  };

  const onFileleFilterChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[];

    const newValues = value.map((item) => {
      const itemObject = JSON.parse(item) as {id: number, title: string};
      return itemObject;
    });

    dispatch(setFilesFilter(newValues));
  }

  const clearFilters = () => {
    const filters = {
      properties: project ? project.properties.map((property) => {
        return {
          ...property,
          selectedItems: [],
        }
      }) : [],
      metrics: {
        metric: {
          id: -1,
          name: 'Не выбрано',
        },
        type: {
          title: 'По возрастанию',
          value: 0,
        }
      },
      status: [],
      initiative: '',
      roles: project ? project.roles.map((role) => {return { role: role.id, items: [], isApproved: -1 }}) : [],
      files: [],
    };

    dispatch(setFilters(filters));
  };

  useEffect(() => {
    if (!rolesFilter.length) dispatch(setRolesFilter(project ? project.roles.map((role) => {return { role: role.id, items: [], isApproved: -1 }}) : []));
    if (!filterProperties.length) dispatch(setfilterProperties(project ? project.properties.map((property) => {
      return {
        ...property,
        selectedItems: [],
      }
    }) : []));
  }, [project]);

  return ReactDOM.createPortal(
    <div
      className={`${styles.filterPopup}`}
      style={{
        top: topOffset+48,
        left: leftOffset,
        right: rightOffset,
      }}
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
              onChange={(e) => dispatch(setInitiativeFilter(e.target.value))}
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
                items={[...project.metrics.filter(metric => metric.is_aggregate).map(metric => metric.title), 'Не выбрано']}
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
              <CustomizedSelect
                value={approveStates.get(value?.isApproved !== undefined ? value.isApproved : -1)}
                items={['Согласовал', 'Не согласовал', 'Не выбрано']}
                onChange={(e) => onRoleApproveStateChange(e.target.value, item.id)}
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
          gap: 40,
        }}
      >
        <CustomizedButton
          value="Сбросить"
          color="transparent"
          onClick={() => clearFilters()}
        />
        <CustomizedButton
          value="Применить"
          color="blue"
          onClick={() => applyFilter()}
        />
      </div>
    </div>,
    portalDiv
  );
}

export default InitiativesFilter;