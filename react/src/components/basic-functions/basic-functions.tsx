import { ChangeEvent } from 'react';
import SectionHeader from '../section/section-header/section-header';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { handleInputChange } from '../../utils';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { TProjectValidationErrors } from '../../types';

// Styles
import styles from './basic-functions.module.scss';
import textStyles from '../../styles/text.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { setProjectValidationErrors } from '../../redux/state/state-slice';

type TBasicFunctionsProps = {
  edit?: boolean;
  create?: boolean;
  error?: TProjectValidationErrors;
  setFile?: any;
}

export default function BasicFunctions({
  edit,
  create,
  error,
  setFile,
}: TBasicFunctionsProps) {
  const dispatch = useAppDispatch();
  const { sectionHeaderText } = textStyles;
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const titles = {
    tasks: 'Задачи',
    purpose: 'Цели',
    descripton: 'Периметр проекта',
  }

  const onChangeHandler = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (projectForEdit) {
      if (e.target.name !== 'file') {
        handleInputChange(e, projectForEdit, dispatch);
        dispatch(setProjectValidationErrors({ ...error, [e.target.name]: false }));
      } else {
        const files = (e.target as HTMLInputElement).files;
        setFile(files ? files[0] : null);
      }
    }
  };

  if (create) {
    if (!projectForEdit) return null;
    return (
      <div className={`${styles.wrapperEdit}`}>
        <div className={`${sectionHeaderText}`}>
          Основные функции
        </div>
        <div  className={`${styles.content}`}>
          <div className={`${styles.leftBlock}`}>
            <div className={`${styles.textBlockEdit}`}>
              <label
                className={`${styles.textBlockDescription}`}
                htmlFor="purpose"
              >
                {`${titles.purpose}:`}
              </label>
              <textarea
                className={`${styles.purpose} ${error?.purpose ? styles.error : ''}`}
                name="purpose"
                value={projectForEdit.purpose}
                onChange={onChangeHandler}
              />
            </div>
            <div className={`${styles.textBlockEdit}`}>
              <label
                className={`${styles.textBlockDescription}`}
                htmlFor="description"
              >
                {`${titles.descripton}:`}
              </label>
              <textarea
                className={`${styles.description} ${error?.description ? styles.error : ''}`}
                name="description"
                value={projectForEdit.description}
                onChange={onChangeHandler}
              />
            </div>
          </div>
          <div className={`${styles.textBlockEdit}`}>
            <label
              className={`${styles.textBlockDescription}`}
              htmlFor="tasks"
            >
              {`${titles.tasks}:`}
            </label>
            <textarea
              className={`${styles.tasks} ${error?.tasks ? styles.error : ''}`}
              name="tasks"
              value={projectForEdit.tasks}
              onChange={onChangeHandler}
            />
            {/* {!! description && description} */}
            
          </div>
        </div>
      </div>
    );
  }

  if (edit) {
    if (!projectForEdit) return null;
    return (
      <div className={`${styles.wrapperEdit}`}>
        {/* <div className={`${sectionHeaderText}`}> */}
        <SectionHeader
          className={`${styles.header}`} 
          edit
        >
          Основные функции
        </SectionHeader>
        {/* </div> */}
        <div  className={`${styles.content}`}>
          {/* <div className={`${styles.leftBlock} ${styles.edit}`}> */}
            <div className={`${styles.textBlockEdit}`}>
              <label
                className={`${styles.textBlockDescription}`}
                htmlFor="purpose"
              >
                {`${titles.purpose}:`}
              </label>
              <textarea
                className={`${styles.textInput} ${error?.purpose ? inputStyles.error : ''}`}
                name="purpose"
                value={projectForEdit.purpose}
                onChange={onChangeHandler}
              />
            </div>
            <div className={`${styles.textBlockEdit} ${styles.bottomArea}`}>
              <label
                className={`${styles.textBlockDescription}`}
                htmlFor="description"
              >
                {`${titles.descripton}:`}
              </label>
              <textarea
                className={`${styles.textInput} ${error?.description ? inputStyles.error : ''}`}
                name="description"
                value={projectForEdit.description}
                onChange={onChangeHandler}
              />
            </div>
          {/* </div> */}
          <div className={`${styles.textBlockEdit} ${styles.tasks}`}>
            <label
              className={`${styles.textBlockDescription}`}
              htmlFor="tasks"
            >
              {`${titles.tasks}:`}
            </label>
            <textarea
              className={`${styles.textInput} ${error?.tasks ? inputStyles.error : ''}`}
              name="tasks"
              value={projectForEdit.tasks}
              onChange={onChangeHandler}
            />
            {/* {!! description && description} */}
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className={`${sectionStyles.wrapperBorder} ${styles.wrapper}`}>
      <SectionHeader>
        Основные функции
      </SectionHeader>
      <div  className={`${styles.content}`}>
        {/* <div className={`${styles.leftBlock}`}> */}
          <div className={`${styles.textBlock}`}>
            <span className={`${styles.textBlockDescription}`}>
              {`${titles.purpose}:`}
            </span>
            {!!project.purpose && (
              <p>
                {project.purpose}
              </p>
            )}
          </div>
          <div className={`${styles.textBlock}`}>
            <span className={`${styles.textBlockDescription}`}>
              {`${titles.descripton}:`}
            </span>
            {!!project.description && (
              <p>
                {project.description}
              </p>
            )}
          </div>
        {/* </div> */}
        <div className={`${styles.textBlock} ${styles.tasks}`}>
          <span className={`${styles.textBlockDescription}`}>
            {`${titles.tasks}:`}
          </span>
          {!! project.tasks && (
            <p>
              {project.tasks}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
