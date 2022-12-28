import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import CustomizedButton from '../../components/button/button';
import CustomizedSelect from '../../components/select/Select';

// Styles
import styles from './admin-page.module.scss';
import textStyles from '../../styles/text.module.scss';
import { paths } from '../../consts';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import {
  emptyProjectForEdit,
  getProjectInfoThunk,
  getProjectsListThunk,
} from '../../redux/state/state-slice';
import { SelectChangeEvent } from '@mui/material';
import ProjectSelector from '../../components/project-selector/project-selector';

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const { project, projectCreate } = useAppSelector((store) => store.state);
  const projectsList = useAppSelector((store) => store.state.projectsList.value);
  const navigate = useNavigate();
  const location = useLocation();
  const [flag, setFlag] = useState({
    basic: false,
    graphics: false,
    components: false,
    team: false,
    adjustment: false,
  });
  // const [selectorValue, setSelectorValue] = useState(project.value.name);

  if (location.pathname.match(paths.settings.basic.relative) && !flag.basic) {
    setFlag({ basic: true, graphics: false, components: false, team: false,
      adjustment: false, })
  }
  if (location.pathname.match(paths.settings.graphics.relative) && !flag.graphics) {
    setFlag({ basic: false, graphics: true, components: false, team: false,
      adjustment: false, })
  }
  if (location.pathname.match(paths.settings.components.relative) && !flag.components) {
    setFlag({ basic: false, graphics: false, components: true, team: false,
      adjustment: false, })
  }
  if (location.pathname.match(paths.settings.team.relative) && !flag.team) {
    setFlag({ basic: false, graphics: false, components: false, team: true,
      adjustment: false, })
  }
  if (location.pathname.match(paths.settings.adjustment.relative) && !flag.adjustment) {
    setFlag({ basic: false, graphics: false, components: false, team: false,
      adjustment: true, })
  }

  const onCreateButtonClick = () => {
    // dispatch(emptyProjectForEdit());
    navigate(paths.create.project.absolute);
  };

  useEffect(() => {
    // dispatch(getProjectsListThunk());
  }, [projectCreate.isGetRequestSuccess]);

  return (
    <div className={`${styles.wrapper}`}>
      <section className={`${styles.headerSection}`}>
        <div>
          <ProjectSelector />
        </div>
        <div>
          <CustomizedButton
            value="Создать проект"
            onClick={onCreateButtonClick}
          />
        </div>
      </section>
      <div>
        <ul className={`${styles.settingsNav}`}>
          <li className={`${flag.basic ? styles.active : ''}`}>
            <Link to={paths.settings.basic.relative}>Настройки проекта</Link>
          </li>
          <li className={`${flag.components ? styles.active : ''}`}>
            <Link to={paths.settings.components.relative}>Настройки компонентов</Link>
          </li>
          <li className={`${flag.team ? styles.active : ''}`}>
            <Link to={paths.settings.team.relative}>Настройки команды</Link>
          </li>
          {/* <li className={`${flag.adjustment ? styles.active : ''}`}>
            <Link to={paths.settings.adjustment.relative}>Настройки этапов согласования</Link>
          </li> */}
          <li className={`${flag.graphics ? styles.active : ''}`}>
            <Link to={paths.settings.graphics.relative}>Настройки графиков</Link>
          </li>
        </ul>
      </div>
      <Outlet />
    </div>
  );
}
