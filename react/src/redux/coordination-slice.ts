import { AxiosResponse } from 'axios';
import { AppDispatch, RootState } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { getRequest, postRequest } from '../utils/requests';
import { TBoss, TCoordinationHistoryItem, TUser } from '../types';
import { getUserRightsThunk } from './auth-slice';

type TState = {
  coordinationHistory: Array<TCoordinationHistoryItem> | null;
  bosses: Array<TBoss>;

  getChatRequest: boolean,
  getChatRequestSuccess: boolean,
  getChatRequestFailed: boolean,

  postCommentRequest: boolean,
  postCommentRequestSuccess: boolean,
  postCommentRequestFailed: boolean,

  closeInitiativeRequest: boolean,
  closeInitiativeRequestSuccess: boolean,
  closeInitiativeRequestFailed: boolean,

  sendForApprovalRequest: boolean,
  sendForApprovalRequestSuccess: boolean,
  sendForApprovalRequestFailed: boolean,
};

const initialState: TState = {
  coordinationHistory: null,
  bosses: [],

  getChatRequest: false,
  getChatRequestSuccess: false,
  getChatRequestFailed: false,

  postCommentRequest: false,
  postCommentRequestSuccess: false,
  postCommentRequestFailed: false,

  closeInitiativeRequest: false,
  closeInitiativeRequestSuccess: false,
  closeInitiativeRequestFailed: false,

  sendForApprovalRequest: false,
  sendForApprovalRequestSuccess: false,
  sendForApprovalRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'coordination',
  initialState,
  reducers: {
    setCoordinationState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    getChatRequest: (state) => {
      return {
        ...state,
        getChatRequest: true,
        getChatRequestSuccess: false,
        getChatRequestFailed: false,
      }
    },
    getChatRequestSuccess: (state, action) => {
      return {
        ...state,
        coordinationHistory: action.payload,
        getChatRequest: false,
        getChatRequestSuccess: true,
      }
    },
    getChatRequestFailed: (state) => {
      return {
        ...state,
        getChatRequest: false,
        getChatRequestFailed: true,
      }
    },
    postCommentRequest: (state) => {
      return {
        ...state,
        postCommentRequest: true,
        postCommentRequestSuccess: false,
        postCommentRequestFailed: false,
      }
    },
    postCommentRequestSuccess: (state) => {
      return {
        ...state,
        postCommentRequestRequest: false,
        postCommentRequestSuccess: true,
      }
    },
    postCommentRequestFailed: (state) => {
      return {
        ...state,
        postCommentRequest: false,
        postCommentRequestFailed: true,
      }
    },
    closeInitiativeRequest: (state) => {
      return {
        ...state,
        closeInitiativeRequest: true,
        closeInitiativeRequestSuccess: false,
        closeInitiativeRequestFailed: false,
      }
    },
    closeInitiativeRequestSuccess: (state) => {
      return {
        ...state,
        closeInitiativeRequest: false,
        closeInitiativeRequestSuccess: true,
      }
    },
    closeInitiativeRequestFailed: (state) => {
      return {
        ...state,
        closeInitiativeRequest: false,
        closeInitiativeRequestFailed: true,
      }
    },
    sendForApprovalRequest: (state) => {
      return {
        ...state,
        sendForApprovalRequest: true,
        sendForApprovalRequestSuccess: false,
        sendForApprovalRequestFailed: false,
      }
    },
    sendForApprovalRequestSuccess: (state) => {
      return {
        ...state,
        sendForApprovalRequest: false,
        sendForApprovalRequestSuccess: true,
      }
    },
    sendForApprovalRequestFailed: (state) => {
      return {
        ...state,
        sendForApprovalRequest: false,
        sendForApprovalRequestFailed: true,
      }
    },
    getBossesListRequest: (state) => {
      return {
        ...state,
        getBossesListRequest: true,
        getBossesListRequestSuccess: false,
        getBossesListRequestFailed: false,
      }
    },
    getBossesListRequestSuccess: (state, action) => {
      return {
        ...state,
        bosses: action.payload,
        getBossesListRequest: false,
        getBossesListRequestSuccess: true,
      }
    },
    getBossesListRequestFailed: (state) => {
      return {
        ...state,
        getBossesListRequest: false,
        getBossesListRequestFailed: true,
      }
    },
    clearBossesList: (state) => {
      state.bosses = [];
    },
  },
});

export const {
  setCoordinationState,
  getChatRequest,
  getChatRequestSuccess,
  getChatRequestFailed,
  postCommentRequest,
  postCommentRequestSuccess,
  postCommentRequestFailed,
  closeInitiativeRequest,
  closeInitiativeRequestSuccess,
  closeInitiativeRequestFailed,
  sendForApprovalRequest,
  sendForApprovalRequestSuccess,
  sendForApprovalRequestFailed,
  getBossesListRequest,
  getBossesListRequestSuccess,
  getBossesListRequestFailed,
  clearBossesList,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getChatThunk = (initiativeId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(getChatRequest());
  getRequest(
    `coordination/initiative/chat/?id=${initiativeId}`,
    (res: AxiosResponse<{ history_coordination: Array<TCoordinationHistoryItem> }>) => {
      try {
        if (!initiativeId) {
          throw new Error('Initiative is missing');
        }
        dispatch(getChatRequestSuccess(res.data.history_coordination));
      } catch (error) {
        console.log(error);
        dispatch(getChatRequestFailed());
      }
    },
    () => {
      dispatch(getChatRequestFailed());
    }
  );
};

export const postCommentThunk = (body: { text: string, initiative: number }) => (dispatch: AppDispatch, getState: () => RootState) => {
  const currentInitiativeId = getState().initiatives.currentInitiativeId;

  dispatch(postCommentRequest());
  postRequest(
    `coordination/initiative/add-comment/`,
    body,
    (res: AxiosResponse) => {
      try {
        if (!currentInitiativeId) {
          throw new Error('Initiative is missing');
        }
        dispatch(getChatThunk(currentInitiativeId));
        dispatch(postCommentRequestSuccess());
      } catch (error) {
        console.log(error);
        dispatch(postCommentRequestFailed());
      }
    },
    () => {
      dispatch(postCommentRequestFailed());
    }
  );
};

export const coordinateThunk = (
  body: {
    text: string,
    initiative: number,
  }) => (dispatch: AppDispatch, getState: () => RootState) => {
  const currentInitiativeId = getState().initiatives.currentInitiativeId;
  // const currentProjectId = getState().state.project.currentId;

  dispatch(postCommentRequest());
  postRequest(
    `coordination/initiative/approval/`,
    body,
    (res: AxiosResponse) => {
      try {
        console.log(res.data);
        if (!currentInitiativeId /*|| !project*/) {
          throw new Error('Project or initiative is missing')
        }
        dispatch(getChatThunk(currentInitiativeId));
        dispatch(getUserRightsThunk(currentInitiativeId));
        // dispatch(getInitiativesListThunk(project.id))
        dispatch(postCommentRequestSuccess());
      } catch (error) {
        console.log(error);
        dispatch(postCommentRequestFailed());
      }
    },
    () => {
      dispatch(postCommentRequestFailed());
    }
  );
};

export const getBossesListThunk = (projectId: number) => (dispatch: AppDispatch, getState: () => RootState) => {
  const initiative = getState().initiatives.initiative;

  dispatch(getBossesListRequest());
  getRequest(
    `/project/community/bosses/?id=${projectId}`,
    (res: AxiosResponse) => {
      try {
        if (!initiative) {
          throw new Error('Initiative is missing')
        }
        dispatch(getBossesListRequestSuccess(res.data));
      } catch (error) {
        console.log(error);
        dispatch(getBossesListRequestFailed());
      }
    },
    () => {
      dispatch(getBossesListRequestFailed());
    }
  );
};
