/* ============================================================
   auth.js — Login & Signup Form Validation & Auth Logic
   ============================================================ */

'use strict';

const Auth = {

  /**
   * Initialize auth forms based on current page
   */
  init() {
    const page = window.location.pathname.split('/').pop();
    if (page === 'login.html')  this.initLogin();
    if (page === 'signup.html') this.initSignup();
  },

  /* ── LOGIN ──────────────────────────────────────── */
  initLogin() {
    const form     = document.getElementById('login-form');
    const emailIn  = document.getElementById('login-email');
    const passIn   = document.getElementById('login-password');
    const btn      = document.getElementById('login-btn');
    const togglePw = document.getElementById('toggle-login-pw');

    if (!form) return;

    // Password visibility toggle
    if (togglePw && passIn) {
      togglePw.addEventListener('click', () => {
        const isText = passIn.type === 'text';
        passIn.type = isText ? 'password' : 'text';
        togglePw.className = `password-toggle fas ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
      });
    }

    // Social login buttons (demo)
    document.querySelectorAll('.btn-social').forEach(btn => {
      btn.addEventListener('click', () => {
        App.showToast('Social login coming soon!', 'info');
      });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors(form);

      const email    = emailIn?.value.trim();
      const password = passIn?.value.trim();
      let valid = true;

      // Validation
      if (!email || !this.isValidEmail(email)) {
        this.showFieldError('email-error', 'Please enter a valid email address');
        emailIn?.classList.add('error');
        valid = false;
      }

      if (!password || password.length < 4) {
        this.showFieldError('password-error', 'Password must be at least 4 characters');
        passIn?.classList.add('error');
        valid = false;
      }

      if (!valid) return;

      // Simulate login
      btn.classList.add('loading');
      btn.disabled = true;

      await this.delay(1200);

      // Check stored user or create demo user
      const storedUsers = JSON.parse(localStorage.getItem('sp-users') || '[]');
      const user = storedUsers.find(u => u.email === email);

      if (user && user.password === password) {
        // Real stored user
        this.loginSuccess(user, btn);
      } else if (email && password) {
        // Demo mode: accept any credentials
        const demoUser = {
          id: 'demo-' + Date.now(),
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          email,
          handle: '@' + email.split('@')[0].toLowerCase(),
          avatar: 'images/user1.jpg',
          role: 'Software Developer',
          bio: 'Passionate developer and creative thinker.',
          followers: 1284,
          following: 367,
          posts: 42
        };
        this.loginSuccess(demoUser, btn);
      } else {
        btn.classList.remove('loading');
        btn.disabled = false;
        this.showFieldError('password-error', 'Invalid credentials. Try any email + password.');
        App.showToast('Login failed. Check credentials.', 'error');
      }
    });
  },

  loginSuccess(user, btn) {
    localStorage.setItem('sp-user', JSON.stringify(user));
    App.showToast(`Welcome back, ${user.name}! 🎉`, 'success');
    setTimeout(() => { window.location.href = 'main.html'; }, 800);
    btn?.classList.remove('loading');
  },

  /* ── SIGNUP ─────────────────────────────────────── */
  initSignup() {
    const form     = document.getElementById('signup-form');
    const passIn   = document.getElementById('signup-password');
    const togglePw = document.getElementById('toggle-signup-pw');

    if (!form) return;

    // Password visibility
    if (togglePw && passIn) {
      togglePw.addEventListener('click', () => {
        const isText = passIn.type === 'text';
        passIn.type = isText ? 'password' : 'text';
        togglePw.className = `password-toggle fas ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
      });
    }

    // Real-time password strength
    if (passIn) {
      passIn.addEventListener('input', () => {
        this.updatePasswordStrength(passIn.value);
      });
    }

    // Social login buttons (demo)
    document.querySelectorAll('.btn-social').forEach(btn => {
      btn.addEventListener('click', () => {
        App.showToast('Social signup coming soon!', 'info');
      });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors(form);

      const nameIn    = document.getElementById('signup-name');
      const emailIn   = document.getElementById('signup-email');
      const passConfIn= document.getElementById('signup-confirm');
      const termsIn   = document.getElementById('terms-check');
      const btn       = document.getElementById('signup-btn');

      const name     = nameIn?.value.trim();
      const email    = emailIn?.value.trim();
      const password = passIn?.value.trim();
      const confirm  = passConfIn?.value.trim();
      const terms    = termsIn?.checked;
      let valid = true;

      if (!name || name.length < 2) {
        this.showFieldError('name-error', 'Enter your full name (at least 2 chars)');
        valid = false;
      }

      if (!email || !this.isValidEmail(email)) {
        this.showFieldError('email-error-s', 'Enter a valid email address');
        valid = false;
      }

      if (!password || password.length < 6) {
        this.showFieldError('password-error-s', 'Password must be at least 6 characters');
        valid = false;
      }

      if (password !== confirm) {
        this.showFieldError('confirm-error', 'Passwords do not match');
        valid = false;
      }

      if (!terms) {
        App.showToast('Please accept the Terms of Service', 'error');
        valid = false;
      }

      if (!valid) return;

      btn.classList.add('loading');
      btn.disabled = true;

      await this.delay(1400);

      // Store new user
      const newUser = {
        id: 'user-' + Date.now(),
        name,
        email,
        password,
        handle: '@' + name.toLowerCase().replace(/\s+/g, ''),
        avatar: 'images/user1.jpg',
        role: 'New Member',
        bio: 'Excited to be part of the ConnectX community!',
        followers: 0,
        following: 0,
        posts: 0,
        joinedAt: new Date().toISOString()
      };

      const users = JSON.parse(localStorage.getItem('sp-users') || '[]');
      users.push(newUser);
      localStorage.setItem('sp-users', JSON.stringify(users));

      App.showToast('Account created! Please log in. 🎉', 'success');
      btn.classList.remove('loading');
      btn.disabled = false;

      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    });
  },

  /* ── Helpers ─────────────────────────────────────── */

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.add('visible');
    }
  },

  clearErrors(form) {
    form.querySelectorAll('.form-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  },

  updatePasswordStrength(password) {
    const bars  = document.querySelectorAll('.strength-bar');
    const label = document.querySelector('.strength-label');
    if (!bars.length) return;

    let score = 0;
    if (password.length >= 8)            score++;
    if (/[A-Z]/.test(password))          score++;
    if (/[0-9]/.test(password))          score++;
    if (/[^A-Za-z0-9]/.test(password))  score++;

    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const classes = ['', 'active-weak', 'active-fair', 'active-good', 'active-strong'];

    bars.forEach((bar, i) => {
      bar.className = 'strength-bar';
      if (i < score) bar.classList.add(classes[score]);
    });

    if (label) {
      label.textContent = score > 0 ? levels[score] : '';
      label.style.color = ['', '#ef4444', '#f59e0b', '#06b6d4', '#10b981'][score];
    }
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

document.addEventListener('DOMContentLoaded', () => Auth.init());
