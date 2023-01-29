import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import SectionHeader from '../section/section-header/section-header';

// Styles
import styles from './initial-files.module.scss';
import textStyles from '../../styles/text.module.scss';
import sectionStyles from '../../styles/sections.module.scss';

import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { handleInputChange } from '../../utils';
import { useGetFilesQuery, useGetProjectInfoQuery, useGetProjectsListQuery } from '../../redux/state/state-api';
import { REACT_APP_BACKEND_BASE_URL } from '../../consts';
import FileUpload from '../file-upload/file-upoad';
import fileSrc from '../../images/icons/file.svg';
import Pictogram from '../pictogram/pictogram';

type TInitialFilesProps = {
  edit?: boolean;
  create?: boolean;
  error?: any;
  setFiles?: Dispatch<SetStateAction<any[]>>;
  setDeleteFiles?: Dispatch<SetStateAction<any[]>>;
  filesListForEdit?: Array<any>;
}

export default function InitialFiles({
  edit,
  create,
  error,
  setFiles,
  setDeleteFiles,
  filesListForEdit,
}: TInitialFilesProps) {
  const dispatch = useAppDispatch();
  const { sectionHeaderText } = textStyles;
  // const project = useAppSelector((store) => store.state.project.value);
  const { currentId } = useAppSelector((store) => store.state.project);
  const { data: project } = useGetProjectInfoQuery(currentId);
  const projectForEdit = useAppSelector((store) => store.state.projectForEdit);
  const { data: filesInfo } = useGetFilesQuery(currentId ? currentId : -1, {
    skip: !currentId,
  });
  const [tempFilesInfo, setTempFilesInfo] = useState(filesInfo ? filesInfo : []);

  const removeProjectFile = (file: { id: number; file: string, file_name: string, project: number }, index: number) => {
    if (typeof setDeleteFiles === 'function') {
      setDeleteFiles((prevState) => {
        const newState = [...prevState];
        newState.push({ id: file.id });
        return newState;
      });
    }
    console.log(tempFilesInfo);
    setTempFilesInfo((prevState) => {
      const newState = [...prevState];
      if (newState[index]) newState.splice(index, 1);
      return newState;
    });
  };

  useEffect(() => {
    if (filesInfo) setTempFilesInfo(filesInfo);
  }, [filesInfo])

  // const onChangeHandler = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
  //   if (projectForEdit) {
  //     if (e.target.name !== 'file') {
  //       handleInputChange(e, projectForEdit, dispatch);
  //     } else {
  //       const files = (e.target as HTMLInputElement).files;
  //       if (typeof setFiles === 'function') setFiles(files ? files[0] : null);
  //     }
  //   }
  // };

  if (edit) {
    if (!projectForEdit) return null;
    return (
      <div className={`${styles.wrapperEdit}`}>
        {/* <div className={`${sectionHeaderText}`}> */}
        <SectionHeader
          edit
        >
          Установочные документы
        </SectionHeader>
        {/* </div> */}
        <div  className={`${styles.content} ${styles.edit}`}>
          {tempFilesInfo?.map((el, index) => (
            <div
              key={el.id}
              className={`${styles.fileWrapper}`}
            >
              <div
                style={{
                  maxWidth: 24,
                }}
              >
                <img src={fileSrc} />
              </div>
              <span>
                {el.file_name}
              </span>
              <div>
                <Pictogram
                  type="delete-filled"
                  cursor="pointer"
                  onClick={() => removeProjectFile(el, index)}
                />
              </div>
            </div>
          ))}
          {filesListForEdit?.map((item, index) => (
            <FileUpload
              key={`file-${index}`}
              file={item}
              fileUploadHandler={setFiles}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className={`${styles.wrapper} ${sectionStyles.wrapperBorder}`}>
      <SectionHeader>
        Установочные документы
      </SectionHeader>
      <div  className={`${styles.content}`}>
        {!filesInfo?.length && (
          <div>Список файлов пуст</div>
        )}
        {filesInfo?.map((item) => (
          <div
            key={item.id}
          >
            <a
              className={`${styles.link}`}
              href={`${REACT_APP_BACKEND_BASE_URL}${item.file}`}
            >
              {item.file_name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
