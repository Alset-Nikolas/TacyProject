import { ChangeEvent } from "react";
import Pictogram from "../pictogram/pictogram";

// Styles
import styles from './timeline-stage-row.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { TProjectForEdit, TStage, TStageEdit, TStageValidationErrors } from "../../types";
import { addPropertie, handlePropertieInutChange, removePropertie } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import DateInput from "../date-input/date-input";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { setProjectValidationErrors } from "../../redux/state/state-slice";

type TTimelineStageRowProps = {
  item: TStage | TStageEdit;
  index: number;
  pictogramType: "delete" | "add";
  error?: TStageValidationErrors;
}

export default function TimelineStageRow({
  item,
  index,
  pictogramType,
  error,
}: TTimelineStageRowProps) {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { project: { currentId }, validationErrors } = useAppSelector((store) => store.state);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const { textInput } = inputStyles;

  const handleInputChange = (
    index: number,
    propType: keyof TProjectForEdit,
    key: string, 
    value: string,
    currentStageErrors: TStageValidationErrors | undefined,
  ) => {
    if (error && currentStageErrors) {
      const errorPropKey = propType as keyof typeof validationErrors;
      const tempErrorProp = validationErrors[errorPropKey];

      if (typeof tempErrorProp !== 'boolean') {
        const projectPropertyErrors = [ ...tempErrorProp ];
        const currentErrorPropIndex = tempErrorProp.findIndex((item) => item.index === currentStageErrors.index);

        if (projectPropertyErrors instanceof Array) {
          const stageErrors = { ...currentStageErrors };
          type Tkey = keyof TStageValidationErrors;
          const curKey = key as Tkey
          let isRemoveError = false;
          if ('name_stage' in stageErrors && (curKey === 'name_stage' || curKey === 'date_start' || curKey === 'date_end')) {
            stageErrors[curKey] = false;
            if (!stageErrors.name_stage && !stageErrors.date_start && !stageErrors.date_end) {
              isRemoveError = true;
            }
          }
          if (isRemoveError && currentErrorPropIndex > -1) {
            projectPropertyErrors.splice(currentErrorPropIndex, 1);
          } else {
            projectPropertyErrors[currentErrorPropIndex] = stageErrors;
          }
        }
        dispatch(setProjectValidationErrors({
          ...validationErrors,
          [propType]: projectPropertyErrors,
        }));
      }
    }
    handlePropertieInutChange(index, projectForEdit, propType, key, value, dispatch);
  }

  if (!project || !projectForEdit) return null;

  return (
    <div
      className={`${styles.tableRow}`}
    >
      <div className={`${styles.tableRow}`}>
        <input
          className={`${textInput} ${styles.input} ${styles.name} ${error?.name_stage ? inputStyles.error : ''}`}
          value={item.name_stage}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, 'stages', 'name_stage', e.target.value, error)}
        />
        <DateInput
          className={`${textInput} ${styles.input} ${styles.date} ${error?.date_start ? inputStyles.error : ''}`}
          value={item.date_start}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, 'stages', 'date_start', e.target.value, error)}
        />
        <DateInput
          className={`${textInput} ${styles.input} ${styles.date} ${error?.date_end ? inputStyles.error : ''}`}
          value={item.date_end}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, 'stages', 'date_end', e.target.value, error)}
        />
      </div>
      <div
        style={{ display: 'flex', gap: '15px' }}
      >
        {(index === projectForEdit.stages.length - 1) && (
          <Pictogram
            type="delete"
            cursor="pointer"
            onClick={() => removePropertie(index, projectForEdit, 'stages', dispatch)}
          />
        )}
        <Pictogram
          type={pictogramType}
          cursor="pointer"
          onClick={index === projectForEdit.stages.length - 1 ?
            () => addPropertie(projectForEdit, 'stages', dispatch)
            :
            () => removePropertie(index, projectForEdit, 'stages', dispatch)}
        />
      </div>
    </div>
  );
}
