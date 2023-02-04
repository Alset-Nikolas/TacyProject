import { FC, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
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
  parent: HTMLDivElement | null;
};

export const InitiativeTableHoverFilePopup:FC<TInitiativeTableHoverPopupProps> = ({ files, initiativeIndex, parent }) => {
  const portalDiv = document.getElementById('modal-root')!;
  const { currentId } = useAppSelector((store) => store.state.project);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupWidth, setPopupWidth] = useState(0);


  const cell = document.querySelector(`#file-status-${initiativeIndex}`) as HTMLTableCellElement;
  
  const parentRect = parent?.getBoundingClientRect();
  const clientRect = cell?.getBoundingClientRect();
  const offesetHeight = clientRect.bottom - (parentRect ? parentRect.top : 0);
  // const popupWidth = popupRef.current ? popupRef.current.clientWidth : 0;
  const offesetLeft = clientRect.left - (popupWidth / 2) - (parentRect ? parentRect.left : 0);


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
      right: 0 + (parentRect ? parentRect.right : 0),
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
      {!files.length && (
        <div
          style={{
            color: 'black',
          }}
        >
          Список файлов пуст
        </div>
      )}
      {!!files.length && (
        <>
          <div
            className={`${styles.tableHeader} ${styles.tableRow}`}
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
    </div>,
    portalDiv
  );
}