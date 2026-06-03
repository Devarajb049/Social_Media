/* ============================================================
   auth.js — Enhanced Form Validation & Authentication Logic
   ConnectX — Premium UI Page Interactivity
   ============================================================ */

'use strict';

const Auth = {

  /**
   * Initialize auth forms based on current page
   */
  init() {
    const page = window.location.pathname.split('/').pop() || 'login.html';
    if (page.includes('login.html'))  this.initLogin();
    if (page.includes('signup.html')) this.initSignup();
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
        togglePw.className = `auth-pw-toggle fas ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
      });
    }

    // Social login buttons (Direct mock authentication)
    document.querySelectorAll('.btn-oauth').forEach(b => {
      b.addEventListener('click', () => {
        const text = b.textContent.trim().toLowerCase();
        let mockUser;
        if (text.includes('google')) {
          mockUser = {
            id: 'google-oauth-' + Date.now(),
            name: 'Alex Morgan',
            email: 'alex@google.com',
            handle: '@alex_morgan',
            avatar: 'images/user1.jpg',
            role: 'UX Designer',
            bio: 'Lead UX designer at ConnectX. Passionate about interfaces and screen readers.',
            followers: 1284,
            following: 367,
            posts: 42
          };
        } else {
          mockUser = {
            id: 'github-oauth-' + Date.now(),
            name: 'Sarah Chen',
            email: 'sarah@github.com',
            handle: '@sarah_chen',
            avatar: 'images/user2.jpg',
            role: 'Full Stack Developer',
            bio: 'Clean coder. I like components and keyboard navigation.',
            followers: 2450,
            following: 580,
            posts: 95
          };
        }
        
        localStorage.setItem('sp-user', JSON.stringify(mockUser));
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`Logged in via ${text.includes('google') ? 'Google' : 'GitHub'}! Welcome, ${mockUser.name}! 🎉`, 'success');
        }
        setTimeout(() => { window.location.href = 'main.html'; }, 850);
      });
    });

    // Forgot Password Link Click
    const forgotLink = document.getElementById('forgot-password-link');
    const forgotModal = document.getElementById('forgot-password-modal');
    const forgotClose = document.getElementById('forgot-close');
    const forgotEmailIn = document.getElementById('forgot-email');
    const forgotCodeIn = document.getElementById('forgot-code');
    const forgotPassIn = document.getElementById('forgot-new-password');

    if (forgotLink && forgotModal) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotModal.classList.add('open');
        forgotModal.style.display = 'flex';
        // Reset steps
        document.getElementById('forgot-step-1').style.display = 'block';
        document.getElementById('forgot-step-2').style.display = 'none';
        document.getElementById('forgot-step-3').style.display = 'none';
        
        document.getElementById('forgot-email-error').classList.remove('visible');
        document.getElementById('forgot-code-error').classList.remove('visible');
        document.getElementById('forgot-pass-error').classList.remove('visible');
        
        if (forgotEmailIn) {
          forgotEmailIn.value = '';
          setTimeout(() => forgotEmailIn.focus(), 80);
        }
        if (forgotCodeIn) forgotCodeIn.value = '';
        if (forgotPassIn) forgotPassIn.value = '';
        
        if (typeof App !== 'undefined' && App.focusTrap) {
          App.focusTrap(forgotModal);
        }
      });
    }

    if (forgotClose && forgotModal) {
      forgotClose.addEventListener('click', () => {
        forgotModal.classList.remove('open');
        forgotModal.style.display = 'none';
        forgotLink?.focus();
      });
    }

    // Forgot Step 1: Send reset code
    document.getElementById('forgot-send-btn')?.addEventListener('click', () => {
      const email = forgotEmailIn?.value.trim();
      const err = document.getElementById('forgot-email-error');
      if (!email || !this.isValidEmail(email)) {
        if (err) {
          err.querySelector('span').textContent = 'Please enter a valid email address';
          err.classList.add('visible');
        }
        return;
      }
      err?.classList.remove('visible');
      
      // Go to Step 2
      document.getElementById('forgot-step-1').style.display = 'none';
      document.getElementById('forgot-step-2').style.display = 'block';
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Verification code sent!', 'success');
      }
      setTimeout(() => forgotCodeIn?.focus(), 50);
    });

    // Forgot Step 2: Verify code
    document.getElementById('forgot-verify-btn')?.addEventListener('click', () => {
      const code = forgotCodeIn?.value.trim();
      const err = document.getElementById('forgot-code-error');
      if (!code || code !== '1234') {
        if (err) {
          err.querySelector('span').textContent = 'Invalid code. Use 1234 to bypass.';
          err.classList.add('visible');
        }
        return;
      }
      err?.classList.remove('visible');
      
      // Go to Step 3
      document.getElementById('forgot-step-2').style.display = 'none';
      document.getElementById('forgot-step-3').style.display = 'block';
      setTimeout(() => forgotPassIn?.focus(), 50);
    });

    // Toggle forgot password visibility
    const toggleForgotPwBtn = document.getElementById('toggle-forgot-pw');
    if (toggleForgotPwBtn && forgotPassIn) {
      toggleForgotPwBtn.addEventListener('click', () => {
        const isText = forgotPassIn.type === 'text';
        forgotPassIn.type = isText ? 'password' : 'text';
        toggleForgotPwBtn.className = `auth-pw-toggle fas ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
      });
    }

    // Forgot Step 3: Update password
    document.getElementById('forgot-reset-btn')?.addEventListener('click', () => {
      const password = forgotPassIn?.value.trim();
      const err = document.getElementById('forgot-pass-error');
      if (!password || password.length < 6) {
        if (err) {
          err.querySelector('span').textContent = 'Password must be at least 6 characters';
          err.classList.add('visible');
        }
        return;
      }
      err?.classList.remove('visible');

      // Update password in localStorage
      const email = forgotEmailIn?.value.trim();
      const users = JSON.parse(localStorage.getItem('sp-users') || '[]');
      const user = users.find(u => u.email === email);
      if (user) {
        user.password = password;
        localStorage.setItem('sp-users', JSON.stringify(users));
      } else {
        // Create demo user if they reset password for unregistered email
        const newUser = {
          id: 'user-' + Date.now(),
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          email,
          password,
          handle: '@' + email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
          avatar: 'images/user1.jpg',
          role: 'Creative Professional',
          bio: 'Connecting dots, making UI screens interactive.',
          followers: 1200,
          following: 340,
          posts: 0
        };
        users.push(newUser);
        localStorage.setItem('sp-users', JSON.stringify(users));
      }

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Password updated! You can now log in.', 'success');
      }

      // Close modal and fill email in login form
      forgotModal.classList.remove('open');
      forgotModal.style.display = 'none';
      if (emailIn) {
        emailIn.value = email;
        passIn?.focus();
      }
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
        valid = false;
      }

      if (!password || password.length < 4) {
        this.showFieldError('password-error', 'Password must be at least 4 characters');
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
        this.loginSuccess(user, btn);
      } else if (email && password) {
        // Demo mode: accept any credentials and create a matching mock user
        const handleName = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const demoUser = {
          id: 'demo-' + Date.now(),
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          email,
          password,
          handle: '@' + handleName,
          avatar: 'images/user1.jpg',
          role: 'Product Designer',
          bio: 'Connecting dots, making UI screens interactive.',
          followers: 1420,
          following: 480,
          posts: 12
        };
        this.loginSuccess(demoUser, btn);
      } else {
        btn.classList.remove('loading');
        btn.disabled = false;
        this.showFieldError('password-error', 'Invalid credentials. Enter any email and password.');
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Login failed. Please check credentials.', 'error');
        }
      }
    });
  },

  loginSuccess(user, btn) {
    localStorage.setItem('sp-user', JSON.stringify(user));
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`Welcome back, ${user.name}! 🎉`, 'success');
    }
    setTimeout(() => { window.location.href = 'main.html'; }, 850);
    btn?.classList.remove('loading');
  },

  /* ── SIGNUP ─────────────────────────────────────── */
  initSignup() {
    const form       = document.getElementById('signup-form');
    const passIn     = document.getElementById('signup-password');
    const togglePw   = document.getElementById('toggle-signup-pw');
    const passConfIn = document.getElementById('signup-confirm');
    const toggleConf = document.getElementById('toggle-signup-confirm-pw');

    if (!form) return;

    // Password visibility
    if (togglePw && passIn) {
      togglePw.addEventListener('click', () => {
        const isText = passIn.type === 'text';
        passIn.type = isText ? 'password' : 'text';
        togglePw.className = `auth-pw-toggle fas ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
      });
    }

    // Confirm password visibility
    if (toggleConf && passConfIn) {
      toggleConf.addEventListener('click', () => {
        const isText = passConfIn.type === 'text';
        passConfIn.type = isText ? 'password' : 'text';
        toggleConf.className = `auth-pw-toggle fas ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
      });
    }

    // Real-time password strength
    if (passIn) {
      passIn.addEventListener('input', () => {
        this.updatePasswordStrength(passIn.value);
      });
    }

    // Social login buttons (Direct mock authentication)
    document.querySelectorAll('.btn-oauth').forEach(b => {
      b.addEventListener('click', () => {
        const text = b.textContent.trim().toLowerCase();
        let mockUser;
        if (text.includes('google')) {
          mockUser = {
            id: 'google-oauth-' + Date.now(),
            name: 'Alex Morgan',
            email: 'alex@google.com',
            handle: '@alex_morgan',
            avatar: 'images/user1.jpg',
            role: 'UX Designer',
            bio: 'Lead UX designer at ConnectX. Passionate about interfaces and screen readers.',
            followers: 1284,
            following: 367,
            posts: 42
          };
        } else {
          mockUser = {
            id: 'github-oauth-' + Date.now(),
            name: 'Sarah Chen',
            email: 'sarah@github.com',
            handle: '@sarah_chen',
            avatar: 'images/user2.jpg',
            role: 'Full Stack Developer',
            bio: 'Clean coder. I like components and keyboard navigation.',
            followers: 2450,
            following: 580,
            posts: 95
          };
        }
        
        localStorage.setItem('sp-user', JSON.stringify(mockUser));
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast(`Signed up and logged in via ${text.includes('google') ? 'Google' : 'GitHub'}! Welcome, ${mockUser.name}! 🎉`, 'success');
        }
        setTimeout(() => { window.location.href = 'main.html'; }, 850);
      });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.clearErrors(form);

      const nameIn     = document.getElementById('signup-name');
      const usernameIn = document.getElementById('signup-username');
      const emailIn    = document.getElementById('signup-email');
      const termsIn    = document.getElementById('terms-check');
      const btn        = document.getElementById('signup-btn');

      const name     = nameIn?.value.trim();
      const username = usernameIn?.value.trim();
      const email    = emailIn?.value.trim();
      const password = passIn?.value.trim();
      const confirm  = passConfIn?.value.trim();
      const terms    = termsIn?.checked;
      let valid = true;

      // Validations
      if (!name || name.length < 2) {
        this.showFieldError('name-error', 'Enter your full name (at least 2 chars)');
        valid = false;
      }

      // Username: alphanumeric and underscores only, between 3 and 20 characters
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!username) {
        this.showFieldError('username-error', 'Username is required');
        valid = false;
      } else if (!usernameRegex.test(username)) {
        this.showFieldError('username-error', 'Username must be 3-20 characters (letters, numbers, underscores only)');
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
        if (typeof App !== 'undefined' && App.showToast) {
          App.showToast('Please accept the Terms & Privacy Policy', 'error');
        }
        valid = false;
      }

      if (!valid) return;

      btn.classList.add('loading');
      btn.disabled = true;

      await this.delay(1400);

      // Store new user in localStorage
      const newUser = {
        id: 'user-' + Date.now(),
        name,
        email,
        password,
        handle: '@' + username.toLowerCase(),
        avatar: 'images/user3.jpg',
        role: 'Creative Professional',
        bio: 'Just joined the stunning ConnectX community!',
        followers: 0,
        following: 0,
        posts: 0,
        joinedAt: new Date().toISOString()
      };

      const users = JSON.parse(localStorage.getItem('sp-users') || '[]');
      users.push(newUser);
      localStorage.setItem('sp-users', JSON.stringify(users));

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('Account created successfully! 🎉', 'success');
      }
      
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
      const span = el.querySelector('span');
      if (span) {
        span.textContent = msg;
      } else {
        el.textContent = msg;
      }
      el.classList.add('visible');
      
      // Add error border to the input box inside this group
      const group = el.closest('.auth-form-group, .form-group');
      if (group) {
        group.classList.add('has-error');
        const input = group.querySelector('input');
        if (input) input.classList.add('error');
      }
    }
  },

  clearErrors(form) {
    form.querySelectorAll('.auth-field-error, .form-error').forEach(el => {
      const span = el.querySelector('span');
      if (span) {
        span.textContent = '';
      } else {
        el.textContent = '';
      }
      el.classList.remove('visible');
    });
    form.querySelectorAll('.auth-form-group, .form-group').forEach(el => {
      el.classList.remove('has-error');
      const input = el.querySelector('input');
      if (input) input.classList.remove('error');
    });
  },

  updatePasswordStrength(password) {
    const bars  = document.querySelectorAll('.auth-strength-bar, .strength-bar');
    const label = document.querySelector('.auth-strength-label, .strength-label');
    if (!bars.length) return;

    let score = 0;
    if (password.length >= 8)            score++;
    if (/[A-Z]/.test(password))          score++;
    if (/[0-9]/.test(password))          score++;
    if (/[^A-Za-z0-9]/.test(password))  score++;

    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const classes = ['', 'weak', 'fair', 'good', 'strong'];

    bars.forEach((bar, i) => {
      // Clear specific score classes
      bar.classList.remove('weak', 'fair', 'good', 'strong');
      bar.classList.remove('active-weak', 'active-fair', 'active-good', 'active-strong');
      
      if (i < score) {
        const activeClass = bar.classList.contains('auth-strength-bar') ? classes[score] : `active-${classes[score]}`;
        bar.classList.add(activeClass);
      }
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
