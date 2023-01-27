import { ChangeEvent, Dispatch, FC, SetStateAction, useRef, useState } from "react";
import fileSrc from '../../images/icons/file.svg';
import Pictogram from "../pictogram/pictogram";

// Styles
import styles from './file-upload.module.scss';

type TFileUploadProps = {
  fileUploadHandler?: Dispatch<SetStateAction<any[]>>;
  index: number;
  file: File | null;
}

const FileUpload:FC<TFileUploadProps> = ({ fileUploadHandler, index, file }) => {
  const descRef = useRef<HTMLSpanElement>(null)
  // const [isShowDeleteIcon, setIsShowDeleteIcon] = useState(false);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const fileName = files ? files[0].name : 'error';
    if (descRef.current) descRef.current.innerText = fileName;
    // setIsShowDeleteIcon(true);
    if (typeof fileUploadHandler === 'function') {
      fileUploadHandler((prevState) => {
        const newState = [...prevState];
        newState[index] = files ? files[0] : 'error';
        if (index === prevState.length -1) newState.push(null); 
        return newState;
      });
    }
  };

  const removeNewFile = (index: number) => {
    if (typeof fileUploadHandler === 'function') {
      fileUploadHandler((prevState) => {
        const newState = [...prevState];
        newState.splice(index, 1);
        return newState;
      });
    }
  };

  

  return (
    <div
      className={`${styles.wrapper}`}
    >
      <label
        className={`${styles.fileInputLabel}`}
        htmlFor={`file-input-${index}`}
      >
        <img style={{marginRight: 8}} src={fileSrc} />
        <span
          ref={descRef}
        >
          {file ? file.name : 'Прикрепить файл'}
        </span>
      </label>
      {file && (
        <div>
          <Pictogram
            type="delete-filled"
            cursor="pointer"
            onClick={() => removeNewFile(index)}
          />
        </div>
      )}
      {!file && (
        <input
          className={`${styles.fileInput}`}
          type="file"
          id={`file-input-${index}`}
          name="file"
          onChange={onChangeHandler}
        />
      )}
    </div>
  );
}

export default FileUpload;