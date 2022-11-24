import InitiativeManagement from '../../components/initiative-management/initiative-management';
import EventManagement from '../../components/event-management/event-management';
import Pictogram from '../../components/pictogram/pictogram';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { getComponentsThunk } from '../../redux/components-slice';
import { getInitiativesListThunk } from '../../redux/initiatives-slice';
import RiskManagement from '../../components/risk-management/risk-management';
import StatusManagement from '../../components/status-management/status-management';
import InitiativesTable from '../../components/initiatives-table/initiatives-table';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../consts';

// Styles
import styles from './components-settings-page.module.scss';

export default function ComponentsSettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId, value } = useAppSelector((store) => store.state.project);
  const components = useAppSelector((store) => store.components.value);
  const initiativesList = useAppSelector((store) => store.initiatives.list);

  const onEditClick = () => {
    navigate(paths.settings.components.edit.absolute);
  }

  useEffect(() => {
    if (currentId) dispatch(getComponentsThunk(currentId));
  }, [currentId]);

  useEffect(() => {
    if (currentId === value?.id)dispatch(getInitiativesListThunk(currentId));
  }, [currentId, value]);

  return (
    <div className={`${styles.wrapper}`}>
      <div className={`${styles.headerSection}`}>
        <span className={`${styles.projectName}`}>Компоненты</span>
        <div
          className={`${styles.pictogramWrapper}`}
          onClick={onEditClick}  
        >
          <Pictogram
            type="edit"
            cursor="pointer"
          />
        </div>
      </div>
      <section className={`${styles.initativeSectionWrapper}`}>
        <InitiativeManagement />
        <EventManagement />
      </section>
      <section className={`${styles.bottomSectionWrapper}`}>
        <RiskManagement
          isSettings
        />
      </section>
      <section className={`${styles.bottomSectionWrapper}`}>
        <StatusManagement />
      </section>
      <section className={`${styles.tableSectionWrapper}`}>
        <InitiativesTable
          initiativesList={initiativesList}
        />
      </section>
    </div>
  );
}
