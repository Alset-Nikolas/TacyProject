import { createRef, MouseEvent, useState } from "react";

// Styles
import modalOverlayStyles from './modal-overlay.module.scss';

type ModalOverlayProps = {
  closeModal?: () => void;
  children: JSX.Element;
};

export default function ModalOverlay({ closeModal, children }: ModalOverlayProps) {
  const modalOverlayRef = createRef<HTMLDivElement>();
  const [isOverlayClicked, setIsOverlayClicked] = useState(false);

  function onMouseDownHandler(e: MouseEvent<HTMLDivElement>) {
    if(e.target === modalOverlayRef.current && closeModal) {
      setIsOverlayClicked(true);
    }
  }

  function onClickHandler(e: MouseEvent<HTMLDivElement>) {
    setIsOverlayClicked(false);

    if(e.target === modalOverlayRef.current && closeModal && isOverlayClicked) {
      closeModal();
    }
  }
  return (
    <div 
      className={modalOverlayStyles.back} 
      id="modal-overlay"
      data-test-id="modal-overlay"
      ref={modalOverlayRef}
      onMouseUp={onClickHandler} 
      onMouseDown={onMouseDownHandler}
    >
      {children}
    </div>
  );
}