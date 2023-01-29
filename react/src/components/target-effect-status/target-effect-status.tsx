import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { useAppSelector } from '../../utils/hooks';
import SectionContent from '../section/section-content/section-content';
import SectionHeader from '../section/section-header/section-header';
import MetricView from '../ui/metric-view/metric-view';

// Styles
import styles from './target-effect-status.module.scss';
import sectionStyles from '../../styles/sections.module.scss';

export default function TargetEffectStatus() {
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const metrics = project?.metrics || [];
  let isActive = false;

  metrics.forEach((metric) => {
    if (metric.active) isActive = true;
  });

  return (
    <section className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        Целевой эффект
      </SectionHeader>
      <SectionContent
        className={`${styles.section}`}
      >
      <div className={`${styles.metricsWrapper}`}>
          {(!metrics.length || !isActive) && (
            <div>
              Метрики отсутствуют
            </div>
          )}
          {metrics.map((el) => {
            if (!el.active) return null;
            return (
              <MetricView
                title={el.title}
                value={el.target_value}
                units={el.units}
                is_percent={el.is_percent}
                key={el.id}
              />
            );
          })}
        </div>
      </SectionContent>
    </section>
  );
}
