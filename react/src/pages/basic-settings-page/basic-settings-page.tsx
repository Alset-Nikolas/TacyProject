// Styles
import { useEffect, useState } from 'react';
import BasicSettingsView from '../../components/basic-settings-view/basic-settings-view';
import BasicSettingsEdit from '../../components/basic-settings-edit/basic-settings-edit';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { clearProjectForEdit, closeModal, createProjectThunk, getProjectInfoThunk, setProjectBackup, setProjectForEdit, updateProjectState } from '../../redux/state/state-slice';
import { makeProjectFordit } from '../../utils';

export default function BasicSettingsPage() {
  const dispatch = useAppDispatch();
  const {
    project,
    backupProjectState,
    projectForEdit,
    projectCreate,
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
    if (projectForEdit) {
      dispatch(createProjectThunk(projectForEdit));
    }
  };

  const onCancelClick = () => {
    setIsEdit(false);
    if (backupProjectState) dispatch(updateProjectState({ ...backupProjectState }));
    if (projectForEdit) dispatch(clearProjectForEdit());
  };

  useEffect(() => {
    if (!project.value) dispatch(getProjectInfoThunk(project.currentId));
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
