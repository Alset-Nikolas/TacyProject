/* eslint-disable arrow-body-style */
import { createSlice } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { TProject, TProjectForEdit } from '../../types';
import { parseRequestError } from '../../utils';
import { createProjectRequest, deleteProject, getProjectInfo, getProjectsList } from '../../utils/requests';
import { getInitiativesListThunk } from '../initiatives-slice'; 
import { AppDispatch, RootState } from '../store';

type TState = {
  project: {
    currentId: number | null;
    value: TProject | null,
    isGetRequest: boolean;
    isGetRequestSuccess: boolean;
    isGetRequestFailed: boolean;
  };
  backupProjectState: TProject | null;
  projectForEdit: TProjectForEdit | null,
  projectsList: {
    value: Array<{
      id: number;
      name: string;
    }>;
    isGetRequest: boolean;
    isGetRequestSuccess: boolean;
    isGetRequestFailed: boolean;
  };
  projectCreate: {
    isGetRequest: boolean;
    isGetRequestSuccess: boolean;
    isGetRequestFailed: boolean;
    error: {
      msg_er: string | Array<string>;
    } | null;
  };
  projectDelete: {
    isGetRequest: boolean;
    isGetRequestSuccess: boolean;
    isGetRequestFailed: boolean;
  };
  app: {
    modal: {
      isOpen: boolean;
      type: {
        deleteMember: boolean;
        addMember: boolean;
        deleteProject: boolean;
        deleteEvent: boolean;
        error: boolean;
        message: boolean,
        coordination: boolean,
        rolesAllocation: boolean,
      };
      message: string | Array<string>;
      data: any;
    };
    initiativeEdit: {
      initiative: boolean;
      risks: boolean;
    };
    loader: boolean;
  };
}

const initialState: TState = {
  project: {
    currentId: null,
    value: null,
    isGetRequest: false,
    isGetRequestSuccess: false,
    isGetRequestFailed: false,
  },
  backupProjectState: null,
  projectForEdit: null,
  projectsList: {
    value: [],
    isGetRequest: false,
    isGetRequestSuccess: false,
    isGetRequestFailed: false,
  },
  projectCreate: {
    isGetRequest: false,
    isGetRequestSuccess: false,
    isGetRequestFailed: false,
    error: null,
  },
  projectDelete: {
    isGetRequest: false,
    isGetRequestSuccess: false,
    isGetRequestFailed: false,
  },
  app: {
    modal: {
      isOpen: false,
      type: {
        deleteMember: false,
        addMember: false,
        deleteProject: false,
        deleteEvent: false,
        error: false,
        message: false,
        coordination: false,
        rolesAllocation: false,
      },
      message: '',
      data: null,
    },
    initiativeEdit: {
      initiative: false,
      risks: false,
    },
    loader: false,
  },
};

// const deleteProject = createAsyncThunk(
//   'state/deleteProject',
//   // Declare the type your function argument here:
//   async (id: number) => {
//     // dispatch(projectDeleteRequest());
//     deleteProject(
//       id,
//       (res: AxiosResponse) => {
//         // dispatch(projectDeleteRequestSuccess());

//       },
//       () => {
//         // dispatch(projectDeleteRequestFailed());
//       },
//     );
//   }
// )

export const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    setState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateProjectState: (state, action) => {
      state.project.value = {
        ...state.project.value,
        ...action.payload,
      };
    },
    setProjectForEdit: (state, action) => {
      state.projectForEdit = action.payload;
    },
    updateProjectForEdit: (state, action) => {
      state.projectForEdit = {
        ...state.projectForEdit,
        ...action.payload,
      };
    },
    clearProjectForEdit: (state) => {
      state.projectForEdit = null;
    },
    emptyProjectForEdit: (state) => {
      state.projectForEdit = {
        id: -1,
        name: '',
        date_start: '',
        date_end: '',
        purpose: '',
        tasks: '',
        description: '',
        intermediate_dates: [],
        stages: [
          // {
          //   title: 'е',
          //   date_start: '2022-12-01',
          //   date_end: '2023-01-01',
          // },
        ],
        metrics: [
          // {
          //   title: '',
          //   value: 0,
          //   target_value: 0,
          //   active: false,
          //   units: 'бм'
          // },
        ],
        properties: [
          // {
          //   title: 'е',
          //   values: [
          //     'е',
          //   ],
          // },
        ],
        roles: [],
        rights: [],
        // file: null,
      };
    },
    setProjectBackup: (state, action) => {
      state.backupProjectState = action.payload;
    },
    clearProjectState: (state) => {
      state.project.value = {
        id: -1,
        name: '',
        date_start: '',
        date_end: '',
        purpose: '',
        tasks: '',
        description: '',
        intermediate_dates: [],
        stages: [],
        metrics: [],
        properties: [],
        roles: [],
        rights: [],
      };
    },
    setIntermediateDates: (state, action) => {
      if (state.project.value) {
        state.project.value.intermediate_dates = action.payload;
      } else {
        return state;
      }
    },
    setCurrentProjectId: (state, action) => {
      if (action.payload) {
        localStorage.setItem('project-id', action.payload.toString());
      } else {
        localStorage.removeItem('project-id');
      }
      state.project.currentId = action.payload;
    },
    projectRequest: (state) => {
      state.project = {
        ...state.project,
        isGetRequest: true,
        isGetRequestSuccess: false,
        isGetRequestFailed: false,
      };
    },
    projectRequestSuccess: (state, action) => {
      state.project = {
        ...state.project,
        value: action.payload,
        isGetRequest: false,
        isGetRequestSuccess: true,
      };
    },
    projectRequestFailed: (state) => {
      state.project = {
        ...state.project,
        isGetRequest: false,
        isGetRequestFailed: true,
      };
    },
    projectsListRequest: (state) => {
      state.projectsList = {
        ...state.projectsList,
        isGetRequest: true,
        isGetRequestSuccess: false,
        isGetRequestFailed: false,
      };
    },
    projectsListRequestSuccess: (state, action) => {
      state.projectsList = {
        ...state.projectsList,
        value: action.payload,
        isGetRequest: false,
        isGetRequestSuccess: true,
      };
    },
    projectsListRequestFailed: (state) => {
      state.projectsList = {
        ...state.projectsList,
        isGetRequest: false,
        isGetRequestFailed: true,
      };
    },
    deleteProjectListElement: (state, action) => {
      state.projectsList.value = state.projectsList.value.filter((el) => el.id !== action.payload);
    },
    projectCreateRequest: (state) => {
      state.projectCreate = {
        ...state.projectCreate,
        isGetRequest: true,
        isGetRequestSuccess: false,
        isGetRequestFailed: false,
        error: null,
      };
    },
    projectCreateRequestSuccess: (state) => {
      state.projectCreate = {
        ...state.projectCreate,
        isGetRequest: false,
        isGetRequestSuccess: true,
      };
    },
    projectCreateRequestFailed: (state, action) => {
      state.projectCreate = {
        ...state.projectCreate,
        isGetRequest: false,
        isGetRequestFailed: true,
        error: action.payload,
      };
    },
    projectDeleteRequest: (state) => {
      state.projectDelete = {
        ...state.projectDelete,
        isGetRequest: true,
        isGetRequestSuccess: false,
        isGetRequestFailed: false,
      };
    },
    projectDeleteRequestSuccess: (state) => {
      state.projectDelete = {
        ...state.projectDelete,
        isGetRequest: false,
        isGetRequestSuccess: true,
      };
    },
    projectDeleteRequestFailed: (state) => {
      state.projectDelete = {
        ...state.projectDelete,
        isGetRequest: false,
        isGetRequestFailed: true,
      };
    },
    openModal: (state, action) => {
      state.app.modal.isOpen = true;
      state.app.modal.message = action.payload;
    },
    openDeleteMemberModal: (state) => {
      state.app.modal.isOpen = true;
      state.app.modal.type.deleteMember = true;
    },
    openAddMemberModal: (state) => {
      state.app.modal.isOpen = true;
      state.app.modal.type.addMember = true;
    },
    openDeleteProjectModal: (state) => {
      state.app.modal.isOpen = true;
      state.app.modal.type.deleteProject = true;
    },
    openErrorModal: (state, action) => {
      state.app.modal.isOpen = true;
      state.app.modal.message = action.payload;
      state.app.modal.type.error = true;
    },
    openDeleteEventModal: (state) => {
      state.app.modal.isOpen = true;
      state.app.modal.type.deleteEvent = true;
    },
    openMessageModal: (state, action) => {
      state.app.modal.isOpen = true;
      state.app.modal.type.message = true;
      state.app.modal.message = action.payload;
    },
    openCoordinationModal: (state) => {
      state.app.modal.isOpen = true;
      state.app.modal.type.coordination = true;
    },
    openRolesAllocationModal: (state, action) => {
      state.app.modal.isOpen = true;
      state.app.modal.type.rolesAllocation = true;
      state.app.modal.data = action.payload;
    },
    closeModal: (state) => {
      state.app.modal.isOpen = false;
      state.app.modal.type = {
        deleteMember: false,
        addMember: false,
        deleteProject: false,
        deleteEvent: false,
        error: false,
        message: false,
        coordination: false,
        rolesAllocation: false,
      };
      state.app.modal.message = '';
      state.app.modal.data = null;
    },
    setInitiativeEdit: (state, action) => {
      state.app.initiativeEdit = {
        ...state.app.initiativeEdit,
        ...action.payload,
      };
    },
    showLoader: (state) => {
      state.app.loader = true;
    },
    closeLoader: (state) => {
      state.app.loader = false;
    }
  },
});

export const {
  setState,
  setProjectBackup,
  setProjectForEdit,
  updateProjectForEdit,
  clearProjectForEdit,
  emptyProjectForEdit,
  updateProjectState,
  clearProjectState,
  setIntermediateDates,
  setCurrentProjectId,
  projectRequest,
  projectRequestSuccess,
  projectRequestFailed,
  projectsListRequest,
  projectsListRequestSuccess,
  projectsListRequestFailed,
  deleteProjectListElement,
  projectCreateRequest,
  projectCreateRequestSuccess,
  projectCreateRequestFailed,
  projectDeleteRequest,
  projectDeleteRequestSuccess,
  projectDeleteRequestFailed,
  openModal,
  closeModal,
  openAddMemberModal,
  openDeleteMemberModal,
  openDeleteProjectModal,
  openDeleteEventModal,
  openErrorModal,
  openMessageModal,
  openCoordinationModal,
  openRolesAllocationModal,
  setInitiativeEdit,
  showLoader,
  closeLoader,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getProjectInfoThunk = (id?: number | null) => (dispatch: AppDispatch) => {
  dispatch(projectRequest());
  try {
      if (id) {
        getProjectInfo(
          (res: AxiosResponse) => {
            dispatch(projectRequestSuccess(res.data));
            dispatch(getInitiativesListThunk(id));
          },
          () => {
            dispatch(projectRequestFailed());
          },
          id,
        );
      } else {
        throw new Error('Project doesn\'t exist');
      }
  } catch (error) {
    dispatch(projectRequestFailed());
  }
};

export const getProjectsListThunk = () => (dispatch: AppDispatch) => {
  dispatch(projectsListRequest());
  getProjectsList(
    (res: AxiosResponse<{ items: { id: number, name: string }}>) => {
      dispatch(projectsListRequestSuccess(res.data.items));
    },
    () => {
      dispatch(projectsListRequestFailed());
    },
  );
};

export const createProjectThunk = (body: TProject | TProjectForEdit | FormData) => (dispatch: AppDispatch) => {
  dispatch(projectCreateRequest());
  createProjectRequest(
    body,
    (res: AxiosResponse<{ code: number, id: number, msg: string }>) => {
      dispatch(projectCreateRequestSuccess());
      dispatch(setCurrentProjectId(res.data.id));
      dispatch(getProjectsListThunk());
    },
    (error: AxiosError<any>) => {
      // console.log(error);
      dispatch(projectCreateRequestFailed(error.response?.data));
      // dispatch(openModal('Произошла ошибка во время создания проекта'));
      if (error.response) {
        const errorMessages = parseRequestError(error.response.data);
        dispatch(openErrorModal(errorMessages));
      } else {
        dispatch(openErrorModal('Произошла ошибка во время создания проекта'));
      }
    },
  );
};

export const deleteProjectThunk = (id: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(projectDeleteRequest());
  deleteProject(
    id,
    () => {
      dispatch(projectDeleteRequestSuccess());
      dispatch(deleteProjectListElement(id));
      const state = getState();
      if (state.state.projectsList.value.length) {
        dispatch(setCurrentProjectId(state.state.projectsList.value[0].id));
      } else {
        dispatch(setCurrentProjectId(null));
        dispatch(setState({
          project: {
            ...state.state.project,
            value: {
              date_end: null,
              date_start: null,
              description: '',
              metrics: [],
              name: '',
              properties: [],
              purpose: '',
              tasks: '',
            },
          },
        }));
      }

    },
    () => {
      dispatch(projectDeleteRequestFailed());
    },
  );
};
