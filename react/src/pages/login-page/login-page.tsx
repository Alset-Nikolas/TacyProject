import LoginForm from "../../components/login-form/login-form";

// styles
import styles from './login-page.module.scss';

export default function LoginPage() {
  return (
    <div className={`${styles.wrapper}`}>
      <LoginForm />
    </div>
  )
}
