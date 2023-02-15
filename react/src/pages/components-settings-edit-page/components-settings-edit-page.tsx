import EventManagement from '../../components/event-management/event-management';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import {
  setComponentsState,
} from '../../redux/components-slice';
import RiskManagement from '../../components/risk-management/risk-management';
import StatusManagement from '../../components/status-management/status-management';
import CustomizedButton from '../../components/button/button';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../consts';
import InitiativesTableConfiguration from '../../components/initiatives-table-configuration/initiatives-table-configuration';
import ModalInfo from '../../components/modal-info/modal-info';
import {
  useGetComponentsQuery,
  useUpdateComponentsMutation,
} from '../../redux/state/state-api';
import TeamTableManagement from '../../components/team-table-management/team-table-management';
import InitiativeSettingsManagement from '../../components/initiative-settings-management/initiative-settings-management';
import { openErrorModal } from '../../redux/state/state-slice';

// Styles
import styles from './components-settings-edit-page.module.scss';
//

export default function ComponentsSettingsEditPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId, value } = useAppSelector((store) => store.state.project);
  const { modal } = useAppSelector((store) => store.state.app);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  // const { value: components } = useAppSelector((store) => store.components);
  const { value: editComponents } = useAppSelector((store) => store.components);
  const [
    updateComponents,
    {
      isSuccess: updateComponentsRequestSuccess,
      isError: updateComponentsRequestError,
    } ] = useUpdateComponentsMutation();

  const onEditClick = () => {
    console.log('test');
  }

  const onCancelClick = () => {
    dispatch(setComponentsState({
      value: null,
    }));
    navigate(paths.settings.components.absolute);
  };

  const onSavelClick = () => {
    if (currentId && editComponents) {
      // dispatch(updateComponentsThunk(currentId));
      // dispatch(getComponentsThunk(currentId));
      updateComponents({
        projectId: currentId,
        components: editComponents,
      });
      
    }
  };

  useEffect(() => {
    if (!editComponents) dispatch(setComponentsState({ value: components }));
    return () => {
      dispatch(setComponentsState({ value: null }))
    }
  }, [components])

  // useEffect(() => {
  //   if (currentId === value?.id)dispatch(getInitiativesListThunk(currentId));
  // }, [currentId, value]);
  // useEffect(() => {
  //   navigate(paths.settings.components.absolute);
  // }, [currentId]);

  useEffect(() => {
    if (updateComponentsRequestSuccess) {
      dispatch(setComponentsState({
        value: null,
      }));
      navigate(paths.settings.components.absolute);
    }
    if (updateComponentsRequestError) {
      dispatch(openErrorModal('Произошла ошибка. Проверьте заполнение полей'));
    }
    return () => {
      // dispatch(setComponentsState({
      //   value: null,
      // }));
    }
  }, [
    updateComponentsRequestSuccess,
    updateComponentsRequestError
  ]);

  if (!editComponents) return null;

  return (
    <div className={`${styles.wrapper}`}>
      <div className={`${styles.headerSection}`}>
        <span className={`${styles.projectName}`}>Компоненты</span>
      </div>
      <div
        className={`${styles.sectionGroupWrapper}`}
      >
        <InitiativeSettingsManagement
          edit
          components={editComponents}
        />
        <EventManagement
          edit
          components={editComponents}
        />
      </div>
      <div
        className={`${styles.sectionGroupWrapper}`}
      >
        <section>
          <RiskManagement
            edit
            components={editComponents}
          />
        </section>
        <section>
          <StatusManagement
            edit
            components={editComponents}
          />
        </section>
      </div>
      <div
        className={`${styles.colsWrapper}`}
      >
        <section>
          <TeamTableManagement
            edit
            components={editComponents}
          />
        </section>
        <section>
          <InitiativesTableConfiguration
            edit
            components={editComponents}
          />
        </section>
      </div>
      
      <div className={`${styles.bottomSectionWrapper}`}>
        <CustomizedButton
          className={`${styles.button}`}
          value="Отменить"
          color="transparent"
          onClick={onCancelClick}
        />
        <CustomizedButton
          className={`${styles.button}`}
          value="Сохранить"
          color="blue"
          onClick={onSavelClick}
        />
      </div>
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
    </div>
  );
}
