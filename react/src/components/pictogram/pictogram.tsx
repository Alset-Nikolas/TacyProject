import settingsIconSrc from '../../images/icons/settings.svg';
import notificationsIconSrc from '../../images/icons/notifications.svg';
import logoutIconSrc from '../../images/icons/logout.svg';
import editIconSrc from '../../images/icons/edit.svg';
import addIconSrc from '../../images/icons/add.svg';
import deleteIconSrc from '../../images/icons/delete.svg';
import { MouseEventHandler } from 'react';

type TPictogramProps = {
  type: 'settings' | 'notifications' | 'logout' | 'edit' | 'delete' | 'add';
  cursor?: 'pointer' | 'default', 
  onClick?: MouseEventHandler<HTMLImageElement>;
};

export default function Pictogram({ type, onClick, cursor = 'default' }: TPictogramProps) {
  let iconSrc;
  switch(type) {
    case 'settings':
      iconSrc = settingsIconSrc;
    break;
    case 'notifications':
      iconSrc = notificationsIconSrc;
    break;
    case 'logout':
      iconSrc = logoutIconSrc;
    break;
    case 'edit':
      iconSrc = editIconSrc;
    break;
    case 'delete':
      iconSrc = deleteIconSrc;
    break;
    case 'add':
      iconSrc = addIconSrc;
    break;
    default:
      iconSrc = settingsIconSrc;
  }
  return (
    <>
      <img
        src={iconSrc}
        style={{
          cursor,
        }}
        onClick={onClick}
      />
    </>
  );
}
