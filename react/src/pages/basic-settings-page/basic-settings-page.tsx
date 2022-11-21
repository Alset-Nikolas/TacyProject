// Styles
import { useEffect, useState } from 'react';
import BasicSettingsView from '../../components/basic-settings-view/basic-settings-view';
import BasicSettingsEdit from '../../components/basic-settings-edit/basic-settings-edit';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { clearProjectForEdit, createProjectThunk, getProjectInfoThunk, setCurrentProjectId, setProjectBackup, setProjectForEdit, updateProjectState } from '../../redux/state-slice';
import { makeProjectFordit } from '../../utils';

export default function BasicSettingsPage() {
  const dispatch = useAppDispatch();
  const {
    project,
    backupProjectState,
    projectForEdit,
    projectCreate,
    projectsList,
  } = useAppSelector((store) => store.state);
  const isDeleteSuccess = useAppSelector((store) => store.state.projectDelete.isGetRequestSuccess);
  const isCreateSuccess = useAppSelector((store) => store.state.projectCreate.isGetRequestSuccess);
  const [isEdit, setIsEdit] = useState(false);
  const onEditClick = () => {
    setIsEdit(true);
    if (project.value) {
      dispatch(setProjectBackup(project.value));
      dispatch(setProjectForEdit(makeProjectFordit(project.value)));
    }
  };

  const onSaveClick = () => {
    // setIsEdit(false);
    if (projectForEdit) {
      dispatch(createProjectThunk(projectForEdit));
      // dispatch(clearProjectForEdit());
    }
  };

  const onCancelClick = () => {
    setIsEdit(false);
    if (backupProjectState) dispatch(updateProjectState({ ...backupProjectState }));
    if (projectForEdit) dispatch(clearProjectForEdit());
  };

  useEffect(() => {
    if (!project.value) dispatch(getProjectInfoThunk(project.currentId));
    // if (!project.currentId) dispatch(setCurrentProjectId(projectsList.value[0].id));
    if (project.currentId) fetch('http://localhost:8000/api/project/change/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token 965d91f906ef254794ed883d030fca1a52bd5027',
      },
      body: JSON.stringify({ id: project.currentId }),
    });
  }, [project.currentId]);

  useEffect(() => {
    if ((isDeleteSuccess || isCreateSuccess) && project.currentId) dispatch(getProjectInfoThunk(project.currentId));
  }, [isDeleteSuccess, isCreateSuccess]);

  useEffect(() => {
    if (projectCreate.isGetRequestSuccess) {
      setIsEdit(false);
      dispatch(clearProjectForEdit())
    }
  }, [projectCreate.isGetRequestSuccess])

  if (isEdit) {
    return (
      <BasicSettingsEdit
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
      />
    )
  }

  return (
    <BasicSettingsView
      onEditClick={onEditClick}
    />
  );
}
