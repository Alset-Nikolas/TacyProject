// Styles
import { useEffect } from 'react';
import { getPersonalStatsThunk } from '../../redux/personal-slice';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { TMetrica } from '../../types';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import ProjectsEffectComponent from '../projects-effect-component/projects-effect-component';
import styles from './personal-project-effect.module.scss';

export default function PersonalProjectEffect() {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const metrics = useAppSelector((store) => store.personal.personalStats.metrics_user_stat);

  useEffect(() => {
    if (project) dispatch(getPersonalStatsThunk(project.id));
  }, [project]);

  return (
    <section className={`${styles.wrapper}`}>
      <ProjectsEffectComponent
        title="Статистика моих инициатив"
        metrics={metrics.map((el) => { return { ...el.metric, value: el.value } }) as Array<TMetrica> || []}
      />
    </section>
  );
}
