// Employee Dashboard JavaScript (modular)
(function() {
  // State
  let employees = [];
  let filteredEmployees = [];
  let currentEmployeeId = null;
  let isEmployeeEditMode = false;

  // DOM elements (Employee section)
  const employeeTableBody = document.getElementById('employeeTableBody');
  const searchInput = document.getElementById('searchInput');
  const roleFilter = document.getElementById('roleFilter');
  const refreshBtn = document.getElementById('refreshBtn');
  const addEmployeeBtn = document.getElementById('addEmployeeBtn');

  // Shared elements
  const employeeModal = document.getElementById('employeeModal');
  const deleteModal = document.getElementById('deleteModal');
  const employeeForm = document.getElementById('employeeForm');
  const modalTitle = document.getElementById('modalTitle');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const toastContainer = document.getElementById('toastContainer');

  // Stats elements
  const totalEmployeesEl = document.getElementById('totalEmployees');
  const avgSalaryEl = document.getElementById('avgSalary');
  const totalRolesEl = document.getElementById('totalRoles');

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('employeeDashboard')) {
      initializeEmployeeDashboard();
    }
  });

  function initializeEmployeeDashboard() {
    loadEmployees();
    setupEmployeeEventListeners();
  }

  function setupEmployeeEventListeners() {
    if (searchInput) searchInput.addEventListener('input', filterEmployees);
    if (roleFilter) roleFilter.addEventListener('change', filterEmployees);
    if (refreshBtn) refreshBtn.addEventListener('click', loadEmployees);
    if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', openAddEmployeeModal);

    document.querySelectorAll('.close').forEach((btn) => btn.addEventListener('click', closeEmployeeModals));

    window.addEventListener('click', (e) => {
      if (e.target === employeeModal || e.target === deleteModal) {
        closeEmployeeModals();
      }
    });

    if (employeeForm) employeeForm.addEventListener('submit', handleEmployeeFormSubmit);

    const cancelBtn = document.getElementById('cancelBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeEmployeeModals);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeEmployeeModals);

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmEmployeeDelete);
  }

  async function loadEmployees() {
    try {
      showLoading(true);
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to load employees');
      employees = await response.json();
      filteredEmployees = [...employees];
      updateEmployeeStats();
      updateRoleFilter();
      renderEmployeeTable();
    } catch (error) {
      showToast('Error loading employees: ' + error.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  function updateEmployeeStats() {
    if (!totalEmployeesEl || !avgSalaryEl || !totalRolesEl) return;
    const total = employees.length;
    const avgSalary = total > 0 ? employees.reduce((sum, e) => sum + e.salary, 0) / total : 0;
    const uniqueRoles = new Set(employees.map((e) => e.role)).size;
    totalEmployeesEl.textContent = total;
    avgSalaryEl.textContent = '$' + avgSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    totalRolesEl.textContent = uniqueRoles;
  }

  function updateRoleFilter() {
    if (!roleFilter) return;
    const roles = [...new Set(employees.map((e) => e.role))].sort();
    roleFilter.innerHTML = '<option value="">All Roles</option>';
    roles.forEach((role) => {
      const option = document.createElement('option');
      option.value = role;
      option.textContent = role;
      roleFilter.appendChild(option);
    });
  }

  function filterEmployees() {
    if (!searchInput || !roleFilter) return;
    const searchTerm = searchInput.value.toLowerCase();
    const selectedRole = roleFilter.value;
    filteredEmployees = employees.filter((employee) => {
      const matchesSearch =
        employee.firstName.toLowerCase().includes(searchTerm) ||
        employee.lastName.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm) ||
        employee.role.toLowerCase().includes(searchTerm);
      const matchesRole = !selectedRole || employee.role === selectedRole;
      return matchesSearch && matchesRole;
    });
    renderEmployeeTable();
  }

  function renderEmployeeTable() {
    if (!employeeTableBody) return;
    if (filteredEmployees.length === 0) {
      employeeTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #64748b;">
            <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
            No employees found
          </td>
        </tr>`;
      return;
    }
    employeeTableBody.innerHTML = filteredEmployees
      .map(
        (employee) => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                ${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}
              </div>
              <div>
                <div style="font-weight: 600; color: #1e293b;">${employee.firstName} ${employee.lastName}</div>
              </div>
            </div>
          </td>
          <td>${employee.email}</td>
          <td><span style="background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 500;">${employee.role}</span></td>
          <td style="font-weight: 600; color: #059669;">$${employee.salary.toLocaleString('en-US')}</td>
          <td>
            <div class="employee-actions">
              <button data-id="${employee._id}" class="btn btn-sm btn-outline employee-edit" title="Edit"><i class="fas fa-edit"></i></button>
              <button data-id="${employee._id}" data-name="${employee.firstName} ${employee.lastName}" class="btn btn-sm btn-danger employee-delete" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`
      )
      .join('');

    document.querySelectorAll('.employee-edit').forEach((btn) => btn.addEventListener('click', () => editEmployee(btn.getAttribute('data-id'))));
    document.querySelectorAll('.employee-delete').forEach((btn) => btn.addEventListener('click', () => deleteEmployee(btn.getAttribute('data-id'), btn.getAttribute('data-name'))));
  }

  function openAddEmployeeModal() {
    if (!employeeModal || !modalTitle || !employeeForm) return;
    isEmployeeEditMode = false;
    currentEmployeeId = null;
    modalTitle.textContent = 'Add Employee';
    employeeForm.reset();
    employeeModal.style.display = 'block';
  }

  function editEmployee(id) {
    const employee = employees.find((e) => e._id === id);
    if (!employee) return;
    isEmployeeEditMode = true;
    currentEmployeeId = id;
    modalTitle.textContent = 'Edit Employee';
    document.getElementById('firstName').value = employee.firstName;
    document.getElementById('lastName').value = employee.lastName;
    document.getElementById('email').value = employee.email;
    document.getElementById('role').value = employee.role;
    document.getElementById('salary').value = employee.salary;
    employeeModal.style.display = 'block';
  }

  function deleteEmployee(id, name) {
    if (!deleteModal) return;
    currentEmployeeId = id;
    const deleteMessage = document.getElementById('deleteMessage');
    const deleteItemName = document.getElementById('deleteItemName');
    if (deleteMessage) deleteMessage.textContent = 'Are you sure you want to delete this employee?';
    if (deleteItemName) deleteItemName.textContent = name;
    deleteModal.style.display = 'block';
  }

  async function handleEmployeeFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(employeeForm);
    const employeeData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      role: formData.get('role'),
      salary: parseFloat(formData.get('salary')),
    };
    try {
      showLoading(true);
      const url = isEmployeeEditMode ? `/api/employees/${currentEmployeeId}` : '/api/employees';
      const method = isEmployeeEditMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save employee');
      }
      const saved = await response.json();
      if (isEmployeeEditMode) {
        const index = employees.findIndex((e) => e._id === currentEmployeeId);
        if (index !== -1) employees[index] = saved;
        showToast('Employee updated successfully!', 'success');
      } else {
        employees.unshift(saved);
        showToast('Employee added successfully!', 'success');
      }
      filterEmployees();
      updateEmployeeStats();
      updateRoleFilter();
      closeEmployeeModals();
    } catch (error) {
      showToast('Error saving employee: ' + error.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  async function confirmEmployeeDelete() {
    if (!currentEmployeeId) return;
    try {
      showLoading(true);
      const response = await fetch(`/api/employees/${currentEmployeeId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete employee');
      }
      employees = employees.filter((e) => e._id !== currentEmployeeId);
      filterEmployees();
      updateEmployeeStats();
      updateRoleFilter();
      closeEmployeeModals();
      showToast('Employee deleted successfully!', 'success');
    } catch (error) {
      showToast('Error deleting employee: ' + error.message, 'error');
    } finally {
      showLoading(false);
    }
  }

  function closeEmployeeModals() {
    if (employeeModal) employeeModal.style.display = 'none';
    if (deleteModal) deleteModal.style.display = 'none';
    if (employeeForm) employeeForm.reset();
    currentEmployeeId = null;
    isEmployeeEditMode = false;
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
})();


