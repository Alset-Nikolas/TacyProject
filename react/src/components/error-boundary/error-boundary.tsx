import { useRouteError } from "react-router-dom";
import Header from "../header/header";
//Styles
import styles from './error-boundary.module.scss';

export default function ErrorPage() {
  const error = useRouteError() as {statusText: string, message: string};
  console.error(error);

  return (
    <div
      className={`${styles.wrapper}`}
    >
      <Header />
      <h1>Упс!</h1>
      <p>В ходе выполнения программы случилось ошибка. Для решения проблемы обратитесь в вашу службу поддержки.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}