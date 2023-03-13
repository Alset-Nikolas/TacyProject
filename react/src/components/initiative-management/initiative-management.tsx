import { useNavigate } from "react-router-dom";
import { addComponentItem, handleComponentInputChange, removeComponentItem } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { paths } from "../../consts";
// Styles
import styles from './initiative-management.module.scss';
//
import { setInitiativeEdit } from "../../redux/state/state-slice";
import {
  useGetComponentsQuery,
  useGetInitiativeByIdQuery,
  useGetInitiativesListQuery,
  useGetUserRightsQuery,
} from "../../redux/state/state-api";
import InitiativeManagementEdit from "../initiative-management-edit/initiative-management-edit";
import InitiativeManagementView from "../initiative-management-view/initiative-management-view";

type TInitiativeManagementProps = {
  edit?: boolean;
  editButton?: boolean
}

export default function InitiativeManagement({ edit, editButton }: TInitiativeManagementProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: currentInitiative,
    isFetching: isFetchingInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const { data: userRights } = useGetUserRightsQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });

  const onEditButtonClick =() => {
    navigate(`/${paths.registry}/edit`);
    dispatch(setInitiativeEdit({
      initiative: true,
      risks: false,
    }))
  }

  if (!components) return null;

  const { settings } = components;

  if (!settings) {
    return (
      <div>No settings</div>
    )
  }

  if (edit) {
    if (!currentInitiative) {
      return (
        <section className={`${styles.wrapper} ${styles.edit}`}>
          Инициатива не выбрана
        </section>
      )
    }
    return (
      <InitiativeManagementEdit
        currentInitiative={currentInitiative}
        initiativeAddfields={settings.initiative_addfields}
        addComponentItem={addComponentItem}
        removeComponentItem={removeComponentItem}
        handleComponentInputChange={handleComponentInputChange}
      />
    );
  }
  
  if (!currentInitiative) {
    return (
      <section className={`${styles.wrapper}`}>
        Инициатива не выбрана
      </section>
    )
  }
  return (
    <InitiativeManagementView
      currentInitiative={currentInitiative}
      editButton={editButton}
      isSuperuser={!!userRights?.user_is_superuser}
      isAuthor={!!userRights?.user_is_author}
      onEditButtonClick={onEditButtonClick}
    />
  );
}
