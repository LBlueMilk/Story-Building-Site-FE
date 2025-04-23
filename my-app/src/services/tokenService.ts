import Cookies from 'js-cookie';

export const TokenService = {
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    Cookies.set('accessToken', accessToken, { path: '/', sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { path: '/', sameSite: 'strict' });
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  },
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () =>
    Cookies.get('refreshToken') || localStorage.getItem('refreshToken'),
};
