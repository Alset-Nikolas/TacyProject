import { FC, useState } from "react";
import ReactDOM from 'react-dom';
import CustomizedButton from "../button/button";
import SelectFiles from "../select-files/select-files";
import SelectRoles from "../select-roles/select-roles";
import SelectUnits from "../select-units/select-units";
import CustomizedSelect from "../select/Select";

import styles from './initiatives-filter.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { useGetComponentsQuery, useGetProjectInfoQuery, useGetTeamListQuery, useLazyGetSortedInitiativesQuery } from "../../redux/state/state-api";
import { useAppSelector } from "../../utils/hooks";
import { TPropertie } from "../../types";
import { SelectChangeEvent } from "@mui/material";

type TInitiativesFilterProps = {
  setIsShowFilteredList: any;
  filesList: any;
  parentElement: HTMLDivElement | null;
  sortInitiatives: any;
  closeFilter: () => void;
}

const InitiativesFilter:FC<TInitiativesFilterProps> = ({ setIsShowFilteredList, filesList, sortInitiatives, parentElement, closeFilter }) => {
  const portalDiv = document.getElementById('modal-root')!;
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
  const getPropertiesForQuery = () => {
    let queryParam = '';
    filterProperties.forEach((property) => {
      property.selectedItems.forEach((item) => {
        queryParam += `${property.id},${item.id};`
      });
    });

    return queryParam;
  };

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

  const parentRect = parentElement?.getBoundingClientRect();
  const topOffset = parentRect ? parentRect.top : 0;
  const leftOffset = parentRect ? parentRect.left : 0;
  const rightOffset = parentRect ? parentRect?.right - parentRect?.width : 0

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
    closeFilter();
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
    </div>,
    portalDiv
  );
}

export default InitiativesFilter;