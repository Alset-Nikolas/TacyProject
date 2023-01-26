import { ChangeEventHandler } from "react";
import ReactInputMask from "react-input-mask-format";

type TDateInputProps = {
  className?: string;
  value: string;
  id?: string;
  name?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export default function DateInput({ className, value, id, name, onChange }: TDateInputProps) {
  return (
    <ReactInputMask
      className={`${className}`}
      id={id}
      name={name}
      mask="99.99.9999"
      placeholder="ДД.ММ.ГГГГ"
      value={value}
      maskPlaceholder="_"
      onChange={onChange}
    />
  );
}
