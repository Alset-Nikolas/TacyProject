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
      mask="9999.99.99"
      placeholder="ГГГГ.ММ.ДД"
      value={value}
      maskPlaceholder="_"
      onChange={onChange}
    />
  );
}
