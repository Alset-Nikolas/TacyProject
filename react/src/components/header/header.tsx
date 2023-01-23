import { useState } from 'react';
import { Link } from 'react-router-dom';
import { paths } from '../../consts';
import { useAppSelector } from '../../utils/hooks';
// import Avatar from '../avatar/avatar';
import Pictogram from '../pictogram/pictogram';
import styles from './header.module.scss';

export default function Header() {
  const user = useAppSelector((store) => store.auth.user);
  const [locationFlag, setLoacationFlag] = useState({
    status: false,
    registry: false,
    stats: false,
    team: false,
  });
  // const [selectorValue, setSelectorValue] = useState(project.value.name);

  if (location.pathname.match(paths.status) && !locationFlag.status) {
    setLoacationFlag({
      status: true,
      registry: false,
      stats: false,
      team: false,
    });
  }
  if (location.pathname.match(paths.registry) && !locationFlag.registry) {
    setLoacationFlag({
      status: false,
      registry: true,
      stats: false,
      team: false,
    });
  }
  if (location.pathname.match(paths.personalStats) && !locationFlag.stats) {
    setLoacationFlag({
      status: false,
      registry: false,
      stats: true,
      team: false,
    });
  }
  if (location.pathname.match(paths.team) && !location.pathname.match(paths.settings.relative) && !locationFlag.team) {
    setLoacationFlag({
      status: false,
      registry: false,
      stats: false,
      team: true,
    });
  } 
  if (location.pathname.match(paths.settings.relative) && (locationFlag.status || locationFlag.registry || locationFlag.stats || locationFlag.team)) {
    setLoacationFlag({
      status: false,
      registry: false,
      stats: false,
      team: false,
    });
  }

  return (
    <header className={`${styles.wrapper}`}>
      {/* <Avatar /> */}
      <nav>
        <ul className={`${styles.navList}`}>
          <li>
            <Link
              className={`${locationFlag.status ? styles.active : ''}`}
              to={paths.status}
            >
              Cтатус проекта
            </Link>
          </li>
          <li>
            <Link
              className={`${locationFlag.registry ? styles.active : ''}`}
              to={paths.registry}
            >
                Реестр инициатив
            </Link>
          </li>
          <li>
            <Link
              className={`${locationFlag.stats ? styles.active : ''}`}
              to={paths.personalStats}
            >
              Персональная статистика
            </Link>
          </li>
          <li>
            <Link
              className={`${locationFlag.team ? styles.active : ''}`}
              to={paths.team}
            >
              Команда проекта
            </Link>
          </li>
        </ul>
      </nav>
      <div className={`${styles.controls}`}>
        {user && user.user.is_superuser && (
          <Link to={paths.settings.basic.absolute} >
            <Pictogram
              type="settings"
              cursor="pointer"
            />
          </Link>
        )}
        <Link to={paths.notifications} >
          <Pictogram
            type="notifications"
            cursor="pointer"
          />
        </Link>
        <Link to={paths.logout} >
          <Pictogram
            type="logout"
            cursor="pointer"
          />
        </Link>
      </div>
    </header>
  );
}
