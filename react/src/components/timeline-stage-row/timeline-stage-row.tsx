import { ChangeEvent } from "react";
import Pictogram from "../pictogram/pictogram";

// Styles
import styles from './timeline-stage-row.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import { TStage, TStageEdit } from "../../types";
import { addPropertie, handlePropertieInutChange, removePropertie } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import DateInput from "../date-input/date-input";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";

type TTimelineStageRowProps = {
  item: TStage | TStageEdit;
  index: number;
  pictogramType: "delete" | "add";
}

export default function TimelineStageRow({
  item,
  index,
  pictogramType,
}: TTimelineStageRowProps) {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const { textInput } = inputStyles;

  if (!project || !projectForEdit) return null;

  return (
    <div
      className={`${styles.tableRow}`}
    >
      <div className={`${styles.tableRow}`}>
        <input
          className={`${textInput} ${styles.input} ${styles.name}`}
          value={item.name_stage}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(index, projectForEdit, 'stages', 'name_stage', e.target.value, dispatch)}
        />
        <DateInput
          className={`${textInput} ${styles.input} ${styles.date}`}
          value={item.date_start}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(index, projectForEdit, 'stages', 'date_start', e.target.value, dispatch)}
        />
        <DateInput
          className={`${textInput} ${styles.input} ${styles.date}`}
          value={item.date_end}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handlePropertieInutChange(index, projectForEdit, 'stages', 'date_end', e.target.value, dispatch)}
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
