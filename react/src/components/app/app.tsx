import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { paths } from '../../consts';
import AddEventPage from '../../pages/add-event-page/add-event-page';
import AddInitiativePage from '../../pages/add-initiatives-page/add-initiatives-page';
import AdminPage from '../../pages/admin-page/admin-page';
import BasicSettingsPage from '../../pages/basic-settings-page/basic-settings-page';
import ComponentsSettingsEditPage from '../../pages/components-settings-edit-page/components-settings-edit-page';
import ComponentsSettingsPage from '../../pages/components-settings-page/components-settings-page';
import CreateProjectPage from '../../pages/create-project-page/create-project-page';
import EditRiskPage from '../../pages/edit-risk-page/edit-risk-page';
import EditInitiativePage from '../../pages/edit-initiative-page/edit-initiative-page';
import EventsPage from '../../pages/evens-page/events-page';
import EventInfoPage from '../../pages/event-info-page/event-info-page';
import GraphicsSettingsPage from '../../pages/graphics-settings-page/graphics-settings-page';
import InitiativesRegistryPage from '../../pages/initiatives-registry-page/initiatives-registry-page';
import LoginPage from '../../pages/login-page/login-page';
import NewPasswordPage from '../../pages/new-password-page/new-password-page';
import NotificationsPage from '../../pages/notifications-page/notifications-page';
import PersonalStatsPage from '../../pages/personal-stats/personal-stats';
import ProjectStatusPage from '../../pages/project-status-page/project-status-page';
import ResetPasswordPage from '../../pages/reset-password-page/reset-password-page';
import RootPage from '../../pages/root-page/root-page';
import TeamPage from '../../pages/team-page/team-page';
import TeamSettingsPage from '../../pages/team-settings-page/team-settings-page';
import Logout from '../logout/logout';
import DocumentsSettingsPage from '../../pages/documents-settings-page/documents-settings-page';

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootPage />,
    children: [
      {
        path: "settings",
        element: <AdminPage />,
        children : [
          {
            path: paths.settings.basic.relative,
            element: <BasicSettingsPage />,
          },
          {
            path: paths.settings.graphics.relative,
            element: <GraphicsSettingsPage />,
          },
          {
            path: paths.settings.components.relative,
            element: <ComponentsSettingsPage />,
          },
          {
            path: `${paths.settings.components.relative}/edit`,
            element: <ComponentsSettingsEditPage />
          },
          {
            path: paths.settings.team.relative,
            element: <TeamSettingsPage />,
          },
          {
            path: paths.settings.adjustment.relative,
            element: <ComponentsSettingsPage />,
          },
          {
            path: paths.settings.documents.relative,
            element: <DocumentsSettingsPage />,
          },
        ],
      },
      {
        path: paths.status,
        element: <ProjectStatusPage />,
      },
      {
        path: paths.registry,
        element: <InitiativesRegistryPage />,
      },
      {
        path: `${paths.registry}/add`,
        element: <AddInitiativePage />,
      },
      {
        path: `${paths.registry}/edit`,
        element: <EditInitiativePage />,
      },
      {
        path: `${paths.registry}/risk-info/:riskId`,
        element: <EditRiskPage />,
      },
      {
        path: `${paths.events}`,
        element: <EventsPage />,
      },
      {
        path: `${paths.events}/add`,
        element: <AddEventPage />,
      },
      {
        path: `${paths.events}/info/:eventId`,
        element: <EventInfoPage />,
      },
      {
        path: paths.personalStats,
        element: <PersonalStatsPage />,
      },
      {
        path: paths.team,
        element: <TeamPage />,
      },
      {
        path: paths.info,
        element: <ProjectStatusPage />,
      },
      {
        path: paths.notifications,
        element: <NotificationsPage />,
      },
      {
        path: paths.create.project.absolute,
        element: <CreateProjectPage />,
      },
    ],
  },
  {
    path: `/${paths.login}`,
    element: <LoginPage />,
  },
  {
    path: `/${paths.logout}`,
    element: <Logout />,
  },
  {
    path: `/${paths.resetPassword}`,
    element: <ResetPasswordPage />,
  },
  {
    path: `/${paths.resetPassword}/confirm`,
    element: <NewPasswordPage />,
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;