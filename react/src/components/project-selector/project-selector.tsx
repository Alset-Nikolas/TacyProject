import { SelectChangeEvent } from "@mui/material";
import { setCurrentProjectId } from "../../redux/state/state-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import CustomizedSelect from "../select/Select";

// Styles
import styles from './project-selector.module.scss';
import textStyles from '../../styles/text.module.scss';
import { useGetProjectInfoQuery, useGetProjectsListQuery } from "../../redux/state/state-api";
import { useEffect, useState } from "react";
import { setCurrentInitiativeId } from "../../redux/initiatives-slice";
import { setComponentsState } from "../../redux/components-slice";

export default function ProjectSelector() {
  const dispatch = useAppDispatch();
  const { data: projectsList } = useGetProjectsListQuery();
  const selectItems = projectsList ? [...projectsList.map((el) => el.name), ''] : [''];
  const savedProjectId = localStorage.getItem('project-id');
  const [selectedId, setSlectedId] = useState(savedProjectId ? Number.parseInt(savedProjectId) : null);
  const [isSkipFetch, setSkipIsFetch] = useState(true);
  const value = projectsList && projectsList.find((el) => el.id === selectedId)?.name;
  const { currentId } = useAppSelector((store) => store.state.project);

  const onSelectorChange = (e: SelectChangeEvent<string>) => {
    const selectedListItem =  projectsList && projectsList.find((el) => el.name === e.target.value);
    setSlectedId(selectedListItem ? selectedListItem.id : null);
  };

  const onSelectButtonClick = () => {
    dispatch(setCurrentProjectId(selectedId));
    dispatch(setCurrentInitiativeId(null));
    dispatch(setComponentsState({ value: null }))
    setSkipIsFetch(false);
  };

  const { isSuccess } = useGetProjectInfoQuery(selectedId, {
    skip: isSkipFetch,
  });

  if (isSuccess) {
    setSkipIsFetch(true);
  }

  useEffect(() => {
    setSlectedId(currentId);
  }, [currentId]);

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
