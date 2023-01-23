import { FC } from "react";
import moment from "moment";

// Styles
import styles from './message-separator.module.scss';

type TMessageSeparatorProps = {
  date: Date;
};

export const MessageSeparator: FC<TMessageSeparatorProps> = ({ date }) => {
  return (
    <div
      className={`${styles.wrapper}`}
    >
      <div className={`${styles.line}`} />
      <div>{moment(date).format('DD.MM.YYYY')}</div>
      <div className={`${styles.line}`} />
    </div>
  )
}