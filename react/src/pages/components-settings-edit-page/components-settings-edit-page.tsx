import InitiativeManagement from '../../components/initiative-management/initiative-management';
import EventManagement from '../../components/event-management/event-management';
import Pictogram from '../../components/pictogram/pictogram';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { getComponentsThunk, setComponentsState, updateComponentsThunk } from '../../redux/components-slice';
import { getInitiativesListThunk } from '../../redux/initiatives-slice';
import RiskManagement from '../../components/risk-management/risk-management';
import StatusManagement from '../../components/status-management/status-management';
import InitiativesTable from '../../components/initiatives-table/initiatives-table';
import CustomizedButton from '../../components/button/button';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../consts';

// Styles
import styles from './components-settings-edit-page.module.scss';
import InitiativesTableConfiguration from '../../components/initiatives-table-configuration/initiatives-table-configuration';
import ModalInfo from '../../components/modal-info/modal-info';

export default function ComponentsSettingsEditPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId, value } = useAppSelector((store) => store.state.project);
  const { modal } = useAppSelector((store) => store.state.app);
  const { updateComponentsRequestSuccess } = useAppSelector((store) => store.components)

  const onEditClick = () => {
    console.log('test');
  }

  const onCancelClick = () => {
    navigate(paths.settings.components.absolute);
  };

  const onSavelClick = () => {
    if (currentId) {
      dispatch(updateComponentsThunk(currentId));
      dispatch(getComponentsThunk(currentId));
    }
  };

  useEffect(() => {
    if (currentId) dispatch(getComponentsThunk(currentId));
  }, [currentId]);

  useEffect(() => {
    if (currentId === value?.id)dispatch(getInitiativesListThunk(currentId));
  }, [currentId, value]);

  useEffect(() => {
    if (updateComponentsRequestSuccess) navigate(paths.settings.components.absolute);
    return () => {
      dispatch(setComponentsState({
        updateComponentsRequest: false,
        updateComponentsRequestSuccess: false,
        updateComponentsRequestFailed: false,

      }));
    }
  }, [updateComponentsRequestSuccess])

  return (
    <div className={`${styles.wrapper}`}>
      <div className={`${styles.headerSection}`}>
        <span className={`${styles.projectName}`}>Компоненты</span>
      </div>
      <InitiativeManagement
        edit
      />
      <EventManagement
        edit
      />
      <section>
        <RiskManagement
        edit
      />
      </section>
      <section>
        <StatusManagement
          edit
        />
      </section>
      <section>
        <InitiativesTableConfiguration />
      </section>
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
