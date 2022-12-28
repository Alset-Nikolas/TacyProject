import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomizedButton from "../../components/button/button";
import EventsTable from "../../components/events-table/events-table";
import InitiativeCoordination from "../../components/initiative-coordination/initiative-coordination";
import EventsDiagram from "../../components/initiative-events/initiative-events";
import InitiativeManagement from "../../components/initiative-management/initiative-management";
import InitiativesTable from "../../components/initiatives-table/initiatives-table";
import RiskManagement from "../../components/risk-management/risk-management";
import RolesAlloction from "../../components/roles-allocation/roles-allocation";
import { paths } from "../../consts";
import { useGetAuthInfoByIdQuery } from "../../redux/auth/auth-api";
import { getComponentsThunk } from "../../redux/components-slice";
import { setCurrentInitiativeId } from "../../redux/initiatives-slice";
import { useGetInitiativeByIdQuery, useGetInitiativesListQuery } from "../../redux/initiatives/initiatives-api";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { closeLoader, showLoader } from "../../redux/state/state-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

//Styles
import styles from './initiatives-registry-page.module.scss';

export default function InitiativesRegistryPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    currentId,
  } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const {
    userRights
  } = useAppSelector((store) => store.auth);
  const { data: user } = useGetAuthInfoByIdQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const {
    data: initiativesList,
    isFetching: isFetchingInitiativesList,
  } = useGetInitiativesListQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
    isFetching: isFetchingInitiative,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const isInitiativeApproved = initiative?.initiative.status?.value === -1;

  const onAddClickHandler = () => {
    // dispatch(addInitiativeThunk());
    navigate(`/${paths.registry}/add`);
  };

  useEffect(() => {
    if (currentId) {
      // dispatch(getInitiativesListThunk(currentId));
      dispatch(getComponentsThunk(currentId));
      // dispatch(getUserInfoByIdThunk(currentId));
    }
  }, [currentId]);

  useEffect(() => {
    if (isFetchingInitiative || isFetchingInitiativesList) {
      dispatch(showLoader());
    } else {
      dispatch(closeLoader());
    }
  }, [
    isFetchingInitiative,
    isFetchingInitiativesList,
  ]);

  useEffect(() => {
    if (!currentInitiativeId && initiativesList?.length) {
      dispatch(setCurrentInitiativeId(initiativesList[0].initiative.id));
    }
    return () => {
      // dispatch(clearInitiativesList());
      // dispatch(clearInitiative());
      dispatch(setCurrentInitiativeId(null));
    }
  }, []);

  return (
    <div
      className={`${styles.wrapper}`}
    >
      <section
        className={`${styles.tableWrapper}`}
      >
        <InitiativesTable
          initiativesList={initiativesList || []}
        />
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
                editButton={((userRights?.user_is_author && !isInitiativeApproved) || user?.user.is_superuser) ? true : false}
              />
            </div>
            <div
              style={{ flex: '1 1' }}
            >
              <RiskManagement
                editButton={((userRights?.user_is_author && !isInitiativeApproved) || user?.user.is_superuser) ? true : false}
              />
            </div>
          </section>
          <section>
            <EventsDiagram />
            <EventsTable />
          </section>
          <section>
            <RolesAlloction />
          </section>
          <section>
            <InitiativeCoordination />
          </section>
        </>
      )}
      
    </div>
  );
}
