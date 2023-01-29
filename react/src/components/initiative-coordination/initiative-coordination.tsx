import { ChangeEvent, useEffect, useRef, useState } from "react";
import { SelectChangeEvent, Tooltip } from "@mui/material";
import moment from "moment";
import SectionHeader from "../section/section-header/section-header";
import CustomizedButton from "../button/button";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import {
  closeInitiativeThunk,
  coordinateThunk,
  getChatThunk,
  postCommentThunk,
  sendForApprovalThunk
} from "../../redux/coordination-slice";
import {
  getUserRightsThunk
} from "../../redux/auth-slice";
import { useGetAuthInfoByIdQuery } from "../../redux/auth/auth-api";
import {
  // useCloseInitiativeMutation,
  useCoordinateMutation,
  useGetChatQuery,
  useGetFilesSettingsQuery,
  useGetInitiativeByIdQuery,
  useGetInitiativeFilesQuery,
  useGetProjectInfoQuery,
  useGetRolesQuery,
  useGetTeamListQuery,
  useGetUserRightsQuery,
  usePostCommentMutation,
  useSendForApprovalMutation,
  useSwitchInitiativeStateMutation,
} from "../../redux/state/state-api";
import Pictogram from "../pictogram/pictogram";
import { MessageSeparator } from "../message-separator/message-separator";
import Modal from "../modal/modal";
import { openCoordinationModal, closeModal, openErrorModal } from "../../redux/state/state-slice";
import { TUser } from "../../types";
import InitiativeFileUpload from "../initiative-file-upload/initiative-file-upload";

//Styles
import sectionStyles from '../../styles/sections.module.scss';
import styles from './initiative-coordination.module.scss';
import Checkbox from "../ui/checkbox/checkbox";


export default function InitiativeCoordination() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
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
  const { /* coordinationHistory, */ bosses } = useAppSelector((store) => store.coordination);
  const [
    switchInitiativeState,
    {
      isError: closeInitiativeRequestFailed,
    }
  ] = useSwitchInitiativeStateMutation();
  // const { userRights } = useAppSelector((store) => store.auth);
  const { data: userRights } = useGetUserRightsQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
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
  const { data: initiativeFiles } = useGetInitiativeFilesQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const isFilesUploaded = () => {
    let isUploaded = true;
    if (initiativeFiles) {
      console.log('test');
    }
    initiativeFiles?.forEach((item) => {
      if (initiative?.initiative.status?.value && 
        item.title.status.value <= initiative?.initiative.status?.value &&
        !item.file.file) {
        isUploaded = false;
      }
    });
    return isUploaded;
  }
  const coordinationButtonIsDisabled = !(userRights?.user_rights_flag.is_approve && userRights?.user_now_apprwed || userRights?.user_is_author) ||
    userRights.init_failure ||
    initiative?.initiative.status?.value === -1 ||
    !isFilesUploaded();
  const [coordinatorsState, setCoordinatorsState] = useState<{text: string, coordinators: Array<TUser & {id: number}>, initiative: number}>({
    text: '1',
    initiative: currentInitiativeId ? currentInitiativeId : -1,
    coordinators: [],
  });
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const { data: membersList } = useGetTeamListQuery({ id: currentId ? currentId : -1, project: project ? project : null });
  const { data: filesSettings} = useGetFilesSettingsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const currentStatusFilesList = filesSettings?.find((item) => item.status.id === initiative?.initiative.status?.id)?.settings_file;
  const [files, setFiles] = useState<Array<{
    id: number;
    settings_project: number;
    title: string;
    status: number;
    file: File | null;
  }>>(currentStatusFilesList ? currentStatusFilesList.map((el) => {return{...el, file: null}}) : []);
  const { data: coordinationHistory, refetch: refetchHistory } = useGetChatQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  // const [ closeInitiative, {
  //   isError: closeInitiativeRequestFailed,
  // } ] = useCloseInitiativeMutation();
  const [ coordinate ] = useCoordinateMutation();
  const [ sendForApproval ] = useSendForApprovalMutation();
  const [ postComment ] = usePostCommentMutation();

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
      // dispatch(postCommentThunk(commentState));
      postComment(commentState);
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
      // dispatch(coordinateThunk({...commentState, text: '1'}));
      coordinate({...commentState, text: '1'});
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
      // dispatch(getUserRightsThunk(currentInitiativeId));
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

  useEffect(() => {
    if (closeInitiativeRequestFailed) dispatch(openErrorModal('Ошибка при отзыве инициативы'));
  }, [closeInitiativeRequestFailed])

  useEffect(() => {
    const currentStatusFilesList = filesSettings?.find((item) => item.status.id === initiative?.initiative.status?.id)?.settings_file;
    setFiles(currentStatusFilesList ? currentStatusFilesList.map((el) => {return{...el, file: null}}) : []);
  }, [filesSettings, initiative]);

  return (
    <div
      className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}
    >
      <SectionHeader>
        <div
          className={`${sectionStyles.hideContentHeader}`}
          onClick={() => setIsOpen((prevState) => !prevState)}
        >
          Согласование инициативы
          <Pictogram
            type={isOpen ? 'close' : 'show'}
            cursor="pointer"
          />
        </div>
      </SectionHeader>
      {isOpen && (
        <>
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
                  <div
                    className={`${styles.documentsHeader}`}
                  >
                    Документы
                  </div>
                  {initiativeFiles?.map((item, index) => {
                    if (initiative?.initiative.status?.value !== undefined &&
                      (item.title.status.value >= initiative?.initiative.status?.value &&
                        initiative?.initiative.status?.value !== -1)) return null;
                    return (
                      <div
                        key={item.file.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          {item.title.title}
                        </div>
                        <div>
                          <InitiativeFileUpload
                            index={index}
                            fileUploadHandler={setFiles}
                            file={item.file}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {initiative?.initiative.status && initiative?.initiative.status?.value > 0 && (
                    <div
                      className={`${styles.documentsHeader}`}
                    >
                      На текущем этапе:
                    </div>
                  )}
                  {initiativeFiles?.map((item, index) => {
                    if (item.title.status.id !== initiative?.initiative.status?.id) return null;
                    return (
                      <div
                        key={item.file.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          {item.title.title}
                        </div>
                        <div>
                          <InitiativeFileUpload
                            index={index}
                            fileUploadHandler={setFiles}
                            file={item.file}
                          />
                        </div>
                      </div>
                    )
                  })}
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
                    disabled={!userRights?.user_is_author && !userRights?.user_is_superuser}
                    onClick={() => {
                      // closeInitiative({
                      //   initiative: initiative ? initiative?.initiative.id : -1,
                      //   failure: !userRights?.init_failure,
                      // });
                      switchInitiativeState({
                        initiative: initiative ? initiative?.initiative.id : -1,
                        failure: !userRights?.init_failure,
                      })
                    }}
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
                <div
                  className={`${styles.messagesWrapper}`}
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
          {modal.isOpen && modal.type.coordination && (
            <Modal
              closeModal={() => dispatch(closeModal())}
            >
              <div
                className={`${styles.coordinationModalWraper}`}
              >
                <div
                  className={`${styles.modalContentWraper}`}
                >
                {!initiative?.roles.length && (
                  <div>
                    Отсутствуют роли для согласования
                  </div>
                )}
                {initiative?.roles.map((item) => {
                  if (!item.role.is_approve) return null;
                  return (
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
                      {!item.community.length && (
                        <div>
                          Отсутствуют пользователи, назначенные на роль
                        </div>
                      )}
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
                              {/* <input
                                type="checkbox"
                                checked={!!coordinatorsState.coordinators.find((coordinator) => coordinator.id === member.user_info?.user.id)}
                                onChange={(e) => member.user_info && modalCheckboxHandler(e, member.user_info.user)}
                              /> */}
                              <Checkbox
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
                  );
                })}
                </div>
                <div
                  className={`${styles.modalButtonWrapper}`}
                >
                  <CustomizedButton
                    value="Согласовать"
                    color="blue"
                    disabled={!coordinatorsState.coordinators.length}
                    onClick={() => {
                      // dispatch(sendForApprovalThunk({ ...coordinatorsState, initiative: currentInitiativeId ? currentInitiativeId : -1 }));
                      sendForApproval({ ...coordinatorsState, initiative: currentInitiativeId ? currentInitiativeId : -1 });
                      dispatch(closeModal());
                    }}
                  />
                </div>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}
