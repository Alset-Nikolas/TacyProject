import axios, { AxiosResponse, AxiosError } from 'axios';

export async function getProjectInfo(
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
  id?: number | null,
  // alwaysCallback = () => {},
  // retries = 0,
) {
  // const formData = new FormData();

  // Object.entries(body).forEach((el) => {
  //   formData.append(el[0], el[1]);
  // });

  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  // Повторение запроса
  // axiosRetry(client, {
  //   retries,
  //   shouldResetTimeout: true,
  //   retryCondition: (/* _error */) => true,
  //   retryDelay: () => 5000,
  // });

  // Запрос
  client
    .get(`/project/info${id ? `/?id=${id}` : ''}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    })
    // .then(() => {
    //   // always executed
    //   // alwaysCallback();
    // });
}

export async function getProjectsList(
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
  // alwaysCallback = () => {},
  // retries = 0,
) {
  // const formData = new FormData();

  // Object.entries(body).forEach((el) => {
  //   formData.append(el[0], el[1]);
  // });

  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  // Повторение запроса
  // axiosRetry(client, {
  //   retries,
  //   shouldResetTimeout: true,
  //   retryCondition: (/* _error */) => true,
  //   retryDelay: () => 5000,
  // });

  // Запрос
  client
    .get('/project/list', {
      headers: {
        Accept: 'application/json',
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    })
    // .then(() => {
    //   // always executed
    //   // alwaysCallback();
    // });
}

export function createProjectRequest(
  body: any,
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .post(
      '/project/create/',
      body,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    })
}

export function authUser(
  body: { email: string, password: string },
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  
  client
    .post(
      '/auth/login/',
      body,
      {
        headers: {
          Accept: 'application/json',
          // Authorization: `Token ${process.env.REACT_APP_BEARER_TOKEN}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    })
}

export function resetPassword(
  body: { email: string },
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .post(
      '/auth/reset-password/',
      body,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    })
}

export function confirmPassword(
  body: { token: string, password: string },
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .post(
      '/auth/reset-password/confirm/',
      body,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    })
}

export function deleteProject(
  id: number,
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const token = localStorage.getItem('token');

  axios({
    method: 'delete',
    url: `${process.env.REACT_APP_BACKEND_URL}/project/delete/`,
    data: { id },
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${token}`,
    },
  })
    .then((res) => {
      successCallback(res);
    })
    .catch((error) => {
      errorCallback(error);
    });
}

export function getTeamList(
  id: number,
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .get(
      `/project/community/?id=${id}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    })
}

export function postTeamList(
  id: number,
  body: { community_info: Array<any> },
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .post(
      `/project/community/?id=${id}`,
      body,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    })
}

export function getComponents(
  id: number,
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .get(
      `/components/settings/?id=${id}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    });
}

export function getInitiativesList(
  projectId: number,
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .get(
      `/components/initiative/info/list/?id=${projectId}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    });
}

export function getRequest(
  // projectId: number,
  url: string,
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .get(
      url,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    });
}

export function postRequest(
  // projectId: number,
  url: string,
  body: any,
  successCallback: (response: AxiosResponse) => void,
  errorCallback: (error: AxiosError) => void,
) {
  const client = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL });
  const token = localStorage.getItem('token');

  client
    .post(
      url,
      body,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      successCallback(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
      errorCallback(error);
    });
}
