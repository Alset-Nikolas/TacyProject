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
import { authThunk, resetPasswordThunk, setAuthState } from '../../redux/auth-slice';
import { Link, useNavigate } from 'react-router-dom';
import { paths } from '../../consts';
import CustomizedButton from '../button/button';

// Styles
import styles from './reset-form.module.scss';

export default function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const { resetRequestSuccess } = useAppSelector((store) => store.auth);
  const [ formData, setFormData ] = useState({ email: '' });

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value})
  }

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    dispatch(resetPasswordThunk(formData));
  };

  useEffect(() => {
    return () => {
      dispatch(setAuthState({
        resetRequest: false,
        resetRequestSuccess: false,
        resetRequestFailed: false,
      }))
    };
  }, []);

  return (
    <div
      className={`${styles.formWrapper}`}
    >
      {!resetRequestSuccess && (
        <form
          className={`${styles.content}`}
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
            className={`${styles.input}`}
            name="email"
            id="email"
            value={formData.email}
            onChange={onChangeHandler}
          />
          <p className={`${styles.message}`}>
            Введите свой электронный адрес для изменения пароля
          </p>
          
          <CustomizedButton
            className={`${styles.buttonWrapper}`}
            value="Отправить"
            type="submit"
          />
        </form>
      )}
      {resetRequestSuccess && (
        <>
          <p className={`${styles.message} ${styles.final}`}>
            Ссылка на смену пароля отправлена на ваш E-mail
          </p>
          <div className={`${styles.linkWrapper}`}>
            <Link to='/'>Вернуться назад</Link>
          </div>
        </>
      )}
    </div>
  )
}
