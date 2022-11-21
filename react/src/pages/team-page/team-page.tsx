import { useEffect } from "react";
import TeamTable from "../../components/team-table/team-table";
import { clearList, getTeamThunk } from "../../redux/team-slice";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";

// Styles
import styles from './team-page.module.scss';

export default function TeamPage() {
  const dispatch = useAppDispatch();
  const currentId = useAppSelector((store) => store.state.project.currentId);

  useEffect(() => {
    if (currentId) dispatch(getTeamThunk(currentId));
    return () => {
      dispatch(clearList());
    }
  }, [currentId]);

  return (
    <div className={`${styles.wrapper}`}>
      <TeamTable />
    </div>
  );
}
