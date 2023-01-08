import { ChangeEvent } from "react";
import { updateTableRegistry } from "../../redux/components-slice";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";

// Styles
import styles from './initiatives-table-configuration.module.scss';

export default function InitiativesTableConfiguration() {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const tableRegistry = useAppSelector((store) => store.components.value?.table_registry);

  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    key: 'properties' | 'metrics',
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

  return (
    <div>
      <SectionHeader
        edit
      >
        Таблица реестра инициатив
      </SectionHeader>
      <div
        className={`${styles.content}`}
      >
        <div>
          <div className={`${styles.addfieldsHeader}`}>
            Постоянные поля
          </div>
          <SectionContent
            edit
          >
            <ol>
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
          </SectionContent>
        </div>
        <div>
          <div
            className={`${styles.colHeader}`}
          >
            Аналитика
          </div>
          <div
            className={`${styles.listWrapper}`}
          >
            {project?.properties.map((propertie, index) => (
              <div key={propertie.id}>
                {propertie.title}
                <input
                  type="checkbox"
                  checked={tableRegistry?.properties[index].initiative_activate}
                  onChange={(e) => handleCheckboxChange(e, index, 'properties')}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div
            className={`${styles.colHeader}`}
          >
            Метрики
          </div>
          <div>
            {project?.metrics.map((metrica, index) => (
              <div key={metrica.title}>
                {metrica.title}
                <input
                  type="checkbox"
                  checked={tableRegistry?.metrics[index].initiative_activate}
                  onChange={(e) => handleCheckboxChange(e, index, 'metrics')}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
