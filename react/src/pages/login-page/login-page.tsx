import FullScreenLoader from "../../components/full-screen-loader/full-screen-loader";
import LoginForm from "../../components/login-form/login-form";
import ModalInfo from "../../components/modal-info/modal-info";
import { useAppSelector } from "../../utils/hooks";

// styles
import styles from './login-page.module.scss';

export default function LoginPage() {
  const { loader, modal } = useAppSelector((store) => store.state.app);

  return (
    <div className={`${styles.wrapper}`}>
      <LoginForm />
      {loader && (
        <FullScreenLoader />
      )}
      {modal.isOpen && modal.type.error && (
        <ModalInfo message={modal.message} />
      )}
    </div>
  )
}
