// styles
import { useEffect } from 'react';
import BasicFunctions from '../../components/basic-functions/basic-functions';
import Graphics from '../../components/graphics/graphics';
import InitialFiles from '../../components/initial-files/initial-files';
import ProjectName from '../../components/project-name/project-name';
import ProjectSelector from '../../components/project-selector/project-selector';
import ProjectTimeline from '../../components/project-timeline/project-timeline';
import ProjectsEffect from '../../components/projects-effect/projects-effect';
import TargetEffectStatus from '../../components/target-effect-status/target-effect-status';
import TargetEffect from '../../components/target-effect/target-effect';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import styles from './project-status-page.module.scss';

export default function ProjectStatusPage() {
  const dispatch = useAppDispatch();
  // const currentId = useAppSelector((store) => store.state.project.currentId);
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  
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
          <InitialFiles />
          <div
            className={`${styles.effectsWrapper}`}
          >
            {/* <TargetEffect /> */}
            <ProjectsEffect />
            <TargetEffectStatus />
          </div>
          <Graphics />
          <ProjectTimeline />
        </>
      )}
      
    </div>
  )
}
