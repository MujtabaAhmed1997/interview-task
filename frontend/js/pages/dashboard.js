import { api } from '../api.js';
import { esc, formatDate, statusBadge, roleBadge, showEmpty } from '../utils.js';

export async function renderDashboardPage(container) {
  try {
    const [profile, contestsRes, prizesRes] = await Promise.all([
      api('/auth/me'),
      api('/me/contests?page=1&perPage=20'),
      api('/me/prizes?page=1&perPage=20'),
    ]);
    const myContests = contestsRes.data || contestsRes;
    const myPrizes = prizesRes.data || prizesRes;

    container.innerHTML = `
      <div class="card mb-1" style="display:flex;align-items:center;gap:1rem">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700">${esc(profile.name.charAt(0).toUpperCase())}</div>
        <div>
          <h3>${esc(profile.name)}</h3>
          <span class="text-muted" style="font-size:.85rem">${esc(profile.email)}</span>
          ${roleBadge(profile.role)}
        </div>
      </div>

      <div class="stats-row">
        <div class="card stat-card"><div class="stat-value">${myContests.length}</div><div class="stat-label">Contests Joined</div></div>
        <div class="card stat-card"><div class="stat-value">${myContests.filter((c) => c.status === 'SUBMITTED').length}</div><div class="stat-label">Completed</div></div>
        <div class="card stat-card"><div class="stat-value">${myPrizes.length}</div><div class="stat-label">Prizes Won</div></div>
      </div>

      <div class="dash-section">
        <h3>My Contests</h3>
        ${
          myContests.length
            ? `
          <div class="card table-wrap">
            <table>
              <thead><tr><th>Contest</th><th>Status</th><th>Score</th><th>Started</th><th>Submitted</th></tr></thead>
              <tbody>
                ${myContests
                  .map(
                    (c) => `
                  <tr>
                    <td><a href="/contests/${c.contestId}" data-link>${esc(c.contestId.substring(0, 8))}...</a></td>
                    <td>${statusBadge(c.status)}</td>
                    <td>${c.score ?? '—'}</td>
                    <td>${formatDate(c.startedAt)}</td>
                    <td>${formatDate(c.submittedAt)}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
            : '<div class="empty"><p>You haven\'t joined any contests yet</p></div>'
        }
      </div>

      <div class="dash-section">
        <h3>My Prizes</h3>
        ${
          myPrizes.length
            ? `
          <div class="grid">
            ${myPrizes
              .map(
                (p) => `
              <div class="card">
                <h4>${esc(p.prizeTitle)}</h4>
                <p class="text-muted" style="font-size:.85rem">Contest: ${esc(p.contestName)}</p>
                <p style="font-size:.9rem;margin-top:.3rem">Rank #${p.rank} &middot; Score: ${p.score}</p>
                <p class="text-muted" style="font-size:.8rem;margin-top:.25rem">Awarded: ${formatDate(p.awardedAt)}</p>
              </div>
            `,
              )
              .join('')}
          </div>
        `
            : '<div class="empty"><p>No prizes won yet</p></div>'
        }
      </div>
    `;
  } catch (e) {
    showEmpty(container, e.message);
  }
}
