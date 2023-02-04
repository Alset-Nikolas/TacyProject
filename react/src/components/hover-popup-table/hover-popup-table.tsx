import { FC, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

// Styles
import styles from './hover-popup-table.module.scss';

type THoverPopupTableProps = {
  data: Array<Array<{
    id: number | string;
    title: string;
    value: string | number;
  }>>;
  element: HTMLDivElement;
  parent: HTMLDivElement;
};

export const HoverPopupTable:FC<THoverPopupTableProps> = ({ data, element, parent }) => {
  const portalDiv = document.getElementById('modal-root')!;
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupWidth, setPopupWidth] = useState(0);

  const parentRect = parent?.getBoundingClientRect();
  const clientRect = element?.getBoundingClientRect();
  const offesetHeight = clientRect.bottom - (parentRect ? parentRect.top : 0);
  const offesetLeft = clientRect.left + (clientRect.width / 2) - (popupWidth / 2) - (parentRect ? parentRect.left : 0);

  let style: {
    opacity: number;
    top: string | number,
    left: string | number,
    right: string | number,
  } = {
    opacity: popupWidth ? 1 : 0,
    top: offesetHeight + (parent ? parent.offsetTop : 0),//(parentRect ? parentRect.top : 0),
    left: offesetLeft + (parentRect ? parentRect.left : 0),
    right: '',
  };

  if (parentRect && (offesetLeft + popupWidth + parentRect.left > parentRect.right)) {
    style = {
      opacity: popupWidth ? 1 : 0,
      top: offesetHeight + (parent ? parent.offsetTop : 0), //(parentRect ? parentRect.top : 0),
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
      {!data.length && (
        <div>
          Информация отсутствует
        </div>
      )}
      {!!data.length && (
        <table>
          <thead
            className={`${styles.tableHeader}`}
          >
            <tr>
              {data[0].map((item) => {
                return (
                  <th
                    key={item.id}
                    className={`${styles.cell}`}
                  >
                    {item.title}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => {
              return (
                <tr
                  key={`row-${rowIndex}`}
                  className={`${styles.tableRow}`}
                >
                  {item.map((rowElement) => {
                    return (
                      <td
                        key={`${rowElement.id}`}
                        className={`${styles.cell}`}
                      >
                        {rowElement.value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>,
    portalDiv
  );
}