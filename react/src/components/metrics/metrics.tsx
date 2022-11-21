import { ChangeEvent, ChangeEventHandler } from 'react';
import Pictogram from '../pictogram/pictogram';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import styles from './metrics.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { updateProjectForEdit, updateProjectState } from '../../redux/state-slice';
import { addPropertie, handlePropertieInutChange, removePropertie } from '../../utils';

type TMetricsProps = {
  edit?: boolean;
  create?: boolean;
  onChange?: ChangeEventHandler;
};

export default function Metrics({
  edit,
  create,
}: TMetricsProps) {
  const project = useAppSelector((store) => store.state.project.value);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const dispatch = useAppDispatch();
  const title = 'Метрики проекта';

  const clearMetrics = () => {
    dispatch(updateProjectForEdit({
      metrics: []
    }));
  };
  if (!project) return null;
  if (edit) {
    if (!projectForEdit) return null;
    return (
      <section className={`${styles.wrapper} ${styles.edit}`}>
        <SectionHeader
          edit
        >
          {title}
        </SectionHeader>
        <div className={`${styles.content} ${styles.edit}`}>
          {/* <div  className={`${styles.closeButton}`}>
            <Pictogram
              type="delete"
              cursor="pointer"
              onClick={clearMetrics}
            />
          </div> */}
          {projectForEdit.metrics.map((el: any, index:number) => (
            <div key={index}>
              <input
                className={`${inputStyles.textInput} ${styles.input}`}
                value={el.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(index, projectForEdit, 'metrics', 'title', e.target.value, dispatch)}
              />
              <Pictogram
                type={`${index === projectForEdit.metrics.length - 1 ? 'add' : 'delete'}`}
                cursor="pointer"
                onClick={index === projectForEdit.metrics.length - 1 ?
                  () => addPropertie(projectForEdit, 'metrics', dispatch)
                  :
                  () => removePropertie(index, projectForEdit, 'metrics', dispatch)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (create) {
    return (
      <section className={`${styles.wrapper}`}>
        <SectionHeader>
          {title}
        </SectionHeader>
        <div className={`${styles.content}`}>
          <div  className={`${styles.closeButton}`}>
            <Pictogram
              type="delete"
              cursor="pointer"
              onClick={clearMetrics}
            />
          </div>
          {projectForEdit.metrics.map((el: any, index: number) => (
            <div
              key={index}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <input
                className={`${inputStyles.textInput} ${styles.input}`}
                value={el.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(
                  index,
                  projectForEdit,
                  'metrics',
                  'title',
                  e.target.value,
                  dispatch
                )}
              />
              {(index === projectForEdit.metrics.length - 1) && (
                <div
                  style={{ marginRight: '15px'}}
                >
                  <Pictogram
                    type="delete"
                    cursor="pointer"
                    onClick={() => removePropertie(index, projectForEdit, 'metrics', dispatch)}
                  />
                </div>
              )}
              <Pictogram
                type={`${index === projectForEdit.metrics.length - 1 ? 'add' : 'delete'}`}
                cursor="pointer"
                onClick={index === projectForEdit.metrics.length - 1 ?
                  () => addPropertie(projectForEdit, 'metrics', dispatch)
                  :
                  () => removePropertie(index, projectForEdit, 'metrics', dispatch)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        {title}
      </SectionHeader>
      {!project.metrics.length && (
        <SectionContent>
          Метрики отсутствуют
        </SectionContent>
      )}
      <SectionContent>
        { project.metrics?.map((el, index) => (
          <div key={index}>
            {el.title}
          </div>
        ))}
      </SectionContent>
    </section>
  );
}
