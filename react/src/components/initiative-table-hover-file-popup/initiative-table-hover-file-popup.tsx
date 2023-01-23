import { FC, useRef } from "react";
import { useGetProjectInfoQuery } from "../../redux/state/state-api";
import { TUser } from "../../types";
import { useAppSelector } from "../../utils/hooks";

// Styles
import styles from './initiative-table-hover-file-popup.module.scss';

type TInitiativeTableHoverPopupProps = {
  files: Array<{
    file: string | null;
    file_name: string;
    id: number;
    initiative: number;
    title: {
      id: number;
      settings_project: number;
      title: string;
    };
  }>;
  initiativeIndex: number;
};

export const InitiativeTableHoverFilePopup:FC<TInitiativeTableHoverPopupProps> = ({ files, initiativeIndex }) => {
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const popupRef = useRef<HTMLDivElement>(null);

  const cell = document.querySelector(`#file-status-${initiativeIndex}`) as HTMLTableCellElement;
  
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
      {!files.length && (
        <div>
          Список файлов пуст
        </div>
      )}
      {!!files.length && (
        <>
          <div
            className={`${styles.tableHeader}`}
          >
            <div
              className={`${styles.name}`}
            >
              Документ
            </div>
            <div
              className={`${styles.status}`}
            >
              Статус
            </div>
          </div>
          {files.map((item) => {
            return (
              <div
                key={item.id}
                className={`${styles.tableRow}`}
              >
                <div
                  className={`${styles.name}`}
                >
                  {`${item.title.title}`}
                </div>
                <div
                  className={`${styles.status}`}
                >
                  {`${item.file_name ? 'Загружен' : 'Отсутствует'}`}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}