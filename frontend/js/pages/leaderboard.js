import { api } from '../api.js';
import { esc, formatDate, showEmpty } from '../utils.js';

export async function renderLeaderboardPage(container, contestId) {
  if (!contestId) {
    showEmpty(container, 'No contest selected');
    return;
  }

  try {
    const [contest, lb] = await Promise.all([
      api(`/contests/${contestId}`),
      api(`/contests/${contestId}/leaderboard?page=1&perPage=50`),
    ]);
    const entries = lb.data || lb;

    container.innerHTML = `
      <a href="/contests" class="btn btn-secondary btn-sm mb-1" data-link>&larr; Back to Contests</a>
      <h2 style="margin-bottom:1rem">Leaderboard: ${esc(contest.name)}</h2>
      ${
        entries.length
          ? `
        <div class="card table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Submitted</th></tr></thead>
            <tbody>
              ${entries
                .map(
                  (e) => `
                <tr>
                  <td><strong>#${e.rank}</strong></td>
                  <td>${esc(e.userName)}</td>
                  <td>${e.score}</td>
                  <td>${formatDate(e.submittedAt)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `
          : '<div class="empty"><p>No submissions yet</p></div>'
      }
    `;
  } catch (e) {
    showEmpty(container, e.message);
  }
}
