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
  setProjectForEdit,
} from '../../redux/state/state-slice';
import ModalInfo from '../modal-info/modal-info';
import { useDeleteFilesMutation, useGetProjectInfoQuery, usePostFilesMutation, usePostProjectMutation } from '../../redux/state/state-api';
import IntermediateDates from '../intermediate-dates/intermediate-dates';
import InitialFiles from '../initial-files/initial-files';
import ProjectStages from '../project-stages/project-stages';

// Syles
import styles from './basic-settings-edit.module.scss';
import { TIntermediateDate, TMetrica, TPropertieEdit } from '../../types';

type TBasicSettingsEditProps = {
  // onSaveClick: MouseEventHandler<HTMLButtonElement>;
  setIsEdit: Dispatch<SetStateAction<boolean>>;
  onCancelClick: MouseEventHandler<HTMLButtonElement>;
};

export default function BasicSettingsEdit({ onCancelClick, setIsEdit }: TBasicSettingsEditProps) {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
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
    let isValid = true;
    const projectEntries = Object.entries(projectForEdit ? projectForEdit : {});
    if (!projectEntries.length) return false;

    projectEntries.forEach((el) => {
      const key = el[0];
      const value = el[1];
      if (typeof value === 'string') {
        if (!value) {
          isValid = false;
          setValidationError((prevState) => ({ ...prevState, [key]: true }));
        } else {
          setValidationError((prevState) => ({ ...prevState, [key]: false }));
        }
      }
      if (key === 'metrics' && (value instanceof Array)) {
        value.forEach((metric) => {
          if (!(metric as TMetrica).title) isValid = false;
        })
      }
      if (key === 'intermediate_dates' && (value instanceof Array)) {
        value.forEach((dateEl) => {
          if (!(dateEl as TIntermediateDate).title) isValid = false;
          if (!(dateEl as TIntermediateDate).date) isValid = false;
        })
      }
      if (key === 'properties' && (value instanceof Array)) {
        value.forEach((propEl, elIndex) => {
          value.forEach((el, index) => {
            if (index !== elIndex) {
              if ((el as TPropertieEdit).title === (propEl as TPropertieEdit).title) {
                isValid = false;
                setIsSamePropNames(true);
              }
            }
          });
        })
      }
    });

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
      />
      {/* <ProjectTimeline
        edit
      /> */}
      <div
        className={`${styles.middleSectionWrapper}`}
      >
        <IntermediateDates edit />
        <InitialFiles
          edit
          filesListForEdit={files}
          setFiles={setFiles}
          setDeleteFiles={setDeleteFilesArray}
        />
      </div>
      <ProjectStages edit />

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
      {/* {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )} */}
    </div>
  );
}
