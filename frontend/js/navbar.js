import { getToken, clearToken } from './api.js';
import { currentUser, clearCurrentUser } from './state.js';
import { roleBadge } from './utils.js';
import { navigate } from './router.js';

export function updateNavbar(activePage = '') {
  const area = document.getElementById('user-area');
  const dashLink = document.querySelector('[data-nav="dashboard"]');
  const adminLink = document.querySelector('[data-nav="admin"]');

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.dataset.nav === activePage);
  });

  if (currentUser) {
    area.innerHTML = `
      <span>${currentUser.name}</span>
      ${roleBadge(currentUser.role)}
      <button class="btn btn-sm btn-secondary" id="logout-btn">Logout</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', doLogout);
    dashLink.style.display = '';
    adminLink.style.display = currentUser.role === 'ADMIN' ? '' : 'none';
  } else {
    const onAuthPage = activePage === 'login' || activePage === 'signup';
    area.innerHTML = onAuthPage
      ? ''
      : `<a href="/login" class="btn btn-sm btn-outline" data-link style="border-color:rgba(255,255,255,.4);color:#fff">Sign In</a>`;
    dashLink.style.display = 'none';
    adminLink.style.display = 'none';
  }
}

function doLogout() {
  clearToken();
  clearCurrentUser();
  updateNavbar();
  navigate('/contests');
}
