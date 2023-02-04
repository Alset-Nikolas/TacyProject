import { FC } from "react";
import { rights } from "../../consts";
import { useGetComponentsQuery } from "../../redux/state/state-api";
import { TRole } from "../../types";
import { useAppSelector } from "../../utils/hooks";
import { HoverPopupTable } from "../hover-popup-table/hover-popup-table";

type TRolesPopupContainerProps = {
  parent: HTMLDivElement;
  element: HTMLDivElement;
  role: TRole & {
    project: number;
}
}

const RolesPopupContainer:FC<TRolesPopupContainerProps> = ({ parent, element, role }) => {
  const currentId = useAppSelector((store) => store.state.project.currentId)
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const roles = components ? components.table_registry.roles : [];
  const data = [];

    if (role.is_approve) data.push([{
      id: `approve-${role.id}`,
      title: 'Права',
      value: rights.approve,
    }]);

    if (role.is_update) data.push([{
      id: `update-${role.id}`,
      title: 'Права',
      value: rights.update,
    }]);

  return (
    <HoverPopupTable
      data={data}
      parent={parent}
      element={element}
    />
  );
}

export default RolesPopupContainer;
