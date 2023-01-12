import settingsIconSrc from '../../images/icons/settings.svg';
import notificationsIconSrc from '../../images/icons/notifications.svg';
import logoutIconSrc from '../../images/icons/logout.svg';
import editIconSrc from '../../images/icons/edit.svg';
import addIconSrc from '../../images/icons/add.svg';
import addFilledIconSrc from '../../images/icons/add_filled.svg';
import deleteIconSrc from '../../images/icons/delete.svg';
import deleteFilledIconSrc from '../../images/icons/delete_filled.svg';
import showIconSrc from '../../images/icons/arrow.svg';
import exportIconSrc from '../../images/icons/export.svg';
import sendIconSrc from '../../images/icons/send.svg';
import { MouseEventHandler } from 'react';

type TPictogramProps = {
  type: 'settings' |
    'notifications' |
    'logout' |
    'edit' |
    'delete' |
    'delete-filled'
    | 'add' |
    'add-filled' |
    'show' |
    'close' |
    'export' |
    'send';
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
    case 'delete-filled':
      iconSrc = deleteFilledIconSrc;
    break;
    case 'add':
      iconSrc = addIconSrc;
    break;
    case 'add-filled':
      iconSrc = addFilledIconSrc;
    break;
    case 'show':
      iconSrc = showIconSrc;
    break;
    case 'close':
      iconSrc = showIconSrc;
    break;
    case 'export':
      iconSrc = exportIconSrc;
    break;
    case 'send':
      iconSrc = sendIconSrc;
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
          transform: type === 'show' ? 'rotate(180deg)' : '',
        }}
        onClick={onClick}
      />
    </>
  );
}
