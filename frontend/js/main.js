import { api, getToken } from './api.js';
import { setCurrentUser, clearCurrentUser } from './state.js';
import { navigate, renderCurrentRoute, initRouter } from './router.js';
import { updateNavbar } from './navbar.js';

async function loadCurrentUser() {
  if (!getToken()) return;
  try {
    const user = await api('/auth/me');
    setCurrentUser(user);
  } catch {
    localStorage.removeItem('token');
    clearCurrentUser();
  }
}

(async function init() {
  initRouter();
  await loadCurrentUser();
  updateNavbar();
  await renderCurrentRoute();
})();
