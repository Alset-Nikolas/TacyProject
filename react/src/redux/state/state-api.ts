import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../consts';
import { TAuthUser, TComponentsSettings, TCoordinationHistoryItem, TEvent, TFilesSettings, TInitiative, TInitiativeFiles, TProject, TProjectForEdit, TRequestTeamListItem, TRisk, TRole, TTeamMember, TUpdateComponents, TUser, TUserRequest, TUserRights } from '../../types';
import { setCurrentInitiativeId } from '../initiatives-slice';
import { store } from '../store';
import { openErrorModal, openMessageModal, setCurrentProjectId } from './state-slice';

export const stateApi = createApi({
  reducerPath: 'stateQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: REACT_APP_BACKEND_URL,
    prepareHeaders: (headers) => {
      if (localStorage.getItem('token')) headers.set('Authorization', `Token ${localStorage.getItem('token')}`);
      return headers;
    },
  }),
  tagTypes: [
    'initiative',
    'initiatives-list',
    'list',
    'project',
    'files-list',
    'event',
    'events-list',
    'project-files-settings',
    'initiative-files',
    'components',
    'team-list',
    'risks-list',
    'diagrams',
    'personal-diagrams',
    'user-rights',
    'coordination-history',
    'graphic-settings',
    'auth',
  ],
  endpoints: (builder) => ({
    getProjectInfo: builder.query<TProject, number | null>({
      query: (id) => `/project/info${id ? `/?id=${id}` : ''}`,
      providesTags: ['project', 'initiative'],
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
            // localStorage.setItem('project-id', project.id.toString());
            dispatch(setCurrentProjectId(project.id));
          } else {
            throw new Error('Project posting error');
          }
        } catch (err) {
          // `onError` side-effect
          console.log(err);
        }
      },
      invalidatesTags: [
        'initiative',
        'project',
        'list',
        'initiatives-list',
        'components',
        'project-files-settings',
        'events-list',
        'event'
      ],
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
          const savedProjectId = store.getState().state.project.currentId;
          if (!(savedProjectId && projectsList.find((item) => item.id === savedProjectId))) {
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
          const cachedInitiativeId = store.getState().initiatives.currentInitiativeId;

          if (!cachedInitiativeId) {
            if (initiativesList.length) {
              dispatch(setCurrentInitiativeId(initiativesList[0].initiative.id));
            } else {
              dispatch(setCurrentInitiativeId(null));
            }
          }
        } catch (err) {
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
      invalidatesTags: ['initiatives-list', 'initiative'],
    }),
    deleteInitiative: builder.mutation<TInitiative, number>({
      query(initiativeId) {
        return {
          url: `components/initiative/delete/?id=${initiativeId}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: ['initiatives-list', 'initiative'],
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
          // localStorage.setItem('initiative-id', initiativeId.toString());
          // dispatch(setCurrentInitiativeId(initiativeId));
        } catch (e) {
          console.log(e);
        }
      },
      invalidatesTags: ['initiatives-list', 'initiative', 'coordination-history'],
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
      providesTags: () => ['events-list'],
    }),
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
      invalidatesTags: ['events-list', 'project', 'initiative', 'initiatives-list'],
    }),
    deleteEvent: builder.mutation<TEvent, number>({
      query(eventId) {
        return {
          url: `components/event/delete/?id=${eventId}`,
          method: 'DELETE',
        }
      },
      invalidatesTags: ['events-list', 'initiatives-list', 'initiative'],
    }),
    getFilesSettings: builder.query<Array<TFilesSettings>, number>({
      query: (projectId) => `components/settings/file/${projectId}`,
      providesTags: () => ['project-files-settings'],
    }),
    postFilesSettings: builder.mutation<any, {
      projectId: number,
      body: Array<{
        id: number;
        title: string;
        status: number;
      }>
    }>({
      query({ projectId, body }) {
        return {
          url: `components/settings/file/${projectId}/`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['project-files-settings', 'initiatives-list', 'initiative-files'],
    }),
    getInitiativeFiles: builder.query<Array<TInitiativeFiles>, number>({
      query: (initiativeId) => `components/initiative/file/?id=${initiativeId}`,
      providesTags: () => ['initiative-files'],
    }),
    postInitiativeFile: builder.mutation<any, {fileId: number, body: FormData}>({
      query({ fileId, body }) {
        return {
          url: `components/initiative/file/?id=${fileId}`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['initiative-files', 'initiatives-list', 'initiative'],
    }),
    deleteInitiativeFile: builder.mutation<any, number>({
      query(fileId) {
        return {
          url: `components/initiative/file/?id=${fileId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['initiative-files', 'initiatives-list', 'initiative'],
    }),
    getSortedInitiatives: builder.query<{project_initiatives: Array<TInitiative>}, {
      id: number;
      name?: string;
      status?: Array<number>;
      roles?: string;
      approvedByRoles?: string;
      properties?: string;
      metrics?: string;
      files?: Array<number>;
    }>({
      query: ({
        id,
        name,
        status,
        roles,
        approvedByRoles,
        properties,
        metrics,
        files
      }) => {
        let endpoint = `components/initiative/info/list/?id=${id}`;
        if (name) endpoint += `&name=${name}`;
        if (status && status.length) endpoint += `&status=${status}`;
        if (roles) endpoint += `&roles=${roles}`;
        if (approvedByRoles) endpoint += `&role_approv=${approvedByRoles}`;
        if (properties) endpoint += `&properties=${properties}`;
        if (metrics) endpoint += `&metrics=${metrics}`;
        if (files && files.length) endpoint += `&files=${files}`;

        return endpoint;
      },
      providesTags: () => ['initiative-files'],
    }),
    getComponents: builder.query<TComponentsSettings, number>({
      query: (projectId) => `/components/settings/?id=${projectId}`,
      providesTags: () => ['components'],
    }),
    updateComponents: builder.mutation<any, {projectId: number, components: TComponentsSettings}>({
      query({projectId, components}) {
        try {
          const { settings, table_registry, table_community } = components;
          const body = {} as TUpdateComponents;

          if (!settings) throw new Error('Settings is null');

          body.project = projectId;
          body.addfields = settings.initiative_addfields.map((addfield) => {
            return {
              title: addfield.title,
              type: addfield.type,
            };
          });
          body.events_addfields = settings.event_addfields.map((addfield) => {
            return {
              title: addfield.title,
              type: addfield.type,
            };
          });
          body.risks_addfields = settings.risks_addfields.map((addfield) => {
            return {
              title: addfield.title,
              type: addfield.type,
            };
          });
          body.status = [...settings.initiative_status].filter((el) => el.value > -1).map((status) => {
            return {
              name: status.name,
              value: status.value,
            };
          });
          body.table_registry = table_registry;
          body.table_community = table_community;

        
          return {
            url: `components/settings/?id=${projectId}`,
            method: 'POST',
            body,
          };
        } catch(e) {
          console.log(e);
          return {
            url: `components/settings/`,
            method: 'POST',
          };
        }
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (e) {
          console.log(e);
          dispatch(openErrorModal('При сохранении произошла ошибка'));
        }
      },
    invalidatesTags: ['components', 'initiatives-list', 'initiative', 'team-list', 'project-files-settings', 'risks-list'],
    }),
    getTeamList: builder.query<Array<TTeamMember>, { id: number, project: TProject | null }>({
      query: ({ id }) => `/project/community/?id=${id}`,
      transformResponse: (response: { community_info: Array<TRequestTeamListItem<TUserRequest>> }, meta, { project }) => {
        const teamList = response.community_info.map((resItem) => {
            
          const member = {} as TTeamMember;
          member.id = resItem.user.id;
          member.name = `${resItem.user.last_name} ${resItem.user.first_name} ${resItem.user.second_name}`;
          member.email = resItem.user.email;
          member.phone = resItem.user.phone;
          member.is_create = resItem.is_create;
          member.is_author = resItem.is_author;
          member.is_superuser = resItem.user.is_superuser;
          // member.role = resItem.role_user.name;
          // member.rights = resItem.rights_user.map((right) => right.name);
          member.properties = resItem.properties.map((resPropertie) => {
            const projectPropertie = project?.properties.find((el) => el.id === resPropertie.title.id);
            if (!projectPropertie) throw new Error('Propertie doesn\'t exist');
            const propertieValuesArray = resPropertie.values.map((value) => projectPropertie.items.find((el) => el.id === value.id)!.value);
            if (!propertieValuesArray.indexOf('undefined')) throw new Error('Value doesn\'t exist');
            
            return {
              id: projectPropertie ? projectPropertie.id : -1,
              title: projectPropertie ? projectPropertie.title : 'No propertie',
              // values: propertieValuesArray,
              values: resPropertie.values,
            };
          });

          member.addfields = resItem.addfields;

          return member;
        });

        return teamList;
      },
      providesTags: () => ['team-list'],
    }),
    postTeamList: builder.mutation<any, { projectId: number, body: any }>({
      query({ projectId, body}) {
        return {
          url: `/project/community/?id=${projectId}`,
          method: 'POST',
          body: { community_info: body },
        }
      },
      invalidatesTags: ['team-list', 'user-rights', 'initiative'],
      async onQueryStarted({ projectId }, { dispatch, queryFulfilled, getState }) {
        // const { data: project } = stateApi.useGetProjectInfoQuery(projectId);
        const state = getState();
        try {
          const { data } = await queryFulfilled;
          // const patchResult = dispatch(
          //   teamApi.util.updateQueryData('getTeamList', { id: projectId, project: null }, (draft) => {
          //     Object.assign(draft, updatedTeamList);
          //   })
          // )
          if (data.code === 200) {
            dispatch(openMessageModal(data.msg));
          }
        } catch (e) {
          console.log(e);
          dispatch(openErrorModal('Произошла ошибка'));
        }
      },
    }),
    deleteRisk: builder.mutation<any, number>({
      query(riskId) {
        return {
          url: `components/risk/delete/`,
          method: 'DELETE',
          body: { id: riskId },
        };
      },
      invalidatesTags: ['risks-list'],
    }),
    addRisk: builder.mutation<any, any>({
      query(body) {
        return {
          url: `components/risk/create/`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['risks-list'],
    }),
    getRisksList: builder.query<Array<TRisk>, number>({
      query: (initiativeId) => `components/risk/info/list/?id=${initiativeId}`,
      transformResponse: (response: { initiative_risks: Array<TRisk> }) => response.initiative_risks,
      providesTags: () => ['risks-list'],
    }),
    getDiagramsList: builder.query<{ graphics: Array<any>, statusGraphics: Array<any> }, { projectId: number | null, quantity?: number, project?: TProject }>({
      query: ({ projectId, quantity }) => `grafics/statistic/metrics/?id=${projectId}${typeof quantity !== 'undefined' ? `&quantity=${quantity}` : ''}`,
      transformResponse: (response: { grafics: Array<any>, status_grafic: Array<any> }, meta, { project }) => {
        
        const parseGraphicData = (graphics: Array<any>) => {
          const data: Array<any> = []
          // if (!project) return [];
          const propertiesEntries = Object.entries(graphics);
          propertiesEntries.forEach((el) => {
            const propGraphic = {} as any;
            const propertieName = project?.properties.find((properie) => properie.id === +el[0])?.title;
            propGraphic.propertieName = propertieName;
            const metricssEntries = Object.entries(el[1]);
            const graphicData = metricssEntries.map((el) => {
              const metric = project?.metrics.find((metric) => metric.id === +el[0]);
              const metricName = metric?.title;
              const metricUnits = metric?.units;
              const isPercent = metric?.is_percent;
              return {
                metricName: metricName ? metricName : 'Количество инициатив',
                units: metricUnits,
                isPercent: isPercent,
                data: el[1],
              };
            });
            propGraphic.graphicData = graphicData;
            data.push(propGraphic);
          });
          return data;
        };
        const parseStatusGraphics = (graphics: Array<any>) => {
          if (!project) return [];
          const metricssEntries = Object.entries(graphics);
          const graphicData = metricssEntries.map((el) => {
            const metricName = project.metrics.find((metric) => metric.id === +el[0])?.title;
            return {
              metricName: metricName ? metricName : 'Количество инициатив',
              data: el[1],
            };
          });
          return graphicData;
        }

        const data = {graphics: [] as Array<any>, statusGraphics: [] as Array<any>};
        const graphics = response.grafics;
        const statusGraphics = response.status_grafic;

        data.graphics = parseGraphicData(graphics);
        data.statusGraphics = parseStatusGraphics(statusGraphics);

        return data;
      },
      providesTags: () => ['diagrams'],
    }),
    getPersonalDiagramsList: builder.query<{ graphics: Array<any>, statusGraphics: Array<any> }, { projectId: number | null, quantity?: number, project?: TProject }>({
      query: ({ projectId, quantity }) => `grafics/statistic/metrics/user/?id=${projectId}${typeof quantity !== 'undefined' ? `&quantity=${quantity}` : ''}`,
      transformResponse: (response: { grafics: Array<any>, status_grafic: Array<any> }, meta, { project }) => {
        
        const parseGraphicData = (graphics: Array<any>) => {
          const data: Array<any> = []
          // if (!project) return [];
          const propertiesEntries = Object.entries(graphics);
          propertiesEntries.forEach((el) => {
            const propGraphic = {} as any;
            const propertieName = project?.properties.find((properie) => properie.id === +el[0])?.title;
            propGraphic.propertieName = propertieName;
            const metricssEntries = Object.entries(el[1]);
            const graphicData = metricssEntries.map((el) => {
              const metricName = project?.metrics.find((metric) => metric.id === +el[0])?.title;
              return {
                metricName: metricName ? metricName : 'Количество инициатив',
                data: el[1],
              };
            });
            propGraphic.graphicData = graphicData;
            data.push(propGraphic);
          });
          return data;
        };
        const parseStatusGraphics = (graphics: Array<any>) => {
          if (!project) return [];
          const metricssEntries = Object.entries(graphics);
          const graphicData = metricssEntries.map((el) => {
            const metricName = project.metrics.find((metric) => metric.id === +el[0])?.title;
            return {
              metricName: metricName ? metricName : 'Количество инициатив',
              data: el[1],
            };
          });
          return graphicData;
        }

        const data = {graphics: [] as Array<any>, statusGraphics: [] as Array<any>};
        const graphics = response.grafics;
        const statusGraphics = response.status_grafic;

        data.graphics = parseGraphicData(graphics);
        data.statusGraphics = parseStatusGraphics(statusGraphics);

        return data;
      },
      providesTags: () => ['personal-diagrams'],
    }),
    getUserRights: builder.query<TUserRights, number>({
      query: (initiativeId) => `coordination/initiative/info-user-role/?id=${initiativeId}`,
      providesTags: () => ['user-rights'],
    }),
    switchInitiativeState: builder.mutation<any, { failure: boolean, initiative: number }>({
      query(body) {
        return {
          url: `coordination/initiative/switch/`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ['initiative', 'initiatives-list', 'coordination-history', 'user-rights'],
    }),
    authUser: builder.mutation<any, { email: string, password: string }>({
      query(credentials) {
        return {
          url: `/auth/login/`,
          method: 'POST',
          body: credentials,
        };
      },
      invalidatesTags: ['user-rights'],
    }),
    getChat: builder.query<Array<TCoordinationHistoryItem>, number>({
      query: (initiativeId) => `coordination/initiative/chat/?id=${initiativeId}`,
      transformResponse: (response: { history_coordination: Array<TCoordinationHistoryItem> }) => {
        return response.history_coordination;
      },
      providesTags: () => ['coordination-history'],
    }),
    postComment: builder.mutation<any, { text: string, initiative: number }>({
      query(body) {
        return {
          url: `coordination/initiative/add-comment/`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['coordination-history'],
    }),
    coordinate: builder.mutation<any, { text: string, initiative: number }>({
      query(body) {
        return {
          url: `coordination/initiative/approval/`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['coordination-history', 'user-rights', 'initiative', 'initiatives-list'],
    }),
    sendForApproval: builder.mutation<any, { text: string, initiative: number, coordinators: Array<TUser & {id: number}> }>({
      query(body) {
        return {
          url: `coordination/initiative/sent-for-approval/`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['coordination-history', 'user-rights', 'initiatives-list'],
    }),
    closeInitiative: builder.mutation<any, { failure: boolean, initiative: number }>({
      query(body) {
        return {
          url: `coordination/initiative/switch/`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['coordination-history', 'user-rights', 'initiatives-list'],
    }),
    getGraphicsSettings: builder.query<{
      grafics: Array<{
        propertie: { id: number, title: string };
        metrics: Array<{ 
          metric: {
            id: number,
            title: string,
          },
          activate: boolean,
        }>
      }>;
      status_grafics: Array<{
        metric: {
          id: number,
          title: string,
        },
        activate: boolean,
      }>;
    }, number>({
      query: (projectId) => `grafics/settings/?id=${projectId}`,
      
      providesTags: () => ['graphic-settings'],
    }),
    updateGraphicsSettings: builder.mutation<any, {
      projectId: number,
      settings: Array<{
        propertie: { id: number, title: string };
        metrics: Array<{ 
          metric: {
            id: number,
            title: string,
          },
          activate: boolean,
        }>
      }>,
      statusSettings: Array<{ 
        metric: {
          id: number,
          title: string,
        },
        activate: boolean,
      }>,
    }>({
      query({ projectId, settings, statusSettings }) {
        return {
          url: `grafics/settings/?id=${projectId}`,
          method: 'POST',
          body: { grafics: settings, status_grafics: statusSettings },
        };
      },
      invalidatesTags: ['graphic-settings', 'diagrams', 'personal-diagrams'],
    }),
    getAuthInfoById: builder.query<TAuthUser, number>({
      query: (projectId) => `auth/info/${projectId !== -1 ? `?id=${projectId}` : ''}`,
      providesTags: () => ['auth'],
    }),
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
  useDeleteInitiativeMutation,
  useSetRolesMutation,
  useGetRolesQuery,
  useGetExportUrlQuery,
  useLazyGetExportUrlQuery,
  useGetEventsListQuery,
  useGetEventByIdQuery,
  useAddEventMutation,
  useDeleteEventMutation,
  useGetFilesSettingsQuery,
  usePostFilesSettingsMutation,
  useGetInitiativeFilesQuery,
  usePostInitiativeFileMutation,
  useDeleteInitiativeFileMutation,
  useGetSortedInitiativesQuery,
  useLazyGetSortedInitiativesQuery,
  useGetComponentsQuery,
  useUpdateComponentsMutation,
  useGetTeamListQuery,
  usePostTeamListMutation,
  useAddRiskMutation,
  useDeleteRiskMutation,
  useGetRisksListQuery,
  useGetDiagramsListQuery,
  useLazyGetDiagramsListQuery,
  useLazyGetPersonalDiagramsListQuery,
  useGetUserRightsQuery,
  useSwitchInitiativeStateMutation,
  useAuthUserMutation,
  useGetChatQuery,
  useCloseInitiativeMutation,
  useCoordinateMutation,
  useSendForApprovalMutation,
  usePostCommentMutation,
  useGetGraphicsSettingsQuery,
  useUpdateGraphicsSettingsMutation,
  useGetAuthInfoByIdQuery,
} = stateApi;
