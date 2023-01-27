// Styles
import moment from 'moment';
import styles from './notifications.module.scss';

type TNotificationsRowProps = {
  notification: {
    user: number;
    text: string;
    date: string;
  }
};

export default function NotificationsRow({ notification }: TNotificationsRowProps) {
  const { text, date } = notification;
  const dateMatch = date.match(/\d+/g);
  const dateInt = dateMatch?.map((el) => Number.parseInt(el));
  const jsDate = dateInt ? new Date(dateInt[2], dateInt[1], dateInt[0], dateInt[3], dateInt[4], dateInt[5]) : new Date();
  return (
    <div className={`${styles.wrapper}`}>
      <div className={`${styles.message}`}>
        {text}
      </div>
      <div className={`${styles.time}`}>
        {moment(jsDate).format('hh:mm')}
      </div>
      <div className={`${styles.date}`}>
        {moment(jsDate).format('DD.MM.YYYY')}
      </div>
    </div>
  );
}
