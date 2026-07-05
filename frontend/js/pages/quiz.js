import { api, getToken } from '../api.js';
import { esc, formatDate, statusBadge, accessBadge, showEmpty, toast } from '../utils.js';
import { navigate } from '../router.js';

let quizState = { contestId: null, questions: [], answers: {}, participation: null };

export async function renderQuizPage(container, contestId) {
  if (!contestId) {
    showEmpty(container, 'No contest selected');
    return;
  }

  quizState = { contestId, questions: [], answers: {}, participation: null };

  try {
    const contest = await api(`/contests/${contestId}`);
    let joined = false;
    let questions = [];

    if (getToken() && contest.status === 'ACTIVE') {
      try {
        const p = await api(`/contests/${contestId}/join`, { method: 'POST' });
        quizState.participation = p;
        joined = true;
      } catch (e) {
        if (e.message.toLowerCase().includes('already')) {
          joined = true;
        } else {
          toast(e.message, 'error');
        }
      }

      if (joined) {
        try {
          questions = await api(`/contests/${contestId}/questions`);
          quizState.questions = questions;
        } catch (e) {
          toast(e.message, 'error');
        }
      }
    }

    container.innerHTML = `
      <div class="contest-header">
        <div>
          <a href="/contests" class="btn btn-secondary btn-sm mb-1" data-link>&larr; Back to Contests</a>
          <h2>${esc(contest.name)}</h2>
          <div class="contest-meta">
            ${statusBadge(contest.status)} ${accessBadge(contest.accessLevel)}
            <span>Start: ${formatDate(contest.startTime)}</span>
            <span>End: ${formatDate(contest.endTime)}</span>
          </div>
          ${contest.description ? `<p style="margin-top:.5rem;color:var(--text-muted)">${esc(contest.description)}</p>` : ''}
        </div>
      </div>
      ${!getToken() ? '<div class="card text-center"><p>Please <a href="/login" data-link>sign in</a> to participate</p></div>' : ''}
      ${getToken() && contest.status !== 'ACTIVE' ? '<div class="card text-center"><p>This contest is not currently active</p></div>' : ''}
      ${joined && questions.length ? renderQuestionsHtml(questions) : ''}
      ${joined && !questions.length ? '<div class="card text-center"><p>No questions in this contest yet</p></div>' : ''}
    `;

    bindQuizEvents();
  } catch (e) {
    showEmpty(container, e.message);
  }
}

function renderQuestionsHtml(questions) {
  return `
    <div id="questions-area">
      ${questions
        .map(
          (q, i) => `
        <div class="card question-card" id="q-${q.id}">
          <h4>Q${i + 1}. ${esc(q.text)} <span class="text-muted" style="font-size:.8rem;font-weight:400">(${q.points} pts, ${q.type.replace('_', ' ')})</span></h4>
          <ul class="option-list">
            ${q.options
              .map(
                (o) => `
              <li data-qid="${q.id}" data-oid="${o.id}" data-type="${q.type}">
                <input type="${q.type === 'MULTI_SELECT' ? 'checkbox' : 'radio'}" name="q-${q.id}" />
                ${esc(o.text)}
              </li>
            `,
              )
              .join('')}
          </ul>
        </div>
      `,
        )
        .join('')}
      <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1rem">
        <button class="btn btn-secondary" id="save-draft-btn">Save Draft</button>
        <button class="btn btn-success" id="submit-btn">Submit Answers</button>
      </div>
    </div>
  `;
}

function bindQuizEvents() {
  document.querySelectorAll('.option-list li').forEach((li) => {
    li.addEventListener('click', () => selectOption(li));
  });
  document.getElementById('save-draft-btn')?.addEventListener('click', saveAnswers);
  document.getElementById('submit-btn')?.addEventListener('click', submitContest);
}

function selectOption(el) {
  const questionId = el.dataset.qid;
  const optionId = el.dataset.oid;
  const type = el.dataset.type;

  if (type === 'MULTI_SELECT') {
    el.classList.toggle('selected');
    el.querySelector('input').checked = el.classList.contains('selected');
    if (!quizState.answers[questionId]) quizState.answers[questionId] = [];
    if (el.classList.contains('selected')) {
      if (!quizState.answers[questionId].includes(optionId)) {
        quizState.answers[questionId].push(optionId);
      }
    } else {
      quizState.answers[questionId] = quizState.answers[questionId].filter((id) => id !== optionId);
    }
  } else {
    const card = document.getElementById(`q-${questionId}`);
    card.querySelectorAll('.option-list li').forEach((li) => {
      li.classList.remove('selected');
      li.querySelector('input').checked = false;
    });
    el.classList.add('selected');
    el.querySelector('input').checked = true;
    quizState.answers[questionId] = [optionId];
  }
}

async function saveAnswers() {
  try {
    const answers = Object.entries(quizState.answers).map(([questionId, optionIds]) => ({
      questionId,
      optionIds,
    }));
    if (!answers.length) {
      toast('Select at least one answer', 'error');
      return;
    }
    await api(`/contests/${quizState.contestId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    toast('Answers saved as draft', 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function submitContest() {
  try {
    const answers = Object.entries(quizState.answers).map(([questionId, optionIds]) => ({
      questionId,
      optionIds,
    }));
    if (answers.length) {
      await api(`/contests/${quizState.contestId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
    }
    const result = await api(`/contests/${quizState.contestId}/submit`, { method: 'POST' });
    toast(`Submitted! Score: ${result.score}`, 'success');
    navigate(`/contests/${quizState.contestId}/leaderboard`);
  } catch (e) {
    toast(e.message, 'error');
  }
}
