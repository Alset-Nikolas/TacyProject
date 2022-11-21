import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getComponents, getInitiativesList, getRequest, postRequest } from '../utils/requests';
import { TComponentsSettings, TInitiative } from '../types';

type TState = {
  list: Array<TInitiative>;
  // currentInitiativeId: number | null;
  initiative: TInitiative | null;

  initiativesListRequest: boolean,
  initiativesListRequestSuccess: boolean,
  initiativesListRequestFailed: boolean,

  initiativesByIdRequest: boolean,
  initiativesByIdRequestSuccess: boolean,
  initiativesByIdRequestFailed: boolean,

  addInitiativeRequest: boolean,
  addInitiativeRequestSuccess: boolean,
  addInitiativeRequestFailed: boolean,
};

const initialState: TState = {
  list: [],
  // currentInitiativeId: null,
  initiative: null,

  initiativesListRequest: false,
  initiativesListRequestSuccess: false,
  initiativesListRequestFailed: false,

  initiativesByIdRequest: false,
  initiativesByIdRequestSuccess: false,
  initiativesByIdRequestFailed: false,

  addInitiativeRequest: false,
  addInitiativeRequestSuccess: false,
  addInitiativeRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'initiatives',
  initialState,
  reducers: {
    setInitiativesState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    initiativesListRequest: (state) => {
      return {
        ...state,
        initiativesListRequest: true,
        initiativesListRequestSuccess: false,
        initiativesListRequestFailed: false,
      }
    },
    initiativesListRequestSuccess: (state, action) => {
      return {
        ...state,
        list: action.payload,
        initiativesListRequest: false,
        initiativesListRequestSuccess: true,
      }
    },
    initiativesListRequestFailed: (state) => {
      return {
        ...state,
        initiativesListRequest: false,
        initiativesListRequestFailed: true,
      }
    },
    initiativesByIdRequest: (state) => {
      return {
        ...state,
        initiativesByIdRequest: true,
        initiativesByIdRequestSuccess: false,
        initiativesByIdRequestFailed: false,
      }
    },
    initiativesByIdRequestSuccess: (state, action) => {
      return {
        ...state,
        initiative: action.payload,
        initiativesByIdRequest: false,
        initiativesByIdRequestSuccess: true,
      }
    },
    initiativesByIdRequestFailed: (state) => {
      return {
        ...state,
        initiativesByIdRequest: false,
        initiativesByIdRequestFailed: true,
      }
    },
    clearInitiative: (state) => {
      state.initiative = null;
    },
    addInitiativeRequest: (state) => {
      return {
        ...state,
        addInitiativeRequest: true,
        addInitiativeRequestSuccess: false,
        addInitiativeRequestFailed: false,
      }
    },
    addInitiativeRequestSuccess: (state) => {
      return {
        ...state,
        addInitiativeRequest: false,
        addInitiativeRequestSuccess: true,
      }
    },
    addInitiativeRequestFailed: (state) => {
      return {
        ...state,
        addInitiativeRequest: false,
        addInitiativeRequestFailed: true,
      }
    },
  },
});

export const {
  setInitiativesState,
  initiativesListRequest,
  initiativesListRequestSuccess,
  initiativesListRequestFailed,
  initiativesByIdRequest,
  initiativesByIdRequestSuccess,
  initiativesByIdRequestFailed,
  clearInitiative,
  addInitiativeRequest,
  addInitiativeRequestSuccess,
  addInitiativeRequestFailed,

} = stateSlice.actions;

export default stateSlice.reducer;

export const getInitiativesListThunk = (id: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const project = getState().state.project.value;

  if (!project) return;
  if (id !== project.id) return;

  dispatch(initiativesListRequest());
  getInitiativesList(
    id,
    (res: AxiosResponse<{ project_initiatives: Array<TInitiative> }>) => {
      try {
        console.log(res.data);
        dispatch(getInitiativeByIdThunk(res.data.project_initiatives[0].initiative.id));
      } catch (error) {
        console.log(error);
        dispatch(initiativesListRequestFailed());
      }
      dispatch(initiativesListRequestSuccess(res.data.project_initiatives));
    },
    () => {
      dispatch(initiativesListRequestFailed());
    }
  );
};

export const getInitiativeByIdThunk = (id: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const project = getState().state.project.value;

  dispatch(initiativesByIdRequest());
  getRequest(
    `/components/initiative/info/?id=${id}`,
    (res: AxiosResponse<TInitiative>) => {
      try {
        console.log(res.data);
        const newInitiative = {} as any;
        // newInitiative                  
      } catch (error) {
        console.log(error);
        dispatch(initiativesByIdRequestFailed());
      }
      dispatch(initiativesByIdRequestSuccess(res.data));
    },
    () => {
      dispatch(initiativesByIdRequestFailed());
    }
  );
};

export const addInitiativeThunk = (initiative: any) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const initiative = getState().initiatives.initiative;
  const body = { ...initiative };

  dispatch(addInitiativeRequest());
  postRequest(
    `components/initiative/create/`,
    body,
    (res: AxiosResponse) => {
      dispatch(addInitiativeRequestSuccess());
    },
    () => {
      dispatch(addInitiativeRequestFailed());
    }
  );
};
