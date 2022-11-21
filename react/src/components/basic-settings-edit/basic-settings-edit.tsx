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
import { stringify } from 'querystring';
import { TIntermediateDate, TMetrica, TPropertie, TPropertieEdit, TRight, TRole, TStage, TStageEdit } from '../../types';
import { clearProjectForEdit, setProjectForEdit } from '../../redux/state-slice';

type TBasicSettingsEditProps = {
  onSaveClick: MouseEventHandler<HTMLButtonElement>;
  onCancelClick: MouseEventHandler<HTMLButtonElement>;
};

export default function BasicSettingsEdit({ onSaveClick, onCancelClick }: TBasicSettingsEditProps) {
  const dispatch = useAppDispatch();
  const project = useAppSelector((store) => store.state.project.value);

  useEffect(() => {
    if (project) dispatch(setProjectForEdit(makeProjectFordit(project)));
    return () => {
      dispatch(clearProjectForEdit());
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
        <TargetEffect
          edit
        />
        <ProjectsEffect
          edit
        />
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
    </div>
  );
}
