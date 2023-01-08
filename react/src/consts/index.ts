export const paths = {
  settings: {
    relative: 'settings',
    basic: {
      relative: 'basic',
      absolute: `/settings/basic`,
    },
    graphics: {
      relative: 'graphics',
      absolute: `/settings/graphics`,
    },
    components: {
      relative: 'components',
      absolute: `/settings/components`,
      edit: {
        relative: 'edit',
        absolute: `/settings/components/edit`,
      }
    },
    team: {
      relative: 'team',
      absolute: `/settings/team`,
    },
    adjustment: {
      relative: 'adjustment',
      absolute: `/settings/adjustment`,
    },
  },
  create: {
    project: {
      relative: 'project',
      absolute: '/create/project',
    },
  },
  status: 'status',
  registry: 'registry',
  personalStats: 'personal-stats',
  team: 'team',
  info: 'info',
  logout: 'logout',
  login: 'login',
  resetPassword: 'reset-password',
  notifications: 'notifications',
  events: 'events',
};

export const mockProjectData = {
  "name": "project10",
  "number": "10",
  "date_start": "2022-10-13",
  "date_end": "2022-10-20",
  "purpose": "purpose1",
  "tasks": "tasks1",
  "description": "description1",
  "intermediate_dates": [
    {
      "title": "title12",
      "date": "2022-10-14"
    },
    {
      "title": "title2",
      "date": "2022-10-15"
    }
  ],
  "metrics": [
    {
      "title": "c3",
      "value": 5.0,
      "target_value": 5.0,
      "active": true
    }
  ],
  "properties": [
    {
      "title": "Подразделения",
      "values": [
        "п1", "п2", "п3"
      ]
    },
    {
      "title": "prop2",
      "values": [
        "p1", "p2", "p3"
      ]
    }
  ],
  "roles": [
    {
      "id": 237,
      "name": "Наблюдать",
      "coverage": 0,
      "project": 14
    },
    {
      "id": 238,
      "name": "Эксперт по направлению",
      "coverage": 1,
      "project": 14
    },
    {
      "id": 239,
      "name": "Функциональный эксперт",
      "coverage": 2,
      "project": 14
    },
    {
      "id": 240,
      "name": "Дирекор",
      "coverage": 3,
      "project": 14
    }
  ],
  "rights": [
    {
      "id": 193,
      "name": "Создать инициативу",
      "project": 14,
      "flags": 217
    },
    {
      "id": 194,
      "name": "Согласовать инициативу",
      "project": 14,
      "flags": 218
    },
    {
      "id": 195,
      "name": "Просмотр",
      "project": 14,
      "flags": 219
    }
  ],
};

export const mockTeam = [
  {
    id: 1,
    name: 'Иванов Иван Иванович',
    rights: ['Создать инициативу', 'Согласовывать инициативу', 'Просмотр'],
    role: 'Наблюдать',
    email: '123@mail.ru',
    phone: '+71234567890',
    unit: ['П1', 'П2'],
  },
  {
    id: 2,
    name: 'Петров Иван Иванович',
    rights: ['Согласовывать инициативу', 'Просмотр'],
    role: 'Директор',
    email: '12345@mail.ru',
    phone: '+71234569999',
    unit: ['П2'],
  },
];

export const rights = {
  approve: 'Согласовывать',
  update: 'Изменять',
  create: 'Создавать инициативу',
};

export const REACT_APP_BACKEND_URL = 'http://31.177.78.111:8000/api';
export const REACT_APP_BACKEND_BASE_URL = 'http://31.177.78.111:8000';

// export const REACT_APP_BACKEND_URL = 'http://localhost:8000/api';
// export const REACT_APP_BACKEND_BASE_URL = 'http://localhost:8000';

