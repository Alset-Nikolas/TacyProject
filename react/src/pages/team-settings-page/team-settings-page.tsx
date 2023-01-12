import { createContext, useEffect, useState } from 'react';
import AddMemberModal from '../../components/add-member-modal/add-member-modal';
import CustomizedButton from '../../components/button/button';
import ModalInfo from '../../components/modal-info/modal-info';
import Modal from '../../components/modal/modal';
import TeamTable from '../../components/team-table/team-table';
import { useGetProjectInfoQuery } from '../../redux/state/state-api';
import { openAddMemberModal, closeModal } from '../../redux/state/state-slice';
import { useGetTeamListQuery, usePostTeamListMutation } from '../../redux/team/team-api';
import { TRequestTeamListItem, TTeamMember, TUser } from '../../types';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';

// Styles
import styles from './team-settings-page.module.scss';

export const TeamContext = createContext([] as Array<TTeamMember>);

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
    try {
      if (!currentId || !project) throw new Error('Project doesn\'t exist');
      // dispatch(postTeamThunk(currentId));
      const body = teamState.map((member) => {
        const listItem = {} as TRequestTeamListItem<TUser>;
    
        // const name = member.name.split(' ');
        const name = member.name.match(/[A-z,А-я]+/g);
        
        if (!name) throw new Error('Name wasn\'t parsed');

        listItem.user = {
          last_name: name[0] ? name[0] : '',
          first_name: name[1] ? name[1] : '',
          second_name: name[2] ? name[2] : '',
          email: member.email,
          phone: member.phone,
        };
        // listItem.role_user = {
        //   id: project!.roles.find((role) => role.name === member.role)!.id,
        //   name: member.role,
        // };
        // listItem.rights_user = [];
        // member.rights.forEach((right) => {
        //   listItem.rights_user.push({
        //     id: project!.rights.find((el) => el.name === right)!.id,
        //     name: right,
        //   });
        // });
        listItem.is_create = member.is_create;
        listItem.properties = [];
        member.properties.forEach((el, index) => {
          const foundPropertie = project.properties.find((propertie) => propertie.title === el.title);
          
          if (!foundPropertie) throw new Error('Propertie not found');

          listItem.properties.push({
            title: {
              id: foundPropertie.id,
              title: el.title,
            },
            values: el.values.map((value) => {
              const foundValue = project.properties[index].items.find((item) => item.value === value.value);
              
              if (!foundValue) throw new Error('Value not found');

              return {
                id: foundValue.id,
                value: value.value,
              };
            }),
          });
        });
    
        return listItem;
      })
      postTeamList({ projectId: currentId, body });
    } catch(e) {
      console.log(e);
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
    <TeamContext.Provider
      value={teamState}
    >
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
            setList={setTeamState}
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
      {modal.isOpen && modal.type.message && (
        <ModalInfo message={modal.message} />
      )}
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
    </div>
    </TeamContext.Provider>
  );
}
