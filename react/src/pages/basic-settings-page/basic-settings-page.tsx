// Styles
import { useEffect, useState } from 'react';
import BasicSettingsView from '../../components/basic-settings-view/basic-settings-view';
import BasicSettingsEdit from '../../components/basic-settings-edit/basic-settings-edit';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { clearProjectForEdit, setProjectBackup, setProjectForEdit, updateProjectState } from '../../redux/state/state-slice';
import { makeProjectFordit } from '../../utils';
import { useGetProjectInfoQuery, usePostProjectMutation } from '../../redux/state/state-api';

export default function BasicSettingsPage() {
  const dispatch = useAppDispatch();
  const {
    project: {
      currentId
    },
    backupProjectState,
    projectForEdit,
  } = useAppSelector((store) => store.state);
  // const currentId = useAppSelector((store) => store.state.project.currentId);
  const { data: project, refetch: refetchProjectInfo } = useGetProjectInfoQuery(currentId);
  
  // const isDeleteSuccess = useAppSelector((store) => store.state.projectDelete.isGetRequestSuccess);
  // const isCreateSuccess = useAppSelector((store) => store.state.projectCreate.isGetRequestSuccess);
  const [isEdit, setIsEdit] = useState(false);
  const [saveProject, { isSuccess: isCreateSuccess }] = usePostProjectMutation();

  const onEditClick = () => {
    setIsEdit(true);
    if (project) {
      dispatch(setProjectBackup(project));
      dispatch(setProjectForEdit(makeProjectFordit(project)));
    }
  };

  const onSaveClick = () => {
    if (projectForEdit) {
      // dispatch(createProjectThunk(projectForEdit));
      saveProject(projectForEdit);
    }
  };

  const onCancelClick = () => {
    setIsEdit(false);
    if (backupProjectState) dispatch(updateProjectState({ ...backupProjectState }));
    if (projectForEdit) dispatch(clearProjectForEdit());
  };

  useEffect(() => {
    // if (!project.value) dispatch(getProjectInfoThunk(project.currentId));
    setIsEdit(false);
  }, [currentId]);

  // useEffect(() => {
  //   if (isCreateSuccess && currentId) {
  //     // dispatch(getProjectInfoThunk(currentId));
  //     setIsEdit(false);
  //     dispatch(clearProjectForEdit());
  //     refetchProjectInfo();
  //   }
  // }, [isCreateSuccess]);

  if (isEdit) {
    return (
      <BasicSettingsEdit
        setIsEdit={setIsEdit}
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
