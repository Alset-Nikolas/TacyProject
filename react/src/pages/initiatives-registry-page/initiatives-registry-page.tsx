import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomizedButton from "../../components/button/button";
import EventManagement from "../../components/event-management/event-management";
import InitiativeCoordination from "../../components/initiative-coordination/initiative-coordination";
import InitiativeManagement from "../../components/initiative-management/initiative-management";
import InitiativesTable from "../../components/initiatives-table/initiatives-table";
import ProjectTimeline from "../../components/project-timeline/project-timeline";
import RiskManagement from "../../components/risk-management/risk-management";
import { paths } from "../../consts";
import { getUserInfoByIdThunk, getUserRightsThunk } from "../../redux/auth-slice";
import { getComponentsThunk } from "../../redux/components-slice";
import { getInitiativesListThunk } from "../../redux/initiatives-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

//Styles
import styles from './initiatives-registry-page.module.scss';

export default function InitiativesRegistryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentId = useAppSelector((store) => store.state.project.currentId);
  const project = useAppSelector((store) => store.state.project.value);
  const { user, userRights } = useAppSelector((store) => store.auth);
  const initiative = useAppSelector((store) => store.initiatives.initiative);

  const onAddClickHandler = () => {
    // dispatch(addInitiativeThunk());
    navigate(`/${paths.registry}/add`);
  };

  useEffect(() => {
    if (currentId) {
      dispatch(getInitiativesListThunk(currentId));
      dispatch(getComponentsThunk(currentId));
      // dispatch(getUserInfoByIdThunk(currentId));
    }
  }, [currentId]);

  return (
    <div
      className={`${styles.wrapper}`}
    >
      <section
        className={`${styles.tableWrapper}`}
      >
        <InitiativesTable />
        {(user && user.user_flags_in_project?.is_create || user?.user.is_superuser) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px'}}>
            <CustomizedButton
              value="Добавить инициативу"
              color="blue"
              onClick={onAddClickHandler}
              disabled={!project?.id}
            />
          </div>
        )}
      </section>
      {initiative && (
        <>
          <section
            style={{ display: 'flex', gap: '40px', margin: '40px 0', width: '100%'}}
          >
            <div
              style={{ flex: '1 1' }}
            >
              <InitiativeManagement
                editButton={user?.user.is_superuser ? true : false}
              />
            </div>
            <div
              style={{ flex: '1 1' }}
            >
              <RiskManagement
                editButton={user?.user.is_superuser ? true : false}
              />
            </div>
          </section>
          <section>
            <div>
              <Link
                to={`/${paths.events}`}
              >
                К списку мероприятий
              </Link>
            </div>
            <ProjectTimeline />
            <div>
              {userRights?.user_is_author && (
                <CustomizedButton
                  value="Добавить"
                  color="blue"
                  onClick={() => {
                    navigate(`/${paths.events}/add`);
                  }}
                />
              )}
            </div>
          </section>
          <section>
            <InitiativeCoordination />
          </section>
        </>
      )}
      
    </div>
  );
}
