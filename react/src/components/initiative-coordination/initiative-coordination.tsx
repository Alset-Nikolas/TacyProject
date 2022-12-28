import SectionHeader from "../section/section-header/section-header";
import CustomizedButton from "../button/button";

//Styles
import sectionStyles from '../../styles/sections.module.scss';
import styles from './initiative-coordination.module.scss';
import { ChangeEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import { clearBossesList, closeInitiativeThunk, coordinateThunk, getBossesListThunk, getChatThunk, postCommentThunk, sendForApprovalThunk } from "../../redux/coordination-slice";
import { getUserInfoByIdThunk, getUserRightsThunk } from "../../redux/auth-slice";
import CustomizedSelect from "../select/Select";
import moment from "moment";
import { SelectChangeEvent } from "@mui/material";
import { useGetAuthInfoByIdQuery } from "../../redux/auth/auth-api";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";

export default function InitiativeCoordination() {
  const dispatch = useAppDispatch();
  const initiative = useAppSelector((store) => store.initiatives.initiative);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  // const project = useAppSelector((store) => store.state.project.value);
  // const teamList = useAppSelector((store) => store.team.list);
  const { coordinationHistory, bosses } = useAppSelector((store) => store.coordination);
  const { userRights } = useAppSelector((store) => store.auth);
  const { data: user } = useGetAuthInfoByIdQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [ commentState, setCommentState ] = useState({
    text: '',
    initiative: initiative ? initiative.initiative.id : -1,
  });
  const bossesNamesList = [ ...bosses.map((boss) => {
    return { 
      id: boss.id,
      name: `${boss.last_name} ${boss.first_name} ${boss.second_name}`,
    };
  })].filter((boss) => boss.id !== user?.user.id);

  const [ coordinatorName, setCoordinatorName ] = useState(bossesNamesList.length ? bossesNamesList[0].name : ''); 
  const coordinationButtonIsDisabled = !(userRights?.user_rights_flag.is_coordinate && userRights?.user_now_apprwed || userRights?.user_is_author) ||
    userRights.init_failure ||
    initiative?.initiative.status?.value === -1;

  const inputChangeHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentState((prevState) => { 
      return {
        ...prevState,
        [name]: value
      }
    });
  };

  const postCommentHandler = () => {
    dispatch(postCommentThunk(commentState));
    setCommentState((prevState) => { 
      return {
        ...prevState,
        text: '',
      }
    });
  };

  const postCoordinateHandler = () => {
    const coordinatorId = bossesNamesList.find((member) => member.name === coordinatorName)?.id;
    if (userRights?.user_is_author && coordinatorId) {
      dispatch(sendForApprovalThunk({ ...commentState, coordinator: coordinatorId }))
    } else {
      dispatch(coordinateThunk(commentState));
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

  useEffect(() => {
    if (initiative) {
      dispatch(getChatThunk(initiative.initiative.id));
      dispatch(getUserRightsThunk(initiative.initiative.id));
      setCommentState((prevState) => { 
        return {
          ...prevState,
          initiative: initiative.initiative.id,
        }
      });
    }
    if (project) {
      dispatch(getBossesListThunk(project.id));
    }
  }, [initiative, project]);

  useEffect(() => {
    return () => {
      dispatch(clearBossesList());
    };
  }, []);

  return (
    <div
      className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}
    >
      <SectionHeader
       className={`${styles.header}`}
      >
        Согласование инициативы
      </SectionHeader>
      {userRights && userRights.user_is_author && (
        <div
          className={`${styles.topSection}`}
        >
          <div>
            <CustomizedSelect
              items={[ ...bossesNamesList.map((boss) => boss.name), '' ]}
              value={coordinatorName}
              onChange={onSelectorChange}
            />
          </div>
          <div>
            <CustomizedButton
              value={`${userRights?.init_failure ? 'Восстановить инициативу' : "Отозвать инициативу"}`}
              color="blue"
              onClick={() => dispatch(closeInitiativeThunk({
                initiative: initiative ? initiative?.initiative.id : -1,
                failure: !userRights?.init_failure,
              }))}
            />
          </div>
        </div>
      )}
      <div
        className={`${styles.content}`}
      >
        <div
          className={`${styles.col}`}
        >
          {userRights?.init_failure ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '30px',
              }}
            >Инициатива отозвана</div>
          ) : (
            <>
              <textarea
                name="text"
                value={commentState.text}
                className={`${styles.textInput}`}
                onChange={inputChangeHandler}
              >

              </textarea>
              <div
                className={`${styles.buttonWrapper}`}
              >
                <CustomizedButton
                  className={`${styles.button}`}
                  value="Оставить комментарий"
                  color="blue"
                  disabled={!userRights?.user_add_comment}
                  onClick={postCommentHandler}
                />
                <CustomizedButton
                  className={`${styles.button}`}
                  value="Согласовать"
                  color="blue"
                  disabled={coordinationButtonIsDisabled}
                  onClick={postCoordinateHandler}
                />
              </div>
            </>
          )}
        </div>
        <div
          className={`${styles.col} ${styles.chat}`}
        >
          {(!coordinationHistory || !coordinationHistory.length) && (
            <div>История пуста</div>
          )}
          {coordinationHistory && coordinationHistory.map((element) => {
            // const author = teamList.find((member) => member.id === element.author_text);
            const isServiceMessage = element.action === 'Служебное сообщение';
            const isComment = element.action === 'Новый комментарий'
            const isApprovement = element.action === 'Инициатива согласована'
            const authorName = element.author_text?.first_name ?
              `${element.author_text.last_name} ${element.author_text.first_name} ${element.author_text.second_name}`
              :
              'Админ';
            const coordinator = element.coordinator?.first_name ?
             `${element.coordinator.last_name} ${element.coordinator.first_name} ${element.coordinator.second_name}`
             :
             '';
            const date = new Date(element.date);
            // const statusName = components?.settings?.initiative_status.find((status) => status.id === element.status)?.name;
            return (
              <div key={element.id}>
                <div
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
                </div>
                <div
                  className={`${styles.messageWrapper} ${isComment ? styles.comment : ''}`}
                >
                  {element.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
