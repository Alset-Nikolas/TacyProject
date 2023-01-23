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
import TeamTableManagement from '../../components/team-table-management/team-table-management';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../consts';

// Styles
import styles from './components-settings-page.module.scss';
import InitiativesTableConfiguration from '../../components/initiatives-table-configuration/initiatives-table-configuration';
import InitiativeSettingsManagement from '../../components/initiative-settings-management/initiative-settings-management';
import { useGetComponentsQuery } from '../../redux/state/state-api';

export default function ComponentsSettingsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentId, value } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  // const components = useAppSelector((store) => store.components.value);
  const initiativesList = useAppSelector((store) => store.initiatives.list);

  const onEditClick = () => {
    navigate(paths.settings.components.edit.absolute);
  }

  // useEffect(() => {
  //   if (currentId) dispatch(getComponentsThunk(currentId));
  // }, [currentId]);

  // useEffect(() => {
  //   if (currentId === value?.id)dispatch(getInitiativesListThunk(currentId));
  // }, [currentId, value]);

  if (!components) {
    return null;
  }

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
        <div>
          <InitiativeSettingsManagement
            components={components}
          />
        </div>
        <div>
          <EventManagement
            components={components}
          />
        </div>
      </section>
      <div
        style={{
          display: 'flex',
          gap: 40,
        }}
      >
        <section className={`${styles.bottomSectionWrapper}`}>
          <RiskManagement
            isSettings
            components={components}
          />
        </section>
        <section className={`${styles.bottomSectionWrapper}`}>
          <StatusManagement
            components={components}
          />
        </section>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 40,
        }}
      >
        <section className={`${styles.bottomSectionWrapper}`}>
          <TeamTableManagement
            components={components}
          />
        </section>
        <section className={`${styles.bottomSectionWrapper}`}>
          <InitiativesTableConfiguration
            components={components}
          />
        </section>
      </div>
      {/* <section className={`${styles.tableSectionWrapper}`}>
        <InitiativesTable
          externalInitiativesList={initiativesList}
        />
      </section> */}
    </div>
  );
}
