import { api, fetchContests } from '../api.js';
import { currentUser } from '../state.js';
import { esc, formatDate, roleBadge, statusBadge, accessBadge, showEmpty, toast, contestSelectHtml } from '../utils.js';
import { navigate } from '../router.js';

export async function renderAdminPage(container) {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    showEmpty(container, 'Admin access required');
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <h2>Admin Panel</h2>
      <button class="btn btn-primary btn-sm" id="btn-create-contest">+ Create Contest</button>
    </div>

    <div class="card mb-1">
      <h3 style="margin-bottom:.75rem">Manage Contests</h3>
      <div id="admin-contests-list"><div class="loading-center"><div class="spinner"></div></div></div>
    </div>

    <div class="card">
      <h3 style="margin-bottom:.75rem">User Management</h3>
      <div id="admin-users-list"><div class="loading-center"><div class="spinner"></div></div></div>
    </div>
  `;

  document.getElementById('btn-create-contest').addEventListener('click', () => showModal('create-contest'));
  loadAdminContests();
  loadAdminUsers();
}

async function loadAdminContests() {
  const container = document.getElementById('admin-contests-list');
  try {
    const contests = await fetchContests();
    if (!contests.length) {
      container.innerHTML = '<p class="text-muted">No contests yet. Create one to get started.</p>';
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Status</th><th>Access</th><th>Start</th><th>End</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${contests
              .map(
                (c) => `
              <tr>
                <td><strong>${esc(c.name)}</strong></td>
                <td>${statusBadge(c.status)}</td>
                <td>${accessBadge(c.accessLevel)}</td>
                <td>${formatDate(c.startTime)}</td>
                <td>${formatDate(c.endTime)}</td>
                <td>
                  <a href="/admin/contests/${c.id}" class="btn btn-primary btn-sm" data-link>Manage</a>
                </td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<p class="text-muted">${esc(e.message)}</p>`;
  }
}

async function loadAdminUsers() {
  const container = document.getElementById('admin-users-list');
  try {
    const result = await api('/admin/users?page=1&perPage=50');
    const users = result.data || result;
    if (!users.length) {
      container.innerHTML = '<p class="text-muted">No users</p>';
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
          <tbody>
            ${users
              .map(
                (u) => `
              <tr>
                <td>${esc(u.name)}</td>
                <td>${esc(u.email)}</td>
                <td>${roleBadge(u.role)}</td>
                <td>${formatDate(u.createdAt)}</td>
                <td>
                  <select data-user-id="${u.id}" class="role-select" style="padding:.25rem .5rem;border:1px solid var(--border);border-radius:4px;font-size:.8rem">
                    <option value="NORMAL" ${u.role === 'NORMAL' ? 'selected' : ''}>Normal</option>
                    <option value="VIP" ${u.role === 'VIP' ? 'selected' : ''}>VIP</option>
                    <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                  </select>
                </td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.role-select').forEach((select) => {
      select.addEventListener('change', () => updateUserRole(select.dataset.userId, select.value));
    });
  } catch (e) {
    container.innerHTML = `<p class="text-muted">${esc(e.message)}</p>`;
  }
}

async function updateUserRole(userId, role) {
  try {
    await api(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
    toast(`Role updated to ${role}`, 'success');
  } catch (e) {
    toast(e.message, 'error');
    loadAdminUsers();
  }
}

export async function showModal(type, { contestId } = {}) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  overlay.classList.add('active');

  if (type === 'create-contest') {
    body.innerHTML = `
      <h3>Create Contest</h3>
      <div class="form-group"><label>Name</label><input id="m-contest-name" placeholder="Contest name" /></div>
      <div class="form-group"><label>Description</label><textarea id="m-contest-desc" placeholder="Optional description"></textarea></div>
      <div class="form-group"><label>Access Level</label>
        <select id="m-contest-access"><option value="NORMAL">Normal</option><option value="VIP">VIP</option></select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Start Time</label><input type="datetime-local" id="m-contest-start" /></div>
        <div class="form-group"><label>End Time</label><input type="datetime-local" id="m-contest-end" /></div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-create-contest">Create</button>
      </div>
    `;
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-create-contest').addEventListener('click', async () => {
      await doCreateContest();
      loadAdminContests();
    });
    return;
  }

  let contests = [];
  try {
    contests = contestId ? [{ id: contestId }] : await fetchContests();
  } catch (e) {
    toast(e.message, 'error');
    closeModal();
    return;
  }

  if (type === 'add-question') {
    const contestField = contestId
      ? `<input type="hidden" id="m-q-contest" value="${contestId}" />`
      : `<div class="form-group"><label>Contest</label>${contestSelectHtml(await fetchContests(), 'm-q-contest')}</div>`;

    body.innerHTML = `
      <h3>Add Question</h3>
      ${contestField}
      <div class="form-group"><label>Question Text</label><textarea id="m-q-text" placeholder="What is 2 + 2?"></textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Type</label>
          <select id="m-q-type"><option value="SINGLE_SELECT">Single Select</option><option value="MULTI_SELECT">Multi Select</option><option value="TRUE_FALSE">True / False</option></select>
        </div>
        <div class="form-group"><label>Points</label><input type="number" id="m-q-points" value="5" min="1" /></div>
      </div>
      <div id="m-q-options">
        <label style="font-size:.8rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Options</label>
        <div class="option-row" style="display:flex;gap:.5rem;margin-top:.4rem;margin-bottom:.4rem">
          <input placeholder="Option text" class="m-opt-text" style="flex:1;padding:.4rem .6rem;border:1.5px solid var(--border);border-radius:6px" />
          <label style="display:flex;align-items:center;gap:.25rem;font-size:.8rem"><input type="checkbox" class="m-opt-correct" /> Correct</label>
        </div>
        <div class="option-row" style="display:flex;gap:.5rem;margin-bottom:.4rem">
          <input placeholder="Option text" class="m-opt-text" style="flex:1;padding:.4rem .6rem;border:1.5px solid var(--border);border-radius:6px" />
          <label style="display:flex;align-items:center;gap:.25rem;font-size:.8rem"><input type="checkbox" class="m-opt-correct" /> Correct</label>
        </div>
      </div>
      <button class="btn btn-sm btn-secondary mb-1" id="add-option-row">+ Add Option</button>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-add-question">Add Question</button>
      </div>
    `;
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-add-question').addEventListener('click', doAddQuestion);
    document.getElementById('add-option-row').addEventListener('click', addOptionRow);
    return;
  }

  if (type === 'create-prize') {
    const contestField = contestId
      ? `<input type="hidden" id="m-p-contest" value="${contestId}" />`
      : `<div class="form-group"><label>Contest</label>${contestSelectHtml(await fetchContests(), 'm-p-contest')}</div>`;

    body.innerHTML = `
      <h3>Create Prize</h3>
      ${contestField}
      <div class="form-group"><label>Title</label><input id="m-p-title" placeholder="Champion" /></div>
      <div class="form-group"><label>Rank</label><input type="number" id="m-p-rank" value="1" min="1" /></div>
      <div class="form-group"><label>Description</label><textarea id="m-p-desc" placeholder="First place prize"></textarea></div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn btn-primary" id="modal-create-prize">Create</button>
      </div>
    `;
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-create-prize').addEventListener('click', doCreatePrize);
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

function addOptionRow() {
  const container = document.getElementById('m-q-options');
  const row = document.createElement('div');
  row.className = 'option-row';
  row.style.cssText = 'display:flex;gap:.5rem;margin-bottom:.4rem';
  row.innerHTML = `
    <input placeholder="Option text" class="m-opt-text" style="flex:1;padding:.4rem .6rem;border:1.5px solid var(--border);border-radius:6px" />
    <label style="display:flex;align-items:center;gap:.25rem;font-size:.8rem"><input type="checkbox" class="m-opt-correct" /> Correct</label>
  `;
  container.appendChild(row);
}

async function doCreateContest() {
  try {
    const name = document.getElementById('m-contest-name').value.trim();
    const description = document.getElementById('m-contest-desc').value.trim();
    const accessLevel = document.getElementById('m-contest-access').value;
    const startTime = new Date(document.getElementById('m-contest-start').value).toISOString();
    const endTime = new Date(document.getElementById('m-contest-end').value).toISOString();
    if (!name || !startTime || !endTime) {
      toast('Name and dates are required', 'error');
      return;
    }
    const result = await api('/contests', {
      method: 'POST',
      body: JSON.stringify({ name, description: description || null, accessLevel, startTime, endTime }),
    });
    toast(`Contest created: ${result.name}`, 'success');
    closeModal();
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function doAddQuestion() {
  try {
  const contestId = document.getElementById('m-q-contest').value;
  const text = document.getElementById('m-q-text').value.trim();
  const type = document.getElementById('m-q-type').value;
  const points = parseInt(document.getElementById('m-q-points').value, 10) || 5;
  const optTexts = document.querySelectorAll('.m-opt-text');
  const optCorrects = document.querySelectorAll('.m-opt-correct');
  const options = [];
  optTexts.forEach((el, i) => {
    const t = el.value.trim();
    if (t) options.push({ text: t, isCorrect: optCorrects[i].checked });
  });
  if (!contestId || !text || options.length < 2) {
    toast('Select a contest, enter question text, and add at least 2 options', 'error');
    return;
  }
  await api(`/contests/${contestId}/questions`, {
    method: 'POST',
    body: JSON.stringify({ type, text, points, options }),
  });
  toast('Question added!', 'success');
  closeModal();
  if (location.pathname.startsWith('/admin/contests/')) {
    const { renderAdminContestPage } = await import('./admin-contest.js');
    renderAdminContestPage(document.getElementById('app'), contestId);
  }
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function doCreatePrize() {
  try {
  const contestId = document.getElementById('m-p-contest').value;
  const title = document.getElementById('m-p-title').value.trim();
  const rank = parseInt(document.getElementById('m-p-rank').value, 10) || 1;
  const description = document.getElementById('m-p-desc').value.trim();
  if (!contestId || !title) {
    toast('Select a contest and enter a title', 'error');
    return;
  }
  await api(`/contests/${contestId}/prizes`, {
    method: 'POST',
    body: JSON.stringify({ rank, title, description: description || null }),
  });
  toast('Prize created!', 'success');
  closeModal();
  if (location.pathname.startsWith('/admin/contests/')) {
    const { renderAdminContestPage } = await import('./admin-contest.js');
    renderAdminContestPage(document.getElementById('app'), contestId);
  }
  } catch (e) {
    toast(e.message, 'error');
  }
}

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});
