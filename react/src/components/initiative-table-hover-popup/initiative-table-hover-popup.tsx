import { FC, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useGetComponentsQuery, useGetProjectInfoQuery } from "../../redux/state/state-api";
import { TUser } from "../../types";
import { makeShortedName } from "../../utils";
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
          is_community_activate: boolean;
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
  parent: HTMLDivElement | null;
};

export const InitiativeTableHoverPopup:FC<TInitiativeTableHoverPopupProps> = ({ community, initiativeIndex, roleIndex, parent }) => {
  const portalDiv = document.getElementById('modal-root')!;
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: components } = useGetComponentsQuery(currentId ? currentId : -1);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupWidth, setPopupWidth] = useState(0);

  const cell = document.querySelector(`#role-${initiativeIndex}-${roleIndex}`) as HTMLTableCellElement;
  
  const parentRect = parent?.getBoundingClientRect();
  const clientRect = cell?.getBoundingClientRect();
  const offesetHeight = clientRect.bottom - (parentRect ? parentRect.top : 0);
  // const popupWidth = popupRef.current ? popupRef.current.clientWidth : 0;
  const offesetLeft = clientRect.left - (popupWidth / 2) - (parentRect ? parentRect.left : 0);

  const statusStyles = new Map([
    [true, styles.statusApproved],
    [false, styles.statusNotApproved],
    [null, styles.statusNone],
  ]);

  let style: {
    opacity: number;
    top: string | number,
    left: string | number,
    right: string | number,
  } = {
    opacity: popupWidth ? 1 : 0,
    top: offesetHeight + (parent ? parent.offsetTop : 0), // (parentRect ? parentRect.top : 0),
    left: offesetLeft + (parentRect ? parentRect.left : 0),
    right: '',
  };

  if (parentRect && (offesetLeft + popupWidth + parentRect.left > parentRect.right)) {
    style = {
      opacity: popupWidth ? 1 : 0,
      top: offesetHeight + (parent ? parent.offsetTop : 0), // (parentRect ? parentRect.top : 0),
      left: '',
      right: 0 + (parentRect ? (parentRect.right - parentRect.width) : 0),
    }
  }

  useEffect(() => {
    if (popupRef.current) setPopupWidth(popupRef.current.clientWidth);
  }, [])

  return ReactDOM.createPortal(
    
    <div
      className={`${styles.wrapper}`}
      style={style}
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
            {components?.table_community.properties.map((propertie) => {
              if (!propertie.is_community_activate) return null;
              return (
                <div
                  key={propertie.id}
                  className={`${styles.cell}`}
                >
                  {propertie.title}
                </div>
              );
            })}
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
                  {item.user_info ? makeShortedName(item.user_info?.user) : ''}
                </div>
                <div
                  className={`${styles.status}`}
                >
                  <div
                    className={`${styles.statusIndicator} ${statusStyles.get(item.status)}`}
                  />
                </div>
                {item.user_info?.properties.map((propertie) => {
                  if (!propertie.title.is_community_activate) return null;
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
    </div>,
    portalDiv
  );
}