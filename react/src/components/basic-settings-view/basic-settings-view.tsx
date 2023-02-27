import { MouseEventHandler, useEffect } from 'react';
import BasicFunctions from '../basic-functions/basic-functions';
import CustomizedButton from '../button/button';
import Metrics from '../metrics/metrics';
import Pictogram from '../pictogram/pictogram';
import ProjectName from '../project-name/project-name';
import ProjectTimeline from '../project-timeline/project-timeline';
import ProjectsEffect from '../projects-effect/projects-effect';
import ProjectsElements from '../projects-elements/projects-elements';
import TargetEffect from '../target-effect/target-effect';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import {
  closeModal,
  openDeleteProjectModal,
  setCurrentProjectId
} from '../../redux/state/state-slice';
// Mock data
// import { mockProjectData as project } from '../../consts';

// Syles
import styles from './basic-settings-view.module.scss';
import Properties from '../properties/properties';
import Modal from '../modal/modal';
import { useDeleteProjectMutation, useGetProjectInfoQuery } from '../../redux/state/state-api';
import InitialFiles from '../initial-files/initial-files';

type TBasicSettingsViewProps = {
  onEditClick: MouseEventHandler<HTMLDivElement>;
};

export default function BasicSettingsView({ onEditClick }: TBasicSettingsViewProps) {
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { modal } = useAppSelector((store) => store.state.app);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const [ deleteProject ] = useDeleteProjectMutation();

  const deleteClickHandler = () => {
    dispatch(openDeleteProjectModal());
  };

  const confirmClickHandler = () => {
    if (currentId) {
      dispatch(closeModal());
      // dispatch(deleteProjectThunk(currentId));
      deleteProject(currentId);
      dispatch(setCurrentProjectId(null));
    }
  };

  if (!project?.id || !currentId) return null;

  return (
    <div className={`${styles.wrapper}`}>
      <div className={`${styles.projectNameWrapper}`}>
        <span className={`${styles.projectName}`}>Проект</span>
        <div
          className={`${styles.pictogramWrapper}`}
          onClick={onEditClick}  
        >
          <Pictogram
            type="edit"
            cursor="pointer"
          />
        </div>
      </div>
      <ProjectName />
      <ProjectTimeline />
      <BasicFunctions />
      <InitialFiles />
      <section className={`${styles.middleSectionWrapper}`}>
        <Metrics />
        <div
          className={`${styles.effects}`}
        >
          <TargetEffect />
          <ProjectsEffect />
        </div>
      </section>
      <Properties />
      <ProjectsElements
        roles={project.roles}
        rights={project.rights}
      />
      <div className={`${styles.deleteButtonWrapper}`}>
        <CustomizedButton
          value="Удалить проект"
          color="blue"
          onClick={deleteClickHandler}
        />
      </div>
      {modal.isOpen && modal.type.deleteProject && (
        <Modal
          closeModal={() => dispatch(closeModal())}
        >
          <div className={`${styles.modalWrapper}`}>
            <div className={`${styles.modalMessage}`}>
              Вы уверены, что хотите удалить проект?
            </div>
            <div  className={`${styles.modalButtonsWrapper}`}>
              <CustomizedButton
                className={`${styles.modalButton}`}
                value='Да'
                onClick={confirmClickHandler}
              />
              <CustomizedButton
                className={`${styles.modalButton}`}
                value='Нет'
                onClick={() => dispatch(closeModal())}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
