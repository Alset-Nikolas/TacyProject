import { ChangeEvent, ChangeEventHandler } from 'react';
import Pictogram from '../pictogram/pictogram';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import styles from './metrics.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import {
  setProjectValidationErrors,
  updateProjectForEdit,
} from '../../redux/state/state-slice';
import {
  addPropertie,
  handlePropertieInutChange,
  removePropertie,
} from '../../utils';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import CustomizedButton from '../button/button';
import Checkbox from '../ui/checkbox/checkbox';
import {
  TMetricValidationError,
  TProjectForEdit,
  TProjectValidationErrors,
} from '../../types';

type TMetricsProps = {
  edit?: boolean;
  create?: boolean;
  onChange?: ChangeEventHandler;
  error?: TProjectValidationErrors;
};

export default function Metrics({
  edit,
  create,
  error,
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

      if (e.target.name === 'is_percent' && e.target.checked) {
        currentMetric.units = 'бм';        
      }

      projectMetrics[index] = currentMetric;

      dispatch(updateProjectForEdit({
        metrics: projectMetrics,
      }));
    } catch (e) {
      console.log(e);
    }
  }

  const handleInputChange = (
    index: number,
    propType: keyof TProjectForEdit,
    key: string, 
    value: string,
    currentMetricErrors: TMetricValidationError | undefined,
) => {
    if (error && currentMetricErrors) {
      const errorPropKey = propType as keyof typeof error;
      const tempErrorProp = error[errorPropKey];

      if (typeof tempErrorProp !== 'boolean') {
        const projectPropertyErrors = [ ...tempErrorProp ];
        const currentErrorPropIndex = tempErrorProp.findIndex((item) => item.index === currentMetricErrors.index);

        if (projectPropertyErrors instanceof Array && currentErrorPropIndex > -1) {
          const metricErrors = { ...projectPropertyErrors[currentErrorPropIndex] };
          type Tkey = keyof TMetricValidationError;
          const curKey = key as Tkey
          let isRemoveError = false;
          if ('description' in metricErrors && curKey !== 'id' && curKey !== 'index') {
            metricErrors[curKey] = false;
            if (!metricErrors.description &&
              !metricErrors.target_value &&
              !metricErrors.title &&
              !metricErrors.units
            ) {
              isRemoveError = true;
            }
          }
          if (isRemoveError) {
            projectPropertyErrors.splice(currentErrorPropIndex, 1);
          } else {
            projectPropertyErrors[currentErrorPropIndex] = metricErrors;
          }
        }
        dispatch(setProjectValidationErrors({
          ...error,
          [propType]: projectPropertyErrors,
        }));
      }
    }
    handlePropertieInutChange(index, projectForEdit, propType, key, value, dispatch);
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
              className={`${sectionStyles.editHeaderWithButton}`}
            >
              {title}
              <CustomizedButton
                value="Добавить"
                onClick={() => addPropertie(projectForEdit, 'metrics', dispatch)}
              />
            </div>
            {!!projectForEdit.metrics.length && (
              <>
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
              </>
            )}
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
          {projectForEdit.metrics.map((el, index) => {
            const currentError = error?.metrics.find((error) => el.id !== -1 ? error.id === el.id : error.index === index);
            return (
              <div
                key={el.id}
                className={`${styles.metricWrapper}`}
              >
                <div
                  className={`${styles.metricParameters}`}
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
                      {/* <div>
                        Сатус проекта
                      </div> */}
                      <div>
                        %
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
                          className={`${inputStyles.textInput} ${styles.input} ${currentError?.title ? inputStyles.error : ''}`}
                          value={el.title}
                          onChange={(e) => handleInputChange(index, 'metrics', 'title', e.target.value, currentError)}
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
                          className={`${inputStyles.textInput} ${styles.unitsInput} ${currentError?.units ? inputStyles.error : ''}`}
                          value={el.units}
                          disabled={el.is_percent}
                          onChange={(e) => handleInputChange(index, 'metrics', 'units', e.target.value, currentError)}
                        />
                      </div>
                      <div>
                        <div
                          className={`${styles.checkboxInput}`}
                        >
                          {/* <input
                            type="checkbox"
                            checked={el.is_aggregate}
                            name="is_aggregate"
                            onChange={(e) => handleCheckboxChange(e, index)}
                          /> */}
                          <Checkbox
                            checked={el.is_aggregate}
                            name="is_aggregate"
                            onChange={(e) => handleCheckboxChange(e, index)}
                          />
                        </div>
                      </div>
                      <div
                        className={`${styles.checkboxInput}`}
                      >
                        {/* <input
                          type="checkbox"
                          checked={el.is_percent}
                          name="is_percent"
                          onChange={(e) => handleCheckboxChange(e, index)}
                        /> */}
                        <Checkbox
                          checked={el.is_percent}
                          name="is_percent"
                          onChange={(e) => handleCheckboxChange(e, index)}
                        />
                      </div>
                      {/* <div
                        className={`${styles.checkboxInput}`}
                      >
                        <input
                          type="checkbox"
                          checked={el.active}
                          name="active"
                          onChange={(e) => handleCheckboxChange(e, index)}
                        />
                      </div> */}
                    {/* </div> */}
                  </div>
                  <div
                    style={{
                      flex: '1 1',
                      display: 'flex',
                      alignItems: 'flex-end',
                    }}
                  >
                    <input
                      className={`${inputStyles.textInput} ${styles.valueInput}  ${currentError?.target_value ? inputStyles.error : ''}`}
                      value={el.target_value}
                      onChange={(e) => handleInputChange(index, 'metrics', 'target_value', e.target.value, currentError)}
                    />
                  </div>
                  <div
                    style={{
                      flex: '2 1',
                      display: 'flex',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div
                      className={`${styles.checkboxInput}`}
                    >
                      {/* <input
                        type="checkbox"
                        checked={el.active}
                        name="active"
                        onChange={(e) => handleCheckboxChange(e, index)}
                      /> */}
                      <Checkbox
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
                  className={`${styles.description} ${currentError?.description ? inputStyles.error : ''}`}
                  value={el.description}
                  onChange={(e) => handleInputChange(index, 'metrics', 'description', e.target.value, currentError)}
                />
              </div>
            );
          })}
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
    <section className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        {title}
      </SectionHeader>
      {!project.metrics.length && (
        <SectionContent>
          Метрики отсутствуют
        </SectionContent>
      )}
      <SectionContent>
        <div
          className={`${styles.metricRow}`}
        >
          <div
            className={`${styles.title}`}
          >
            Название
          </div>
          <div
            className={`${styles.checkbox}`}
          >
            Единицы
          </div>
          <div
            className={`${styles.checkbox}`}
          >
            Агрегируемый
          </div>
          <div
            className={`${styles.checkbox}`}
          >
            %
          </div>
            Описание
        </div>
        { project.metrics?.map((el, index) => (
          <div
            key={index}
            className={`${styles.metricRow}`}
          >
            <div
              className={`${styles.title}`}
            >
              {el.title}
            </div>
            <div
              className={`${styles.checkbox}`}
            >
              {el.units}
            </div>
            <div
              className={`${styles.checkbox}`}
            >
              {/* <input type="checkbox" checked={el.is_aggregate} /> */}
              <Checkbox
                checked={el.is_aggregate}
              />
            </div>
            <div
              className={`${styles.checkbox}`}
            >
              {/* <input type="checkbox" checked={el.is_percent} /> */}
              <Checkbox
                checked={el.is_percent}
              />
            </div>
            <div>
              {el.description}
            </div>
          </div>
        ))}
      </SectionContent>
    </section>
  );
}
