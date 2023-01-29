import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicFunctions from '../../components/basic-functions/basic-functions';
import Metrics from '../../components/metrics/metrics';
import ProjectName from '../../components/project-name/project-name';
import ProjectTimeline from '../../components/project-timeline/project-timeline';
import CustomizedButton from '../../components/button/button';
import { paths } from '../../consts';
import textStyles from '../../styles/text.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { closeModal, createProjectThunk, emptyProjectForEdit, getProjectInfoThunk, openErrorModal, setState } from '../../redux/state/state-slice';
import { addPropertie, handleInputChange } from '../../utils';
import Modal from '../../components/modal/modal';
import { TMetrica, TIntermediateDate, TPropertie, TPropertieEdit } from '../../types';
import fileSrc from '../../images/icons/file.svg';

// Styles
import styles from './create-project-page.module.scss';
import { useGetProjectsListQuery, usePostFilesMutation, usePostProjectMutation } from '../../redux/state/state-api';
import ProjectsElements from '../../components/projects-elements/projects-elements';
import Properties from '../../components/properties/properties';
import FileUpload from '../../components/file-upload/file-upoad';
import InitialFiles from '../../components/initial-files/initial-files';

export default function CreateProjectPage() {
  const { refetch } = useGetProjectsListQuery();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
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
  const [files, setFiles] = useState<Array<any>>([null]);
  const [postFiles] = usePostFilesMutation();
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

  const returnToMainPage = () => {
    navigate(paths.settings.basic.absolute);
  };

  const onSaveClick = () => {
    const isValid = validateEmptyInputs(); 
    if (projectForEdit && isValid) {
      const projectEntries = Object.entries(projectForEdit);
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
          error={validationError}
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
      />
      <BasicFunctions
        edit
        error={validationError}
        setFile={setFile}
      />
      <section className={`${styles.middleSectionWrapper}`}>
        <Metrics
          edit
        />
      </section>
      <Properties
        edit
      />
      <ProjectsElements
        roles={projectForEdit.roles}
        rights={projectForEdit.rights}
        edit
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
