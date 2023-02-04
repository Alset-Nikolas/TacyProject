import { useEffect } from "react";
import ReactDOM from "react-dom";

//Styles
import modalStyles from './modal.module.scss';

// Components
import ModalOverlay from "../modal-overlay/modal-overlay";
//import ModalHeader from "../modal-header/modal-header";

type TModalProps = {
  closeModal?: () => void;
  title?: string;
  loader?: boolean;
  children: JSX.Element;
  className?: string;
};

export default function Modal({ closeModal, title, loader, children, className }: TModalProps) {
  const portalDiv = document.getElementById('modal-root')!;

  useEffect(() => {
    const modal = document.getElementById('modal-wrapper');
    modal!.focus();
  }, []);

  function escapeButtonHandler(e: React.KeyboardEvent<HTMLDivElement>) {
    if(e.key === 'Escape' && closeModal) {
      closeModal();
    }
  }

  return ReactDOM.createPortal(
    <ModalOverlay closeModal={closeModal}>
      <div className={loader ? '' : `${modalStyles.modalWrapper} ${className}`} id='modal-wrapper' onKeyDown={escapeButtonHandler} tabIndex={-1}>
        {/* <div
            className={`${modalStyles.closeButtonWrapper} mt-15 mr-10`}
            onClick={closeButtonClickHandler}
            data-test-id='modal-close-button'>
            X
        </div>
        {
          !!title && 
            <div className={`${modalStyles.modalHeader} text text_type_main-large mt-10 mr-10 ml-10`} data-test-id="modal-header">
              {title}
            </div>
        } */}
        {children}
      </div>
    </ModalOverlay>,
    portalDiv
  );
}
