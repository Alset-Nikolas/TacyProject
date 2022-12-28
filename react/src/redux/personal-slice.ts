import { AxiosResponse } from 'axios';
import { AppDispatch } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getRequest } from '../utils/requests';
import { TPersonalStats } from '../types';
import { closeLoader, showLoader } from './state/state-slice';

type TState = {
  personalStats: TPersonalStats;

  getPersonalStatsRequest: boolean,
  getPersonalStatsRequestSuccess: boolean,
  getPersonalStatsRequestFailed: boolean,
};

const initialState: TState = {
  personalStats: {
    user_initiatives: [],
    events: [],
    metrics_user_stat: [],
  },

  getPersonalStatsRequest: false,
  getPersonalStatsRequestSuccess: false,
  getPersonalStatsRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'personal',
  initialState,
  reducers: {
    setPersonalState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    getPersonalStatsRequest: (state) => {
      return {
        ...state,
        getPersonalStatsRequest: true,
        getPersonalStatsRequestSuccess: false,
        getPersonalStatsRequestFailed: false,
      }
    },
    getPersonalStatsRequestSuccess: (state, action) => {
      return {
        ...state,
        personalStats: action.payload,
        getPersonalStatsRequest: false,
        getPersonalStatsRequestSuccess: true,
      }
    },
    getPersonalStatsRequestFailed: (state) => {
      return {
        ...state,
        getPersonalStatsRequest: false,
        getPersonalStatsRequestFailed: true,
      }
    },
  },
});

export const {
  setPersonalState,
  getPersonalStatsRequest,
  getPersonalStatsRequestSuccess,
  getPersonalStatsRequestFailed,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getPersonalStatsThunk = (projectId: number) => (dispatch: AppDispatch) => {
  try {
    dispatch(getPersonalStatsRequest());
    dispatch(showLoader());
    if (!projectId) {
      throw new Error('Project doesnt exist')
    }
    getRequest(
      `components/initiative/user/statistics/?id=${projectId}`,
      (res: AxiosResponse) => {
        dispatch(getPersonalStatsRequestSuccess(res.data));
        dispatch(closeLoader());
      },
      () => {
        dispatch(getPersonalStatsRequestFailed());
        dispatch(closeLoader());
      }
    );
  } catch (error) {
    dispatch(getPersonalStatsRequestFailed());
    dispatch(closeLoader());
  }
  
};
