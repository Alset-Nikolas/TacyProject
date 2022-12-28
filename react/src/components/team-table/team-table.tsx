import { useAppDispatch, useAppSelector } from "../../utils/hooks";
import TeamRow from "../team-row/team-row";

// Styles
import styles from './team-table.module.scss';
import sectionStyles from '../../styles/sections.module.scss'
import { useEffect } from "react";
import { addNotExistingPropertie } from "../../redux/team-slice";
import ModalInfo from "../modal-info/modal-info";
import { useGetTeamListQuery, usePostTeamListMutation } from "../../redux/team/team-api";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { TTeamMember } from "../../types";

type TTeamTableProps = {
  teamList: Array<TTeamMember>;
  removeMember?: (index: number) => void;
  edit?: boolean;
}

export default function TeamTable({ edit, teamList, removeMember }: TTeamTableProps) {
  const dispatch = useAppDispatch();
  // const teamList = useAppSelector((store) => store.team.list);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  // const { data: teamList } = useGetTeamListQuery(
  //   {
  //     id: currentId ? currentId : -1,
  //     project: project ? project : null
  //   }, {
  //     skip: !project || !currentId,
  //   }
  // );

  const modal = useAppSelector((store) => store.state.app.modal);

  // if (!teamList.length) return null;
  useEffect(() => {
    teamList?.forEach((member, index) => {
      if (project) {
        project.properties.forEach((propertie, propIndex) => {
          let outputPropertie = member.properties.find((prop) => prop.title === propertie.title);
          if (!outputPropertie) {
            outputPropertie = {
              values: [],
              title: propertie.title,
              id: propertie.id,
            };
            dispatch(addNotExistingPropertie({ index: index, propertie: outputPropertie }));
          }
        });
      }
    });
  }, [teamList]);

  return (
    <div className={`${styles.wrapper} ${edit ? '' : sectionStyles.wrapperBorder}`}>
      <table>
        <thead>
          <TeamRow edit={edit ? true : false} header />
        </thead>
        <tbody>
          {teamList?.map((member, index) => (
            <TeamRow
              edit={edit}
              index={index}
              member={member}
              removeMember={removeMember}
              key={member.id !== -1 ? member.id : `new_member_${index}`}
            />
          ))}
        </tbody>
      </table>
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
      {modal.isOpen && modal.type.message && (
        <ModalInfo message={modal.message} />
      )}
    </div>
  );
}
