// API Client for Progress Manager Web UI

// ============================================================================
// Constants
// ============================================================================

const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
const PING_INTERVAL = 30000; // 30 seconds

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Fetch all requirements with optional filters
 */
async function fetchRequirements(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.since) params.append('since', filters.since);
  if (filters.until) params.append('until', filters.until);
  if (filters.linked) params.append('linked', 'true');
  if (filters.unlinked) params.append('unlinked', 'true');
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.order) params.append('order', filters.order);

  const queryString = params.toString();
  const url = `/api/requirements${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch requirements');
  }

  return data.data || [];
}

/**
 * Fetch a single requirement by ID
 */
async function fetchRequirement(id) {
  const response = await fetch(`/api/requirements/${id}`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch requirement');
  }

  return data.data;
}

/**
 * Create a new requirement
 */
async function createRequirement(requirementData) {
  const response = await fetch('/api/requirements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requirementData),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to create requirement');
  }

  return data.data;
}

/**
 * Update an existing requirement
 */
async function updateRequirement(id, requirementData) {
  const response = await fetch(`/api/requirements/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requirementData),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to update requirement');
  }

  return data.data;
}

/**
 * Delete a requirement
 */
async function deleteRequirement(id) {
  const response = await fetch(`/api/requirements/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete requirement');
  }

  return data;
}

/**
 * Send ping to keep session alive
 */
async function healthPing() {
  try {
    await fetch('/api/ping', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Ping failed:', error);
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate status value
 */
function isValidStatus(status) {
  return VALID_STATUSES.includes(status);
}

/**
 * Validate URL format
 */
function isValidUrl(urlString) {
  if (!urlString || urlString.trim() === '') {
    return true; // Empty is valid (optional field)
  }

  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate title
 */
function validateTitle(title) {
  if (!title || title.trim() === '') {
    return { valid: false, error: 'Title is required' };
  }
  return { valid: true };
}

/**
 * Validate description
 */
function validateDescription(description) {
  if (!description || description.trim() === '') {
    return { valid: false, error: 'Description is required' };
  }
  return { valid: true };
}

/**
 * Validate external link
 */
function validateExternalLink(link) {
  if (!link || link.trim() === '') {
    return { valid: true }; // Optional field
  }

  if (!isValidUrl(link)) {
    return { valid: false, error: 'Invalid URL format. Must be HTTP or HTTPS.' };
  }

  return { valid: true };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format ISO date string for display
 */
function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format ISO date string with time for display
 */
function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show error message
 */
function showError(message) {
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.style.display = 'block';

  // Hide success message if shown
  const successEl = document.getElementById('success-message');
  successEl.style.display = 'none';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);

  // Scroll to top to show message
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successEl = document.getElementById('success-message');
  successEl.textContent = message;
  successEl.style.display = 'block';

  // Hide error message if shown
  const errorEl = document.getElementById('error-message');
  errorEl.style.display = 'none';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    successEl.style.display = 'none';
  }, 3000);

  // Scroll to top to show message
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Hide all messages
 */
function hideMessages() {
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('success-message').style.display = 'none';
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status) {
  switch (status) {
    case 'Not Started':
      return 'badge-not-started';
    case 'In Progress':
      return 'badge-in-progress';
    case 'Completed':
      return 'badge-completed';
    case 'Blocked':
      return 'badge-blocked';
    default:
      return 'badge-not-started';
  }
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Initialize ping mechanism to keep session alive
 */
function initializePingMechanism() {
  // Send initial ping
  healthPing();

  // Set up interval to ping every 30 seconds
  setInterval(() => {
    healthPing();
  }, PING_INTERVAL);
}

// ============================================================================
// Requirements List Rendering
// ============================================================================

/**
 * Load and display requirements
 */
async function loadRequirements() {
  try {
    // Show loading indicator
    document.getElementById('loading-indicator').style.display = 'block';
    document.getElementById('requirements-list').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';

    // Get current filters from UI
    const filters = getCurrentFilters();

    // Fetch requirements
    const requirements = await fetchRequirements(filters);

    // Hide loading indicator
    document.getElementById('loading-indicator').style.display = 'none';

    // Render requirements or show empty state
    if (requirements.length === 0) {
      document.getElementById('empty-state').style.display = 'block';
    } else {
      renderRequirements(requirements);
    }

    // Update status summary
    updateStatusSummary(requirements);
  } catch (error) {
    document.getElementById('loading-indicator').style.display = 'none';
    showError(`Failed to load requirements: ${error.message}`);
  }
}

/**
 * Get current filters from UI controls
 */
function getCurrentFilters() {
  const filters = {};

  const status = document.getElementById('filter-status').value;
  if (status) {
    filters.status = status;
  }

  const since = document.getElementById('filter-since').value;
  if (since) {
    filters.since = since;
  }

  const until = document.getElementById('filter-until').value;
  if (until) {
    filters.until = until;
  }

  const linked = document.getElementById('filter-linked').checked;
  if (linked) {
    filters.linked = true;
  }

  const unlinked = document.getElementById('filter-unlinked').checked;
  if (unlinked) {
    filters.unlinked = true;
  }

  const sortBy = document.getElementById('sort-by').value;
  if (sortBy) {
    filters.sort = sortBy;
  }

  const sortOrder = document.getElementById('sort-order').value;
  if (sortOrder) {
    filters.order = sortOrder;
  }

  return filters;
}

/**
 * Render requirements list
 */
function renderRequirements(requirements) {
  const container = document.getElementById('requirements-list');
  container.innerHTML = '';

  requirements.forEach((req) => {
    const card = renderRequirementCard(req);
    container.appendChild(card);
  });

  container.style.display = 'block';
}

/**
 * Render a single requirement card
 */
function renderRequirementCard(requirement) {
  const card = document.createElement('div');
  card.className = 'requirement-card';
  card.dataset.id = requirement.id;

  const statusBadgeClass = getStatusBadgeClass(requirement.status);

  card.innerHTML = `
    <div class="requirement-header">
      <div style="flex: 1;">
        <div class="requirement-id">Requirement #${requirement.id}</div>
        <h3 class="requirement-title">${escapeHtml(requirement.title)}</h3>
      </div>
      <span class="badge ${statusBadgeClass}">${escapeHtml(requirement.status)}</span>
    </div>

    <p class="requirement-description">${escapeHtml(requirement.description)}</p>

    ${requirement.notes ? `<div class="requirement-notes">${escapeHtml(requirement.notes)}</div>` : ''}

    <div class="requirement-meta">
      <span>Created: ${formatDate(requirement.created)}</span>
      <span>Updated: ${formatDate(requirement.updated)}</span>
      ${requirement.externalLink ? `<a href="${escapeHtml(requirement.externalLink)}" target="_blank" rel="noopener noreferrer" class="requirement-link">🔗 External Link</a>` : ''}
    </div>

    <div class="requirement-actions">
      <button class="secondary" onclick="openEditModal(${requirement.id})">Edit</button>
      <button class="secondary outline" onclick="openDeleteModal(${requirement.id})">Delete</button>
    </div>
  `;

  return card;
}

/**
 * Update status summary badges
 */
function updateStatusSummary(requirements) {
  const summary = {
    'Not Started': 0,
    'In Progress': 0,
    'Completed': 0,
    'Blocked': 0,
  };

  requirements.forEach((req) => {
    if (summary[req.status] !== undefined) {
      summary[req.status]++;
    }
  });

  document.getElementById('summary-not-started').textContent = `Not Started: ${summary['Not Started']}`;
  document.getElementById('summary-in-progress').textContent = `In Progress: ${summary['In Progress']}`;
  document.getElementById('summary-completed').textContent = `Completed: ${summary['Completed']}`;
  document.getElementById('summary-blocked').textContent = `Blocked: ${summary['Blocked']}`;
}

// ============================================================================
// Initialization
// ============================================================================

// Start ping mechanism and load requirements when page loads
document.addEventListener('DOMContentLoaded', () => {
  initializePingMechanism();
  console.log('Ping mechanism initialized (30s interval)');

  // Load requirements on page load
  loadRequirements();

  // Set up refresh button
  document.getElementById('refresh-btn').addEventListener('click', () => {
    loadRequirements();
  });

  // Set up apply filters button
  document.getElementById('apply-filters').addEventListener('click', () => {
    loadRequirements();
  });

  // Set up clear filters button
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('filter-status').value = '';
    document.getElementById('filter-since').value = '';
    document.getElementById('filter-until').value = '';
    document.getElementById('filter-linked').checked = false;
    document.getElementById('filter-unlinked').checked = false;
    document.getElementById('sort-by').value = 'id';
    document.getElementById('sort-order').value = 'asc';
    loadRequirements();
  });
});
