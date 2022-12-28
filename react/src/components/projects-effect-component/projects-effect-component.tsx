import { ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';

// Styles
import styles from './projects-effect.module.scss';
import { TMetrica } from '../../types';
import MetricView from '../ui/metric-view/metric-view';

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
          {metrics.map((el) => (
            <MetricView
              title={el.title}
              value={el.value}
              key={`${el.title}_${el.id}`}
            />
          ))}
        </div>
      </SectionContent>
    </section>
  );
}
