import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicFunctions from '../../components/basic-functions/basic-functions';
import Metrics from '../../components/metrics/metrics';
import ProjectName from '../../components/project-name/project-name';
import ProjectTimeline from '../../components/project-timeline/project-timeline';
import CustomizedButton from '../../components/button/button';
import { paths } from '../../consts';
import textStyles from '../../styles/text.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { closeModal, createProjectThunk, emptyProjectForEdit, getProjectInfoThunk, setState } from '../../redux/state/state-slice';
import { addPropertie } from '../../utils';
import Modal from '../../components/modal/modal';
import { TMetrica, TIntermediateDate } from '../../types';

// Styles
import styles from './create-project-page.module.scss';
import { useGetProjectsListQuery, usePostProjectMutation } from '../../redux/state/state-api';
import ProjectsElements from '../../components/projects-elements/projects-elements';

export default function CreateProjectPage() {
  const { refetch } = useGetProjectsListQuery();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const [file, setFile] = useState<Blob | null>(null);
  // const isCreateSuccess = useAppSelector((store) => store.state.projectCreate.isGetRequestSuccess);
  const [createProject, { isSuccess: isCreateSuccess }] = usePostProjectMutation();
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
    });

    return isValid;
  };

  const returnToMainPage = () => {
    navigate(paths.settings.basic.absolute);
  };

  const onSaveClick = () => {
    const isValid = validateEmptyInputs(); 
    if (projectForEdit && isValid) {
      const formData = new FormData();
      const projectEntries = Object.entries(projectForEdit);
      // formData.append("username", "abc123");

      projectEntries.forEach((el, index) => {
        // if (index !== event.target.elements.length - 1) {
        //   if (el[0] === 'file') {
            formData.append(el[0], el[1] instanceof Array || typeof el[1] === 'number' ? JSON.stringify(el[1]) : el[1]);
          // } else {
          //   formData.append(el.name, el.value);
          // }
        // }
        // for (const p of formData.entries()) {
        //   console.log(`${p[0]}: ${p[1]}`);
        // }
      });
      formData.append('file', file ? file : '');

      // dispatch(createProjectThunk(formData));
      createProject(formData);
      refetch();
    }
  };

  const onCancelClick = () => {
    dispatch(getProjectInfoThunk());
    returnToMainPage();
  };

  useEffect(() => {
    if (isCreateSuccess) navigate(paths.settings.basic.absolute);
    return () => {
      dispatch(setState({
        projectCreate: {
          isGetRequest: false,
          isGetRequestSuccess: false,
          isGetRequestFailed: false,
        },
      }));
    }
  }, [isCreateSuccess]);

  useEffect(() => {
    dispatch(emptyProjectForEdit());
  }, []);

  if (!projectForEdit) return null;
  return (
    <div className={`${styles.wrapper}`}>
      <ProjectName
        create
        error={validationError}
      />
      <ProjectTimeline
        create
      />
      <BasicFunctions
        create
        error={validationError}
        setFile={setFile}
      />
      <section className={`${styles.middleSectionWrapper}`}>
        {!projectForEdit.metrics.length ? 
          <div className={`${styles.createPropWrapper}`}>
            <div className={`${textStyles.sectionHeaderText}`}>
              Метрики проекта 
            </div>
            <CustomizedButton
              value="Добавить"
              onClick={() => addPropertie(projectForEdit, 'metrics', dispatch)}
            />
          </div>
          :
          <>
            <Metrics
              create
            />
          </>
        }
      </section>
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
      {modal.isOpen && modal.type.error && (
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
      )}
    </div>
  );
}
