import { useEffect } from "react";
import Graphics from "../../components/graphics/graphics";
import InitiativesTable from "../../components/initiatives-table/initiatives-table";
import PersonalEventsDiagram from "../../components/personal-events/personal-events";
import PersonalGraphics from "../../components/personal-graphics/personal-graphics";
import PersonalInitiativeTable from "../../components/personal-initiative-table/personal-initiative-table";
import PersonalProjectEffect from "../../components/personal-project-effect/personal-project-effect";
import { getPersonalStatsThunk } from "../../redux/personal-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

// Styles
import styles from './personal-stats.module.scss';

export default function PersonalStatsPage() {
  const dispatch = useAppDispatch();
  const project = useAppSelector((store) => store.state.project.value);

  useEffect(() => {
    if (project) dispatch(getPersonalStatsThunk(project.id));
  }, [project]);

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
      <section>
        <PersonalInitiativeTable />
      </section>
      <section>
        <PersonalEventsDiagram />
      </section>
    </div>
  );
}
