import { FC, useRef } from "react";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { TUser } from "../../types";
import { useAppSelector } from "../../utils/hooks";

// Styles
import styles from './initiative-table-hover-popup.module.scss';

type TInitiativeTableHoverPopupProps = {
  community: Array<{
    user_info: {
      user: TUser & {
        id: number;
      };
      properties: Array<{
        title: {
            id: number;
            title: string;
        };
        values: Array<{
            id: number;
            value: string;
        }>;
      }>;
    } | null;
    status: boolean | null;
  }>;
  initiativeIndex: number;
  roleIndex: number;
};

export const InitiativeTableHoverPopup:FC<TInitiativeTableHoverPopupProps> = ({ community, initiativeIndex, roleIndex }) => {
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const popupRef = useRef<HTMLDivElement>(null);

  const cell = document.querySelector(`#role-${initiativeIndex}-${roleIndex}`) as HTMLTableCellElement;
  
  const clientRect = cell?.getBoundingClientRect();
  const offesetHeight = clientRect.top + cell?.clientHeight;
  const popupWidth = popupRef.current ? popupRef.current.clientWidth : 0;
  const offesetLeft = clientRect.left - (popupWidth / 2);

  const statusStyles = new Map([
    [true, styles.statusApproved],
    [false, styles.statusNotApproved],
    [null, styles.statusNone],
  ]);

  return (
    
    <div
      className={`${styles.wrapper}`}
      style={{
        top: offesetHeight,
        left: offesetLeft
      }}
      ref={popupRef}
    >
      {!community.length && (
        <div>
          Список пользователей пуст
        </div>
      )}
      {!!community.length && (
        <>
          <div
            className={`${styles.tableHeader}`}
          >
            <div
              className={`${styles.name}`}
            >
              ФИО
            </div>
            <div
              className={`${styles.status}`}
            >
              Статус
            </div>
            {project?.properties.map((propertie) => (
              <div
                key={propertie.id}
                className={`${styles.cell}`}
              >
                {propertie.title}
              </div>
            ))}
          </div>
          {community.map((item) => {
            return (
              <div
                key={item.user_info?.user.id}
                className={`${styles.tableRow}`}
              >
                <div
                  className={`${styles.name}`}
                >
                  {`${item.user_info?.user.last_name} ${item.user_info?.user.first_name[0]}. ${item.user_info?.user.second_name[0]}.`}
                </div>
                <div
                  className={`${styles.status}`}
                >
                  <div
                    className={`${styles.statusIndicator} ${statusStyles.get(item.status)}`}
                  />
                </div>
                {item.user_info?.properties.map((propertie) => {
                  return (
                    <div
                      key={`${item.user_info?.user.id}-${propertie.title.id}`}
                      className={`${styles.cell}`}
                    >
                      {propertie.values.map((el) => el.value).join(', ')}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}