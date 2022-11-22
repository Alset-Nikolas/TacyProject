import { ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';

// Styles
import styles from './projects-effect.module.scss';
import inputStyles from '../../styles/inputs.module.scss'
import { updateProjectForEdit } from '../../redux/state-slice';

type TProjectsEffectProps = {
  edit?: boolean;
};

export default function ProjectsEffect({ edit }: TProjectsEffectProps) {
  const dispatch = useAppDispatch()
  const { textInput } = inputStyles;
  const project = useAppSelector((store) => store.state.project.value);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const title = 'Эффект проекта';

  if (!project) return null;
  
  const { metrics } = project;

  if (edit) {
    if (!projectForEdit) return null;

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
      const projectMetrics = [ ...projectForEdit.metrics ];
      const currentMetric = { ...projectMetrics[index] };
      currentMetric.active = e.target.checked;
      projectMetrics[index] = currentMetric;
  
      dispatch(updateProjectForEdit({
        metrics: projectMetrics,
      }));
    }
    
    return (
      <section className={`${styles.wrapper} ${styles.edit}`}>
        {/* <div className={`${styles.header} ${styles.edit}`}>
          Эффект проекта
        </div> */}
        <SectionHeader
          edit
        >
          {title}
        </SectionHeader>
        <div className={`${styles.content} ${styles.edit} ${styles.effect}`}>
          <div className={`${styles.effectWrapper}`}>
          {projectForEdit.metrics.map((el, index) => (
            <div
              key={`${index}_${el.title}_effect`}
              className={`${styles.checkboxInput}`}
            >
              <input
                
                type="checkbox"
                checked={el.active}
                onChange={(e) => handleCheckboxChange(e, index)}
              />
            </div>
          ))}
          </div>
          <div className={`${styles.sum}`}>
            <span>
              %
            </span>
            <span>
              Сумма
            </span>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        {title}
      </SectionHeader>
      <SectionContent
        className={`${styles.section}`}
      >
      <div className={`${styles.metricsWrapper}`}>
          {!metrics.length && (
            <div>
              Метрики отсутствуют
            </div>
          )}
          {metrics?.map((el, index) => (
            <div
              className={`${styles.singleMetricWrapper}`}
              key={index}
            >
              <div className={`${styles.value}`}>
                {el.value}
              </div>
              <span className={`${styles.title}`}>
                {el.title}
              </span>
              
            </div>
          ))}
        </div>
      </SectionContent>
    </section>
  );
}
