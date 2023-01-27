import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState
} from 'react';
import {
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Button,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { authThunk, setAuthState } from '../../redux/auth-slice';
import { Link, useNavigate } from 'react-router-dom';
import { paths } from '../../consts';

// Styles
import styles from './login-form.module.scss';
import inputStyles from '../../styles/inputs.module.scss';
import CustomizedButton from '../button/button';
import { useAuthUserMutation } from '../../redux/state/state-api';

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const { authRequestSuccess, authRequestFailed } = useAppSelector((store) => store.auth);
  const [ formData, setFormData ] = useState({ email: '', password: ''});
  const [ validationError, setValidationError ] = useState(false);
  const [
    authUser,
    {
      isError: authRequestFailed,
      isSuccess: authRequestSuccess,
      data: res,
    }
  ] = useAuthUserMutation();

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setValidationError(false);
    setFormData({ ...formData, [e.target.name]: e.target.value})
  }

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    const formDataEntries = Object.entries(formData);
    let validationErrorTemp = false;
    formDataEntries.forEach((el) => {
      if (!el[1]) validationErrorTemp = true;
    });
    if (validationErrorTemp) {
      setValidationError(validationErrorTemp);
    } else {
      // dispatch(authThunk(formData));
      authUser(formData);
    }
  };

  useEffect(() => {
    if (authRequestSuccess) {
      localStorage.setItem('token', res.token);
      localStorage.setItem('email', res.email);
      localStorage.setItem('user_id', res.user_id.toString());
      navigate(`/${paths.status}`);
    }
    // return () => {
    //   dispatch(setAuthState({
    //     authRequest: false,
    //     authRequestSuccess: false,
    //     authRequestFailed: false,
    //   }))
    // };
  }, [authRequestSuccess]);

  return (
    <form
      className={`${styles.formWrapper}`}
      onSubmit={onSubmitHandler}
    >
      <label
        className={`${styles.label}`}
        htmlFor="email"
      >
        Email&nbsp;
        <span>*</span>
      </label>
      <input
        className={`${styles.input} ${authRequestFailed ? styles.error : ''}`}
        name="email"
        id="email"
        value={formData.email}
        onChange={onChangeHandler}
      />
      <label
        className={`${styles.label}`}
        htmlFor="password"
      >
        Пароль&nbsp;
        <span>*</span>
      </label>
      <input
        className={`${styles.input} ${authRequestFailed ? styles.error : ''}`}
        name="password"
        id="password"
        value={formData.password}
        onChange={onChangeHandler}
        type="password"
      />
      {authRequestFailed && (
        <div className={`${styles.error}`}>
          Неверное имя пользователя или пароль
        </div>
      )}
      {validationError && (
        <div className={`${styles.error}`}>
          Заполните обязательные поля
        </div>
      )}
      {/* <FormControl>
        <InputLabel htmlFor="email">E-mail</InputLabel>
        <Input
          id="email"
          name="email"
          aria-describedby="my-helper-text"
          onChange={onChangeHandler}
        />
        <FormHelperText id="my-helper-text">Well never share your email.</FormHelperText>
      </FormControl>
      <FormControl>
        <InputLabel htmlFor="password">Пароль</InputLabel>
        <Input
          className={`${inputStyles.input}`}
          id="password"
          name="password"
          aria-describedby="my-helper-text"
          onChange={onChangeHandler}
        />
        <FormHelperText id="my-helper-text">Well never share your email.</FormHelperText>
      </FormControl> 
      <Button
        variant="contained"
        type="submit"
      >
        Вход
      </Button> */}
      {/* <div
        className={`${styles.buttonWrapper}`}
      > */}
        <CustomizedButton
          className={`${styles.buttonWrapper}`}
          value="Вход"
          type="submit"
        />
      {/* </div> */}
      <div
        className={`${styles.linkWrapper}`}
      >
        <Link to={`/${paths.resetPassword}`}>Восстановить пароль</Link>      
      </div>
    </form>
  )
}
