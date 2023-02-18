import { AxiosError, AxiosResponse } from 'axios';
import { AppDispatch } from './store';
import { createSlice } from '@reduxjs/toolkit';
import { authUser, confirmPassword, getRequest, resetPassword } from '../utils/requests';
import { TAuthUser, TUserRights } from '../types';

type TState = {
  isAuth: boolean;
  user: TAuthUser | null;
  userRights: TUserRights | null;
  error: {
    message: string;
  } | null;

  authRequest: boolean,
  authRequestSuccess: boolean,
  authRequestFailed: boolean,

  resetRequest: boolean,
  resetRequestSuccess: boolean,
  resetRequestFailed: boolean,

  confirmRequest: boolean,
  confirmRequestSuccess: boolean,
  confirmRequestFailed: boolean,

  getUserInfoRequest: boolean,
  getUserInfoRequestSuccess: boolean,
  getUserInfoRequestFailed: boolean,

  getUserRightsRequest: boolean,
  getUserRightsRequestSuccess: boolean,
  getUserRightsRequestFailed: boolean,
}

const initialState: TState = {
  isAuth: false,
  user: null,
  userRights: null,
  error: null,

  authRequest: false,
  authRequestSuccess: false,
  authRequestFailed: false,

  resetRequest: false,
  resetRequestSuccess: false,
  resetRequestFailed: false,

  confirmRequest: false,
  confirmRequestSuccess: false,
  confirmRequestFailed: false,

  getUserInfoRequest: false,
  getUserInfoRequestSuccess: false,
  getUserInfoRequestFailed: false,

  getUserRightsRequest: false,
  getUserRightsRequestSuccess: false,
  getUserRightsRequestFailed: false,
};

export const stateSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setIsAuth: (state) => {
      state.isAuth = true;
    },
    resetIsAuth: (state) => {
      state.isAuth = false;
    },
    authRequest: (state) => {
      return {
        ...state,
        authRequest: true,
        authRequestSuccess: false,
        authRequestFailed: false,
      }
    },
    authRequestSuccess: (state) => {
      return {
        ...state,
        isAuth: true,
        authRequest: false,
        authRequestSuccess: true,
      }
    },
    authRequestFailed: (state) => {
      return {
        ...state,
        authRequest: false,
        authRequestFailed: true,
      }
    },
    resetRequest: (state) => {
      return {
        ...state,
        error: null,
        resetRequest: true,
        resetRequestSuccess: false,
        resetRequestFailed: false,
      }
    },
    resetRequestSuccess: (state) => {
      return {
        ...state,
        resetRequest: false,
        resetRequestSuccess: true,
      }
    },
    resetRequestFailed: (state, action) => {
      return {
        ...state,
        error: {
          message: action.payload,
        },
        resetRequest: false,
        resetRequestFailed: true,
      }
    },
    confirmRequest: (state) => {
      return {
        ...state,
        confirmRequest: true,
        confirmRequestSuccess: false,
        confirmRequestFailed: false,
      }
    },
    confirmRequestSuccess: (state) => {
      return {
        ...state,
        confirmRequest: false,
        confirmRequestSuccess: true,
      }
    },
    confirmRequestFailed: (state) => {
      return {
        ...state,
        confirmRequest: false,
        confirmRequestFailed: true,
      }
    },
    getUserInfoRequest: (state) => {
      return {
        ...state,
        getUserInfoRequest: true,
        getUserInfoRequestSuccess: false,
        getUserInfoRequestFailed: false,
      }
    },
    getUserInfoRequestSuccess: (state, action) => {
      return {
        ...state,
        user: action.payload,
        getUserInfoRequest: false,
        getUserInfoRequestSuccess: true,
      }
    },
    getUserInfoRequestFailed: (state) => {
      return {
        ...state,
        getUserInfoRequest: false,
        getUserInfoRequestFailed: true,
      }
    },
    clearUser: (state) => {
      state.user = null;
    },
    getUserInfoByIdRequest: (state) => {
      return {
        ...state,
        getUserInfoByIdRequest: true,
        getUserInfoByIdRequestSuccess: false,
        getUserInfoByIdRequestFailed: false,
      }
    },
    getUserInfoByIdRequestSuccess: (state, action) => {
      return {
        ...state,
        user: action.payload,
        getUserInfoByIdRequest: false,
        getUserInfoByIdRequestSuccess: true,
      }
    },
    getUserInfoByIdRequestFailed: (state) => {
      return {
        ...state,
        getUserInfoByIdRequest: false,
        getUserInfoByIdRequestFailed: true,
      }
    },
    getUserRightsRequest: (state) => {
      return {
        ...state,
        getUserRightsRequest: true,
        getUserRightsRequestSuccess: false,
        getUserRightsRequestFailed: false,
      }
    },
    getUserRightsRequestSuccess: (state, action) => {
      return {
        ...state,
        userRights: action.payload,
        getUserRightsRequest: false,
        getUserRightsRequestSuccess: true,
      }
    },
    getUserRightsRequestFailed: (state) => {
      return {
        ...state,
        getUserRightsRequest: false,
        getUserRightsRequestFailed: true,
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setAuthState,
  setIsAuth,
  resetIsAuth,
  authRequest,
  authRequestSuccess,
  authRequestFailed,
  resetRequest,
  resetRequestSuccess,
  resetRequestFailed,
  confirmRequest,
  confirmRequestSuccess,
  confirmRequestFailed,
  getUserInfoRequest,
  getUserInfoRequestSuccess,
  getUserInfoRequestFailed,
  getUserInfoByIdRequest,
  getUserInfoByIdRequestSuccess,
  getUserInfoByIdRequestFailed,
  getUserRightsRequest,
  getUserRightsRequestSuccess,
  getUserRightsRequestFailed,
  clearUser,
  clearError,
} = stateSlice.actions;

export default stateSlice.reducer;

export const getUserInfoThunk = () => (dispatch: AppDispatch) => {
  dispatch(getUserInfoRequest());
  getRequest(
    'auth/info',
    (res: AxiosResponse<TAuthUser>) => {
      dispatch(getUserInfoRequestSuccess(res.data));
    },
    () => {
      dispatch(getUserInfoRequestFailed());
    }
  )
}

export const getUserInfoByIdThunk = (projectId: number) => (dispatch: AppDispatch) => {
  dispatch(getUserInfoByIdRequest());
  getRequest(
    `auth/info?id=${projectId}`,
    (res: AxiosResponse<TAuthUser>) => {
      dispatch(getUserInfoByIdRequestSuccess(res.data));
    },
    () => {
      dispatch(getUserInfoByIdRequestFailed());
    }
  )
}

export const authThunk = (credentials: { email: string, password: string }) => (dispatch: AppDispatch) => {
  dispatch(authRequest());
  authUser(
    credentials,
    (res: AxiosResponse<{ 
      token: string;
      user_id: number;
      email: string;
    }>) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      localStorage.setItem('user_id', res.data.user_id.toString());
      dispatch(authRequestSuccess());
      dispatch(getUserInfoThunk());
    },
    (error: AxiosError) => {
      dispatch(authRequestFailed());
    }
  );
};

export const resetPasswordThunk = (credentials: { email: string }) => (dispatch: AppDispatch) => {
  dispatch(resetRequest());
  resetPassword(
    credentials,
    () => {
      dispatch(resetRequestSuccess());
    },
    (error: AxiosError<any>) => {
      const message = error.response ? error.response.data.email : 'Неизвестная ошибка'
      dispatch(resetRequestFailed(message));
    }
  );
};

export const confirmPasswordThunk = (credentials: { token: string, password: string }) => (dispatch: AppDispatch) => {
  dispatch(confirmRequest());
  confirmPassword(
    credentials,
    () => {
      dispatch(confirmRequestSuccess());
    },
    () => {
      dispatch(confirmRequestFailed());
    }
  );
};

export const getUserRightsThunk = (initiativeId: number) => (dispatch: AppDispatch) => {
  dispatch(getUserRightsRequest());
  getRequest(
    `coordination/initiative/info-user-role/?id=${initiativeId}`,
    (res: AxiosResponse<TUserRights>) => {
      dispatch(getUserRightsRequestSuccess(res.data));
    },
    () => {
      dispatch(getUserRightsRequestFailed());
    }
  );
};
