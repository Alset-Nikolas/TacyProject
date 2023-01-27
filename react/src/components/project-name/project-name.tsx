import { ChangeEvent } from 'react';
import moment from 'moment';
import textStyles from '../../styles/text.module.scss';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { handleInputChange } from '../../utils';
import DateInput from '../date-input/date-input';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';

// Styles
import styles from './project-name.module.scss';
import sectionStyles from '../../styles/sections.module.scss';

type TProjectNameProps = {
  edit?: boolean;
  create?: boolean;
  error?: any;
}

export default function ProjectName({
  edit,
  create,
  error,
}: TProjectNameProps) {
  const { sectionHeaderText, inputLabelText } = textStyles;
  const dispatch = useAppDispatch();
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (projectForEdit) handleInputChange(e, projectForEdit, dispatch);
  };

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
            className={`${styles.input} ${error?.name ? styles.error : ''}`}
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
            className={`${styles.input} ${error?.name ? styles.error : ''}`}
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
              className={`${styles.input} ${error?.date_start ? styles.error : ''}`}
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
              className={`${styles.input} ${error?.date_end ? styles.error : ''}`}
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

  if (!project) return null;
  const dateStart = new Date(project.date_start);
  const dateEnd = new Date(project.date_end);

  return (
    <div className={`${sectionStyles.wrapperBorder} ${styles.wrapper}`}>
      {/* <div className={`${textStyles.sectionHeaderText} ${sectionsStyles.header}`}>
        name
        <Pictogram type='edit' />
      </div> */}
      <div className={`${styles.projectName}`}>
        {project.name}
      </div>
      <div className={`${styles.date}`}>
        <span className={`${styles.contentBoldText}`}>Дата начала:</span> {moment(dateStart).format('DD.MM.YYYY')}
      </div>
      <div className={`${styles.date}`}>
        <span className={`${styles.contentBoldText}`}>Дата окончания:</span> {moment(dateEnd).format('DD.MM.YYYY')}
      </div>
    </div>
  );
}