import { MouseEventHandler, useEffect } from 'react';
import BasicFunctions from '../basic-functions/basic-functions';
import CustomizedButton from '../button/button';
import Metrics from '../metrics/metrics';
import ProjectName from '../project-name/project-name';
import ProjectTimeline from '../project-timeline/project-timeline';
import ProjectsEffect from '../projects-effect/projects-effect';
import ProjectsElements from '../projects-elements/projects-elements';
import TargetEffect from '../target-effect/target-effect';

// Syles
import styles from './basic-settings-edit.module.scss';
import textStyles from '../../styles/text.module.scss';

// Mock data
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { addPropertie, isPropertie, isStage, makeProjectFordit } from '../../utils';
import Properties from '../properties/properties';
import { clearProjectForEdit, closeModal, setProjectForEdit } from '../../redux/state/state-slice';
import ModalInfo from '../modal-info/modal-info';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';

type TBasicSettingsEditProps = {
  onSaveClick: MouseEventHandler<HTMLButtonElement>;
  onCancelClick: MouseEventHandler<HTMLButtonElement>;
};

export default function BasicSettingsEdit({ onSaveClick, onCancelClick }: TBasicSettingsEditProps) {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const modal = useAppSelector((store) => store.state.app.modal);

  useEffect(() => {
    if (project) dispatch(setProjectForEdit(makeProjectFordit(project)));
    return () => {
      dispatch(clearProjectForEdit());
      dispatch(closeModal());
    };
  }, []);
  
  if (!project) return null;

  return (
    <div className={`${styles.wrapper}`}>
      <ProjectName
        edit
      />
      <ProjectTimeline
        edit
      />
      <BasicFunctions
        edit
      />
      <section className={`${styles.middleSectionWrapper}`}>
        <Metrics
          edit
        />
        {/* <TargetEffect
          edit
        />
        <ProjectsEffect
          edit
        /> */}
      </section>
      <section>
        {/* {!project.properties.length ? 
          <div className={`${styles.createPropWrapper}`}>
            <div className={`${textStyles.sectionHeaderText}`}>
              Ёмкости проекта 
            </div>
            <CustomizedButton
              value="Добавить"
              onClick={() => addPropertie(project, 'properties', dispatch)}
            />
          </div>
          : */}
          <Properties
            edit
          />
        {/* } */}
      </section>
      <ProjectsElements
        roles={project.roles}
        rights={project.rights}
        edit
      />
      {/* <section>
        <Roles
          edit
        />
      </section> */}
      <div className={`${styles.bottomSectionWrapper}`}>
        <CustomizedButton
          value="Отменить"
          color="blue"
          onClick={onCancelClick}
        />
        <CustomizedButton
          value="Сохранить"
          color="blue"
          onClick={onSaveClick}
        />
      </div>
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
    </div>
  );
}
