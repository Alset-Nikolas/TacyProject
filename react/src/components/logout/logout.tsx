import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "../../consts";
import { clearUser, resetIsAuth } from "../../redux/auth-slice";
import { stateApi } from "../../redux/state/state-api";
import { useAppDispatch } from "../../utils/hooks";

export default function Logout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    navigate(`/${paths.login}`);
    dispatch(resetIsAuth());
    dispatch(clearUser());
    dispatch(stateApi.util.resetApiState());
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
  }, []);
  return null;
}
