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
  const jsDate = new Date(date);
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
