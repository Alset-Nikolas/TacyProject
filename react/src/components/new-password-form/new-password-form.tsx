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
import { confirmPasswordThunk, setAuthState } from '../../redux/auth-slice';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { paths } from '../../consts';

// Styles
import styles from './new-password-form.module.scss';
import CustomizedButton from '../button/button';

export default function NewPasswordForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { confirmRequestSuccess } = useAppSelector((store) => store.auth);
  const [ formData, setFormData ] = useState({ password: '', confirmPassword: ''});

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value})
  }

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (token && formData.password === formData.confirmPassword) {
      dispatch(confirmPasswordThunk({ token, password: formData.password }));
    }
  };

  useEffect(() => {
    if (confirmRequestSuccess) {
      navigate(`/${paths.login}`);
    }
    return () => {
      dispatch(setAuthState({
        confirmRequest: false,
        confirmRequestSuccess: false,
        confirmRequestFailed: false,
      }))
    };
  }, [confirmRequestSuccess]);

  return (
    <form
      className={`${styles.formWrapper}`}
      onSubmit={onSubmitHandler}
    >
      <label
        className={`${styles.label}`}
        htmlFor="password"
      >
        Новый пароль
      </label>
      <input
        className={`${styles.input}`}
        name="password"
        id="password"
        value={formData.password}
        type="password"
        onChange={onChangeHandler}
      />
      <label
        className={`${styles.label}`}
        htmlFor="confirmPassword"
      >
        Повторите пароль
      </label>
      <input
        className={`${styles.input}`}
        name="confirmPassword"
        id="confirmPassword"
        value={formData.confirmPassword}
        type="password"
        onChange={onChangeHandler}
      />
      <p>
        Пароль должен содержать 8 символов, одну заглавную букву, одну цифру
      </p>
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
      <CustomizedButton
        className={`${styles.buttonWrapper}`}
        value="Вход"
        type="submit"
      />
    </form>
  )
}
