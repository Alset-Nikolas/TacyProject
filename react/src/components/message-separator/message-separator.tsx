import { FC } from "react";
import moment from "moment";

// Styles
import styles from './message-separator.module.scss';
import { formatDate } from "../../utils";
import { dateFormat } from "../../consts";

type TMessageSeparatorProps = {
  date: Date;
};

export const MessageSeparator: FC<TMessageSeparatorProps> = ({ date }) => {
  return (
    <div
      className={`${styles.wrapper}`}
    >
      <div className={`${styles.line}`} />
      <div>{formatDate(date, dateFormat)}</div>
      <div className={`${styles.line}`} />
    </div>
  )
}