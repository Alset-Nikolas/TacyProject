import { ChangeEvent, useEffect, useState } from "react";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
import CustomizedSelect from "../select/Select";
import CustomizedButton from "../button/button";
import { useAppSelector } from "../../utils/hooks";
import { useGetTeamListQuery } from "../../redux/team/team-api";
import {
  useGetProjectInfoQuery,
  useGetInitiativeByIdQuery,
  useGetRolesQuery,
  useSetRolesMutation
} from "../../redux/state/state-api";
import { SelectChangeEvent } from "@mui/material";

// Styles
import styles from './role-allocation.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { TRole, TTeamMember, TUser } from "../../types";


export default function RolesAlloction() {
  const [isOpen, setIsOpen] = useState(false);
  const notAllocated = 'Не выбрано';
  const { currentInitiativeId } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
    refetch: refetchInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1);
  const [roles, setRoles] = useState(initiative ? initiative.roles : []);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId ? currentId : -1);
  const { data: teamList } = useGetTeamListQuery({ id: currentId ? currentId : -1, project: project ? project : null });
  const [fullMembersList, setFullMembersList] = useState(teamList ? teamList.map((member) => member.name) : []);
  const [membersList, setMembersList] = useState(fullMembersList);
  const [
    setRolesMutation,
    {
      isSuccess: isSuccessSetRoles,
    }
  ] = useSetRolesMutation();
  const { data: rolePersonList, refetch: rolePersonListRefetch } = useGetRolesQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const selectorStyle = {
    width: '223px',
    height: '28px',
    border: '1px solid #504F4F',
    borderRadius: 0,
    paddingBottom: 0,
  }

  const addPersonToRole = (index: number) => {
    setRoles((prevState) => {
      const newState = [...prevState];
      const currentRole = { ...newState[index] };
      const currentRoleUsers = [...currentRole.users];
      currentRoleUsers.push({
        id: -1,
        first_name: '',
        last_name: '',
        second_name: '',
        email : '',
        phone: '',
      });
      currentRole.users = currentRoleUsers;
      newState[index] = currentRole;

      return newState;
    });
  }

  const deletePersonFromRole = (roleIndex: number, personIndex: number) => {
    setRoles((prevState) => {
      const newState = [...prevState];
      const currentRole = { ...newState[roleIndex] };
      const currentRoleUsers = [...currentRole.users];
      currentRoleUsers.splice(personIndex, 1);
      currentRole.users = currentRoleUsers;
      newState[roleIndex] = currentRole;

      return newState;
    });
  }

  const onRolesPersonChange = (e: SelectChangeEvent<string>, roleIndex: number, personIndex: number) => {
    try {
      let previousMember = {} as {
        id: number,
        first_name: string,
        second_name: string,
        last_name: string,
        email: string,
        phone: string,
      };
      setRoles((prevState) => {
        const newState = [...prevState];
        const currentRole = { ...newState[roleIndex] };
        const currentRoleUsers = [...currentRole.users];
        previousMember = currentRoleUsers[personIndex];

        if (!teamList) throw new Error('Team list is missing');
        
        let selectedUser = teamList?.find((el) => el.name === e.target.value);
        
        if (!selectedUser) {
          if (e.target.value === notAllocated) {
            selectedUser = {
              id: -1,
              name: '  ',
              email : '',
              phone: '',
            } as TTeamMember;
          } else {
            throw new Error('Team member not found');
          }
        } 

        const splitedName = selectedUser.name.split(' ');
        currentRoleUsers[personIndex] = {
          id: selectedUser.id,
          first_name: splitedName[1],
          second_name: splitedName[2],
          last_name: splitedName[0],
          email: selectedUser.email,
          phone: selectedUser.phone,
        };

        currentRole.users = currentRoleUsers;
        newState[roleIndex] = currentRole;

        return newState;
      });
      setMembersList((prevState) => {
        const newState = [...prevState];
        const memberIndex = prevState.findIndex((member) => member === e.target.value);
        if (memberIndex > -1) newState.splice(memberIndex, 1);
        if (previousMember.id !== -1) newState.push(`${previousMember.last_name} ${previousMember.first_name} ${previousMember.second_name}`);

        return newState;
      });
    } catch(e) {
      console.log(e);
    }
  }

  const saveRoleHandler = () => {
    try {
      if (!currentInitiativeId) throw new Error('Initiative is missing');

      const body: Array<{user: TUser & { id: number }, role: TRole}> = [];
      roles.forEach((item) => {
        item.users.forEach((user) => {
          if (user.id !== -1) {
            body.push({
              user,
              role : {
                id: item.role.id,
                name: item.role.name,
                is_approve: item.role.is_approve,
                is_update: item.role.is_update,
              },
            });
          }
        });
      });
      setRolesMutation({ initiativeId: currentInitiativeId, body });
      
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (isSuccessSetRoles) {
      refetchInitiative();
      rolePersonListRefetch();
    }
  }, [isSuccessSetRoles]);

  useEffect(() => {
    if (teamList) setFullMembersList(teamList.map((member) => member.name));
  }, [teamList]);

  useEffect(() => {
    if (!rolePersonList?.length) return;
    const newMemberList = [...fullMembersList];
    console.log(rolePersonList);
    rolePersonList?.forEach((item, itemIndex) => {
      const memberIndex = newMemberList.findIndex((member) => {
        const fullName = `${item.user.last_name} ${item.user.first_name} ${item.user.second_name}`;
        return member === fullName;
      });
      console.log(memberIndex);
      if (memberIndex > -1) {
        newMemberList.splice(memberIndex, 1);
      }
    });
    console.log(newMemberList);

    setMembersList(newMemberList);

  }, [rolePersonList, fullMembersList]);

  return (
    <div
      className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}
    >
      <SectionHeader>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setIsOpen((prevState) => !prevState)}
        >
          Распределение ролей
          <Pictogram
            type={isOpen ? 'close' : 'show'}
            cursor="pointer"
          />
        </div>
      </SectionHeader>
      {isOpen && (
        <>
          <SectionContent>
            <div
              className={`${styles.contentWrapper}`}
            >
              <div
                className={`${styles.titlesColumn}`}
              >
                {roles.map((item) => (
                  <div
                    key={`title_${item.role.id}`}
                    className={`${styles.cell}`}
                  >
                      {item.role.name}
                  </div>
                ))}
              </div>
              <div
                className={`${styles.valuesColumn}`}
              >
                {
                  roles.map((item, roleIndex) => (
                    <div
                      key={item.role.id}
                      className={`${styles.cell}`}
                    >
                      {!item.users.length && (
                        <Pictogram
                          type="add-filled"
                          cursor="pointer"
                          onClick={() => addPersonToRole(roleIndex)}
                        />
                      )}
                      {item.users.map((user, userIndex) => (
                          <div
                            key={user.id}
                            className={`${styles.selectorWrapper}`}
                          >
                            <CustomizedSelect
                              style={selectorStyle}
                              items={membersList ? [...membersList, notAllocated, `${user.last_name} ${user.first_name} ${user.second_name}`] : [notAllocated]}
                              value={user.id !== -1 ? `${user.last_name} ${user.first_name} ${user.second_name}` : notAllocated}
                              onChange={(e) => onRolesPersonChange(e, roleIndex, userIndex)}
                            />
                            <Pictogram
                              type="delete"
                              cursor="pointer"
                              onClick={() => deletePersonFromRole(roleIndex, userIndex)}
                            />
                            {(userIndex === item.users.length - 1) && (
                              <Pictogram
                              type="add-filled"
                              cursor="pointer"
                              onClick={() => addPersonToRole(roleIndex)}
                            />
                            )}
                          </div>
                        ))
                      }
                      
                    </div>
                  ))
                }
              </div>
            </div>
          </SectionContent>
          <div
            className={`${styles.sectionFooter}`}
          >
            <CustomizedButton
              color="blue"
              value="Сохранить"
              onClick={saveRoleHandler}
            />
          </div>
        </>
        )}
        
    </div>
  );
}
