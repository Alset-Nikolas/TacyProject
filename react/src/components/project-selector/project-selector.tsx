import { SelectChangeEvent } from "@mui/material";
import { getProjectInfoThunk, setCurrentProjectId } from "../../redux/state-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import CustomizedSelect from "../select/Select";

// Styles
import styles from './project-selector.module.scss';
import textStyles from '../../styles/text.module.scss';

export default function ProjectSelector() {
  const dispatch = useAppDispatch();
  const { project } = useAppSelector((store) => store.state);
  const projectsList = useAppSelector((store) => store.state.projectsList.value);
  const selectItems = [...projectsList.map((el) => el.name), ''];
  const value = projectsList.find((el) => el.id === project.currentId)?.name;

  const onSelectorChange = (e: SelectChangeEvent<string>) => {
    dispatch(setCurrentProjectId(projectsList.find((el) => el.name === e.target.value)?.id));
  };

  const onSelectButtonClick = () => {
    if (project.currentId) dispatch(getProjectInfoThunk(project.currentId));
  };

  return (
    <div>
      <span className={`${textStyles.sectionHeaderText}`}>Все проекты</span>
      <div className={`${styles.selectorWrapper}`}>
      <CustomizedSelect
          value={value ? value : ''}
          items={selectItems}
          onChange={onSelectorChange}
      />
      <CustomizedButton
          value="Выбрать"
          color="blue"
          onClick={onSelectButtonClick}
      />
      </div>
    </div>
  );
}
