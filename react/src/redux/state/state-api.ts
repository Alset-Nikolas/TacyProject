import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../consts';
import { TEvent, TInitiative, TProject, TProjectForEdit, TRole, TUser } from '../../types';
import { setCurrentInitiativeId } from '../initiatives-slice';
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
  tagTypes: ['initiative', 'initiatives-list', 'list', 'project', 'files-list', 'event', 'events-list'],
  endpoints: (builder) => ({
    getProjectInfo: builder.query<TProject, number | null>({
      query: (id) => `/project/info${id ? `/?id=${id}` : ''}`,
      providesTags: ['project'],
    }),
    postProject: builder.mutation<TProject, TProject | TProjectForEdit>({
      query(project) {
        return {
          url: `/project/create/`,
          method: 'POST',
          body: project,
        };
      },
      async onQueryStarted(voidArg, { dispatch, queryFulfilled }) {
        try {
          const { data: project } = await queryFulfilled;
          // `onSuccess` side-effect
          if (project) {
            localStorage.setItem('project-id', project.id.toString());
            dispatch(setCurrentProjectId(project.id));
          } else {
            throw new Error('Project posting error');
          }
        } catch (err) {
          // `onError` side-effect
          console.log(err);
        }
      },
      invalidatesTags: ['initiative', 'project', 'list'],
    }),
    deleteProject: builder.mutation<any, number>({
      query(projectId) {
        return {
          url: `/project/delete/`,
          method: 'DELETE',
          body: { id: projectId },
        };
      },
      invalidatesTags: ['initiative', 'project', 'list'],
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
      providesTags: ['list'],
    }),
    getFiles: builder.query<Array<{id: number, file: string, project: number, file_name: string}>, number>({
      query: (projectId) => `project/file/?id=${projectId}`,
      providesTags: ['files-list'],
    }),
    postFiles: builder.mutation<any, {projectId: number, body: FormData}>({
      query({projectId, body}) {
        const type = (body.get('file0') as File).type;
        return {
          url: `project/file/?id=${projectId}`,
          method: 'POST',
          headers: {
            'Content-Type': undefined,
          },
          body,
        };
      },
      invalidatesTags: ['files-list'],
    }),
    deleteFiles: builder.mutation<any, {projectId: number, body: Array<{id: number}>}>({
      query({projectId, body}) {
        return {
          url: `project/file/?id=${projectId}`,
          method: 'DELETE',
          body,
        };
      },
      invalidatesTags: ['files-list'],
    }),
    getInitiativesList: builder.query<Array<TInitiative>, number>({
      query: (id) => `/components/initiative/info/list/?id=${id}`,
      transformResponse: (response: { project_initiatives: Array<TInitiative> }) => response.project_initiatives,
      async onQueryStarted(voidArg, { dispatch, queryFulfilled }) {
        try {
          const { data: initiativesList } = await queryFulfilled;
          // `onSuccess` side-effect
          // const savedProjectId = localStorage.getItem('project-id');
          // if (savedProjectId && projectsList.find((item) => item.id === parseInt(savedProjectId))) {
          //   dispatch(setCurrentProjectId(parseInt(savedProjectId)));
          // } else if (projectsList.length) {
          //   dispatch(setCurrentProjectId(projectsList[0].id));
          const cachedInitiativeId = localStorage.getItem('initiative-id');
          if (cachedInitiativeId) {
            dispatch(setCurrentInitiativeId(parseInt(cachedInitiativeId)));
            localStorage.removeItem('initiative-id');
          } else {
            dispatch(setCurrentInitiativeId(initiativesList[0].initiative.id));
          }
          // }
        } catch (err) {
          // `onError` side-effect
          console.log(err);
        }
      },
      providesTags: ['initiatives-list'],
    }),
    getPersonalInitiativesList: builder.query<Array<TInitiative>, number>({
      query: (id) => `components/initiative/info/list/user/?id=${id}`,
      transformResponse: (response: { project_initiatives: Array<TInitiative> }) => response.project_initiatives,
      providesTags: () => ['list'],
    }),
    getInitiativeById: builder.query<TInitiative, number>({
      query: (initiativeId) => `/components/initiative/info/?id=${initiativeId}`,
      providesTags: () => ['initiative'],
    }),
    addInitiative: builder.mutation<TInitiative, any>({
      query(initiative) {
        return {
          url: `components/initiative/create/`,
          method: 'POST',
          body: initiative,
        }
      },
      // async onQueryStarted(initiative, { dispatch, queryFulfilled, getState }) {
      //   try {
      //     // const projectId = getState().
      //     const { data: updatedInitiative } = await queryFulfilled;
      //     console.log(updatedInitiative);
      //     console.log(initiative);
      //     const patchResult = dispatch(
      //       initiativesApi.util.updateQueryData('getInitiativesList', initiative.initiative.project, (draft) => {
      //         draft.push(updatedInitiative);
      //       })
      //     )
      //   } catch (e) {
      //     console.log(e);
      //   }
      // },
      invalidatesTags: ['initiatives-list'],
    }),
    setRoles: builder.mutation<any, { initiativeId: number, body:  Array<{user: TUser & { id: number }, role: TRole}> }>({
      query({initiativeId, body}) {
        return {
          url: `components/initiative/role/?id=${initiativeId}`,
          method: 'POST',
          body,
        }
      },
      async onQueryStarted({ initiativeId }, { dispatch, queryFulfilled, getState }) {
        try {
          // const projectId = getState().
          const { data: updatedInitiative } = await queryFulfilled;
          // console.log(updatedInitiative);
          // console.log(initiative);
          localStorage.setItem('initiative-id', initiativeId.toString());
          // dispatch(setCurrentInitiativeId(initiativeId));
        } catch (e) {
          console.log(e);
        }
      },
      invalidatesTags: ['initiatives-list'],
    }),
    getRoles: builder.query<Array<{user: TUser & { id: number }, role: TRole & { project: number }}>, number>({
      query: (initiativeId) => `components/initiative/role/?id=${initiativeId}`,
    }),
    getExportUrl: builder.query<{ url: string }, number>({
      query: (projectId) => `components/initiative/info/list/file/?id=${projectId}`,
    }),
    getEventsList: builder.query<Array<TEvent>, number>({
      query: (initiativeId) => `components/event/info/list/?id=${initiativeId}`,
      transformResponse: (response: { initiative_events: Array<TEvent> }) => response.initiative_events,
    //   async onQueryStarted(voidArg, { dispatch, queryFulfilled }) {
    //     try {
    //       const { data: initiativesList } = await queryFulfilled;
    //       // `onSuccess` side-effect
    //       // const savedProjectId = localStorage.getItem('project-id');
    //       // if (savedProjectId && projectsList.find((item) => item.id === parseInt(savedProjectId))) {
    //       //   dispatch(setCurrentProjectId(parseInt(savedProjectId)));
    //       // } else if (projectsList.length) {
    //       //   dispatch(setCurrentProjectId(projectsList[0].id));
    //         dispatch(setCurrentInitiativeId(initiativesList[0].initiative.id));
    //       // }
    //     } catch (err) {
    //       // `onError` side-effect
    //       console.log(err);
    //     }
    //   },   
      providesTags: () => ['events-list'],

    }),
    // getPersonalInitiativesList: builder.query<Array<TInitiative>, number>({
    //   query: (id) => `components/initiative/info/list/user/?id=${id}`,
    //   transformResponse: (response: { project_initiatives: Array<TInitiative> }) => response.project_initiatives,
    //   providesTags: () => ['list'],
    // }),
    getEventById: builder.query<TEvent, number>({
      query: (eventId) => `components/event/info/?id=${eventId}`,
      providesTags: () => ['event'],
    }),
    addEvent: builder.mutation<TEvent, any>({
      query(event) {
        return {
          url: `components/event/create/`,
          method: 'POST',
          body: event,
        }
      },
      // async onQueryStarted(initiative, { dispatch, queryFulfilled, getState }) {
      //   try {
      //     // const projectId = getState().
      //     const { data: updatedInitiative } = await queryFulfilled;
      //     console.log(updatedInitiative);
      //     console.log(initiative);
      //     const patchResult = dispatch(
      //       initiativesApi.util.updateQueryData('getInitiativesList', initiative.initiative.project, (draft) => {
      //         draft.push(updatedInitiative);
      //       })
      //     )
      //   } catch (e) {
      //     console.log(e);
      //   }
    //   },
      invalidatesTags: ['events-list'],
    })
  }),
});

export const {
  useGetProjectInfoQuery,
  usePostProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsListQuery,
  usePostFilesMutation,
  useGetFilesQuery,
  useDeleteFilesMutation,
  useGetInitiativesListQuery,
  useGetPersonalInitiativesListQuery,
  useGetInitiativeByIdQuery,
  useAddInitiativeMutation,
  useSetRolesMutation,
  useGetRolesQuery,
  useGetExportUrlQuery,
  useLazyGetExportUrlQuery,
  useGetEventsListQuery,
  useGetEventByIdQuery,
  useAddEventMutation,
} = stateApi;
