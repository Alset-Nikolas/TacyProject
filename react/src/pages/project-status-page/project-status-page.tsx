// styles
import { useEffect } from 'react';
import BasicFunctions from '../../components/basic-functions/basic-functions';
import Graphics from '../../components/graphics/graphics';
import ProjectName from '../../components/project-name/project-name';
import ProjectSelector from '../../components/project-selector/project-selector';
import ProjectTimeline from '../../components/project-timeline/project-timeline';
import ProjectsEffect from '../../components/projects-effect/projects-effect';
import TargetEffect from '../../components/target-effect/target-effect';
import { getProjectInfoThunk } from '../../redux/state-slice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import styles from './project-status-page.module.scss';

export default function ProjectStatusPage() {
  const dispatch = useAppDispatch();
  const currentId = useAppSelector((store) => store.state.project.currentId);
  const project = useAppSelector((store) => store.state.project.value);
  useEffect(() => {
    dispatch(getProjectInfoThunk(currentId));
  }, []);
  return (
    <div className={`${styles.wrapper}`}>
      <div
        className={`${styles.header}`}
      >
        <ProjectSelector />
      </div>
      {(!project || !project?.id) ? (
        <div>
          Выберите проект
        </div>
      ) : (
        <>
          <ProjectName />
          <BasicFunctions />
          <div
            className={`${styles.effectsWrapper}`}
          >
            <TargetEffect />
            <ProjectsEffect />
          </div>
          <Graphics />
          <ProjectTimeline />
        </>
      )}
      
    </div>
  )
}
