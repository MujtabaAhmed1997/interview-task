import { api, getToken } from '../api.js';
import { esc, formatDate, statusBadge, accessBadge, showEmpty } from '../utils.js';

export async function renderContestsPage(container) {
  container.innerHTML = `
    <div class="section-header"><h2>Contests</h2></div>
    <div id="contests-list" class="grid"><div class="loading-center"><div class="spinner"></div></div></div>
  `;

  const list = document.getElementById('contests-list');

  try {
    const result = await api('/contests?page=1&perPage=20');
    const contests = result.data || result;

    if (!contests.length) {
      showEmpty(list, 'No contests yet');
      return;
    }

    list.innerHTML = contests
      .map(
        (c) => `
      <div class="card">
        <div class="flex-between mb-1">
          ${statusBadge(c.status)}
          ${accessBadge(c.accessLevel)}
        </div>
        <h3>${esc(c.name)}</h3>
        <p class="text-muted" style="font-size:.85rem;margin:.4rem 0 .75rem">${esc(c.description || 'No description')}</p>
        <div class="contest-meta">
          <span>Start: ${formatDate(c.startTime)}</span>
          <span>End: ${formatDate(c.endTime)}</span>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:1rem">
          ${c.status === 'ACTIVE' && getToken() ? `<a href="/contests/${c.id}" class="btn btn-primary btn-sm" data-link>Join / Play</a>` : ''}
          ${c.status !== 'ACTIVE' && getToken() ? `<a href="/contests/${c.id}" class="btn btn-secondary btn-sm" data-link>View</a>` : ''}
          <a href="/contests/${c.id}/leaderboard" class="btn btn-outline btn-sm" data-link>Leaderboard</a>
        </div>
      </div>
    `,
      )
      .join('');
  } catch (e) {
    showEmpty(list, e.message);
  }
}
