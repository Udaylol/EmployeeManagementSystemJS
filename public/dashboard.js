// Employee Dashboard JavaScript

// Global variables
let employees = [];
let filteredEmployees = [];
let currentEmployeeId = null;
let isEditMode = false;

// DOM elements
const employeeTableBody = document.getElementById('employeeTableBody');
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');
const refreshBtn = document.getElementById('refreshBtn');
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Modal elements
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard page
    if (document.body.classList.contains('dashboard-container') || document.getElementById('employeeTableBody')) {
        initializeDashboard();
    }
});

// Dashboard functionality
function initializeDashboard() {
    loadEmployees();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', filterEmployees);
    }
    
    // Role filter
    if (roleFilter) {
        roleFilter.addEventListener('change', filterEmployees);
    }
    
    // Refresh button
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadEmployees);
    }
    
    // Add employee button
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', openAddEmployeeModal);
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target === employeeModal) {
            closeModals();
        }
        if (e.target === deleteModal) {
            closeModals();
        }
    });
    
    // Form submission
    if (employeeForm) {
        employeeForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Cancel buttons
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModals);
    }
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeModals);
    }
    
    // Delete confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
}

// Load employees from API
async function loadEmployees() {
    try {
        showLoading(true);
        const response = await fetch('/api/employees');
        
        if (!response.ok) {
            throw new Error('Failed to load employees');
        }
        
        employees = await response.json();
        filteredEmployees = [...employees];
        
        updateStats();
        updateRoleFilter();
        renderEmployeeTable();
        
    } catch (error) {
        showToast('Error loading employees: ' + error.message, 'error');
        console.error('Error loading employees:', error);
    } finally {
        showLoading(false);
    }
}

// Update statistics
function updateStats() {
    if (!totalEmployeesEl || !avgSalaryEl || !totalRolesEl) return;
    
    const total = employees.length;
    const avgSalary = total > 0 ? employees.reduce((sum, emp) => sum + emp.salary, 0) / total : 0;
    const uniqueRoles = new Set(employees.map(emp => emp.role)).size;
    
    totalEmployeesEl.textContent = total;
    avgSalaryEl.textContent = '$' + avgSalary.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    totalRolesEl.textContent = uniqueRoles;
}

// Update role filter options
function updateRoleFilter() {
    if (!roleFilter) return;
    
    const roles = [...new Set(employees.map(emp => emp.role))].sort();
    roleFilter.innerHTML = '<option value="">All Roles</option>';
    
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleFilter.appendChild(option);
    });
}

// Filter employees based on search and role filter
function filterEmployees() {
    if (!searchInput || !roleFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedRole = roleFilter.value;
    
    filteredEmployees = employees.filter(employee => {
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

// Render employee table
function renderEmployeeTable() {
    if (!employeeTableBody) return;
    
    if (filteredEmployees.length === 0) {
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No employees found
                </td>
            </tr>
        `;
        return;
    }
    
    employeeTableBody.innerHTML = filteredEmployees.map(employee => `
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
            <td>
                <span style="background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 500;">
                    ${employee.role}
                </span>
            </td>
            <td style="font-weight: 600; color: #059669;">$${employee.salary.toLocaleString('en-US')}</td>
            <td>
                <div class="employee-actions">
                    <button onclick="editEmployee('${employee._id}')" class="btn btn-sm btn-outline" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteEmployee('${employee._id}', '${employee.firstName} ${employee.lastName}')" class="btn btn-sm btn-danger" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Open add employee modal
function openAddEmployeeModal() {
    if (!employeeModal || !modalTitle || !employeeForm) return;
    
    isEditMode = false;
    currentEmployeeId = null;
    modalTitle.textContent = 'Add Employee';
    employeeForm.reset();
    employeeModal.style.display = 'block';
}

// Edit employee
function editEmployee(id) {
    const employee = employees.find(emp => emp._id === id);
    if (!employee) return;
    
    isEditMode = true;
    currentEmployeeId = id;
    modalTitle.textContent = 'Edit Employee';
    
    // Populate form
    document.getElementById('firstName').value = employee.firstName;
    document.getElementById('lastName').value = employee.lastName;
    document.getElementById('email').value = employee.email;
    document.getElementById('role').value = employee.role;
    document.getElementById('salary').value = employee.salary;
    
    employeeModal.style.display = 'block';
}

// Delete employee
function deleteEmployee(id, name) {
    if (!deleteModal) return;
    
    currentEmployeeId = id;
    const deleteEmployeeNameEl = document.getElementById('deleteEmployeeName');
    if (deleteEmployeeNameEl) {
        deleteEmployeeNameEl.textContent = name;
    }
    deleteModal.style.display = 'block';
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(employeeForm);
    const employeeData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        role: formData.get('role'),
        salary: parseFloat(formData.get('salary'))
    };
    
    try {
        showLoading(true);
        
        const url = isEditMode ? `/api/employees/${currentEmployeeId}` : '/api/employees';
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save employee');
        }
        
        const savedEmployee = await response.json();
        
        if (isEditMode) {
            // Update existing employee in local array
            const index = employees.findIndex(emp => emp._id === currentEmployeeId);
            if (index !== -1) {
                employees[index] = savedEmployee;
            }
            showToast('Employee updated successfully!', 'success');
        } else {
            // Add new employee to local array
            employees.unshift(savedEmployee);
            showToast('Employee added successfully!', 'success');
        }
        
        // Refresh the display
        filterEmployees();
        updateStats();
        updateRoleFilter();
        closeModals();
        
    } catch (error) {
        showToast('Error saving employee: ' + error.message, 'error');
        console.error('Error saving employee:', error);
    } finally {
        showLoading(false);
    }
}

// Confirm delete
async function confirmDelete() {
    if (!currentEmployeeId) return;
    
    try {
        showLoading(true);
        
        const response = await fetch(`/api/employees/${currentEmployeeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete employee');
        }
        
        // Remove from local array
        employees = employees.filter(emp => emp._id !== currentEmployeeId);
        
        // Refresh the display
        filterEmployees();
        updateStats();
        updateRoleFilter();
        closeModals();
        
        showToast('Employee deleted successfully!', 'success');
        
    } catch (error) {
        showToast('Error deleting employee: ' + error.message, 'error');
        console.error('Error deleting employee:', error);
    } finally {
        showLoading(false);
    }
}

// Close modals
function closeModals() {
    if (employeeModal) {
        employeeModal.style.display = 'none';
    }
    if (deleteModal) {
        deleteModal.style.display = 'none';
    }
    if (employeeForm) {
        employeeForm.reset();
    }
    currentEmployeeId = null;
    isEditMode = false;
}

// Logout
async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            window.location.href = '/';
        } else {
            showToast('Error logging out', 'error');
        }
    } catch (error) {
        showToast('Error logging out: ' + error.message, 'error');
        console.error('Logout error:', error);
    }
}

// Show/hide loading spinner
function showLoading(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}
