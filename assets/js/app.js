
(function ($) {
  'use strict';

  const API = String(window.TIF_CONFIG?.API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

  let token = sessionStorage.getItem('tif_access_token') || '';
  let currentUser = null;
  let categories = [];

  const $login = $('#login-view');
  const $app = $('#app-view');

  function request(method, path, data) {
    const options = {
      url: `${API}${path}`,
      method,
      dataType: 'json',
      headers: { Accept: 'application/json' }
    };

    if (token) options.headers.Authorization = `Bearer ${token}`;

    if (data !== undefined) {
      if (String(method).toUpperCase() === 'GET') {
        options.data = data;
      } else {
        options.contentType = 'application/json; charset=utf-8';
        options.data = JSON.stringify(data);
        options.processData = false;
      }
    }

    return $.ajax(options).fail(function (xhr) {
      if (xhr.status === 401 && token) {
        clearSession();
        showLogin('La sesión venció. Volvé a ingresar.');
      }
    });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  function errorText(xhr, fallback) {
    const body = xhr?.responseJSON;

    if (body?.errors) {
      const first = Object.values(body.errors).flat()[0];
      if (first) return first;
    }

    return body?.message || fallback || 'Ocurrió un error. Revisá los datos e intentá nuevamente.';
  }

  function toast(message, isError) {
    const $item = $('<div class="toast-message" role="status"></div>')
      .toggleClass('error', Boolean(isError)).text(message);

    $('#toast-area').append($item);

    window.setTimeout(() => $item.fadeOut(250, () => $item.remove()), 3600);
  }

  function formatDate(value, includeTime) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    const options = includeTime
      ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };

    return new Intl.DateTimeFormat('es-AR', options).format(date);
  }

  function initials(name) {
    return String(name || 'U').trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0] || '')
      .join('')
      .toUpperCase();
  }

  function statusClass(status) {
    if (status === 'EN PROCESO') return 'status-progress';
    if (status === 'RESUELTA') return 'status-resolved';
    return 'status-open';
  }

  function statusLabel(status) {
    return status === 'EN PROCESO' ? 'EN PROCESO' : (status || 'ABIERTA');
  }

  function showLogin(message) {
    $app.addClass('d-none');
    $login.removeClass('d-none');

    $('#login-error').toggleClass('d-none', !message).text(message || '');
  }

  function showApp() {
    $login.addClass('d-none');
    $app.removeClass('d-none');

    const role = currentUser.role === 'tecnico' ? 'TÉCNICO' : 'USUARIO';

    $('#sidebar-name, #topbar-name').text(currentUser.name);
    $('#sidebar-role').text(currentUser.role === 'tecnico' ? 'Técnico' : 'Usuario');
    $('#topbar-role').text(role);
    $('#sidebar-avatar').text(initials(currentUser.name));

    const isUser = currentUser.role !== 'tecnico';

    $('#nav-new, #new-incident-top').toggleClass('d-none', !isUser);

    $('#list-subtitle').text(isUser
      ? 'Consultá el estado y el seguimiento de tus reportes.'
      : 'Visualizá, asigná y resolvé las incidencias registradas.');

    loadCategories().always(() => loadIncidents());

    showScreen('list');
  }

  function clearSession() {
    token = '';
    currentUser = null;

    sessionStorage.removeItem('tif_access_token');
  }

  function login(email, password) {
    $('#login-submit').prop('disabled', true).text('Ingresando...');
    $('#login-error').addClass('d-none').text('');

    request('POST', '/login', { email, password })
      .done((response) => {
        token = response.access_token;

        sessionStorage.setItem('tif_access_token', token);

        currentUser = response.user;

        $('#login-password').val('');

        showApp();
      })
      .fail((xhr) => $('#login-error').removeClass('d-none').text(errorText(xhr, 'No se pudo iniciar sesión.')))
      .always(() => $('#login-submit').prop('disabled', false).html('Ingresar <span aria-hidden="true">→</span>'));
  }

  function loadCategories() {
    return request('GET', '/categories').done((response) => {
      categories = response.data || response || [];

      const options = categories.map(category =>
        `<option value="${category.id}">${escapeHtml(category.name)}</option>`
      ).join('');

      $('#filter-category').html('<option value="">Todas</option>' + options);

      $('#incident-category').html('<option value="">Seleccioná una categoría</option>' + options);

    }).fail(() => toast('No se pudieron cargar las categorías.', true));
  }

  function showScreen(name) {
    $('.content-screen').addClass('d-none');

    $(`#${name}-screen`).removeClass('d-none');

    $('#nav-incidents').toggleClass('active', name === 'list');
    $('#nav-new').toggleClass('active', name === 'new');

    $('#topbar-section').text(name === 'new' ? 'NUEVA INCIDENCIA' : 'INCIDENCIAS');

    $('#sidebar').removeClass('open');
  }

  function loadIncidents() {
    const params = {};

    const status = $('#filter-status').val();
    const categoryId = $('#filter-category').val();

    if (status) params.status = status;
    if (categoryId) params.category_id = categoryId;

    $('#incidents-table-body').html(
      '<tr><td colspan="7" class="table-message">Cargando incidencias...</td></tr>'
    );

    $('#empty-state').addClass('d-none');

    request('GET', '/incidencias', params).done((response) => {
      const incidents = response.data || [];

      $('#result-count').text(
        `${incidents.length} ${incidents.length === 1 ? 'registro' : 'registros'}`
      );

      $('#visible-count').text(incidents.length);

      if (!incidents.length) {
        $('#incidents-table-body').empty();
        $('#empty-state').removeClass('d-none');
        return;
      }

      const rows = incidents.map(item => `
        <tr>
          <td>
            <span class="incident-id">#${String(item.id).padStart(4, '0')}</span>
          </td>

          <td>
            <div class="incident-title">${escapeHtml(item.title)}</div>
            <div class="incident-description">${escapeHtml(item.description)}</div>
          </td>

          <td>
            <span class="category-label">${escapeHtml(item.category?.name || 'Sin categoría')}</span>
          </td>

          <td>
            <span class="status-pill ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
          </td>

          <td>
            <span class="technician-name">${escapeHtml(item.technician?.name || 'Sin asignar')}</span>
          </td>

          <td>
            <span class="text-muted-small">${formatDate(item.created_at, false)}</span>
          </td>

          <td>
            <button class="view-button" type="button" data-open-incident="${item.id}" aria-label="Ver incidencia ${item.id}">
              VER ↗
            </button>
          </td>
        </tr>`).join('');

      $('#incidents-table-body').html(rows);

    }).fail((xhr) => {
      $('#incidents-table-body').html(`
        <tr>
          <td colspan="7" class="table-message">
            ${escapeHtml(errorText(xhr, 'No se pudieron cargar las incidencias.'))}
          </td>
        </tr>
      `);
    });
  }

  function openNewIncident() {
    $('#new-incident-form')[0].reset();

    $('#new-incident-error').addClass('d-none').text('');

    showScreen('new');
  }

  function createIncident(formData) {
    $('#create-incident-submit').prop('disabled', true).text('Registrando...');

    $('#new-incident-error').addClass('d-none').text('');

    request('POST', '/incidencias', formData)
      .done(() => {
        toast('La incidencia fue registrada correctamente.');

        showScreen('list');

        loadIncidents();
      })
      .fail((xhr) => {
        $('#new-incident-error')
          .removeClass('d-none')
          .text(errorText(xhr, 'No se pudo registrar la incidencia.'));
      })
      .always(() => {
        $('#create-incident-submit')
          .prop('disabled', false)
          .html('Registrar incidencia <span>→</span>');
      });
  }

  function logout() {
    request('POST', '/logout', {}).always(() => {
      clearSession();
      showLogin('');
    });
  }

  // Eventos de interfaz.

  $('#login-form').on('submit', function (event) {
    event.preventDefault();

    login(
      $('#login-email').val().trim(),
      $('#login-password').val()
    );
  });

  $('#nav-incidents, #back-to-list-new, #cancel-new').on('click', () => {
    showScreen('list');
    loadIncidents();
  });

  $('#nav-new, #new-incident-top').on('click', openNewIncident);

  $('#new-incident-form').on('submit', function (event) {
    event.preventDefault();

    createIncident({
      title: $('#incident-title').val().trim(),
      description: $('#incident-description').val().trim(),
      category_id: Number($('#incident-category').val())
    });
  });

  $('#filter-status, #filter-category').on('change', loadIncidents);

  $('#clear-filters').on('click', () => {
    $('#filter-status, #filter-category').val('');

    loadIncidents();
  });

  $('#logout-button').on('click', logout);

  $('#mobile-menu').on('click', () => {
    $('#sidebar').toggleClass('open');
  });

  // Recuperar una sesión iniciada en esta pestaña.

  if (token) {
    request('GET', '/user').done(response => {
      currentUser = response.user;
      showApp();

    }).fail(() => {
      clearSession();
      showLogin('');
    });

  } else {
    showLogin('');
  }

})(jQuery);