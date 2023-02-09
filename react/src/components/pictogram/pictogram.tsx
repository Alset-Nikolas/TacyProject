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
import selectorArrowIconSrc from '../../images/icons/selector_arrow.svg';
import downloadIconSrc from '../../images/icons/download.svg';
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
    'hide' |
    'close' |
    'export' |
    'send' |
    'selector-arrow' |
    'download';
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
    case 'hide':
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
    case 'selector-arrow':
      iconSrc = selectorArrowIconSrc;
    break;
    case 'download':
      iconSrc = downloadIconSrc;
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
          transform: type === 'hide' ? 'rotate(180deg)' : '',
        }}
        onClick={onClick}
      />
    </>
  );
}
