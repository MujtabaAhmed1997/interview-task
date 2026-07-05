import { api } from '../api.js';
import { currentUser } from '../state.js';
import { esc, formatDate, statusBadge, accessBadge, showEmpty, toast } from '../utils.js';
import { navigate } from '../router.js';
import { showModal } from './admin.js';

function toDatetimeLocal(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function renderAdminContestPage(container, contestId) {
  if (!currentUser || currentUser.role !== 'ADMIN') {
    showEmpty(container, 'Admin access required');
    return;
  }

  try {
    const [contest, questions, prizes] = await Promise.all([
      api(`/contests/${contestId}`),
      api(`/contests/${contestId}/questions`),
      api(`/contests/${contestId}/prizes`),
    ]);

    container.innerHTML = `
      <a href="/admin" class="btn btn-secondary btn-sm mb-1" data-link>&larr; Back to Admin</a>

      <div class="card mb-1">
        <div class="flex-between" style="align-items:flex-start">
          <div>
            <h2>${esc(contest.name)}</h2>
            <div class="contest-meta" style="margin-top:.5rem">
              ${statusBadge(contest.status)} ${accessBadge(contest.accessLevel)}
            </div>
            <p class="text-muted" style="margin-top:.5rem;font-size:.9rem">${esc(contest.description || 'No description')}</p>
            <p class="text-muted" style="font-size:.85rem;margin-top:.25rem">
              ${formatDate(contest.startTime)} &mdash; ${formatDate(contest.endTime)}
            </p>
          </div>
          <div style="display:flex;gap:.5rem;flex-shrink:0">
            <button class="btn btn-outline btn-sm" id="btn-edit-contest">Edit Contest</button>
            <button class="btn btn-danger btn-sm" id="btn-delete-contest">Delete</button>
          </div>
        </div>
      </div>

      <div class="card mb-1">
        <div class="flex-between mb-1">
          <h3>Questions (${questions.length})</h3>
          <button class="btn btn-primary btn-sm" id="btn-add-question">+ Add Question</button>
        </div>
        <div id="questions-admin-list">
          ${questions.length ? questions.map((q, i) => renderQuestionCard(q, i)).join('') : '<p class="text-muted">No questions yet.</p>'}
        </div>
      </div>

      <div class="card">
        <div class="flex-between mb-1">
          <h3>Prizes (${prizes.length})</h3>
          <button class="btn btn-primary btn-sm" id="btn-add-prize">+ Add Prize</button>
        </div>
        <div id="prizes-admin-list">
          ${prizes.length ? renderPrizesTable(prizes) : '<p class="text-muted">No prizes yet.</p>'}
        </div>
      </div>
    `;

    document.getElementById('btn-edit-contest').addEventListener('click', () => openEditContestModal(contest));
    document.getElementById('btn-delete-contest').addEventListener('click', () => deleteContest(contestId));
    document.getElementById('btn-add-question').addEventListener('click', () => showModal('add-question', { contestId }));
    document.getElementById('btn-add-prize').addEventListener('click', () => showModal('create-prize', { contestId }));

    bindQuestionEvents(contestId, questions);
    bindPrizeEvents(contestId);
  } catch (e) {
    showEmpty(container, e.message);
  }
}

function renderQuestionCard(q, index) {
  return `
    <div class="card question-card" style="background:#f8fafc" data-question-id="${q.id}">
      <div class="flex-between" style="align-items:flex-start">
        <h4>Q${index + 1}. ${esc(q.text)}</h4>
        <div style="display:flex;gap:.4rem">
          <button class="btn btn-outline btn-sm btn-edit-question" data-id="${q.id}">Edit</button>
          <button class="btn btn-danger btn-sm btn-delete-question" data-id="${q.id}">Delete</button>
        </div>
      </div>
      <p class="text-muted" style="font-size:.8rem;margin:.25rem 0 .75rem">
        ${q.type.replace(/_/g, ' ')} &middot; ${q.points} pts &middot; Position ${q.position}
      </p>
      <ul class="option-list" style="margin-bottom:.75rem">
        ${q.options
          .map(
            (o) => `
          <li style="cursor:default;${o.isCorrect ? 'border-color:var(--success);background:#f0fdf4' : ''}">
            <span style="flex:1">${esc(o.text)}</span>
            ${o.isCorrect ? '<span class="badge badge-active">Correct</span>' : ''}
            <button class="btn btn-sm btn-outline btn-edit-option" data-id="${o.id}">Edit</button>
            <button class="btn btn-sm btn-danger btn-delete-option" data-id="${o.id}">Del</button>
          </li>
        `,
          )
          .join('')}
      </ul>
      <button class="btn btn-sm btn-secondary btn-add-option" data-id="${q.id}">+ Add Option</button>
    </div>
  `;
}

function renderPrizesTable(prizes) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Rank</th><th>Title</th><th>Description</th><th>Action</th></tr></thead>
        <tbody>
          ${prizes
            .map(
              (p) => `
            <tr>
              <td>#${p.rank}</td>
              <td>${esc(p.title)}</td>
              <td>${esc(p.description || '—')}</td>
              <td><button class="btn btn-danger btn-sm btn-delete-prize" data-id="${p.id}">Delete</button></td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindQuestionEvents(contestId, questions) {
  const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]));
  const optionMap = Object.fromEntries(questions.flatMap((q) => q.options.map((o) => [o.id, o])));

  document.querySelectorAll('.btn-edit-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = questionMap[btn.dataset.id];
      if (!q) return;
      openEditQuestionModal(q.id, q.text, q.points, q.position, contestId);
    });
  });

  document.querySelectorAll('.btn-delete-question').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this question?')) return;
      try {
        await api(`/questions/${btn.dataset.id}`, { method: 'DELETE' });
        toast('Question deleted', 'success');
        renderAdminContestPage(document.getElementById('app'), contestId);
      } catch (e) {
        toast(e.message, 'error');
      }
    });
  });

  document.querySelectorAll('.btn-edit-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      const o = optionMap[btn.dataset.id];
      if (!o) return;
      openEditOptionModal(o.id, o.text, o.isCorrect, contestId);
    });
  });

  document.querySelectorAll('.btn-delete-option').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this option?')) return;
      try {
        await api(`/options/${btn.dataset.id}`, { method: 'DELETE' });
        toast('Option deleted', 'success');
        renderAdminContestPage(document.getElementById('app'), contestId);
      } catch (e) {
        toast(e.message, 'error');
      }
    });
  });

  document.querySelectorAll('.btn-add-option').forEach((btn) => {
    btn.addEventListener('click', () => openAddOptionModal(btn.dataset.id, contestId));
  });
}

function bindPrizeEvents(contestId) {
  document.querySelectorAll('.btn-delete-prize').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this prize?')) return;
      try {
        await api(`/prizes/${btn.dataset.id}`, { method: 'DELETE' });
        toast('Prize deleted', 'success');
        renderAdminContestPage(document.getElementById('app'), contestId);
      } catch (e) {
        toast(e.message, 'error');
      }
    });
  });
}

function openEditContestModal(contest) {
  const body = document.getElementById('modal-body');
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('active');

  body.innerHTML = `
    <h3>Edit Contest</h3>
    <div class="form-group"><label>Name</label><input id="edit-contest-name" value="${esc(contest.name)}" /></div>
    <div class="form-group"><label>Description</label><textarea id="edit-contest-desc">${esc(contest.description || '')}</textarea></div>
    <div class="form-group"><label>Access Level</label>
      <select id="edit-contest-access">
        <option value="NORMAL" ${contest.accessLevel === 'NORMAL' ? 'selected' : ''}>Normal</option>
        <option value="VIP" ${contest.accessLevel === 'VIP' ? 'selected' : ''}>VIP</option>
      </select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Start Time</label><input type="datetime-local" id="edit-contest-start" value="${toDatetimeLocal(contest.startTime)}" /></div>
      <div class="form-group"><label>End Time</label><input type="datetime-local" id="edit-contest-end" value="${toDatetimeLocal(contest.endTime)}" /></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-save">Save</button>
    </div>
  `;

  document.getElementById('modal-cancel').addEventListener('click', () => overlay.classList.remove('active'));
  document.getElementById('modal-save').addEventListener('click', async () => {
    try {
      await api(`/contests/${contest.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: document.getElementById('edit-contest-name').value.trim(),
          description: document.getElementById('edit-contest-desc').value.trim() || null,
          accessLevel: document.getElementById('edit-contest-access').value,
          startTime: new Date(document.getElementById('edit-contest-start').value).toISOString(),
          endTime: new Date(document.getElementById('edit-contest-end').value).toISOString(),
        }),
      });
      toast('Contest updated', 'success');
      overlay.classList.remove('active');
      renderAdminContestPage(document.getElementById('app'), contest.id);
    } catch (e) {
      toast(e.message, 'error');
    }
  });
}

function openEditQuestionModal(questionId, text, points, position, contestId) {
  const body = document.getElementById('modal-body');
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('active');

  body.innerHTML = `
    <h3>Edit Question</h3>
    <div class="form-group"><label>Question Text</label><textarea id="edit-q-text">${esc(text)}</textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Points</label><input type="number" id="edit-q-points" value="${points}" min="0" /></div>
      <div class="form-group"><label>Position</label><input type="number" id="edit-q-position" value="${position}" min="0" /></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-save">Save</button>
    </div>
  `;

  document.getElementById('modal-cancel').addEventListener('click', () => overlay.classList.remove('active'));
  document.getElementById('modal-save').addEventListener('click', async () => {
    try {
      await api(`/questions/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          text: document.getElementById('edit-q-text').value.trim(),
          points: parseInt(document.getElementById('edit-q-points').value, 10),
          position: parseInt(document.getElementById('edit-q-position').value, 10),
        }),
      });
      toast('Question updated', 'success');
      overlay.classList.remove('active');
      renderAdminContestPage(document.getElementById('app'), contestId);
    } catch (e) {
      toast(e.message, 'error');
    }
  });
}

function openEditOptionModal(optionId, text, isCorrect, contestId) {
  const body = document.getElementById('modal-body');
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('active');

  body.innerHTML = `
    <h3>Edit Option</h3>
    <div class="form-group"><label>Option Text</label><input id="edit-o-text" value="${esc(text)}" /></div>
    <div class="form-group">
      <label style="display:flex;align-items:center;gap:.5rem;text-transform:none">
        <input type="checkbox" id="edit-o-correct" ${isCorrect ? 'checked' : ''} /> Mark as correct answer
      </label>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-save">Save</button>
    </div>
  `;

  document.getElementById('modal-cancel').addEventListener('click', () => overlay.classList.remove('active'));
  document.getElementById('modal-save').addEventListener('click', async () => {
    try {
      await api(`/options/${optionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          text: document.getElementById('edit-o-text').value.trim(),
          isCorrect: document.getElementById('edit-o-correct').checked,
        }),
      });
      toast('Option updated', 'success');
      overlay.classList.remove('active');
      renderAdminContestPage(document.getElementById('app'), contestId);
    } catch (e) {
      toast(e.message, 'error');
    }
  });
}

function openAddOptionModal(questionId, contestId) {
  const body = document.getElementById('modal-body');
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('active');

  body.innerHTML = `
    <h3>Add Option</h3>
    <div class="form-group"><label>Option Text</label><input id="add-o-text" placeholder="Option text" /></div>
    <div class="form-group">
      <label style="display:flex;align-items:center;gap:.5rem;text-transform:none">
        <input type="checkbox" id="add-o-correct" /> Mark as correct answer
      </label>
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
      <button class="btn btn-primary" id="modal-save">Add</button>
    </div>
  `;

  document.getElementById('modal-cancel').addEventListener('click', () => overlay.classList.remove('active'));
  document.getElementById('modal-save').addEventListener('click', async () => {
    try {
      const text = document.getElementById('add-o-text').value.trim();
      if (!text) {
        toast('Option text is required', 'error');
        return;
      }
      await api(`/questions/${questionId}/options`, {
        method: 'POST',
        body: JSON.stringify({
          text,
          isCorrect: document.getElementById('add-o-correct').checked,
        }),
      });
      toast('Option added', 'success');
      overlay.classList.remove('active');
      renderAdminContestPage(document.getElementById('app'), contestId);
    } catch (e) {
      toast(e.message, 'error');
    }
  });
}

async function deleteContest(contestId) {
  if (!confirm('Delete this contest and all its data?')) return;
  try {
    await api(`/contests/${contestId}`, { method: 'DELETE' });
    toast('Contest deleted', 'success');
    navigate('/admin');
  } catch (e) {
    toast(e.message, 'error');
  }
}
