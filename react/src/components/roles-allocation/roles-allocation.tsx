import { ChangeEvent, useEffect, useState } from "react";
import Pictogram from "../pictogram/pictogram";
import SectionContent from "../section/section-content/section-content";
import SectionHeader from "../section/section-header/section-header";
import CustomizedSelect from "../select/Select";
import CustomizedButton from "../button/button";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import {
  useGetProjectInfoQuery,
  useGetInitiativeByIdQuery,
  useGetRolesQuery,
  useSetRolesMutation,
  useGetTeamListQuery,
  useGetUserRightsQuery,
  useGetComponentsQuery
} from "../../redux/state/state-api";
import { Checkbox, SelectChangeEvent } from "@mui/material";

// Styles
import styles from './role-allocation.module.scss';
import sectionStyles from '../../styles/sections.module.scss';
import { TPropertie, TRole, TRolesAllocationModalMembersList, TTeamMember, TUser } from "../../types";
import { closeModal, openRolesAllocationModal } from "../../redux/state/state-slice";
import Modal from "../modal/modal";


export default function RolesAlloction() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const notAllocated = 'Не выбрано';
  const modal = useAppSelector((store) => store.state.app.modal);
  const { currentInitiativeId } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
    refetch: refetchInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1);
  const [roles, setRoles] = useState(initiative ? initiative.roles : []);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId ? currentId : -1);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const { data: teamList } = useGetTeamListQuery({ id: currentId ? currentId : -1, project: project ? project : null });
  const [fullMembersList, setFullMembersList] = useState(teamList ? teamList.map((member) => {return { name: member.name, id: member.id }}) : []);
  const [membersList, setMembersList] = useState(teamList ? teamList : []);
  const [
    setRolesMutation,
    {
      isSuccess: isSuccessSetRoles,
    }
  ] = useSetRolesMutation();
  const { data: fetchedRolePersonList, refetch: rolePersonListRefetch } = useGetRolesQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const [ rolePersonList, setRolePersonList ] = useState(fetchedRolePersonList ? fetchedRolePersonList : []);
  const [modalMembersLis, setModalMemberList] = useState<Array<{
    id: number,
    active: boolean,
    user_name: string,
    user: TUser & {id: number}
    properties: Array<{
      id: number;
      title: string;
      values: Array<{
        id: number;
        value: string;
      }>;
    }>
  }>>([]);
  const { data: userRights } = useGetUserRightsQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });

  const addPersonToRole = (role: TRole & {project: number}, index: number) => {
    setModalMemberList(() => {
      const newState = [] as Array<TRolesAllocationModalMembersList>;
      rolePersonList?.forEach((item) => {
        const membersProperties = teamList?.find((member) => member.id === item.user.id)?.properties;

        if (role.id === item.role.id) newState.push({
          id: item.user.id,
          active: true,
          user_name: `${item.user.last_name} ${item.user.first_name[0]}. ${item.user.second_name[0]}.`,
          user: item.user,
          properties: membersProperties ? membersProperties : [],
        });
      });
      membersList.forEach((item) => {
        const splittedName = item.name.split(' ');
        newState.push({
          id: item.id,
          active: false,
          user_name: `${splittedName[0]} ${splittedName[1][0]}. ${splittedName[2][0]}.`,
          user: {
            id: item.id,
            first_name: splittedName[1],
            last_name: splittedName[2],
            second_name: splittedName[0],
            email : item.email,
            phone: item.phone,
          },
          properties: item.properties,
        });
      });

      return newState;
    })
    dispatch(openRolesAllocationModal(role));
  }

  const deletePersonFromRole = (roleIndex: number, personIndex: number, personId: number | undefined) => {
    setRolePersonList((prevState) => {
      const foundIndex = prevState.findIndex((el) => el.user.id === personId);
      if (foundIndex === -1) return prevState;

      const newState = [...prevState];
      newState.splice(foundIndex, 1);

      return newState;
    });
    
    setRoles((prevState) => {
      const newState = [...prevState];
      const currentRole = { ...newState[roleIndex] };
      const currentRoleUsers = [...currentRole.community];
      // const currentUserId = currentRoleUsers[personIndex].user_info?.user.id;

      currentRoleUsers.splice(personIndex, 1);
      currentRole.community = currentRoleUsers;
      newState[roleIndex] = currentRole;

      // setMembersList((prevState) => {
      //   const newState = [...prevState];
      //   const addingUser = teamList?.find((member) => member.id === currentUserId);
      //   if (addingUser) {
      //     newState.push(addingUser);
      //   }
      //   return newState;
      // });

      return newState;
    });
  }

  const saveRoleHandler = (roleId?: number) => {
    try {
      if (!currentInitiativeId) throw new Error('Initiative is missing');

      const body: Array<{user: TUser & { id: number }, role: TRole}> = [];
      roles.forEach((item) => {
        if (item.role.id != roleId) item.community.forEach((member) => {
          if (member.user_info) {
            body.push({
              user: member.user_info.user,
              role : {
                id: item.role.id,
                name: item.role.name,
                is_approve: item.role.is_approve,
                is_update: item.role.is_update,
                initiative_activate: item.role.initiative_activate,
              },
            });
          }
        });
      });

      if (roleId) modalMembersLis.forEach((member) => {
        if (member.active) {
          body.push({
            user: member.user,
            role : {
              id: modal.data.id,
              name: modal.data.name,
              is_approve: modal.data.is_approve,
              is_update: modal.data.is_update,
              initiative_activate: modal.data.initiative_activate,
            },
          });
        }
      });
      setRolesMutation({ initiativeId: currentInitiativeId, body });
      
      dispatch(closeModal());
    } catch (e) {
      console.log(e);
    }
  }

  const modalCheckboxHandler = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    setModalMemberList((prevState) => {
      const newState = [...prevState];
      newState[index].active = e.target.checked;
      return newState;
    });
  };

  useEffect(() => {
    if (isSuccessSetRoles) {
      refetchInitiative();
      rolePersonListRefetch();
    }
  }, [isSuccessSetRoles]);

  useEffect(() => {
    if (!teamList) return;
    const newMemberList = [...teamList];
    rolePersonList?.forEach((item, itemIndex) => {
      const memberIndex = newMemberList.findIndex((member) => {
        const fullName = `${item.user.last_name} ${item.user.first_name} ${item.user.second_name}`;
        return member.name === fullName;
      });
      console.log(memberIndex);
      if (memberIndex > -1) {
        newMemberList.splice(memberIndex, 1);
      }
    });
    console.log(newMemberList);

    setMembersList(newMemberList);

  }, [rolePersonList, teamList, initiative]);

  useEffect(() => {
    setRoles(initiative ? initiative.roles : []);
  }, [initiative])

  useEffect(() => {
    setRolePersonList(fetchedRolePersonList ? fetchedRolePersonList : []);
  }, [fetchedRolePersonList]);
  // useEffect(() => {
  //   if (teamList) setMembersList(() => {
  //     const newMembersList = [...fullMembersList];
  //     roles.forEach((item) => {
  //       item.community.forEach((member) => {
  //         const foundIndex = newMembersList.findIndex((el) => el.id === member.user_info?.user.id);
  //         if (foundIndex !== -1) newMembersList.splice(foundIndex, 1);
  //       });
  //     })
  //     return fullMembersList;
  //   });
  // }, [currentInitiativeId]);

  return (
    <div
      className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}
    >
      <SectionHeader>
        <div
          className={`${sectionStyles.hideContentHeader}`}
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
          <SectionContent
            className={`${styles.section}`}
          >
            <div
              className={`${styles.contentWrapper}`}
            >
              {!roles.length && (
                <div>Отсутствуют роли для распределения</div>
              )}
              {!!roles.length && (
                <div
                  className={`${styles.valuesColumn}`}
                >
                  <div
                    className={`${styles.roleGroup}`}
                  >
                    <div 
                      className={`${styles.roleCell}`}
                    />
                    <div
                      className={`${styles.userWrapper}`}
                    >
                      <div
                        className={`${styles.nameCell} ${styles.header}`}
                      >
                        ФИО
                      </div>
                      {components?.table_community.properties.map((property) => {
                        if (!property.is_community_activate) return null;
                        return (
                          <div
                            key={`${property.id}`}
                            className={`${styles.propertyCell} ${styles.header}`}
                          >
                            {property.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {
                    roles.map((item, roleIndex) => {
                      return (
                        <div
                          key={item.role.id}
                          className={`${styles.roleGroup} ${roleIndex % 2 ? styles.oddRow : styles.evenRow}`}
                        >
                          <div
                            className={`${styles.roleCell}`}
                          >
                            <div
                              className={`${styles.cell}`}
                            >
                                {item.role.name}
                            </div>
                            {(userRights?.user_is_author || userRights?.user_is_superuser) && (
                              <div
                                className={`${styles.addMemberIcon}`}
                              >
                                <Pictogram
                                  type="add-filled"
                                  cursor="pointer"
                                  onClick={() => addPersonToRole(item.role, roleIndex)}
                                />
                              </div>
                            )}
                          </div>
                          <div
                            className={`${styles.membersWrapper}`}
                          >
                            {item.community.map((member, userIndex) => {
                              let items: Array<string> = [notAllocated];
                              if (membersList) items = items.concat(membersList.map((el) => el.name));
                              if (member.user_info && member.user_info.user.id !== -1) items = items.concat([`${member.user_info?.user.last_name} ${member.user_info?.user.first_name} ${member.user_info?.user.second_name}`]);
                              
                              return (
                                <div
                                  key={member.user_info ? member.user_info.user.id : `new_${userIndex}`}
                                  className={`${styles.userWrapper}`}
                                >
                                  <div
                                    className={`${styles.nameCell}`}
                                  >
                                    {(userRights?.user_is_author || userRights?.user_is_superuser) && (
                                      <div
                                        className={`${styles.removeMemberIcon}`}
                                      >
                                        <Pictogram
                                          type="delete-filled"
                                          cursor="pointer"
                                          onClick={() => deletePersonFromRole(roleIndex, userIndex, member.user_info?.user.id)}
                                        />
                                      </div>
                                    )}
                                    <div
                                      style={{
                                        // border: '0.5px solid #504F4F',
                                        // backgroundColor: '#FFFFFF',
                                        width: '100%',
                                      }}
                                    >
                                      {`${member.user_info?.user.last_name} ${member.user_info?.user.first_name[0]}. ${member.user_info?.user.second_name[0]}.`}
                                    </div>
                                  </div>
                                  {member.user_info?.properties.map((propertie) => {
                                    if (!propertie.title.is_community_activate) return null;
                                    return (
                                      <div
                                        key={`${member.user_info?.user.id}-${propertie.title.id}`}
                                        className={`${styles.propertyCell}`}
                                      >
                                        {propertie.values.map((value) => value.value).join(', ')}
                                      </div>
                                    );
                                  })}
                                  {/* <CustomizedSelect
                                    style={selectorStyle}
                                    items={items}
                                    value={(member.user_info && member.user_info.user.id !== -1) ? `${member.user_info.user.last_name} ${member.user_info.user.first_name} ${member.user_info.user.second_name}` : notAllocated}
                                    onChange={(e) => onRolesPersonChange(e, roleIndex, userIndex)}
                                  />
                                  <Pictogram
                                    type="delete"
                                    cursor="pointer"
                                    onClick={() => deletePersonFromRole(roleIndex, userIndex)}
                                  />
                                  {(userIndex === item.community.length - 1) && (
                                    <Pictogram
                                    type="add-filled"
                                    cursor="pointer"
                                    onClick={() => addPersonToRole(roleIndex)}
                                  />
                                  )} */}
                                </div>
                              );
                            })}
                          </div>
                          
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          </SectionContent>
          <div
            className={`${styles.sectionFooter}`}
          >
            <CustomizedButton
              color="blue"
              value="Сохранить"
              onClick={() => saveRoleHandler()}
            />
          </div>
        </>
        )}
        {modal.isOpen && modal.type.rolesAllocation && (
        <Modal
          closeModal={() => dispatch(closeModal())}
        >
          <div
            className={`${styles.allocationModalWraper}`}
          >
            <div
              className={`${styles.modalContentWraper}`}
            >
            {/* {roles.map((item) => ( */}
              <div
                key={modal.data.id}
                className={`${styles.modalRoleWrapper}`}
              >
                <div
                  className={`${styles.modalRoleName}`}
                >
                  {/* {item.role.name} */}
                  {modal.data.name}
                </div>
                <div
                  className={`${styles.scroll}`}
                >
                <div
                  className={`${styles.modalUserWrapper} ${styles.header}`}
                >
                  <div className={`${styles.modalHeaderCell}`}>
                    ФИО
                  </div>
                  {
                    project?.properties.map((propertie) => (
                      <div className={`${styles.modalHeaderCell}`} key={propertie.id}>
                        {propertie.title}
                      </div>
                    ))
                  }
                </div>
                <div
                  className={`${styles.modalGroupWrapper}`}
                >
                  {modalMembersLis.map((item, index) => {
                    // if (item.id !== modal.data.role.id) return null;
                    // const membersProperties = teamList?.find((member) => member.id === item.id)?.properties;
                    return (
                      <div
                        key={item.id}
                        className={`${styles.modalUserWrapper}`}
                      >
                        <div
                          className={`${styles.checkboxWrapper}`}
                        >
                          {/* <input
                            type="checkbox"
                            checked={item.active}
                            onChange={(e) => modalCheckboxHandler(e, index)}
                          /> */}
                          <Checkbox
                            checked={item.active}
                            onChange={(e) => modalCheckboxHandler(e, index)}
                          />
                        </div>
                        <div
                          className={`${styles.modalCell}`}
                        >
                          {`${item.user_name}`}
                        </div>
                        {item.properties.map((property) => (
                          <div
                            key={`${item.id}_${property.id}`}
                            className={`${styles.modalCell}`}
                          >
                            {property.values.map((el) => el.value).join(', ')}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            {/* ))} */}
            </div>
            <div
              className={`${styles.modalButtonWrapper}`}
            >
              <CustomizedButton
                value="Cохранить"
                color="blue"
                onClick={() => saveRoleHandler(modal.data.id)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
