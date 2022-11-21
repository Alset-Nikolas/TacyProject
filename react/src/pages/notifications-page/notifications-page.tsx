import SectionContent from '../../components/section/section-content/section-content';
import SectionHeader from '../../components/section/section-header/section-header';
import Select from '../../components/select/Select';

// Styles
import styles from './notifications-page.module.scss';
import sectionStyles from '../../styles/sections.module.scss'
import NotificationsRow from '../../components/notifications-row/notifications-row';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { getNotificationsThunk } from '../../redux/notifications-slice';

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((store) => store.notifications);
  const { wrapperBorder } = sectionStyles;

  useEffect(() => {
    dispatch(getNotificationsThunk());
  }, [])

  return (
    <div className={`${styles.wrapper} ${wrapperBorder}`}>
      <SectionHeader>
        <span style={{ marginRight: '20px' }}>Уведомления</span>
        {/* <Select
          value={'Сегодня'}
          items={['Сегодня', 'Неделя', 'Месяц']}
        /> */}
      </SectionHeader>
      <SectionContent
        className={`${styles.content}`}
      >
        {notifications && notifications.length ? (
          notifications.map((notification) => <NotificationsRow notification={notification} key={notification.id} />)
        ) : (
          <div>
            Cписок уведомлений пуст
          </div>
        )}
      </SectionContent>
    </div>
  );
}
