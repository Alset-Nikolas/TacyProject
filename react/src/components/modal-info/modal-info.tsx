import { closeModal } from "../../redux/state/state-slice";
import { useAppDispatch } from "../../utils/hooks";
import CustomizedButton from "../button/button";
import Modal from "../modal/modal";

// Style
import styles from './modal-info.module.scss';

type TModalInfoProps = {
  message: string | Array<string>;
}

export default function ModalInfo({ message }: TModalInfoProps) {
  const dispatch = useAppDispatch();
  return (
    <Modal
      closeModal={() => dispatch(closeModal())}
    >
      <div
        className={`${styles.modalWrapper}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column'  }}>
          {message instanceof Array ? (
            <>
              {message.map((el, index) => (
                <div key={`msg_${index}`}>
                  {el}
                </div>
              ))}
            </>
          ) : (
            <div>
              {message}
            </div>
          )}
        </div>
        <div>
          <CustomizedButton
            value="Ок"
            onClick={() => dispatch(closeModal())}
          />
        </div>
      </div>
    </Modal>
    
  );
}
