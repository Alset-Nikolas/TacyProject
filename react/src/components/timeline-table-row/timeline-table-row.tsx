import { ChangeEvent } from "react";
import Pictogram from "../pictogram/pictogram";

// Styles
import styles from './timeline-table-row.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { TIntermediateDate, TStage, TMetrica, TIntermediateDateValidationErrors, TProjectForEdit } from "../../types";
import { addPropertie, handlePropertieInutChange, removePropertie } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import DateInput from "../date-input/date-input";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { setProjectValidationErrors } from "../../redux/state/state-slice";

type TTimelineTableRowProps = {
  item: TIntermediateDate;
  index: number;
  pictogramType: "delete" | "add";
  onPictogramClick?: any;
  error?: TIntermediateDateValidationErrors;
}

export default function TimelineTableRow({ item, index, pictogramType, error }: TTimelineTableRowProps) {
  const { textInput } = inputStyles;
  // const project = useAppSelector((store) => store.state.project.value);
  const { project: { currentId }, validationErrors } = useAppSelector((store) => store.state);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);

  const dispatch = useAppDispatch();

  const onChangeHandler = (index: number, key: keyof TMetrica | keyof TIntermediateDate | keyof TStage, value: string) => {
    if (projectForEdit) {
    handlePropertieInutChange(
      index,
      projectForEdit,
      'intermediate_dates',
      key, 
      value,
      dispatch,
    );
    }
  };

  const handleInputChange = (
    index: number,
    propType: keyof TProjectForEdit,
    key: string, 
    value: string,
    currentInterDateErrors: TIntermediateDateValidationErrors | undefined,
  ) => {
    if (error && currentInterDateErrors) {
      const errorPropKey = propType as keyof typeof validationErrors;
      const tempErrorProp = validationErrors[errorPropKey];

      if (typeof tempErrorProp !== 'boolean') {
        const projectPropertyErrors = [ ...tempErrorProp ];
        const currentErrorPropIndex = tempErrorProp.findIndex((item) => item.index === currentInterDateErrors.index);

        if (projectPropertyErrors instanceof Array) {
          const intermediateDateErrors = { ...currentInterDateErrors };
          type Tkey = keyof TIntermediateDateValidationErrors;
          const curKey = key as Tkey
          let isRemoveError = false;
          if ('date' in intermediateDateErrors && (curKey === 'title' || curKey === 'date')) {
            intermediateDateErrors[curKey] = false;
            if (!intermediateDateErrors.title && !intermediateDateErrors.date) {
              isRemoveError = true;
            }
          }
          if (isRemoveError && currentErrorPropIndex > -1) {
            projectPropertyErrors.splice(currentErrorPropIndex, 1);
          } else {
            projectPropertyErrors[currentErrorPropIndex] = intermediateDateErrors;
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

  if (!project || !projectForEdit) return null
  return (
    <div
      className={`${styles.tableRow}`}
    >
      {/* <div className={`${styles.tableRow}`}> */}
      <input
        className={`${textInput} ${styles.input} ${error?.title ? inputStyles.error : ''}`}
        value={item.title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, 'intermediate_dates', 'title', e.target.value, error)}
      />
      <DateInput
        className={`${textInput} ${styles.input}  ${error?.date ? inputStyles.error : ''}`}
        value={item.date}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(index, 'intermediate_dates', 'date', e.target.value, error)}
      />
      {/* </div> */}
      <div style={{ display: 'flex', gap: '8px', alignContent: 'center' }}>
        {(index === projectForEdit.intermediate_dates.length - 1) && (
          <Pictogram
            type="delete"
            cursor="pointer"
            onClick={() => removePropertie(index, projectForEdit, 'intermediate_dates', dispatch)}
          />
        )}
        <Pictogram
          type={pictogramType}
          cursor="pointer"
          onClick={pictogramType === 'add' ?
            () => addPropertie(projectForEdit, 'intermediate_dates', dispatch)
            :
            () => removePropertie(index, projectForEdit, 'intermediate_dates', dispatch)
          }
        />
      </div>
    </div>
  );
}
