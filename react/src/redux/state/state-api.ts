import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../consts';
import { TProject } from '../../types';
import { setCurrentProjectId } from './state-slice';

export const stateApi = createApi({
  reducerPath: 'stateQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_BACKEND_URL,
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Token ${localStorage.getItem('token')}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getProjectInfo: builder.query<TProject, number | null>({
      query: (id) => `/project/info${id ? `/?id=${id}` : ''}`,
    }),
    getProjectsList: builder.query<Array<{ id: number, name: string }>, void>({
      query: () => `/project/list`,
      transformResponse: (response: { items: Array<{ id: number, name: string }> }) => response.items,
      async onQueryStarted(voidArg, { dispatch, queryFulfilled }) {
        try {
          const { data: projectsList } = await queryFulfilled;
          // `onSuccess` side-effect
          const savedProjectId = localStorage.getItem('project-id');
          if (savedProjectId && projectsList.find((item) => item.id === parseInt(savedProjectId))) {
            dispatch(setCurrentProjectId(parseInt(savedProjectId)));
          } else if (projectsList.length) {
            dispatch(setCurrentProjectId(projectsList[0].id));
          }
        } catch (err) {
          // `onError` side-effect
          console.log(err);
        }
      },
    }),
  }),
});

export const {
  useGetProjectInfoQuery,
  useGetProjectsListQuery,
} = stateApi;
