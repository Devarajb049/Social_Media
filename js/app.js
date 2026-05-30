/* ============================================================
   app.js — Global Init, Auth Guard, Toast Notifications
   ============================================================ */

'use strict';

/**
 * Global App State
 */
const App = {
  currentUser: null,
  theme: 'light',

  /**
   * Initialize the application
   */
  init() {
    // Prevent FOUC by applying theme immediately
    this.applyThemeSilently();

    // Initialize theme toggle listener
    this.initThemeToggle();

    // Auth guard: protect dashboard pages
    this.authGuard();

    // Initialize toast container
    this.initToasts();

    // Setup global accessibility
    this.initAccessibility();

    // Preloader fading handler
    const loader = document.getElementById('loading-screen');
    if (loader) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          loader.classList.add('hidden');
        }, 400);
      });
      // Fallback
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 4000);
    }

    console.log('[App] Initialized');
  },

  /**
   * Apply theme without transition flash on load
   */
  applyThemeSilently() {
    document.documentElement.classList.add('no-transition');
    const savedTheme = localStorage.getItem('connectx-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.theme = savedTheme;
    // Remove no-transition class after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transition');
      });
    });
  },

  /**
   * Initialize interactive theme toggle button if present in DOM
   */
  initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('connectx-theme', newTheme);
      this.theme = newTheme;
      
      console.log(`[App] Theme switched to: ${newTheme}`);
    });
  },

  /**
   * Auth Guard — redirect unauthenticated users away from protected pages
   */
  authGuard() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const protectedPages = ['main.html'];
    const authPages     = ['login.html', 'signup.html'];
    const isAuth = !!localStorage.getItem('sp-user');

    if (protectedPages.includes(page) && !isAuth) {
      window.location.replace('login.html');
      return;
    }

    if (authPages.includes(page) && isAuth) {
      window.location.replace('main.html');
      return;
    }

    // Load current user
    if (isAuth) {
      try {
        this.currentUser = JSON.parse(localStorage.getItem('sp-user'));
      } catch (e) {
        localStorage.removeItem('sp-user');
      }
    }
  },

  /**
   * Create toast container
   */
  initToasts() {
    if (!document.getElementById('toast-container')) {
      const el = document.createElement('div');
      el.id = 'toast-container';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
  },

  /**
   * Show a toast notification
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} duration - ms
   */
  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const colors = { success: '#10b981', error: '#ef4444', info: '#6366f1' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.position = 'relative';
    toast.style.userSelect = 'none';
    toast.style.touchAction = 'none';
    toast.style.cursor = 'grab';

    toast.innerHTML = `
      <i class="fas ${icons[type]}" style="color:${colors[type]};font-size:1.1rem;flex-shrink:0;pointer-events:none;"></i>
      <span style="pointer-events:none;">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove reference so we can cancel it
    let autoRemoveTimer = setTimeout(() => {
      dismissToast(120);
    }, duration);

    function dismissToast(exitDirection = 120) {
      toast.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
      toast.style.opacity = '0';
      toast.style.transform = `translateX(${exitDirection}%)`;
      setTimeout(() => toast.remove(), 300);
    }

    // Drag / Swipe Gesture State
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let diffX = 0;

    const startDrag = (clientX) => {
      isDragging = true;
      startX = clientX;
      toast.style.cursor = 'grabbing';
      toast.style.transition = 'none'; // Instant response while dragging
      clearTimeout(autoRemoveTimer); // Don't disappear during swipe
    };

    const moveDrag = (clientX) => {
      if (!isDragging) return;
      currentX = clientX;
      diffX = currentX - startX;

      // Calculate opacity drop
      const progress = Math.min(Math.abs(diffX) / 200, 0.8);
      toast.style.transform = `translateX(${diffX}px)`;
      toast.style.opacity = `${1 - progress}`;
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      toast.style.cursor = 'grab';

      // Dismiss if swiped past threshold
      if (Math.abs(diffX) > 80) {
        dismissToast(diffX > 0 ? 120 : -120);
      } else {
        // Return to center
        toast.style.transition = 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';

        // Restart auto-remove timer
        autoRemoveTimer = setTimeout(() => {
          dismissToast(120);
        }, duration);
      }
      diffX = 0;
    };

    // Touch Event Listeners
    toast.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX));
    toast.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX));
    toast.addEventListener('touchend', endDrag);

    // Mouse Event Listeners
    toast.addEventListener('mousedown', (e) => startDrag(e.clientX));
    window.addEventListener('mousemove', (e) => {
      if (isDragging) moveDrag(e.clientX);
    });
    window.addEventListener('mouseup', () => {
      if (isDragging) endDrag();
    });
  },

  /**
   * Accessibility: skip link, focus management
   */
  initAccessibility() {
    // Keyboard navigation for dropdowns
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Close all open dropdowns/modals
        document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        document.body.style.overflow = '';
      }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      }
    });
  },

  /**
   * Format numbers (e.g. 1200 → "1.2K")
   */
  formatNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return String(n);
  },

  /**
   * Relative time (e.g. "2h ago")
   */
  timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  },

  /**
   * Debounce utility
   */
  debounce(fn, delay = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('sp-user');
    App.showToast('Logged out successfully', 'info', 2000);
    setTimeout(() => { window.location.href = 'index.html'; }, 600);
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => App.init());
