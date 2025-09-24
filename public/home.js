// Home page controls: dashboard toggle and logout
(function() {
  const employeeDashboardBtn = document.getElementById('employeeDashboardBtn');
  const adminDashboardBtn = document.getElementById('adminDashboardBtn');
  const employeeDashboard = document.getElementById('employeeDashboard');
  const adminDashboard = document.getElementById('adminDashboard');
  const logoutBtn = document.getElementById('logoutBtn');

  document.addEventListener('DOMContentLoaded', () => {
    if (employeeDashboardBtn && adminDashboardBtn) {
      employeeDashboardBtn.addEventListener('click', () => switchSection('employee'));
      adminDashboardBtn.addEventListener('click', () => switchSection('admin'));
    }
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }
  });

  function switchSection(section) {
    if (!employeeDashboard || !adminDashboard) return;
    const isEmployee = section === 'employee';
    employeeDashboard.classList.toggle('active', isEmployee);
    adminDashboard.classList.toggle('active', !isEmployee);
    employeeDashboardBtn.classList.toggle('active', isEmployee);
    adminDashboardBtn.classList.toggle('active', !isEmployee);
    // Optional: smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function logout() {
    try {
      const res = await fetch('/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch (e) {}
  }
})();


