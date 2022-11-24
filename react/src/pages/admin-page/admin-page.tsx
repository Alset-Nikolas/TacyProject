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
  setCurrentProjectId
} from '../../redux/state-slice';
import { SelectChangeEvent } from '@mui/material';

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
    dispatch(emptyProjectForEdit());
    navigate(paths.create.project.absolute);
  };

  const onSelectorChange = (e: SelectChangeEvent<string>) => {
    dispatch(setCurrentProjectId(projectsList.find((el) => el.name === e.target.value)?.id));
  };

  const onSelectButtonClick = () => {
    if (project.currentId) dispatch(getProjectInfoThunk(project.currentId));
  };

  useEffect(() => {
    dispatch(getProjectsListThunk());
  }, [projectCreate.isGetRequestSuccess]);

  // useEffect(() => {
  //   const savedProjectId = localStorage.getItem('project-id');
  //   if (project.currentId === null) {
  //     if (savedProjectId && projectsList.find((item) => item.id === parseInt(savedProjectId))) {
  //       dispatch(setCurrentProjectId(parseInt(savedProjectId)));
  //     } else if (projectsList.length) {
  //       dispatch(setCurrentProjectId(projectsList[0].id));
  //     }
  //   }
  // }, [projectsList]); 

  // useEffect(() => {
  //   if (!project.currentId && projectsList.length) {
  //     dispatch(setCurrentProjectId(projectsList[0].id));
  //     console.log(`dispatched first prj here id:${project.currentId}`);
  //   }
  //   console.log(projectsList);
  // }, [projectsList])

  const setValue = () => {
    const value = projectsList.find((el) => el.id === project.currentId)?.name
    // if (!value) {
    //   console.log(`here id:${project.currentId}`);
    //   console.log(projectsList);
    // } else {
    //   console.log(`ok id:${project.currentId}`);
    //   console.log(projectsList);
    // }
    // return value ? value : projectsList.value[0].name;
    return value;
  };
  return (
    <div className={`${styles.wrapper}`}>
      <section className={`${styles.headerSection}`}>
        <div>
          <span className={`${textStyles.sectionHeaderText}`}>Все проекты</span>
          <div className={`${styles.selectorWrapper}`}>
            <CustomizedSelect
              value={setValue()}
              items={projectsList.map((el) => el.name)}
              onChange={onSelectorChange}
            />
            <CustomizedButton
              value="Выбрать"
              color="blue"
              onClick={onSelectButtonClick}
            />
          </div>
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
