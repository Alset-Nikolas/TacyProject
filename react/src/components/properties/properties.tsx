import { ChangeEvent, ChangeEventHandler } from 'react';
import Pictogram from '../pictogram/pictogram';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import inputStyles from '../../styles/inputs.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { updateProjectState } from '../../redux/state/state-slice';
import { addPropertie, addPropertieValue, handlePropertieInutChange, isPropertie, isPropertieEdit, removePropertie, removePropertieValue } from '../../utils';

// Styles
import styles from './properties.module.scss';
import CustomizedButton from '../button/button';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';

type TPropertiesProps = {
  edit?: boolean;
  onChange?: ChangeEventHandler;
};

export default function Properties({
  edit,
}: TPropertiesProps) {
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const dispatch = useAppDispatch();

  const clearMetrics = () => {
    dispatch(updateProjectState({
      metrics: []
    }));
  };
  if (!project) return null;

  if (edit) {
    if (!projectForEdit) return null;
    // if (!isPropertieEdit(projectForEdit.properties)) return null;
    return (
      <section className={`${styles.wrapper} ${styles.edit}`}>
        <div className={`${styles.header} ${styles.edit}`}>
          Атрибуты инициатив
          <CustomizedButton
            value="Добавить"
            onClick={() => addPropertie(projectForEdit, 'properties', dispatch)}
          />
        </div>
        <div className={`${styles.content}`}>
          {/* <div  className={`${styles.closeButton}`}>
            <Pictogram
              type="delete"
              cursor="pointer"
              onClick={clearMetrics}
            />
          </div> */}
          {projectForEdit.properties.map((el: any, index:number) => (
            <div
              className={`${styles.propertieWrapper} ${styles.edit}`}
              key={`prop_${index}`}
            >
              <div
                className={`${styles.closeButton}`}
              >
                <Pictogram
                  type="delete-filled"
                  cursor="pointer"
                  onClick={() => removePropertie(index, projectForEdit, 'properties', dispatch)}
                />
              </div>
              <label>

              </label>
              <input
                className={`${inputStyles.textInput} ${styles.input} ${styles.titleInput}`}
                value={el.title}
                placeholder="Название"
                name='title'
                onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(
                  index,
                  projectForEdit,
                  'properties',
                  'title',
                  e.target.value,
                  dispatch
                )}
              />
              {/* {!el.values.length && (
                <div>
                <CustomizedButton
                  value="Добавить"
                  onClick={() => addPropertieValue(projectForEdit, index, dispatch)}

                />
                </div>
              )} */}
              {el.values.map((itemProp: { id: number, value: string, value_short: string }, itemIndex: number) => (
                <div
                  key={`prop_${itemProp.id}_${itemIndex}`}
                  className={`${styles.propertieValueWrapper}`}
                >
                  <div
                    className={`${styles.value}`}
                  >
                  <input
                    className={`${inputStyles.textInput} ${styles.input}`}
                    value={itemProp.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(
                      index,
                      projectForEdit,
                      'properties',
                      'values',
                      e.target.value,
                      dispatch,
                      itemIndex,
                    )}
                  />
                  </div>
                  <div
                    className={`${styles.short}`}
                  >
                  <input
                    className={`${inputStyles.textInput} ${styles.input}`}
                    value={itemProp.value_short}
                    placeholder="Cокращение"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(
                      index,
                      projectForEdit,
                      'properties',
                      'values_short',
                      e.target.value,
                      dispatch,
                      itemIndex,
                    )}
                  />
                  </div>
                  <div
                    className={`${styles.control}`}
                  >
                    {(itemIndex !== 0 || el.values.length > 1) && (
                      <div style={{ marginRight: '15px' }}>
                        <Pictogram
                          type="delete"
                          cursor="pointer"
                          onClick={() => removePropertieValue(projectForEdit, el.title, itemIndex, dispatch)}
                        />
                      </div>
                    )}
                    {(itemIndex === el.values.length - 1) && (

                    <div>
                      <Pictogram
                        type="add"
                        cursor="pointer"
                        onClick={() => addPropertieValue(projectForEdit, index, dispatch)}
                      />
                    </div>
                    )}
                </div>
                </div>
              ))}
              
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        Атрибуты инициатив
      </SectionHeader>
      <div className={`${styles.contentWrapper}`}>
        {!project.properties.length && (
          <SectionContent>Атрибуты инициатив отсутствуют</SectionContent>
        )}
        {project.properties.map((propertie) => (
          <SectionContent
            className={`${styles.propertieWrapper}`}
            key={propertie.id}
          >
            <div
              className={`${styles.propertieTitle}`}
            >
              {propertie.title}
            </div>
            {propertie.items.map((item) => <div key={item.id}>{item.value}</div>)}
          </SectionContent>
        ))}
      </div>
    </section>
  );
}
