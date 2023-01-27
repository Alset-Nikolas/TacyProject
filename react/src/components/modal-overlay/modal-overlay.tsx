import { createRef, MouseEvent } from "react";

// Styles
import modalOverlayStyles from './modal-overlay.module.scss';

type ModalOverlayProps = {
  closeModal?: () => void;
  children: JSX.Element;
};

export default function ModalOverlay({ closeModal, children }: ModalOverlayProps) {
  const modalOverlayRef = createRef<HTMLDivElement>();

  function onClickHandler(e: MouseEvent<HTMLDivElement>) {
    if(e.target === modalOverlayRef.current && closeModal) {
      closeModal();
    }
  }
  return (
    <div 
      className={modalOverlayStyles.back} 
      id="modal-overlay"
      data-test-id="modal-overlay"
      ref={modalOverlayRef}
      onClick={onClickHandler} 
    >
      {children}
    </div>
  );
}