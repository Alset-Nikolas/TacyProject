import { useEffect } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom';
import FullScreenLoader from '../../components/full-screen-loader/full-screen-loader';
import Header from '../../components/header/header';
import ModalInfo from '../../components/modal-info/modal-info';
import { paths } from '../../consts';
import { getUserInfoByIdThunk, getUserInfoThunk, setIsAuth } from '../../redux/auth-slice';
import { useGetProjectInfoQuery, useGetProjectsListQuery } from '../../redux/state/state-api';
import { getProjectInfoThunk } from '../../redux/state/state-slice';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';

// styles
import styles from './root-page.module.scss';

export default function RootPage() {
  const { auth, state: { project, projectsList, app: { loader, modal } } } = useAppSelector((store) => store);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const savedProjectId = localStorage.getItem('project-id') ? Number.parseInt(localStorage.getItem('project-id')!) : null;
  useGetProjectsListQuery();

  useGetProjectInfoQuery(savedProjectId, {
    skip: savedProjectId === null,
  });
  
  useEffect(() => {
    const pathSplit = location.pathname.split('/');
    // if (pathMatch) {
      if (!auth.isAuth) {
        if (localStorage.getItem('token')) {
          dispatch(setIsAuth());
          dispatch(getUserInfoThunk());
          // dispatch(getProjectsListThunk());
          if (localStorage.getItem('project-id')) {
            const savedProjectId = localStorage.getItem('project-id');
            if (savedProjectId) dispatch(getProjectInfoThunk(Number.parseInt(savedProjectId)));
          }
          if (!pathSplit[1]) {
            navigate(`/${paths.status}`);
          }
        } else {
          navigate(`/${paths.login}`);
        }
      }
    // }
  }, []);

  useEffect(() => {
    window.scroll(0,0);

  }, [location.pathname])

  return (
    <div className={`${styles.wrapper}`}>
      <Header />
      <Outlet />
      {loader && (
        <FullScreenLoader />
      )}
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
    </div>
  )
}
