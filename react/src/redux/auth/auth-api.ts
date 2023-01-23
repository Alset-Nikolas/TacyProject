import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../consts';
import { TAuthUser } from '../../types';

export const authApi = createApi({
  reducerPath: 'authQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_BACKEND_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Token ${localStorage.getItem('token')}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAuthInfoById: builder.query<TAuthUser, number>({
      query: (projectId) => `auth/info/?id=${projectId}`,
    }),
  }),
});

export const {
  useGetAuthInfoByIdQuery,
} = authApi;
