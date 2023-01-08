import { ChangeEvent } from "react";
import Pictogram from "../pictogram/pictogram";

// Styles
import styles from './timeline-table-row.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { TIntermediateDate, TStage, TMetrica } from "../../types";
import { addPropertie, handlePropertieInutChange, removePropertie } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import DateInput from "../date-input/date-input";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";

type TTimelineTableRowProps = {
  item: TIntermediateDate;
  index: number;
  pictogramType: "delete" | "add";
  onPictogramClick?: any;
}

export default function TimelineTableRow({ item, index, pictogramType }: TTimelineTableRowProps) {
  const { textInput } = inputStyles;
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
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

  if (!project || !projectForEdit) return null
  return (
    <div
      className={`${styles.tableRow}`}
    >
      {/* <div className={`${styles.tableRow}`}> */}
      <input
        className={`${textInput} ${styles.input}`}
        value={item.title}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeHandler(index, 'title', e.target.value)}
      />
      <DateInput
        className={`${textInput} ${styles.input}`}
        value={item.date}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeHandler(index, 'date', e.target.value)}
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
