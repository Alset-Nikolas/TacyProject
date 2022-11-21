import ResetPasswordForm from "../../components/reset-form/reset-form";

// styles
import styles from './reset-password-page.module.scss';

export default function ResetPasswordPage() {
  return (
    <div className={`${styles.wrapper}`}>
      <ResetPasswordForm />
    </div>
  )
}
