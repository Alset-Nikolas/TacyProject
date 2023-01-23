import { ChangeEvent, ChangeEventHandler, FC } from "react";
import checkSrc from '../../../images/icons/check.svg';

// Styles
import styles from './checkbox.module.scss';

type TCheckboxProps = {
  checked?: boolean;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  id?: string;
}

const Checkbox: FC<TCheckboxProps> = ({ checked, name, onChange, id }) => {
  return (
    <label
      className={`${styles.wrapper} ${checked ? styles.checked : ''}`}
      htmlFor={id}
    >
      {checked && <img src={checkSrc} />}
      <input
        className={`${styles.input}`}
        type="checkbox"
        name={name}
        id={id}
        onChange={onChange}
      />
    </label>
  );
}

export default Checkbox;
