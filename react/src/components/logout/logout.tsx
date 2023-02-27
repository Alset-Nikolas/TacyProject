import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { clearUser, resetIsAuth } from "../../redux/auth-slice";
import { setCurrentInitiativeId } from "../../redux/initiatives-slice";
import { stateApi } from "../../redux/state/state-api";
import { setCurrentProjectId } from "../../redux/state/state-slice";
import { persistor } from "../../redux/store";
import { useAppDispatch } from "../../utils/hooks";

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    navigate(`/${paths.login}`);
    dispatch(resetIsAuth());
    dispatch(clearUser());
    dispatch(stateApi.util.resetApiState());
    dispatch(setCurrentInitiativeId(null));
    dispatch(setCurrentProjectId(null));
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    persistor.purge();
  }, []);
  return null;
}
