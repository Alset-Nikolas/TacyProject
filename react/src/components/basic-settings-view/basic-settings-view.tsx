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
  deleteProjectListElement,
  deleteProjectThunk,
  getProjectInfoThunk,
  closeModal,
  setCurrentProjectId,
  getProjectsListThunk,
  openDeleteProjectModal
} from '../../redux/state-slice';
import ProjectCapacity from '../project-capacity/projects-capacity';
// Mock data
// import { mockProjectData as project } from '../../consts';

// Syles
import styles from './basic-settings-view.module.scss';
import Properties from '../properties/properties';
import Modal from '../modal/modal';

type TBasicSettingsViewProps = {
  onEditClick: MouseEventHandler<HTMLDivElement>;
};

export default function BasicSettingsView({ onEditClick }: TBasicSettingsViewProps) {
  const dispatch = useAppDispatch();
  const { projectsList, project, app: { modal } } = useAppSelector((store) => store.state);
  // const project = useAppSelector((store) => store.state.project.value);
  // const isDeleteSuccess = useAppSelector((store) => store.state.projectDelete.isGetRequestSuccess);
  // const isCreateSuccess = useAppSelector((store) => store.state.projectCreate.isGetRequestSuccess);

  const deleteClickHandler = () => {
    dispatch(openDeleteProjectModal());
    // if (project.value) {
    //   dispatch(deleteProjectListElement(project.value.id));
    //   dispatch(deleteProjectThunk(project.value.id));
    // }
  };

  const confirmClickHandler = () => {
    if (project.value) {
      dispatch(closeModal());
      // dispatch(deleteProjectListElement(project.value.id));
      dispatch(deleteProjectThunk(project.value.id));
    }
  }

  useEffect(() => {
    dispatch(getProjectInfoThunk(project.currentId));
  }, []);

  // useEffect(() => {
  //   if (!projectsList.value.find((el) => el.id === project.currentId)) dispatch(setCurrentProjectId(projectsList.value[0].id));
  // }, [projectsList]);

  if (!project.value?.id || !project.currentId) return null;

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
      <section className={`${styles.middleSectionWrapper}`}>
        <Metrics />
        <div>
          {/* <TargetEffect
            metrics={project?.metrics}
          /> */}
          <TargetEffect />
          <ProjectsEffect />
        </div>
      </section>
      <Properties />
      <ProjectsElements
        roles={project.value.roles}
        rights={project.value.rights}
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
