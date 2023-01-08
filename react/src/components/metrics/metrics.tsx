import { ChangeEvent, ChangeEventHandler } from 'react';
import Pictogram from '../pictogram/pictogram';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import styles from './metrics.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { updateProjectForEdit, updateProjectState } from '../../redux/state/state-slice';
import { addPropertie, handlePropertieInutChange, removePropertie } from '../../utils';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import CustomizedButton from '../button/button';

type TMetricsProps = {
  edit?: boolean;
  create?: boolean;
  onChange?: ChangeEventHandler;
};

export default function Metrics({
  edit,
  create,
}: TMetricsProps) {
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const dispatch = useAppDispatch();
  const title = 'Метрики';

  const clearMetrics = () => {
    dispatch(updateProjectForEdit({
      metrics: []
    }));
  };
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    try {
      if (!projectForEdit) throw new Error('Project for edit is missing');

      const projectMetrics = [ ...projectForEdit.metrics ];
      const currentMetric = { ...projectMetrics[index] };
      
      currentMetric[e.target.name] = e.target.checked;
      projectMetrics[index] = currentMetric;

      dispatch(updateProjectForEdit({
        metrics: projectMetrics,
      }));
    } catch (e) {
      console.log(e);
    }
  }

  if (!project) return null;
  if (edit) {
    if (!projectForEdit) return null;
    return (
      <section className={`${styles.wrapper} ${styles.edit}`}>
        <SectionHeader
          edit
        >
          <div
            className={`${styles.headerRow}`}
          >
            <div
              className={`${styles.metricCell} ${styles.header}`}
            >
              {title}
              <CustomizedButton
                value="Добавить"
                onClick={() => addPropertie(projectForEdit, 'metrics', dispatch)}
              />
            </div>
            <div
              className={`${styles.targetCell}`}
            >
              Целевой эффект
            </div>
            <div
              className={`${styles.effectCell}`}
            >
              Эффект проекта
            </div>
          </div>
        </SectionHeader>
        <div className={`${styles.content} ${styles.edit}`}>
          {/* <div  className={`${styles.closeButton}`}>
            <Pictogram
              type="delete"
              cursor="pointer"
              onClick={clearMetrics}
            />
          </div> */}
          {projectForEdit.metrics.map((el, index) => (
            <div
              key={index}
              className={`${styles.metricWrapper}`}
            >
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                }}
              >
                <div
                  className={`${styles.metricLeftPart} ${styles.metricCell}`}
                >
                  {/* <div
                    className={`${styles.metricLeftPartRow}`}
                  > */}
                    <div>
                      Название
                    </div>
                    <div>
                      Единицы
                    </div>
                    <div>
                      Агрегируемый
                    </div>
                  {/* </div> */}
                  {/* <div
                    className={`${styles.metricLeftPartRow}`}
                  > */}
                    <div
                      style={{
                        display: 'flex',
                      }}
                    >
                      <input
                        className={`${inputStyles.textInput} ${styles.input}`}
                        value={el.title}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(index, projectForEdit, 'metrics', 'title', e.target.value, dispatch)}
                      />
                      <div style={{ marginRight: '15px' }}>
                        <Pictogram
                          type="delete"
                          cursor="pointer"
                          onClick={() => removePropertie(index, projectForEdit, 'metrics', dispatch)}
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        className={`${inputStyles.textInput} ${styles.unitsInput}`}
                        value={el.units}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(index, projectForEdit, 'metrics', 'units', e.target.value, dispatch)}
                      />
                    </div>
                    <div>
                      <div
                        className={`${styles.checkboxInput}`}
                      >
                        <input
                          type="checkbox"
                          checked={el.is_aggregate}
                          name="is_aggregate"
                          onChange={(e) => handleCheckboxChange(e, index)}
                        />
                      </div>
                    </div>
                  {/* </div> */}
                </div>
                <div
                  style={{
                    flex: '2 1',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <input
                    className={`${inputStyles.textInput} ${styles.valueInput}`}
                    value={el.target_value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(index, projectForEdit, 'metrics', 'target_value', e.target.value, dispatch)}
                  />
                </div>
                <div
                  style={{
                    flex: '4 1',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <div
                    className={`${styles.checkboxInput}`}
                  >
                    <input
                      type="checkbox"
                      checked={el.active}
                      name="active"
                      onChange={(e) => handleCheckboxChange(e, index)}
                    />
                  </div>
                </div>
                {/* <Pictogram
                  type={`${index === projectForEdit.metrics.length - 1 ? 'add' : 'delete'}`}
                  cursor="pointer"
                  onClick={index === projectForEdit.metrics.length - 1 ?
                    () => addPropertie(projectForEdit, 'metrics', dispatch)
                    :
                    () => removePropertie(index, projectForEdit, 'metrics', dispatch)}
                /> */}
              </div>
              <textarea
              className={`${styles.description}`}
                value={el.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handlePropertieInutChange(index, projectForEdit, 'metrics', 'description', e.target.value, dispatch)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (create) {
    if (!projectForEdit) return null;
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
          {projectForEdit.metrics.map((el, index) => (
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
