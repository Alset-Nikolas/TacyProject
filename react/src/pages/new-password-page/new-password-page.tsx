import NewPasswordForm from "../../components/new-password-form/new-password-form";

// styles
import styles from './new-password-page.module.scss';

export default function NewPasswordPage() {
  return (
    <div className={`${styles.wrapper}`}>
      <NewPasswordForm />
    </div>
  )
}
