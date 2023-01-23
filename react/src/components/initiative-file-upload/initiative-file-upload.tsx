import { ChangeEvent, Dispatch, FC, SetStateAction, useRef, useState } from "react";
import { REACT_APP_BACKEND_BASE_URL } from "../../consts";
import fileSrc from '../../images/icons/file.svg';
import { useDeleteInitiativeFileMutation, usePostInitiativeFileMutation } from "../../redux/state/state-api";
import Pictogram from "../pictogram/pictogram";

// Styles
import styles from './initiative-file-upload.module.scss';

type TFileUploadProps = {
  fileUploadHandler?: Dispatch<SetStateAction<any[]>>;
  index: number;
  file: {
    id:number;
    file: string | null;
    initiative: number;
    title: number;
  };
}

const InitiativeFileUpload:FC<TFileUploadProps> = ({ fileUploadHandler, index, file }) => {
  const descRef = useRef<HTMLSpanElement>(null)
  const [postFile] = usePostInitiativeFileMutation();
  const [deleteFile] = useDeleteInitiativeFileMutation();
  // const [isShowDeleteIcon, setIsShowDeleteIcon] = useState(false);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const fileName = files ? files[0].name : 'error';
    // if (descRef.current) descRef.current.innerText = fileName;
    // // setIsShowDeleteIcon(true);
    // if (typeof fileUploadHandler === 'function') {
    //   fileUploadHandler((prevState) => {
    //     const newState = [...prevState];
    //     newState[index].file = files ? files[0] : 'error';
    //     // if (index === prevState.length -1) newState.push(null); 
    //     return newState;
    //   });
    // }
    const formData = new FormData();
    if (files) {
      formData.append('file', files[0]);
      postFile({ fileId: file.id, body: formData })
    }
  };

  const removeNewFile = (index: number) => {
    // if (typeof fileUploadHandler === 'function') {
    //   fileUploadHandler((prevState) => {
    //     const newState = [...prevState];
    //     newState[index].file = null;
    //     return newState;
    //   });
    // }
    deleteFile(file.id);
  };

  const splitedFilePath = file.file?.split('/');
  const fileName = splitedFilePath ? splitedFilePath[splitedFilePath.length - 1] : null;

  return (
    <div
      className={`${styles.wrapper}`}
    >
      <label
        className={`${styles.fileInputLabel}`}
        htmlFor={`file-input-${index}`}
      >
        <img style={{marginRight: 8}} src={fileSrc} />
        {fileName && (
          <a
            href={`${REACT_APP_BACKEND_BASE_URL}${file.file}`}
          >
            {fileName}
          </a>
        )}
        {!fileName && (
          <span>
            Прикрепить файл
          </span>
        )}
        {!file}
      </label>
      {file.file && (
        <div>
          <Pictogram
            type="delete-filled"
            cursor="pointer"
            onClick={() => removeNewFile(index)}
          />
        </div>
      )}
      {!file.file && (
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

export default InitiativeFileUpload;