import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import CustomizedButton from '../../components/button/button';

// Styles
import styles from './admin-page.module.scss';
import { paths } from '../../consts';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
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
    documents: false,
  });
  // const [selectorValue, setSelectorValue] = useState(project.value.name);

  if (location.pathname.match(paths.settings.basic.relative) && !flag.basic) {
    setFlag({ basic: true, graphics: false, components: false, team: false,
      adjustment: false, documents: false })
  }
  if (location.pathname.match(paths.settings.graphics.relative) && !flag.graphics) {
    setFlag({ basic: false, graphics: true, components: false, team: false,
      adjustment: false, documents: false })
  }
  if (location.pathname.match(paths.settings.components.relative) && !flag.components) {
    setFlag({ basic: false, graphics: false, components: true, team: false,
      adjustment: false, documents: false })
  }
  if (location.pathname.match(paths.settings.team.relative) && !flag.team) {
    setFlag({ basic: false, graphics: false, components: false, team: true,
      adjustment: false, documents: false })
  }
  if (location.pathname.match(paths.settings.adjustment.relative) && !flag.adjustment) {
    setFlag({ basic: false, graphics: false, components: false, team: false,
      adjustment: true, documents: false })
  }
  if (location.pathname.match(paths.settings.documents.relative) && !flag.documents) {
    setFlag({ basic: false, graphics: false, components: false, team: false,
      adjustment: false, documents: true })
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
          <li className={`${flag.documents ? styles.active : ''}`}>
            <Link to={paths.settings.documents.relative}>Настройки документов</Link>
          </li>
          <li className={`${flag.graphics ? styles.active : ''}`}>
            <Link to={paths.settings.graphics.relative}>Настройки графиков</Link>
          </li>
        </ul>
      </div>
      <Outlet />
    </div>
  );
}
