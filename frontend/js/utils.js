export function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

export function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function statusBadge(status) {
  const s = (status || '').toLowerCase();
  return `<span class="badge badge-${s}">${status}</span>`;
}

export function accessBadge(level) {
  const l = (level || '').toLowerCase();
  return `<span class="badge badge-${l}">${level}</span>`;
}

export function roleBadge(role) {
  const r = (role || '').toLowerCase();
  return `<span class="badge badge-${r}">${role}</span>`;
}

export function showLoading(container) {
  container.innerHTML = '<div class="loading-center"><div class="spinner"></div></div>';
}

export function showEmpty(container, msg) {
  container.innerHTML = `<div class="empty"><p>${esc(msg)}</p></div>`;
}

export function contestSelectHtml(contests, id, placeholder = 'Select a contest') {
  const options = contests
    .map((c) => `<option value="${c.id}">${esc(c.name)} (${c.status})</option>`)
    .join('');
  return `<select id="${id}"><option value="">${esc(placeholder)}</option>${options}</select>`;
}
