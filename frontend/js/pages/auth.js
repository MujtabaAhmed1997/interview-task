import { api, setToken } from '../api.js';
import { setCurrentUser } from '../state.js';
import { navigate } from '../router.js';
import { updateNavbar } from '../navbar.js';
import { toast } from '../utils.js';

export function renderAuthPage(container, mode = 'login') {
  const isLogin = mode === 'login';

  container.innerHTML = `
    <div class="auth-wrapper">
      <div class="card auth-card">
        <div id="auth-login-form" style="${isLogin ? '' : 'display:none'}">
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
          <div class="form-group">
            <label for="login-email">Email</label>
            <input type="email" id="login-email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input type="password" id="login-password" placeholder="Your password" />
          </div>
          <button class="btn btn-primary" id="login-btn" style="width:100%">Sign In</button>
          <div class="auth-toggle">Don't have an account? <a href="/signup" data-link>Sign up</a></div>
        </div>
        <div id="auth-signup-form" style="${isLogin ? 'display:none' : ''}">
          <h2>Create account</h2>
          <p>Join and start competing</p>
          <div class="form-group">
            <label for="signup-name">Name</label>
            <input type="text" id="signup-name" placeholder="Your name" />
          </div>
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input type="email" id="signup-email" placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label for="signup-password">Password</label>
            <input type="password" id="signup-password" placeholder="Choose a password" />
          </div>
          <button class="btn btn-primary" id="signup-btn" style="width:100%">Create Account</button>
          <div class="auth-toggle">Already have an account? <a href="/login" data-link>Sign in</a></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-btn')?.addEventListener('click', doLogin);
  document.getElementById('signup-btn')?.addEventListener('click', doSignup);
}

async function doLogin() {
  try {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
      toast('Please fill in all fields', 'error');
      return;
    }
    const result = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setToken(result.token);
    setCurrentUser(result.user);
    toast('Signed in successfully', 'success');
    updateNavbar();
    navigate('/contests');
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function doSignup() {
  try {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    if (!name || !email || !password) {
      toast('Please fill in all fields', 'error');
      return;
    }
    const result = await api('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    setToken(result.token);
    setCurrentUser(result.user);
    toast('Account created!', 'success');
    updateNavbar();
    navigate('/contests');
  } catch (e) {
    toast(e.message, 'error');
  }
}
