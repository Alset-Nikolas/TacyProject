import TeamTable from "../../components/team-table/team-table";
import { useGetProjectInfoQuery, useGetTeamListQuery } from "../../redux/state/state-api";
import { useAppSelector } from "../../utils/hooks";

// Styles
import styles from './team-page.module.scss';

export default function TeamPage() {
  const currentId = useAppSelector((store) => store.state.project.currentId);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const { data: teamList } = useGetTeamListQuery({ id: currentId ? currentId : -1, project: project ? project : null });

  return (
    <div className={`${styles.wrapper}`}>
      <TeamTable
        teamList={teamList ? teamList : []}
      />
    </div>
  );
}
