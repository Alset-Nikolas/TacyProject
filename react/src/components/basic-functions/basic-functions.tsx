import { ChangeEvent } from 'react';
import SectionHeader from '../section/section-header/section-header';
// Styles
import styles from './basic-functions.module.scss';
import textStyles from '../../styles/text.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { handleInputChange } from '../../utils';

type TBasicFunctionsProps = {
  edit?: boolean;
  create?: boolean;
}

export default function BasicFunctions({
  edit,
  create,
}: TBasicFunctionsProps) {
  const dispatch = useAppDispatch();
  const { sectionHeaderText } = textStyles;
  const project = useAppSelector((store) => store.state.project.value);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);

  const onChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (projectForEdit) handleInputChange(e, projectForEdit, dispatch);
  };

  if (!project) return null;

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
                Цели:
              </label>
              <textarea
                className={`${styles.purpose}`}
                name="purpose"
                value={projectForEdit.purpose}
                onChange={onChangeHandler}
              />
            </div>
            <div className={`${styles.textBlockEdit}`}>
              <label
                className={`${styles.textBlockDescription}`}
                htmlFor="tasks"
              >
                Задачи:
              </label>
              <textarea
                className={`${styles.tasks}`}
                name="tasks"
                value={projectForEdit.tasks}
                onChange={onChangeHandler}
              />
            </div>
          </div>
          <div className={`${styles.textBlockEdit}`}>
            <label
              className={`${styles.textBlockDescription}`}
              htmlFor="description"
            >
              Описание:
            </label>
            <textarea
              className={`${styles.descrition}`}
              name="description"
              value={projectForEdit.description}
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
        <div className={`${sectionHeaderText}`}>
          Основные функции
        </div>
        <div  className={`${styles.content}`}>
          <div className={`${styles.leftBlock} ${styles.edit}`}>
            <div className={`${styles.textBlockEdit}`}>
              <label
                className={`${styles.textBlockDescription}`}
                htmlFor="purpose"
              >
                Цели:
              </label>
              <textarea
                className={`${styles.purpose}`}
                name="purpose"
                value={projectForEdit.purpose}
                onChange={onChangeHandler}
              />
            </div>
            <div className={`${styles.textBlockEdit} ${styles.bottomArea}`}>
              <label
                className={`${styles.textBlockDescription}`}
                htmlFor="tasks"
              >
                Задачи:
              </label>
              <textarea
                className={`${styles.tasks}`}
                name="tasks"
                value={projectForEdit.tasks}
                onChange={onChangeHandler}
              />
            </div>
          </div>
          <div className={`${styles.textBlockEdit}`}>
            <label
              className={`${styles.textBlockDescription}`}
              htmlFor="description"
            >
              Описание:
            </label>
            <textarea
              className={`${styles.descrition}`}
              name="description"
              value={projectForEdit.description}
              onChange={onChangeHandler}
            />
            {/* {!! description && description} */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper}`}>
      <SectionHeader>
        Основные функции
      </SectionHeader>
      <div  className={`${styles.content}`}>
        <div className={`${styles.leftBlock}`}>
          <div className={`${styles.textBlock}`}>
            <span className={`${styles.textBlockDescription}`}>
              Цели:
            </span>
            {!!project.purpose && (
              <p>
                {project.purpose}
              </p>
            )}
          </div>
          <div className={`${styles.textBlock}`}>
            <span className={`${styles.textBlockDescription}`}>
              Задачи:
            </span>
            {!!project.tasks && (
              <p>
                {project.tasks}
              </p>
            )}
          </div>
        </div>
        <div className={`${styles.textBlock} ${styles.description}`}>
          <span className={`${styles.textBlockDescription}`}>
            Описание:
          </span>
          {!! project.description && (
            <p>
              {project.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
