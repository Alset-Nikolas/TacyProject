import { Dispatch, MouseEventHandler, SetStateAction, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { makeProjectFordit } from '../../utils';
import BasicFunctions from '../basic-functions/basic-functions';
import CustomizedButton from '../button/button';
import Metrics from '../metrics/metrics';
import ProjectName from '../project-name/project-name';
import ProjectsElements from '../projects-elements/projects-elements';
import Properties from '../properties/properties';
import {
  clearProjectForEdit,
  closeModal,
  openErrorModal,
  projectValidationErrorInitialState,
  setProjectForEdit,
  setProjectValidationErrors,
} from '../../redux/state/state-slice';
import ModalInfo from '../modal-info/modal-info';
import { useDeleteFilesMutation, useGetProjectInfoQuery, usePostFilesMutation, usePostProjectMutation } from '../../redux/state/state-api';
import IntermediateDates from '../intermediate-dates/intermediate-dates';
import InitialFiles from '../initial-files/initial-files';
import ProjectStages from '../project-stages/project-stages';

// Syles
import styles from './basic-settings-edit.module.scss';
import { TIntermediateDate, TIntermediateDateValidationErrors, TMetrica, TPropertieEdit, TPropertyValidationError, TRole, TRoleValidationErrors, TStageEdit, TStageValidationErrors } from '../../types';

type TBasicSettingsEditProps = {
  // onSaveClick: MouseEventHandler<HTMLButtonElement>;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  onCancelClick: MouseEventHandler<HTMLButtonElement>;
};

export default function BasicSettingsEdit({ onCancelClick, setIsEdit }: TBasicSettingsEditProps) {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { project: { currentId }, validationErrors } = useAppSelector((store) => store.state);
  const { data: project, refetch: refetchProjectInfo } = useGetProjectInfoQuery(currentId);
  const modal = useAppSelector((store) => store.state.app.modal);
  const [files, setFiles] = useState<Array<any>>([null]);
  const [ deleteFilesArray, setDeleteFilesArray ] = useState<Array<{ id: number; }>>([]);
  const {
    projectForEdit,
  } = useAppSelector((store) => store.state);
  const [
    saveProject,
    {
      isSuccess: isSaveSuccess,
      isError: isSaveError,
    }
  ] = usePostProjectMutation();
  const [deleteFiles] = useDeleteFilesMutation();
  const [postFiles] = usePostFilesMutation();
  const [validationError, setValidationError] = useState({
    name: false,
    date_start: false,
    date_end: false,
    purpose: false,
    tasks: false,
    description: false,
    intermediate_dates: [],
    stages: [],
    metrics: [],
    properties: [],
    roles: [],
    rights: [],
  });
  const [ isSamePropNames, setIsSamePropNames ] = useState(false);

  const validateEmptyInputs = () => {
    const validationErrorsTemp = { ...projectValidationErrorInitialState };
    let isValid = true;
    const projectEntries = Object.entries(projectForEdit ? projectForEdit : {});
    if (!projectEntries.length) return false;

    projectEntries.forEach((el) => {
      const key = el[0] as keyof typeof validationErrorsTemp;
      const value = el[1];
      if (typeof value === 'string') {
        if (!value) {
          isValid = false;
          if (key === 'name' ||
            key === 'date_start' ||
            key === 'date_end' ||
            key === 'purpose' ||
            key === 'tasks' ||
            key === 'description'
          ) {
            validationErrorsTemp[key] = true;
          }
        }
      }
      if (key === 'metrics' && (value instanceof Array)) {
        (value as Array<TMetrica>).forEach((metric, metricIndex) => {
          const metricValidationState = {
            id: metric.id as number,
            index: metricIndex,
            title: false,
            units: false,
            description: false,
            target_value: false,
          };
          if (!metric.title) {
            isValid = false;
            metricValidationState.title = true;
          }
          if (!metric.units) {
            isValid = false;
            metricValidationState.units = true;
          }
          if (!metric.description) {
            isValid = false;
            metricValidationState.description = true;
          }
          if (metric.target_value === '') {
            isValid = false;
            metricValidationState.target_value = true;
          }
    
          if (metricValidationState.title ||
            metricValidationState.units ||
            metricValidationState.description ||
            metricValidationState.target_value
          ) {
            const currentMetricValidation = [...validationErrorsTemp[key]];
            currentMetricValidation.push(metricValidationState);
            validationErrorsTemp[key] = currentMetricValidation;
          }
        });
      }
      if (key === 'intermediate_dates' && (value instanceof Array)) {
        (value as Array<TIntermediateDate>).forEach((dateEl, dateIndex) => {
          let isIntermediateDateValid = true;
          const intermediateDateValidationState: TIntermediateDateValidationErrors = {
            index: dateIndex,
            title: false,
            date: false,
          };
          if (!dateEl.title) {
            isValid = false;
            isIntermediateDateValid = false;
            intermediateDateValidationState.title = true;
          }
          if (!dateEl.date) {
            isValid = false;
            isIntermediateDateValid = false;
            intermediateDateValidationState.date = true;
          }

          if (!isIntermediateDateValid) {
            const currentIntermediateDateValidation = [...validationErrorsTemp[key]];
            currentIntermediateDateValidation.push(intermediateDateValidationState);
            validationErrorsTemp[key] = currentIntermediateDateValidation;
          }
        })
      }
      if (key === 'stages' && (value instanceof Array)) {
        (value as Array<TStageEdit>).forEach((stage, stageIndex) => {
          let isStageValid = true;
          const stageValidationState: TStageValidationErrors = {
            index: stageIndex,
            name_stage: false,
            date_start: false,
            date_end: false,
          };
          if (!stage.name_stage) {
            isValid = false;
            isStageValid = false;
            stageValidationState.name_stage = true;
          }
          if (!stage.date_start) {
            isValid = false;
            isStageValid = false;
            stageValidationState.date_start = true;
          }
          if (!stage.date_end) {
            isValid = false;
            isStageValid = false;
            stageValidationState.date_end = true;
          }

          if (!isStageValid) {
            const currentStageValidation = [...validationErrorsTemp[key]];
            currentStageValidation.push(stageValidationState);
            validationErrorsTemp[key] = currentStageValidation;
          }
        })
      }
      if (key === 'properties' && (value instanceof Array)) {
        (value as Array<TPropertieEdit>).forEach((propEl, elIndex) => {
          (value as Array<TPropertieEdit>).forEach((el, index) => {
            if (index !== elIndex) {
              if (el.title === propEl.title) {
                isValid = false;
                setIsSamePropNames(true);
              }
            }
          });
        });

        (value as Array<TPropertieEdit>).forEach((propEl, elIndex) => {
          let isPropertyValid = true;
          const propertyValidationState: TPropertyValidationError = {
            id: propEl.id as number,
            index: elIndex,
            title: false,
            values: propEl.values.map((item, itemIndex) => {
              return {
                id: item.id,
                index: itemIndex,
                value: false,
              }
            })
          };

          if (!propEl.title) {
            isValid = false;
            isPropertyValid = false;
            propertyValidationState.title = true;
          }

          propEl.values.forEach((item, itemIndex) => {
            if (!item.value) {
              isValid = false;
              isPropertyValid = false;
              propertyValidationState.values[itemIndex].value = true;
            }
          });

          if (!isPropertyValid) {
            const currentPropertyValidation = [...validationErrorsTemp[key]];
            currentPropertyValidation.push(propertyValidationState);
            validationErrorsTemp[key] = currentPropertyValidation;
          }
        });
      }
      if (key === 'roles' && (value instanceof Array)) {
        (value as Array<TRole>).forEach((role, roleIndex) => {
          let isRoleValid = true;
          const roleValidationState: TRoleValidationErrors = {
            id: role.id,
            index: roleIndex,
            name: false,
          };

          if (!role.name) {
            isValid = false;
            isRoleValid = false;
            roleValidationState.name = true;
          }

          if (!isRoleValid) {
            const currentRoleValidation = [...validationErrorsTemp[key]];
            currentRoleValidation.push(roleValidationState);
            validationErrorsTemp[key] = currentRoleValidation;
          }
        })
      }
    });

    dispatch(setProjectValidationErrors(validationErrorsTemp));

    return isValid;
  };

  useEffect(() => {
    if (project) dispatch(setProjectForEdit(makeProjectFordit(project)));
    return () => {
      dispatch(clearProjectForEdit());
      dispatch(closeModal());
    };
  }, []);

  useEffect(() => {
    if (isSaveSuccess && currentId) {
      // dispatch(getProjectInfoThunk(currentId));
      setIsEdit(false);
      dispatch(clearProjectForEdit());
      refetchProjectInfo();
    }
    if (isSaveError) {
      dispatch(openErrorModal('Произошла ошибка. Проверьте заполнение полей'));
    }
  }, [
    isSaveSuccess,
    isSaveError
  ]);

  const onSaveClick = () => {
    const isValid = validateEmptyInputs(); 

    if (projectForEdit && isValid) {
      // dispatch(createProjectThunk(projectForEdit));

      saveProject(projectForEdit);
      if (deleteFilesArray.length && currentId) deleteFiles({ projectId: currentId, body: deleteFilesArray});

      if (files[0]) {
        const formData = new FormData();
        files.forEach((el, index) => {
          if (el) formData.append(`file${index}`, el);
        });

        formData.append(`total`, (files.length - 1).toString());

        if (currentId) postFiles({ projectId: currentId, body: formData });
      }
    } else {
      if (isSamePropNames) {
        dispatch(openErrorModal('У атрибутов инициатив не может быть одинаковых названий'));
        setIsSamePropNames(false);
      } else {
        dispatch(openErrorModal('Проверьте правильность заполнения полей'));
      }
    }
  };
  
  if (!project) return null;

  return (
    <div className={`${styles.wrapper}`}>
      <ProjectName
        edit
        error={validationErrors}
      />
      {/* <ProjectTimeline
        edit
      /> */}
      <div
        className={`${styles.middleSectionWrapper}`}
      >
        <IntermediateDates
          edit
          error={validationErrors}  
        />
        <InitialFiles
          edit
          filesListForEdit={files}
          setFiles={setFiles}
          setDeleteFiles={setDeleteFilesArray}
        />
      </div>
      <ProjectStages
        edit
        error={validationErrors}  
      />

      <BasicFunctions
        edit
        error={validationErrors}
      />
      <section className={`${styles.middleSectionWrapper}`}>
        <Metrics
          edit
          error={validationErrors}
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
            error={validationErrors}
          />
        {/* } */}
      </section>
      <ProjectsElements
        roles={project.roles}
        rights={project.rights}
        edit
        error={validationErrors}
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
      {/* {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )} */}
    </div>
  );
}
