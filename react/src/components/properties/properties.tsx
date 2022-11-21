import { ChangeEvent, ChangeEventHandler } from 'react';
import Pictogram from '../pictogram/pictogram';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import inputStyles from '../../styles/inputs.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { updateProjectState } from '../../redux/state-slice';
import { addPropertie, addPropertieValue, handlePropertieInutChange, isPropertie, isPropertieEdit, removePropertie, removePropertieValue } from '../../utils';

// Styles
import styles from './properties.module.scss';
import CustomizedButton from '../button/button';

type TPropertiesProps = {
  edit?: boolean;
  onChange?: ChangeEventHandler;
};

export default function Properties({
  edit,
}: TPropertiesProps) {
  const project = useAppSelector((store) => store.state.project.value);
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
    if (!isPropertieEdit(projectForEdit.properties)) return null;
    return (
      <section className={`${styles.wrapper} ${styles.edit}`}>
        <div className={`${styles.header} ${styles.edit}`}>
          Ёмкости проекта
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
                  type="delete"
                  cursor="pointer"
                  onClick={() => removePropertie(index, projectForEdit, 'properties', dispatch)}
                />
              </div>
              <label>

              </label>
              <input
                className={`${inputStyles.textInput} ${styles.input}`}
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
              {el.values.map((itemProp: string, itemIndex: number) => (
                <div key={`prop_${index}_${itemIndex}`}>
                  <input
                    className={`${inputStyles.textInput} ${styles.input}`}
                    value={itemProp}
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
                  <Pictogram
                    type={`${itemIndex === el.values.length - 1 ? 'add' : 'delete'}`}
                    cursor="pointer"
                    onClick={itemIndex === el.values.length - 1 ?
                      () => addPropertieValue(projectForEdit, index, dispatch)
                      :
                      () => removePropertieValue(projectForEdit, el.title, itemIndex, dispatch)}
                  />
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
        Ёмкости проекта
      </SectionHeader>
      <div className={`${styles.contentWrapper}`}>
        {!project.properties.length && (
          <SectionContent>Ёмкости отсутствуют</SectionContent>
        )}
        {project.properties.map((propertie) => (
          <SectionContent
            className={`${styles.propertieWrapper}`}
            key={propertie.id}
          >
            <div>
              {propertie.title}
            </div>
            {propertie.items.map((item) => <div key={item.id}>{item.value}</div>)}
          </SectionContent>
        ))}
      </div>
    </section>
  );
}
