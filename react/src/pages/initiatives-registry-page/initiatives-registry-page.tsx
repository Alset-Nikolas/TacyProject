import { Tooltip } from "@mui/material";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CustomizedButton from "../../components/button/button";
import EventsTable from "../../components/events-table/events-table";
import InitiativeCoordination from "../../components/initiative-coordination/initiative-coordination";
import InitiativeManagement from "../../components/initiative-management/initiative-management";
import InitiativesTable from "../../components/initiatives-table/initiatives-table";
import Modal from "../../components/modal/modal";
import RiskManagement from "../../components/risk-management/risk-management";
import RolesAlloction from "../../components/roles-allocation/roles-allocation";
import { setCurrentInitiativeId } from "../../redux/initiatives-slice";
import {
  useGetProjectInfoQuery,
  useGetInitiativeByIdQuery,
  useGetInitiativesListQuery,
  useGetComponentsQuery,
  useDeleteInitiativeMutation,
  useGetUserRightsQuery,
  useGetAuthInfoByIdQuery,
} from "../../redux/state/state-api";
import { closeLoader, showLoader, openDeleteInitiativeModal, closeModal } from "../../redux/state/state-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

//Styles
import styles from './initiatives-registry-page.module.scss';

export default function InitiativesRegistryPage() {
  // const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const modal = useAppSelector((store) => store.state.app.modal);
  const {
    currentId,
  } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const { data: user } = useGetAuthInfoByIdQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const {
    data: initiativesList,
    isFetching: isFetchingInitiativesList,
    isSuccess: isFetchingInitiativesListSuccess,
    isError: isFetchingInitiativesListFailed,
  } = useGetInitiativesListQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const {
    currentInitiativeId
  } = useAppSelector((store) => store.initiatives);
  const {
    data: initiative,
    isFetching: isFetchingInitiative,
    isSuccess: isFetchingInitiativeSuccess,
    isError: isFetchingInitiativeFailed,
  } = useGetInitiativeByIdQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const { data: userRights } = useGetUserRightsQuery(currentInitiativeId ? currentInitiativeId : -1, {
    skip: !currentInitiativeId,
  });
  const isInitiativeApproved = initiative?.initiative.status?.value === -1;
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [
    deleteInitiative,
    {
      isError: deleteInitiativeRequestError,
      isSuccess: deleteInitiativeRequestSuccess,
    }
  ] = useDeleteInitiativeMutation();

  // const onAddClickHandler = () => {
  //   // dispatch(addInitiativeThunk());
  //   navigate(`/${paths.registry}/add`);
  // };

  const onDeleteClickHandler = () => {
    dispatch(openDeleteInitiativeModal());
  }

  useEffect(() => {
    if (currentId) {
      // dispatch(getInitiativesListThunk(currentId));
      // dispatch(getComponentsThunk(currentId));
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

  // useEffect(() => {
  //   if(isFetchingInitiativeSuccess || isFetchingInitiativeFailed || isFetchingInitiativesListSuccess || isFetchingInitiativesListFailed) {
  //     dispatch(closeLoader());
  //   }
  // }, [
  //   isFetchingInitiativeSuccess,
  //   isFetchingInitiativeFailed,
  //   isFetchingInitiativesListSuccess,
  //   isFetchingInitiativesListFailed
  // ]);

  useEffect(() => {
    if (!currentInitiativeId && initiativesList?.length) {
      if (location.state?.initiativeId) {
        dispatch(setCurrentInitiativeId(location.state?.initiativeId));
      } else {
        dispatch(setCurrentInitiativeId(initiativesList[0].initiative.id));
      }
    }
    return () => {
      // dispatch(clearInitiativesList());
      // dispatch(clearInitiative());
      // dispatch(setCurrentInitiativeId(null));
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
          externalInitiativesList={initiativesList || []}
          addButton
        />
        {/* {(user && user.user_flags_in_project?.is_create || user?.user.is_superuser) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px'}}>
            <CustomizedButton
              value="Добавить"
              color="blue"
              onClick={onAddClickHandler}
              disabled={!project?.id}
            />
          </div>
        )} */}
      </section>
      {initiative && !!initiativesList?.length && (
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
                components={components!}
              />
            </div>
          </section>
          <section>
            {/* <EventsDiagram /> */}
            <EventsTable />
          </section>
          <section>
            <RolesAlloction />
          </section>
          <section>
            <InitiativeCoordination />
          </section>
          {(userRights?.user_is_author || userRights?.user_is_superuser) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: 40,
              }}
            >
              <CustomizedButton
                value="Удалить инициативу"
                color="blue"
                onClick={onDeleteClickHandler}
              />
            </div>
          )}
        </>
      )}
      {modal.isOpen && modal.type.deleteInitiative && (
        <Modal>
          <div className={`${styles.modalWrapper}`}>
            <div>
              Вы уверены,что хотите удалить элемент?
            </div>
            <div className={`${styles.modalButtonsWrapper}`}>
              <CustomizedButton
                className={`${styles.modalButton}`}
                value="Да"
                onClick={() => {
                  if (currentInitiativeId) {
                    deleteInitiative(currentInitiativeId);
                    // dispatch(setCurrentInitiativeId(null));
                  }
                  dispatch(closeModal());
                }}
              />
              <CustomizedButton
                className={`${styles.modalButton}`}
                value="Нет"
                onClick={() => dispatch(closeModal())}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
