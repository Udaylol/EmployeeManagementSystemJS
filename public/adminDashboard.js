(function() {
  let admins = [];
  let filteredAdmins = [];
  let currentAdminId = null;
  let isAdminEditMode = false;

  // DOM elements (Admin section)
  const adminDashboard = document.getElementById('adminDashboard');
  const adminTableBody = document.getElementById('adminTableBody');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const refreshAdminsBtn = document.getElementById('refreshAdminsBtn');
  const addAdminBtn = document.getElementById('addAdminBtn');

  // Shared elements
  const adminModal = document.getElementById('adminModal');
  const adminForm = document.getElementById('adminForm');
  const adminModalTitle = document.getElementById('adminModalTitle');
  const deleteModal = document.getElementById('deleteModal');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const toastContainer = document.getElementById('toastContainer');
  const totalAdminsEl = document.getElementById('totalAdmins');

  document.addEventListener('DOMContentLoaded', () => {
    if (adminDashboard) {
      initializeAdminDashboard();
    }
  });

  function initializeAdminDashboard() {
    loadAdmins();
    setupAdminEventListeners();
  }

  function setupAdminEventListeners() {
    // Remove any existing event listeners first to prevent duplicates
    if (adminSearchInput) {
      adminSearchInput.removeEventListener('input', filterAdmins);
      adminSearchInput.addEventListener('input', filterAdmins);
    }
    if (refreshAdminsBtn) {
      refreshAdminsBtn.removeEventListener('click', loadAdmins);
      refreshAdminsBtn.addEventListener('click', loadAdmins);
    }
    if (addAdminBtn) {
      addAdminBtn.removeEventListener('click', openAddAdminModal);
      addAdminBtn.addEventListener('click', openAddAdminModal);
    }

    document.querySelectorAll('.close').forEach((btn) => {
      btn.removeEventListener('click', closeAdminModals);
      btn.addEventListener('click', closeAdminModals);
    });
    window.removeEventListener('click', handleWindowClick);
    window.addEventListener('click', handleWindowClick);
    
    if (adminForm) {
      adminForm.removeEventListener('submit', handleAdminFormSubmit);
      adminForm.addEventListener('submit', handleAdminFormSubmit);
    }

    const cancelAdminBtn = document.getElementById('cancelAdminBtn');
    if (cancelAdminBtn) {
      cancelAdminBtn.removeEventListener('click', closeAdminModals);
      cancelAdminBtn.addEventListener('click', closeAdminModals);
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.removeEventListener('click', confirmAdminDelete);
      confirmDeleteBtn.addEventListener('click', confirmAdminDelete);
    }
  }

  function handleWindowClick(e) {
    if (e.target === adminModal || e.target === deleteModal) {
      closeAdminModals();
    }
  }

  async function loadAdmins() {
    try {
      showLoading(true);
      const response = await fetch('/api/admins');
      if (!response.ok) throw new Error('Failed to load admins');
      admins = await response.json();
      filteredAdmins = [...admins];
      updateAdminStats();
      renderAdminTable();
    } catch (error) {
      showToast('Error loading admins: ' + error.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  function updateAdminStats() {
    if (!totalAdminsEl) return;
    totalAdminsEl.textContent = admins.length;
  }

  function filterAdmins() {
    if (!adminSearchInput) return;
    const searchTerm = adminSearchInput.value.toLowerCase();
    filteredAdmins = admins.filter((admin) => admin.username.toLowerCase().includes(searchTerm));
    renderAdminTable();
  }

  function renderAdminTable() {
    if (!adminTableBody) return;
    if (filteredAdmins.length === 0) {
      adminTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2rem; color: #64748b;">
            <i class="fas fa-user-shield" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
            No admins found
          </td>
        </tr>`;
      return;
    }
    adminTableBody.innerHTML = filteredAdmins
      .map(
        (admin) => `
        <tr>
          <td>${admin.username}</td>
          <td>${formatDate(admin.createdAt)}</td>
          <td>${formatDate(admin.updatedAt)}</td>
          <td>
            <div class="employee-actions">
              <button data-id="${admin._id}" data-username="${admin.username}" class="btn btn-sm btn-outline admin-edit" title="Edit"><i class="fas fa-edit"></i></button>
              <button data-id="${admin._id}" data-username="${admin.username}" class="btn btn-sm btn-danger admin-delete" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`
      )
      .join('');

    document.querySelectorAll('.admin-edit').forEach((btn) => btn.addEventListener('click', () => editAdmin(btn.getAttribute('data-id'), btn.getAttribute('data-username'))));
    document.querySelectorAll('.admin-delete').forEach((btn) => btn.addEventListener('click', () => deleteAdmin(btn.getAttribute('data-id'), btn.getAttribute('data-username'))));
  }

  function openAddAdminModal() {
    if (!adminModal || !adminModalTitle || !adminForm) return;
    isAdminEditMode = false;
    currentAdminId = null;
    adminModalTitle.textContent = 'Add Admin';
    adminForm.reset();
    adminModal.style.display = 'block';
  }

  function editAdmin(id, username) {
    isAdminEditMode = true;
    currentAdminId = id;
    adminModalTitle.textContent = 'Edit Admin';
    document.getElementById('adminUsername').value = username;
    document.getElementById('adminPassword').value = '';
    adminModal.style.display = 'block';
  }

  function deleteAdmin(id, username) {
    if (!deleteModal) return;
    currentAdminId = id;
    const deleteMessage = document.getElementById('deleteMessage');
    const deleteItemName = document.getElementById('deleteItemName');
    if (deleteMessage) deleteMessage.textContent = 'Are you sure you want to delete this admin?';
    if (deleteItemName) deleteItemName.textContent = username;
    deleteModal.style.display = 'block';
  }

  let isSubmitting = false;

  async function handleAdminFormSubmit(e) {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    isSubmitting = true;
    
    const formData = new FormData(adminForm);
    const payload = {
      username: formData.get('username'),
      password: formData.get('password') || undefined
    };
    try {
      showLoading(true);
      const url = isAdminEditMode ? `/api/admins/${currentAdminId}` : '/api/admins';
      const method = isAdminEditMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save admin');
      }
      const saved = await response.json();
      if (isAdminEditMode) {
        const index = admins.findIndex((a) => a._id === currentAdminId);
        if (index !== -1) admins[index] = saved;
        showToast('Admin updated successfully', 'success');
      } else {
        admins.unshift(saved);
        showToast('Admin added successfully', 'success');
      }
      filterAdmins();
      updateAdminStats();
      closeAdminModals();
    } catch (error) {
      showToast('Error saving admin: ' + error.message, 'error');
    } finally {
      showLoading(false);
      isSubmitting = false; // Reset the flag
    }
  }

  async function confirmAdminDelete() {
    if (!currentAdminId) return;
    try {
      showLoading(true);
      const response = await fetch(`/api/admins/${currentAdminId}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete admin');
      }
      admins = admins.filter((a) => a._id !== currentAdminId);
      filterAdmins();
      updateAdminStats();
      closeAdminModals();
      showToast('Admin deleted successfully', 'success');
    } catch (error) {
      showToast('Error deleting admin: ' + error.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  function closeAdminModals() {
    if (adminModal) adminModal.style.display = 'none';
    if (deleteModal) deleteModal.style.display = 'none';
    if (adminForm) adminForm.reset();
    currentAdminId = null;
    isAdminEditMode = false;
  }

  function showLoading(show) {
    if (loadingSpinner) loadingSpinner.style.display = show ? 'block' : 'none';
  }

  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  }
})();


