import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicFunctions from '../../components/basic-functions/basic-functions';
import Metrics from '../../components/metrics/metrics';
import ProjectName from '../../components/project-name/project-name';
import ProjectTimeline from '../../components/project-timeline/project-timeline';
import CustomizedButton from '../../components/button/button';
import { paths } from '../../consts';
import textStyles from '../../styles/text.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { closeModal, createProjectThunk, getProjectInfoThunk, setState } from '../../redux/state-slice';
import { addPropertie } from '../../utils';
import Modal from '../../components/modal/modal';

// Styles
import styles from './create-project-page.module.scss';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const newProjectState = useAppSelector((store) => store.state.project.value);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const isCreateSuccess = useAppSelector((store) => store.state.projectCreate.isGetRequestSuccess);
  const modal = useAppSelector((store) => store.state.app.modal);

  const returnToMainPage = () => {
    navigate(paths.settings.basic.absolute);
  };

  const onSaveClick = () => {
    if (projectForEdit) dispatch(createProjectThunk(projectForEdit));
  };

  const onCancelClick = () => {
    dispatch(getProjectInfoThunk());
    returnToMainPage();
  };

  if (!newProjectState) return null;

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

  if (!projectForEdit) return null;
  return (
    <div className={`${styles.wrapper}`}>
      <ProjectName
        create
      />
      <ProjectTimeline
        create
      />
      <BasicFunctions
        create
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
