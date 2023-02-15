import { ChangeEvent, Dispatch, FC, SetStateAction, useRef, useState } from "react";
import { REACT_APP_BACKEND_BASE_URL } from "../../consts";
import fileSrc from '../../images/icons/file.svg';
import { useDeleteInitiativeFileMutation, usePostInitiativeFileMutation } from "../../redux/state/state-api";
import { useAppSelector } from "../../utils/hooks";
import Pictogram from "../pictogram/pictogram";

// Styles
import styles from './initiative-file-upload.module.scss';

type TFileUploadProps = {
  fileUploadHandler?: Dispatch<SetStateAction<any[]>>;
  index: number;
  file: {
    id:number;
    file: string | null;
    file_name: string;
    initiative: number;
    title: number;
  };
  strict?: boolean;
}

const InitiativeFileUpload:FC<TFileUploadProps> = ({ fileUploadHandler, index, file, strict }) => {
  const descRef = useRef<HTMLSpanElement>(null)
  const initiativeId = useAppSelector((store) => store.initiatives.currentInitiativeId);
  const [postFile] = usePostInitiativeFileMutation();
  const [deleteFile] = useDeleteInitiativeFileMutation();

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const fileName = files ? files[0].name : 'error';
    const formData = new FormData();
    if (files) {
      formData.append('file', files[0]);
      if (initiativeId) localStorage.setItem('initiative-id', initiativeId.toString());
      postFile({ fileId: file.id, body: formData })
    }
  };

  const removeNewFile = (index: number) => {
    if (initiativeId) localStorage.setItem('initiative-id', initiativeId.toString());
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
        {file.file_name && (
          <a
            href={`${REACT_APP_BACKEND_BASE_URL}${file.file}`}
          >
            {file.file_name}
          </a>
        )}
        {!file.file_name && (
          <span>
            {strict ? 'Файл отсутствует' : 'Прикрепить файл'}
          </span>
        )}
        {!file}
      </label>
      {file.file && !strict && (
        <div>
          <Pictogram
            type="delete-filled"
            cursor="pointer"
            onClick={() => removeNewFile(index)}
          />
        </div>
      )}
      {!file.file && !strict && (
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