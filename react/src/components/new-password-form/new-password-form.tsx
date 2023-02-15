import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState
} from 'react';

import {
  useAppDispatch,
  useAppSelector,
} from '../../utils/hooks';
import {
  confirmPasswordThunk,
  setAuthState,
} from '../../redux/auth-slice';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { paths } from '../../consts';
import CustomizedButton from '../button/button';
import { openErrorModal } from '../../redux/state/state-slice';

// Styles
import styles from './new-password-form.module.scss';
import FullScreenLoader from '../full-screen-loader/full-screen-loader';
import ModalInfo from '../modal-info/modal-info';

export default function NewPasswordForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { confirmRequestSuccess, confirmRequestFailed } = useAppSelector((store) => store.auth);
  const { loader, modal } = useAppSelector((store) => store.state.app);
  const [ formData, setFormData ] = useState({ password: '', confirmPassword: ''});

  // function makePasswordRegExp(patterns: any, argMin: number | string, margMax: number | string) {
  //   const min = argMin || ''; // Если минимальное число символов не указано, берём пустую строку
  //   const max = margMax || ''; // Если максимальное число символов не указано, берём пустую строку
  //   let regex_string = '';
  //   const rules = [];
  //   const range = "{" + min + "," + max + "}"; // Разрешённый диапазон для длины строки
  //   for (let rule in patterns) { // Обрабатываем входящий массив из ВСЕХ правил для строки
  //     if (patterns.hasOwnProperty(rule)) {
  //       rules.push(patterns[rule]); // Запоминаем правила
  //       // Формируем последовательность из шаблонов `(?=.*[%s])`
  //       // Она проверит обязательное присутствие всех символов из входящего набора
  //       regex_string += "(?=.*[" + patterns[rule] + "])";
  //     }
  //   }
  //   // Добавляем в хвост набор из ВСЕХ разрешённых символов и разрешённую длину строки
  //   regex_string += "[" + rules.join('') + "]" + range;
  //   // Собираем всё в одно регулярное выражение
  //   return new RegExp(regex_string, 'g');
  // }

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value})
  }

  const onSubmitHandler = (e: FormEvent) => {
    e.preventDefault();
    const passwordMatch = formData.password.match(/(?=.*[0-9])(?=.*[a-zа-я])(?=.*[A-ZА-Я])[0-9a-zA-Zа-яА-Я]{8,}/g);

    if (token && formData.password === formData.confirmPassword && passwordMatch) {
      dispatch(confirmPasswordThunk({ token, password: formData.password }));
    } else {
      if (formData.password !== formData.confirmPassword) {
        dispatch(openErrorModal('Введенные пароли не совпадают'));
      }
      if (!passwordMatch) {
        dispatch(openErrorModal('Пароль не удовлетворяет условиям'));
      }
    }
  };

  useEffect(() => {
    if (confirmRequestSuccess) {
      navigate(`/${paths.login}`);
    }
    if (confirmRequestFailed) {
      dispatch(openErrorModal('Ошибка при изменени пароля. Попрубуйте еще раз'));
      navigate(`/${paths.login}`);
    }
    return () => {
      dispatch(setAuthState({
        confirmRequest: false,
        confirmRequestSuccess: false,
        confirmRequestFailed: false,
      }))
    };
  }, [confirmRequestSuccess, confirmRequestFailed]);

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
      {loader && (
        <FullScreenLoader />
      )}
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
    </form>
  )
}
