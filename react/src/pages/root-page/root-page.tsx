import { useEffect } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';
import Header from '../../components/header/header';
import { paths } from '../../consts';
import { getUserInfoByIdThunk, getUserInfoThunk, setIsAuth } from '../../redux/auth-slice';
import { getProjectInfoThunk, getProjectsListThunk, setCurrentProjectId } from '../../redux/state-slice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';

// styles
import styles from './root-page.module.scss';

export default function RootPage() {
  const { auth, state: { project, projectsList } } = useAppSelector((store) => store);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (location.pathname.match('/')) {
      if (auth.isAuth) {
        navigate(`/${paths.status}`);
      } else if (localStorage.getItem('token')) {
        dispatch(setIsAuth());
        dispatch(getUserInfoThunk());
        dispatch(getProjectsListThunk());
        navigate(`/${paths.status}`);
      } else {
        navigate(`/${paths.login}`);
      }
    }
  }, []);

  useEffect(() => {
    if (project.currentId) dispatch(getUserInfoByIdThunk(project.currentId));
  }, [project.currentId])

  useEffect(() => {
    const savedProjectId = localStorage.getItem('project-id');
    if (project.currentId === null) {
      if (savedProjectId && projectsList.value.find((item) => item.id === parseInt(savedProjectId))) {
        dispatch(setCurrentProjectId(parseInt(savedProjectId)));
      } else if (projectsList.value.length) {
        dispatch(setCurrentProjectId(projectsList.value[0].id));
      }
    }
  }, [projectsList]); 

  return (
    <div className={`${styles.wrapper}`}>
      <Header />
      <Outlet />
    </div>
  )
}
