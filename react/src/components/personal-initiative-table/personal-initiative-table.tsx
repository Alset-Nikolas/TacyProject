import { useEffect } from "react";
import { getPersonalInitiativesListThunk } from "../../redux/initiatives-slice";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import InitiativesTable from "../initiatives-table/initiatives-table";

export default function PersonalInitiativeTable() {
  const dispatch = useAppDispatch();
  const personalInitiativesList = useAppSelector((store) => store.personal.personalStats.user_initiatives);
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);

  // useEffect(() => {
  //   if (project) dispatch(getPersonalInitiativesListThunk(project.id))
  // }, [project]);

  return (
    <InitiativesTable
      initiativesList={personalInitiativesList}
    />
  )
}