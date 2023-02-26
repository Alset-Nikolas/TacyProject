import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Styles
import styles from './create-project-page.module.scss';
//
import BasicFunctions from '../../components/basic-functions/basic-functions';
import Metrics from '../../components/metrics/metrics';
import ProjectName from '../../components/project-name/project-name';
import ProjectTimeline from '../../components/project-timeline/project-timeline';
import CustomizedButton from '../../components/button/button';
import { paths } from '../../consts';
import {
  useAppDispatch,
  useAppSelector,
} from '../../utils/hooks';
import {
  emptyProjectForEdit,
  getProjectInfoThunk,
  openErrorModal,
  projectValidationErrorInitialState,
  setProjectValidationErrors,
  setState,
} from '../../redux/state/state-slice';
import { handleInputChange } from '../../utils';
import {
  TMetrica,
  TIntermediateDate,
  TPropertieEdit,
  TProjectValidationErrors,
  TPropertyValidationError,
  TRole,
  TRoleValidationErrors,
  TIntermediateDateValidationErrors,
  TStageEdit,
  TStageValidationErrors,
} from '../../types';
import {
  useGetProjectsListQuery,
  usePostFilesMutation,
  usePostProjectMutation,
} from '../../redux/state/state-api';
import ProjectsElements from '../../components/projects-elements/projects-elements';
import Properties from '../../components/properties/properties';
import InitialFiles from '../../components/initial-files/initial-files';

export default function CreateProjectPage() {
  const { refetch } = useGetProjectsListQuery();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projectForEdit, validationErrors } = useAppSelector((store) => store.state);
  const [file, setFile] = useState<Blob | null>(null);
  const currentProjectId = useAppSelector((store) => store.state.project.currentId);
  const [createProject,
    {
      isSuccess: isCreateSuccess,
      isError: isCreateError,
      data: createResponse
    }
  ] = usePostProjectMutation();
  const modal = useAppSelector((store) => store.state.app.modal);
  const [files, setFiles] = useState<Array<any>>([null]);
  const [postFiles] = usePostFilesMutation();
  const [ isSamePropNames, setIsSamePropNames ] = useState(false);

  const validateMetrics = (metrics: Array<TMetrica>, validationErrorsTemp: TProjectValidationErrors): Array<boolean> => {
    let isValid = true;
    let isMetricsValid = true;

    metrics.forEach((metric, metricIndex) => {
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
        isMetricsValid = true;
      }
    });

    return [isValid, isMetricsValid];
  }

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

  const returnToMainPage = () => {
    navigate(paths.settings.basic.absolute);
  };

  const onSaveClick = () => {
    const isValid = validateEmptyInputs(); 
    if (projectForEdit && isValid) {
      createProject(projectForEdit);
      refetch();
    } else {
      if (isSamePropNames) {
        dispatch(openErrorModal('У атрибутов инициатив не может быть одинаковых названий'));
        setIsSamePropNames(false);
      } else {
        dispatch(openErrorModal('Проверьте правильность заполнения полей'));
      }
    }
  };

  const onCancelClick = () => {
    dispatch(getProjectInfoThunk());
    returnToMainPage();
  };

  const onChangeHandler = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (projectForEdit) {
      if (e.target.name !== 'file') {
        handleInputChange(e, projectForEdit, dispatch);
      } else {
        const files = (e.target as HTMLInputElement).files;
        setFile(files ? files[0] : null);
      }
    }
  };

  useEffect(() => {
    const formData = new FormData();
    if (isCreateSuccess) {
      files.forEach((el, index) => {
        if (el) formData.append(`file${index}`, el);
      });

      formData.append(`total`, (files.length - 1).toString());

      if (createResponse) postFiles({ projectId: createResponse.id, body: formData });
      navigate(paths.settings.basic.absolute);
    }
    if (isCreateError) {
      dispatch(openErrorModal('При создании произошла ошибка'));
    }
    return () => {
      dispatch(setState({
        projectCreate: {
          isGetRequest: false,
          isGetRequestSuccess: false,
          isGetRequestFailed: false,
        },
      }));
    }
  }, [isCreateSuccess, isCreateError]);

  useEffect(() => {
    dispatch(emptyProjectForEdit());
  }, []);

  if (!projectForEdit) return null;
  return (
    <div className={`${styles.wrapper}`}>
      <div
        style={{
          display: 'flex',
        }}
      >
        <ProjectName
          create
          error={validationErrors}
        />
        <InitialFiles
          edit
          filesListForEdit={files}
          setFiles={setFiles}
        />
        {/* <div>
          <div>
            Установочные документы
          </div>
          {files.map((item, index) => (
            <FileUpload
              key={`file-${index}`}
              file={item}
              fileUploadHandler={setFiles}
              index={index}
            />
          ))}
        </div> */}
      </div>
      <ProjectTimeline
        edit
        error={validationErrors}
      />
      <BasicFunctions
        edit
        error={validationErrors}
        setFile={setFile}
      />
      <section className={`${styles.middleSectionWrapper}`}>
        <Metrics
          edit
          error={validationErrors}
        />
      </section>
      <Properties
        edit
        error={validationErrors}
      />
      <ProjectsElements
        roles={projectForEdit.roles}
        rights={projectForEdit.rights}
        edit
        error={validationErrors}
      />
      <div className={`${styles.buttonsWrapper}`}>
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
        <Modal
          closeModal={() => dispatch(closeModal())}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', margin: 20 }}
          >
            {modal.message instanceof Array ? (
              <ul>
                {modal.message.map((el) => <li key={el}>{el}</li>)}
              </ul>
            ) : (
              <div>{modal.message}</div>
            )}
            <div
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <CustomizedButton
                value='Ок'
                onClick={() => dispatch(closeModal())}
              />
            </div>
          </div>
        </Modal>
      )} */}
    </div>
  );
}
