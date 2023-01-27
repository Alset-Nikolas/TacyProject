import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getComponents, getInitiativesList, getRequest, postRequest } from '../utils/requests';
import { TComponentsSettings, TInitiative, TRisk } from '../types';

type TState = {
  list: Array<TRisk>;
  // currentInitiativeId: number | null;
  risk: TRisk | null;

  risksListRequest: boolean,
  risksListRequestSuccess: boolean,
  risksListRequestFailed: boolean,

  riskByIdRequest: boolean,
  riskByIdRequestSuccess: boolean,
  riskByIdRequestFailed: boolean,

  addRiskRequest: boolean,
  addRiskRequestSuccess: boolean,
  addRiskRequestFailed: boolean,
};

const initialState: TState = {
  list: [],
  // currentInitiativeId: null,
  risk: null,

  risksListRequest: false,
  risksListRequestSuccess: false,
  risksListRequestFailed: false,

  riskByIdRequest: false,
  riskByIdRequestSuccess: false,
  riskByIdRequestFailed: false,

  addRiskRequest: false,
  addRiskRequestSuccess: false,
  addRiskRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'risks',
  initialState,
  reducers: {
    setRisksState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    risksListRequest: (state) => {
      return {
        ...state,
        risksListRequest: true,
        risksListRequestSuccess: false,
        risksListRequestFailed: false,
      }
    },
    risksListRequestSuccess: (state, action) => {
      return {
        ...state,
        list: action.payload,
        risksListRequest: false,
        risksListRequestSuccess: true,
      }
    },
    risksListRequestFailed: (state) => {
      return {
        ...state,
        risksListRequest: false,
        risksListRequestFailed: true,
      }
    },
    riskByIdRequest: (state) => {
      return {
        ...state,
        riskByIdRequest: true,
        riskByIdRequestSuccess: false,
        riskByIdRequestFailed: false,
      }
    },
    riskByIdRequestSuccess: (state, action) => {
      return {
        ...state,
        risk: action.payload,
        riskByIdRequest: false,
        riskByIdRequestSuccess: true,
      }
    },
    riskByIdRequestFailed: (state) => {
      return {
        ...state,
        riskByIdRequest: false,
        riskByIdRequestFailed: true,
      }
    },
    clearRisk: (state) => {
      state.risk = null;
    },
    addRiskRequest: (state) => {
      return {
        ...state,
        addRiskRequest: true,
        addRiskRequestSuccess: false,
        addRiskRequestFailed: false,
      }
    },
    addRiskRequestSuccess: (state) => {
      return {
        ...state,
        addRiskRequest: false,
        addRiskRequestSuccess: true,
      }
    },
    addRiskRequestFailed: (state) => {
      return {
        ...state,
        addRiskRequest: false,
        addRiskRequestFailed: true,
      }
    },
  },
});

export const {
  setRisksState,
  risksListRequest,
  risksListRequestSuccess,
  risksListRequestFailed,
  riskByIdRequest,
  riskByIdRequestSuccess,
  riskByIdRequestFailed,
  clearRisk,
  addRiskRequest,
  addRiskRequestSuccess,
  addRiskRequestFailed,

} = stateSlice.actions;

export default stateSlice.reducer;

export const getRisksListThunk = (initiativeId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const project = getState().state.project.value;
  const initiative = getState().initiatives.initiative;

  if (!initiative) return;
  // if (id !== project.id) return;

  dispatch(risksListRequest());
  getRequest(
    `components/risk/info/list/?id=${initiativeId}`,
    (res: AxiosResponse<{ initiative_risks: Array<TRisk> }>) => {
      try {
        // console.log(res.data);
      } catch (error) {
        console.log(error);
        dispatch(risksListRequestFailed());
      }
      dispatch(risksListRequestSuccess(res.data.initiative_risks));
    },
    () => {
      dispatch(risksListRequestFailed());
    }
  );
};

export const getRiskByIdThunk = (riskId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  // const project = getState().state.project.value;

  dispatch(riskByIdRequest());
  getRequest(
    `components/risk/info/?id=${riskId}`,
    (res: AxiosResponse<TRisk>) => {
      try {
        console.log(res.data);
        const newInitiative = {} as any;
        // newInitiative                  
      } catch (error) {
        console.log(error);
        dispatch(riskByIdRequestFailed());
      }
      dispatch(riskByIdRequestSuccess(res.data));
    },
    () => {
      dispatch(riskByIdRequestFailed());
    }
  );
};

export const addRiskThunk = (risk: any) => (dispatch: AppDispatch, getState: () => RootState) => {
  const initiative = getState().initiatives.initiative;
  const body = { ...risk };

  dispatch(addRiskRequest());
  postRequest(
    `components/risk/create/`,
    body,
    (res: AxiosResponse) => {
      dispatch(addRiskRequestSuccess());
      if (initiative) dispatch(getRisksListThunk(initiative.initiative.id))
    },
    () => {
      dispatch(addRiskRequestFailed());
    }
  );
};
