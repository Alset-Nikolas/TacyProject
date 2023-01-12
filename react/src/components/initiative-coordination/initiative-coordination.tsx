import SectionHeader from "../section/section-header/section-header";
import CustomizedButton from "../button/button";

//Styles
import sectionStyles from '../../styles/sections.module.scss';
import styles from './initiative-coordination.module.scss';
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import {
  clearBossesList,
  closeInitiativeThunk,
  coordinateThunk,
  getBossesListThunk,
  getChatThunk,
  postCommentThunk,
  sendForApprovalThunk
} from "../../redux/coordination-slice";
import {
  getUserInfoByIdThunk,
  getUserRightsThunk
} from "../../redux/auth-slice";
import moment from "moment";
import { SelectChangeEvent, Tooltip } from "@mui/material";
import { useGetAuthInfoByIdQuery } from "../../redux/auth/auth-api";
import { useGetInitiativeByIdQuery, useGetProjectInfoQuery, useGetRolesQuery } from "../../redux/state/state-api";
import Pictogram from "../pictogram/pictogram";
import { MessageSeparator } from "../message-separator/message-separator";
import Modal from "../modal/modal";
import { openCoordinationModal, closeModal } from "../../redux/state/state-slice";
import { TUser } from "../../types";
import { useGetTeamListQuery } from "../../redux/team/team-api";

export default function InitiativeCoordination() {
  const dispatch = useAppDispatch();
  // const initiative = useAppSelector((store) => store.initiatives.initiative);
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
    isFetching: isFetchingInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const { data: rolePersonList, refetch: rolePersonListRefetch } = useGetRolesQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const modal = useAppSelector((store) => store.state.app.modal);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  // const project = useAppSelector((store) => store.state.project.value);
  // const teamList = useAppSelector((store) => store.team.list);
  const { coordinationHistory, bosses } = useAppSelector((store) => store.coordination);
  const { userRights } = useAppSelector((store) => store.auth);
  const { data: user } = useGetAuthInfoByIdQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [commentState, setCommentState] = useState({
    text: '',
    initiative: initiative ? initiative.initiative.id : -1,
  });
  const bossesNamesList = [...bosses.map((boss) => {
    return {
      id: boss.id,
      name: `${boss.last_name} ${boss.first_name} ${boss.second_name}`,
    };
  })].filter((boss) => boss.id !== user?.user.id);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const [coordinatorName, setCoordinatorName] = useState(bossesNamesList.length ? bossesNamesList[0].name : '');
  const coordinationButtonIsDisabled = !(userRights?.user_rights_flag.is_approve && userRights?.user_now_apprwed || userRights?.user_is_author) ||
    userRights.init_failure ||
    initiative?.initiative.status?.value === -1;
  const [coordinatorsState, setCoordinatorsState] = useState<{text: string, coordinators: Array<TUser & {id: number}>, initiative: number}>({
    text: '1',
    initiative: currentInitiativeId ? currentInitiativeId : -1,
    coordinators: [],
  });
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { data: membersList } = useGetTeamListQuery({ id: currentId ? currentId : -1, project: project ? project : null });


  const inputChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (chatInputRef.current) {
      // Get the number of rows in the textarea
      const rows = chatInputRef.current.scrollHeight / chatInputRef.current.clientHeight;

      // Set the height of the textarea
      chatInputRef.current.style.height = `32px`;
      chatInputRef.current.style.height = `${((rows < 3 ? rows : 3) * chatInputRef.current.scrollHeight)}px`;
    }

    setCommentState((prevState) => {
      return {
        ...prevState,
        [name]: value
      }
    });
  };

  const postCommentHandler = () => {
    if (userRights?.user_add_comment) {
      if (chatInputRef.current) chatInputRef.current.style.height = `32px`;
      dispatch(postCommentThunk(commentState));
      setCommentState((prevState) => {
        return {
          ...prevState,
          text: '',
        }
      });
    }
  };

  const postCoordinateHandler = () => {
    // const coordinatorId = bossesNamesList.find((member) => member.name === coordinatorName)?.id;
    if (userRights?.user_is_author /* && coordinatorId */) {
      dispatch(openCoordinationModal())
      // dispatch(sendForApprovalThunk({ ...commentState, coordinator: coordinatorId }))
    } else {
      dispatch(coordinateThunk({...commentState, text: '1'}));
    }
    setCommentState((prevState) => {
      return {
        ...prevState,
        text: '',
      }
    });
  }

  const onSelectorChange = (e: SelectChangeEvent) => {
    setCoordinatorName(e.target.value);
  }

  const modalCheckboxHandler = (e: ChangeEvent<HTMLInputElement>, user: TUser & {id: number}) =>{
    console.log(e);
    if (e.target.checked) {
      setCoordinatorsState((prevState) => {
        return {
          ...prevState,
          coordinators: [
            ...prevState.coordinators,
            user,
          ]
        };
      });
  } else {
    const newCoordinatorsArray = [...coordinatorsState.coordinators];
    const removeIndex = newCoordinatorsArray.findIndex((coordinator) => coordinator.id === user.id);
    if (removeIndex !== -1) {
      newCoordinatorsArray.splice(removeIndex, 1);
      setCoordinatorsState((prevState) => {
        return {
          ...prevState,
          coordinators: newCoordinatorsArray,
        };
      });
    }

  }
  };

  useEffect(() => {
    if (currentInitiativeId) {
      dispatch(getChatThunk(currentInitiativeId));
      dispatch(getUserRightsThunk(currentInitiativeId));
      setCommentState((prevState) => {
        return {
          ...prevState,
          initiative: currentInitiativeId,
        }
      });
    }
    if (project) {
      // dispatch(getBossesListThunk(project.id));
    }
  }, [currentInitiativeId, project]);

  useEffect(() => {
    const topPos = chatBottomRef.current?.offsetTop;
    if (chatRef.current && topPos) {
      chatRef.current.scrollTop = topPos;
    }
  }, [coordinationHistory]);

  return (
    <div
      className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}
    >
      <SectionHeader
        className={`${styles.header}`}
      >
        Согласование инициативы
      </SectionHeader>
      <div
        className={`${styles.content}`}
      >
        <div
          className={`${styles.col}`}
        >
          <div
            className={`${styles.infoBlock}`}
          >
            <div
              className={`${styles.historyHeader}`}
            >
              История согласования
            </div>
            <div
              className={`${styles.history}`}
            >
              <ul
                className={`${styles.historyList}`}
              >
                {coordinationHistory && coordinationHistory.map((element, index) => {
                  const isServiceMessage = element.action === 'Служебное сообщение';
                  const isApprovement = element.action === 'Инициатива согласована'
                  const isSendToApprove = element.action === "Отправить на согласование";
                  const elementsDate = new Date(element.date);
                  if (!isServiceMessage && !isApprovement && !isSendToApprove) return null;
                  // if (isServiceMessage) {
                  //   return (
                  //     <div
                  //       key={element.id}
                  //       className={`${styles.serviceMessage}`}
                  //     >
                  //       {element.text}
                  //     </div>
                  //   );
                  // }
                  return (
                    <li
                      key={element.id}
                      className={`${styles.historyRow}`}
                    >
                      <div>
                        {moment(elementsDate).format('DD.MM.YYYY')}
                      </div>
                      <div>
                        {element.status?.name ? element.status.name : 'null'}
                      </div>
                      <div>
                        {isServiceMessage && element.text}
                        {isSendToApprove && `${element.author_text?.last_name} ${element.author_text?.first_name[0]}. ${element.author_text?.second_name[0]}. ${element.text}`}
                        {isApprovement && element.action}
                      </div>
                      <div>
                        {rolePersonList?.find((item) => item.user.id === element.coordinator?.id)?.role.name}
                      </div>
                      <div>
                        {!isServiceMessage && `${element.coordinator?.last_name} ${element.coordinator?.first_name[0]}. ${element.coordinator?.second_name[0]}.`}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div
            className={`${styles.infoBlock}`}
          >
            <div
              className={`${styles.documents}`}
            >
              <div>
                Документы
              </div>
              
            </div>
          </div>
          <div
            className={`${styles.buttonWrapper}`}
          >
            <div
              className={`${styles.commentButtonsWrapper}`}
            >
              <CustomizedButton
                className={`${styles.button}`}
                value={`${userRights?.init_failure ? 'Восстановить' : "Отозвать"}`}
                color="transparent"
                onClick={() => dispatch(closeInitiativeThunk({
                  initiative: initiative ? initiative?.initiative.id : -1,
                  failure: !userRights?.init_failure,
                }))}
              />
              <CustomizedButton
                className={`${styles.button}`}
                value="Согласовать"
                color="blue"
                disabled={coordinationButtonIsDisabled}
                onClick={postCoordinateHandler}
              />
            </div>
          </div>
          {/* )} */}
        </div>
        <div
          className={`${styles.col}`}
        >
          
          <div
            className={`${styles.chat}`}
            ref={chatRef}
          >
            {(!coordinationHistory || !coordinationHistory.length) && (
              <div
                style={{
                  textAlign: 'center',
                }}
              >История пуста</div>
            )}
            {coordinationHistory && coordinationHistory.map((element, index) => {
              // const author = teamList.find((member) => member.id === element.author_text);
              const isServiceMessage = element.action === 'Служебное сообщение';
              const isComment = element.action === 'Новый комментарий'
              const isApprovement = element.action === 'Инициатива согласована'
              const isSendToApprove = element.action === "Отправить на согласование";
              const authorName = element.author_text?.first_name ?
                `${element.author_text.last_name} ${element.author_text.first_name} ${element.author_text.second_name}`
                :
                'Админ';
              const coordinator = element.coordinator?.first_name ?
                `${element.coordinator.last_name} ${element.coordinator.first_name} ${element.coordinator.second_name}`
                :
                '';
              const date = new Date(element.date);
              const nextElement = coordinationHistory[index + 1];
              const prevDate = nextElement ? new Date(nextElement.date) : null;
              const isPreviousDay = prevDate && (date.getDate() !== prevDate.getDate());
              // const statusName = components?.settings?.initiative_status.find((status) => status.id === element.status)?.name;
              return (
                <div
                  key={element.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* <div
                    className={`${styles.metaData}`}
                  >
                    {isServiceMessage ? (
                      <div
                        className={`${styles.metaDataName}`}
                      />
                    ) : (
                      <div
                        className={`${styles.metaDataName}`}
                      >
                        {authorName}
                        &nbsp;
                        {isApprovement && (
                          <span>согласовал</span>
                        )}
                        {coordinator && !isApprovement && (
                          <span>
                            ответил(а)
                            &nbsp;
                            {coordinator}
                            &nbsp;  
                          </span>
                        )}
                      </div>
                    )}
                    <div
                      className={`${styles.metaDataStatus}`}
                    >
                      Cтатус:&nbsp;{element.status?.name ? element.status.name : 'null'}
                    </div>
                    <div
                      className={`${styles.metaDataDate}`}
                    >
                      {moment(date).format('MM.DD.YYYY')}
                    </div>
                  </div> */}
                  {(isServiceMessage || isApprovement || isSendToApprove) ? (
                    <>
                      {!isServiceMessage && (
                        <div
                          className={`${styles.serviceMessage}`}
                        >
                          {element.status?.name ? element.status.name : 'null'}
                          &nbsp;
                          {isSendToApprove ? 
                            `${element.author_text?.last_name} ${element.author_text?.first_name[0]}. ${element.author_text?.second_name[0]}. ${element.text}`
                            :
                            element.action
                          }
                          &nbsp;
                          {rolePersonList?.find((item) => item.user.id === element.coordinator?.id)?.role.name}
                          &nbsp;
                          {`${element.coordinator?.last_name} ${element.coordinator?.first_name[0]}. ${element.coordinator?.second_name[0]}.`}
                        </div>
                      )}
                      {isServiceMessage && (
                        <div
                          className={`${styles.serviceMessage}`}
                        >
                          {element.text}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div
                        className={`${styles.messageWrapper} ${element.author_text?.id === user?.user.id && styles.own}`}
                      >
                        {element.author_text?.id !== user?.user.id && (
                          <Tooltip
                            title={`${element.author_text?.last_name} ${element.author_text?.first_name} ${element.author_text?.second_name}`}
                            placement="bottom"
                          >
                            <div
                              className={styles.avatar}
                            >
                              {element.author_text?.last_name[0]}
                            </div>
                          </Tooltip>
                        )}
                        <Tooltip
                          title={moment(element.date).format('HH:mm')}
                          placement={`${element.author_text?.id === user?.user.id ? 'left' : 'right'}`}
                        >
                          <div
                            className={`${styles.messageText} ${styles.own}`}
                          >
                            {element.text}
                          </div>
                        </Tooltip>
                        {element.author_text?.id === user?.user.id && (
                          <Tooltip
                            title={`${element.author_text?.last_name} ${element.author_text?.first_name} ${element.author_text?.second_name}`}
                            placement="bottom"
                          >
                            <div
                              className={`${styles.avatar} ${styles.own}`}
                            >
                              {element.author_text?.last_name[0]}
                            </div>
                          </Tooltip>
                        )}
                      </div>
                      {isPreviousDay && <MessageSeparator date={prevDate} />}
                    </>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              );
            })}
          </div>
          <div
            className={`${styles.inputMessageWrapper}`}
          >
            <textarea
              name="text"
              placeholder="Сообщение"
              value={commentState.text}
              className={`${styles.textInput}`}
              onChange={inputChangeHandler}
              ref={chatInputRef}
            />
            <Pictogram
              type="send"
              cursor="pointer"
              onClick={postCommentHandler}
            />
          </div>
        </div>
      </div>
      {modal.isOpen && (
        <Modal
          closeModal={() => dispatch(closeModal())}
        >
          <div
            className={`${styles.coordinationModalWraper}`}
          >
            <div
              className={`${styles.modalContentWraper}`}
            >
            {initiative?.roles.map((item) => (
              <div
                key={item.role.id}
                className={`${styles.modalRoleWrapper}`}
              >
                <div
                  className={`${styles.modalRoleName}`}
                >
                  {item.role.name}
                </div>
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
                {item.community.map((member) => {
                  const foundMember = membersList?.find((item) => item.id === member.user_info?.user.id);
                  if ((user?.user.id === member.user_info?.user.id) || !member.user_info) return null;
                  return (
                    <div
                      key={member.user_info.user.id}
                      className={`${styles.modalUserWrapper}`}
                    >
                      <div
                        className={`${styles.checkboxWrapper}`}
                      >
                        <input
                          type="checkbox"
                          checked={!!coordinatorsState.coordinators.find((coordinator) => coordinator.id === member.user_info?.user.id)}
                          onChange={(e) => member.user_info && modalCheckboxHandler(e, member.user_info.user)}
                        />
                      </div>
                      <div
                        className={`${styles.modalCell}`}
                      >
                        {`${member.user_info.user.last_name} ${member.user_info.user.first_name[0]}. ${member.user_info.user.second_name[0]}.`}
                      </div>
                      {foundMember?.properties.map((propertie) => (
                        <div
                          key={`${member.user_info?.user.id}_${propertie.id}`}
                          className={`${styles.modalCell}`}
                        >
                          {propertie.values.map((el) => el.value).join(', ')}
                        </div>
                      ))}
                    </div>
                  );
                })}

              </div>
            ))}
            </div>
            <div
              className={`${styles.modalButtonWrapper}`}
            >
              <CustomizedButton
                value="Согласовать"
                color="blue"
                onClick={() => {
                  dispatch(sendForApprovalThunk({ ...coordinatorsState, initiative: currentInitiativeId ? currentInitiativeId : -1 }));
                  dispatch(closeModal());
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
