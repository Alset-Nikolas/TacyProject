import { useEffect } from 'react';
import AddMemberModal from '../../components/add-member-modal/add-member-modal';
import CustomizedButton from '../../components/button/button';
import Modal from '../../components/modal/modal';
import TeamTable from '../../components/team-table/team-table';
import { openAddMemberModal, closeModal } from '../../redux/state-slice';
import { addMember, clearList, getTeamThunk, postTeamThunk } from '../../redux/team-slice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';

// Styles
import styles from './team-settings-page.module.scss';

export default function TeamSettingsPage() {
  const dispatch = useAppDispatch();
  const { currentId, value } = useAppSelector((store) => store.state.project);
  const { modal } = useAppSelector((store) => store.state.app);

  const onSaveClickHandler = () => {
    if (currentId === value?.id) dispatch(postTeamThunk(currentId));
  }

  const onAddClickHandler = () => {
    dispatch(openAddMemberModal());
    // () => dispatch(addMember(value));
  }

  useEffect(() => {
    if (currentId) dispatch(getTeamThunk(currentId));
    return () => {
      dispatch(clearList());
    }
  }, [value]);

  return (
    <div className={`${styles.wrapper}`}>
      {!value?.id && (
        <div>
          Проект не выбран
        </div>
      )}
      {value?.id && (
        <>
          <TeamTable edit />
          <div className={`${styles.buttonsWrapper}`}>
            <CustomizedButton
              value="Добавить"
              onClick={onAddClickHandler}
            />
            <CustomizedButton
              className={`${styles.saveButton}`}
              value="Сохранить"
              color="blue"
              onClick={onSaveClickHandler}
            />
          </div>
        </>
      )}
      {modal.isOpen && modal.type.addMember && (
        <Modal
          closeModal={() => dispatch(closeModal())}
        >
          <AddMemberModal />
        </Modal>
      )}
    </div>
  );
}
