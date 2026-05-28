/* ============================================================
   darkmode.js — Theme Toggle & System Preference Detection
   ============================================================ */

'use strict';

const DarkMode = {

  /**
   * Initialize dark mode — call early to avoid flash
   */
  init() {
    // Theme already applied by app.js, just wire up toggles
    document.addEventListener('DOMContentLoaded', () => {
      this.wireToggleButtons();
      this.listenSystemPref();
    });
  },

  /**
   * Get current theme
   */
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  /**
   * Set theme
   * @param {'light'|'dark'} theme
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sp-theme', theme);

    // Update all toggle button icons
    this.updateToggleIcons(theme);

    // Update settings page if open
    const lightOpt = document.getElementById('theme-light');
    const darkOpt  = document.getElementById('theme-dark');
    if (lightOpt) lightOpt.classList.toggle('selected', theme === 'light');
    if (darkOpt)  darkOpt.classList.toggle('selected', theme === 'dark');
  },

  /**
   * Toggle between light and dark
   */
  toggle() {
    const current = this.getTheme();
    const next    = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);

    if (typeof App !== 'undefined') {
      App.showToast(
        next === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled',
        'info',
        2000
      );
    }
  },

  /**
   * Wire all toggle buttons on the page
   */
  wireToggleButtons() {
    const toggles = document.querySelectorAll(
      '[data-theme-toggle], .theme-toggle, .theme-toggle-icon, #dark-mode-toggle, #theme-toggle-btn'
    );

    toggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });

      // Keyboard accessible
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        }
      });

      // Set initial aria state
      const theme = this.getTheme();
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      btn.setAttribute('aria-label', `Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });

    // Update icons immediately
    this.updateToggleIcons(this.getTheme());

    // Settings page theme selector
    const lightOpt = document.getElementById('theme-light');
    const darkOpt  = document.getElementById('theme-dark');

    if (lightOpt) {
      lightOpt.addEventListener('click', () => this.setTheme('light'));
      lightOpt.classList.toggle('selected', this.getTheme() === 'light');
    }
    if (darkOpt) {
      darkOpt.addEventListener('click', () => this.setTheme('dark'));
      darkOpt.classList.toggle('selected', this.getTheme() === 'dark');
    }
  },

  /**
   * Update toggle button icons to reflect current theme
   */
  updateToggleIcons(theme) {
    // Update aria attributes
    const toggles = document.querySelectorAll(
      '[data-theme-toggle], .theme-toggle, .theme-toggle-icon, #dark-mode-toggle, #theme-toggle-btn'
    );
    toggles.forEach(btn => {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });

    // Update text-based toggles
    const textToggles = document.querySelectorAll('.theme-toggle-text');
    textToggles.forEach(el => {
      el.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });

    // Update icon-based toggles
    const iconToggles = document.querySelectorAll('.theme-icon');
    iconToggles.forEach(el => {
      el.className = `fas ${theme === 'dark' ? 'fa-sun theme-icon' : 'fa-moon theme-icon'}`;
    });
  },

  /**
   * Listen for system color scheme changes
   */
  listenSystemPref() {
    // Only follow system preference if user hasn't manually set a preference
    const hasManual = localStorage.getItem('sp-theme');
    if (hasManual) return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e) => {
      if (!localStorage.getItem('sp-theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
};

// Apply theme immediately before DOMContentLoaded
(function applyThemeEarly() {
  const saved = localStorage.getItem('sp-theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

DarkMode.init();
