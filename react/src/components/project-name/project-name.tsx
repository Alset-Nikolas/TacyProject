import { ChangeEvent, ChangeEventHandler, useState } from 'react';
import Pictogram from '../pictogram/pictogram';
import SectionHeader from '../section/section-header/section-header';

// Styles
import styles from './project-name.module.scss';
import textStyles from '../../styles/text.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { handleInputChange } from '../../utils';
import DateInput from '../date-input/date-input';

type TProjectNameProps = {
  edit?: boolean;
  create?: boolean;
}

export default function ProjectName({
  edit,
  create,
}: TProjectNameProps) {
  const { sectionHeaderText, inputLabelText } = textStyles;
  const dispatch = useAppDispatch();
  const project = useAppSelector((store) => store.state.project.value);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (projectForEdit) handleInputChange(e, projectForEdit, dispatch);
  };

  if (!project) return null;
  if (edit) {
    if (!projectForEdit) return null;
    return (
      <div className={`${styles.wrapperEdit}`}>
        <div className={`${styles.nameWrapper}`}>
          <label
            className={`${inputLabelText}`}
            htmlFor="name"
          >
            Название проекта
          </label>
          <input
            className={`${styles.input}`}
            id="name"
            name="name"
            value={projectForEdit.name}
            onChange={onChangeHandler}
          />
        </div>
        <div className={`${styles.bothDatesWrapper}`}>
          <div className={`${styles.dateWrapper}`}>
            <label
              className={`${inputLabelText}`}
              htmlFor="date_start"
            >
              Дата начала
            </label>
            <DateInput
              className={`${styles.input}`}
              id="date_start"
              name="date_start"
              value={projectForEdit.date_start}
              onChange={onChangeHandler}
            />
          </div>
          <div className={`${styles.dateWrapper}`}>
            <label
              className={`${inputLabelText}`}
              htmlFor="date_end"
            >
              Дата окончания
            </label>
            <DateInput
              className={`${styles.input}`}
              id="date_end"
              name="date_end"
              value={projectForEdit.date_end}
              onChange={onChangeHandler}
            />
          </div>
        </div>
      </div>
    );
  }

  if (create) {
    if (!projectForEdit) return null; 
    return (
      <div className={`${styles.wrapperCreate}`}>
        <div className={`${styles.nameWrapper}`}>
          <label
            className={`${sectionHeaderText}`}
            htmlFor="name"
          >
            Название проекта
          </label>
          <input
            className={`${styles.input}`}
            id="name"
            name="name"
            value={projectForEdit.name}
            onChange={onChangeHandler}
          />
        </div>
        <div className={`${styles.bothDatesWrapper}`}>
          <div className={`${styles.dateWrapper}`}>
            <label
              className={`${inputLabelText}`}
              htmlFor="date_start"
            >
              Дата начала
            </label>
            <DateInput
              className={`${styles.input}`}
              id="date_start"
              name="date_start"
              value={projectForEdit.date_start}
              onChange={onChangeHandler}
            />
          </div>
          <div className={`${styles.dateWrapper}`}>
            <label
              className={`${inputLabelText}`}
              htmlFor="date_end"
            >
              Дата окончания
            </label>
            <DateInput
              className={`${styles.input}`}
              id="date_end"
              name="date_end"
              value={projectForEdit.date_end}
              onChange={onChangeHandler}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper}`}>
      {/* <div className={`${textStyles.sectionHeaderText} ${sectionsStyles.header}`}>
        name
        <Pictogram type='edit' />
      </div> */}
      <div className={`${styles.projectName}`}>
        {project.name}
      </div>
      <div>
        <span className={`${styles.contentBoldText}`}>Дата начала:</span> {project.date_start}
      </div>
      <div>
        <span className={`${styles.contentBoldText}`}>Дата окончания:</span> {project.date_end}
      </div>
    </div>
  );
}
