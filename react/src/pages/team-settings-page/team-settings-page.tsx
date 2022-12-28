import { useEffect, useState } from 'react';
import AddMemberModal from '../../components/add-member-modal/add-member-modal';
import CustomizedButton from '../../components/button/button';
import Modal from '../../components/modal/modal';
import TeamTable from '../../components/team-table/team-table';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { openAddMemberModal, closeModal } from '../../redux/state/state-slice';
import { useGetTeamListQuery, usePostTeamListMutation } from '../../redux/team/team-api';
import { TRequestTeamListItem, TTeamMember, TUser } from '../../types';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';

// Styles
import styles from './team-settings-page.module.scss';

export default function TeamSettingsPage() {
  const dispatch = useAppDispatch();
  const [postTeamList] = usePostTeamListMutation();
  const { currentId, value } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const { data: teamList } = useGetTeamListQuery({ id: currentId ? currentId : -1, project: project ? project : null });
  const [teamState, setTeamState] = useState(teamList ? [...teamList] : []);
  const { modal } = useAppSelector((store) => store.state.app);

  const addMember = (newMember: TTeamMember) => {
    setTeamState((prevState) => [...prevState, newMember]);
  };

  const removeMember = (index: number) => {
    setTeamState((prevState) => {
      const newList = [...prevState];
      newList.splice(index, 1);
      return newList;
    });
  };

  const onSaveClickHandler = () => {
    if (currentId) {
      // dispatch(postTeamThunk(currentId));
      const body = teamState.map((member) => {
        const listItem = {} as TRequestTeamListItem<TUser>;
    
        const name = member.name.split(' ');
        listItem.user = {
          last_name: name[0] ? name[0] : '',
          first_name: name[1] ? name[1] : '',
          second_name: name[2] ? name[2] : '',
          email: member.email,
          phone: member.phone,
        };
        listItem.role_user = {
          id: project!.roles.find((role) => role.name === member.role)!.id,
          name: member.role,
        };
        listItem.rights_user = [];
        member.rights.forEach((right) => {
          listItem.rights_user.push({
            id: project!.rights.find((el) => el.name === right)!.id,
            name: right,
          });
        });
        listItem.properties = [];
        member.properties.forEach((el, index) => {
          listItem.properties.push({
            title: {
              id: project!.properties.find((propertie) => propertie.title === el.title)!.id,
            },
            values: el.values.map((value) => {
              return {
                id: project!.properties[index].items.find((item) => item.value === value)!.id,
              };
            }),
          });
        });
    
        return listItem;
      })
      postTeamList({ projectId: currentId, body })
    }
  }

  const onAddClickHandler = () => {
    dispatch(openAddMemberModal());
    // () => dispatch(addMember(value));
  }

  useEffect(() => {
    setTeamState(teamList ? [...teamList] : []);
  }, [teamList])

  return (
    <div className={`${styles.wrapper}`}>
      {!value?.id && (
        <div>
          Проект не выбран
        </div>
      )}
      {value?.id && (
        <>
          <TeamTable
            teamList={teamState}
            removeMember={removeMember}
            edit
          />
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
          <AddMemberModal
            addMember={addMember}
          />
        </Modal>
      )}
    </div>
  );
}
