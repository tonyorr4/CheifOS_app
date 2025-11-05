/**
 * Theme Manager for TimeBack AI
 * Handles theme switching and persistence
 */

// Theme switcher functionality
function initThemeSwitcher() {
  const themeButtons = document.querySelectorAll('.theme-btn');
  const body = document.body;

  // Add click listeners to theme buttons
  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.getAttribute('data-theme');

      // Update active button
      themeButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Update theme
      body.setAttribute('data-theme', theme);

      // Save to localStorage
      localStorage.setItem('timebackTheme', theme);

      console.log(`Theme changed to: ${theme}`);
    });
  });

  // Load saved theme on page load
  const savedTheme = localStorage.getItem('timebackTheme') || 'modern';
  body.setAttribute('data-theme', savedTheme);

  // Set active button for saved theme
  const activeButton = document.querySelector(`[data-theme="${savedTheme}"]`);
  if (activeButton) {
    themeButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeSwitcher);
} else {
  initThemeSwitcher();
}
