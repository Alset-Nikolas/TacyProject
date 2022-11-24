import { ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';

// Styles
import styles from './projects-effect.module.scss';
import inputStyles from '../../styles/inputs.module.scss'
import { updateProjectForEdit } from '../../redux/state-slice';
import { TMetrica } from '../../types';

type TProjectsEffectComponentProps = {
  title?: string;
  metrics: Array<TMetrica>;
};

export default function ProjectsEffectComponent({ title, metrics }: TProjectsEffectComponentProps) {

  return (
    <section className={`${styles.wrapper}`}>
      <SectionHeader>
        {title || ''}
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
