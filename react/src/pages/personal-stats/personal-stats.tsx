import { useEffect } from "react";
import EventsTable from "../../components/events-table/events-table";
import Graphics from "../../components/graphics/graphics";
import InitiativesTable from "../../components/initiatives-table/initiatives-table";
import PersonalEventsDiagram from "../../components/personal-events/personal-events";
import PersonalGraphics from "../../components/personal-graphics/personal-graphics";
import PersonalInitiativeTable from "../../components/personal-initiative-table/personal-initiative-table";
import PersonalProjectEffect from "../../components/personal-project-effect/personal-project-effect";
import { getPersonalStatsThunk } from "../../redux/personal-slice";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

// Styles
import styles from './personal-stats.module.scss';

export default function PersonalStatsPage() {
  const dispatch = useAppDispatch();
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);

  useEffect(() => {
    if (currentId) dispatch(getPersonalStatsThunk(currentId));
  }, [currentId]);

  return (
    <div
      className={`${styles.wrapper}`}
    >
      <section
        style={{ marginBottom: 40 }}
      >
        <PersonalProjectEffect />
      </section>
      <section>
        <PersonalGraphics />
      </section>
      <section
        style={{ marginBottom: 40 }}
      >
        <PersonalInitiativeTable />
      </section>
      <section>
        {/* <PersonalEventsDiagram /> */}
        <EventsTable />
      </section>
    </div>
  );
}
