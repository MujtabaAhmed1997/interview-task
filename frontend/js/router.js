import { renderAuthPage } from './pages/auth.js';
import { renderContestsPage } from './pages/contests.js';
import { renderQuizPage } from './pages/quiz.js';
import { renderLeaderboardPage } from './pages/leaderboard.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderAdminPage } from './pages/admin.js';
import { renderAdminContestPage } from './pages/admin-contest.js';
import { getToken } from './api.js';
import { currentUser } from './state.js';
import { updateNavbar } from './navbar.js';

const routes = [
  { pattern: /^\/login$/, page: 'login', handler: (el) => renderAuthPage(el, 'login') },
  { pattern: /^\/signup$/, page: 'signup', handler: (el) => renderAuthPage(el, 'signup') },
  { pattern: /^\/contests$/, page: 'contests', handler: (el) => renderContestsPage(el) },
  { pattern: /^\/contests\/([^/]+)\/leaderboard$/, page: 'leaderboard', handler: (el, params) => renderLeaderboardPage(el, params.id) },
  { pattern: /^\/contests\/([^/]+)$/, page: 'quiz', handler: (el, params) => renderQuizPage(el, params.id) },
  { pattern: /^\/dashboard$/, page: 'dashboard', auth: true, handler: (el) => renderDashboardPage(el) },
  { pattern: /^\/admin\/contests\/([^/]+)$/, page: 'admin', auth: true, role: 'ADMIN', handler: (el, params) => renderAdminContestPage(el, params.id) },
  { pattern: /^\/admin$/, page: 'admin', auth: true, role: 'ADMIN', handler: (el) => renderAdminPage(el) },
];

let currentPage = '';

function matchRoute(pathname) {
  for (const route of routes) {
    const match = pathname.match(route.pattern);
    if (match) {
      const params = {};
      if (match[1]) params.id = match[1];
      return { route, params };
    }
  }
  return null;
}

function canAccess(route) {
  if (route.auth && !getToken()) return false;
  if (route.role && currentUser?.role !== route.role) return false;
  return true;
}

export function navigate(path, { replace = false } = {}) {
  const url = path.startsWith('/') ? path : `/${path}`;
  if (replace) {
    history.replaceState({ path: url }, '', url);
  } else if (location.pathname !== url) {
    history.pushState({ path: url }, '', url);
  }
  renderCurrentRoute();
}

export async function renderCurrentRoute() {
  const pathname = location.pathname === '/' ? '/contests' : location.pathname;
  if (location.pathname === '/') {
    history.replaceState({ path: '/contests' }, '', '/contests');
  }

  const matched = matchRoute(pathname);
  const app = document.getElementById('app');

  if (!matched) {
    navigate('/contests', { replace: true });
    return;
  }

  if (!canAccess(matched.route)) {
    const redirect = matched.route.auth ? '/login' : '/contests';
    navigate(redirect, { replace: true });
    return;
  }

  currentPage = matched.route.page;
  updateNavbar(currentPage);
  showLoading(app);
  await matched.route.handler(app, matched.params);
}

function showLoading(container) {
  container.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
}

export function initRouter() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http')) return;
    e.preventDefault();
    navigate(href);
  });

  window.addEventListener('popstate', () => {
    renderCurrentRoute();
  });
}
