// ============================================================
//  admin.js — Lógica del panel de la masajista
// ============================================================

// ── Helpers ──────────────────────────────────────────────────
function initials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  const span = t.querySelector('span');
  if (span) span.textContent = msg;
  else t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function waIcon() {
  return `<svg class="wa-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>`;
}

// ── Tab switching ─────────────────────────────────────────────
let currentAgendaView = 'semanal';

function switchAgendaView(view) {
  currentAgendaView = view;
  document.getElementById('view-semanal').classList.toggle('hidden', view !== 'semanal');
  document.getElementById('view-mensual').classList.toggle('hidden', view !== 'mensual');
  document.getElementById('btn-semanal').classList.toggle('active', view === 'semanal');
  document.getElementById('btn-mensual').classList.toggle('active', view === 'mensual');
  document.getElementById('btn-semanal').style.background = view === 'semanal' ? 'var(--primary)' : 'transparent';
  document.getElementById('btn-semanal').style.color = view === 'semanal' ? 'white' : 'var(--text)';
  document.getElementById('btn-mensual').style.background = view === 'mensual' ? 'var(--primary)' : 'transparent';
  document.getElementById('btn-mensual').style.color = view === 'mensual' ? 'white' : 'var(--text)';
}
function switchTab(id, btn) {
  ['agenda', 'clientes', 'nueva'].forEach(t => {
    document.getElementById('tab-' + t).classList.add('hidden');
  });
  document.getElementById('tab-' + id).classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

// ── Schedule grid ─────────────────────────────────────────────
function buildGrid() {
  const { diasSemana, horarios, citas } = SERENITY;

  // Count free slots for stat card
  let freeCount = 0;

  // Header
  let head = `<div style="grid-column:1" class="gh-cell" style="border-right:0.5px solid var(--border)"></div>`;
  diasSemana.forEach(d => {
    head += `<div class="gh-cell${d.hoy ? ' gh-today' : ''}">
      ${d.label}<span class="gh-num">${d.num}</span>
    </div>`;
  });
  document.getElementById('grid-head').innerHTML =
    `<div style="display:grid;grid-template-columns:50px repeat(${diasSemana.length},1fr)">${head}</div>`;

  // Rows
  let body = '';
  horarios.forEach(time => {
    body += `<div class="grid-row">`;
    body += `<div class="time-cell">${time}</div>`;
    diasSemana.forEach(d => {
      const booked = citas.find(c => c.time === time && c.day === d.idx);
      if (booked) {
        body += `<div class="slot" style="cursor:default;">
          <div class="slot-bk">${booked.client}<span>${booked.service}</span></div>
        </div>`;
      } else {
        freeCount++;
        body += `<div class="slot" onclick="prefillNewCita('${time}', '${d.label} ${d.num}')">
          <div class="slot-free-label">+ cita</div>
        </div>`;
      }
    });
    body += `</div>`;
  });

  document.getElementById('grid-body').innerHTML = body;
  document.getElementById('stat-libres').textContent = freeCount;
  document.getElementById('stat-clientes').textContent = SERENITY.clientes.length;
}

// ── Monthly grid ──────────────────────────────────────────────
function buildMonthGrid() {
  const container = document.getElementById('month-body');
  container.innerHTML = '';
  
  const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  // Headers de los días
  diasSemanaNombres.forEach(d => {
    container.innerHTML += `<div style="text-align:center; font-weight:bold; padding: 5px; color: var(--text-muted); font-size: 0.85rem;">${d}</div>`;
  });
  
  // Generar un mes estático de 30 días para el prototipo (empezando un lunes, digamos)
  // 1er día = Lunes (index 1)
  container.innerHTML += `<div></div>`; // Offset para domingo
  
  for(let i=1; i<=30; i++) {
    // Buscar si hay citas este día en la data estática
    // Vamos a mapear los números del 23 al 28 a nuestro mes falso
    let citasHtml = '';
    const dateStr = i.toString();
    const mapDay = SERENITY.diasSemana.find(d => d.num === dateStr);
    
    if (mapDay) {
        const booked = SERENITY.citas.filter(c => c.day === mapDay.idx);
        if (booked.length > 0) {
            citasHtml = booked.map(c => `<div style="background:var(--primary); color:white; font-size:0.7rem; padding:2px 4px; border-radius:4px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${c.time} - ${c.client} - ${c.service}">${c.time} ${c.client}</div>`).join('');
        }
    }
    
    container.innerHTML += `
      <div style="min-height: 80px; border: 1px solid var(--border); border-radius: 8px; padding: 4px; background: white; display: flex; flex-direction: column;">
        <span style="font-size: 0.8rem; color: var(--text-muted); align-self: flex-end; margin-bottom: 4px;">${i}</span>
        <div style="flex: 1; display:flex; flex-direction:column; gap:2px; overflow-y:auto; max-height: 60px;">${citasHtml}</div>
      </div>
    `;
  }
}

// Click on a free slot → jump to Nueva cita tab prefilled
function prefillNewCita(time, dayLabel) {
  switchTab('nueva', document.querySelectorAll('.tab-btn')[2]);
  const today = new Date();
  // Simple date guess from day label (prototype — in production use real date)
  document.getElementById('a-dt').value = '';
  showToast('Horario seleccionado: ' + dayLabel + ' · ' + time);
  updatePreview();
}

// ── Client list ───────────────────────────────────────────────
function renderClients(list) {
  const container = document.getElementById('client-list');

  if (!list.length) {
    container.innerHTML = `<div class="empty-state">
      <i class="ti ti-users" aria-hidden="true"></i>
      No se encontraron clientes.
    </div>`;
    return;
  }

  container.innerHTML = list.map((c, i) => `
    <div class="cc" id="cc-${i}" onclick="toggleClient(${i})">
      <div class="cc-row">
        <div class="avatar">${initials(c.name)}</div>
        <div class="cc-info">
          <div class="cc-name">${c.name}</div>
          <div class="cc-meta">
            <i class="ti ti-id" style="font-size:11px;vertical-align:-1px" aria-hidden="true"></i>
            C.C. ${c.cedula || 'N/A'}
          </div>
          <div class="cc-meta" style="margin-top: 2px;">
            <i class="ti ti-calendar" style="font-size:11px;vertical-align:-1px" aria-hidden="true"></i>
            Próxima: ${c.next}
          </div>
        </div>
        <span class="badge">${c.sessions} sesiones</span>
        <i class="ti ti-chevron-down chev" aria-hidden="true"></i>
      </div>

      <div class="hist">
        <div class="hist-label">
          Historial · notas solo visibles para ti
        </div>
        <div class="tl">
          ${c.history.map(h => `
            <div class="tl-item">
              <div class="tl-date">${h.date}</div>
              <div class="tl-service">${h.service}</div>
              ${h.notes ? `<div class="tl-note">${h.notes}</div>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="cc-btns">
          <a class="btn-wa"
            href="https://wa.me/${c.phone}?text=${encodeURIComponent('Hola ' + c.name.split(' ')[0] + ', te escribe Serenity Masajes 🌿')}"
            target="_blank"
            rel="noopener noreferrer"
            onclick="event.stopPropagation()">
            ${waIcon()} WhatsApp
          </a>
          <button class="btn-sage"
            onclick="event.stopPropagation(); goToNewCita('${c.name}', '${c.cedula || ''}', '${c.phone}')">
            <i class="ti ti-calendar-plus" style="font-size:13px" aria-hidden="true"></i>
            Nueva cita
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleClient(i) {
  document.getElementById('cc-' + i).classList.toggle('open');
}

function filterClients(query) {
  const q = query.toLowerCase();
  renderClients(SERENITY.clientes.filter(c => 
    c.name.toLowerCase().includes(q) || 
    (c.cedula && c.cedula.toLowerCase().includes(q))
  ));
}

function goToNewCita(name, cedula, phone) {
  switchTab('nueva', document.querySelectorAll('.tab-btn')[2]);
  document.getElementById('a-client').value = name;
  document.getElementById('a-cedula').value = cedula;
  document.getElementById('a-phone').value = phone;
  updatePreview();
}

// ── Nueva cita form ───────────────────────────────────────────
function buildServiceSelect() {
  const sel = document.getElementById('a-service');
  SERENITY.servicios.forEach(s => {
    const opt = document.createElement('option');
    opt.textContent = s;
    sel.appendChild(opt);
  });
}

function updatePreview() {
  const client = document.getElementById('a-client').value.trim() || '[cliente]';
  const service = document.getElementById('a-service').value;
  const dt = document.getElementById('a-dt').value;

  let dateStr = '[fecha por confirmar]';
  if (dt) {
    const d = new Date(dt);
    dateStr = d.toLocaleString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit'
    });
  }

  const msg = `Hola ${client.split(' ')[0]}, te confirmamos tu cita 🌿\n\n💆 *${service}*\n📅 *${dateStr}*\n\n¡Te esperamos! Cualquier duda, escríbenos.`;
  document.getElementById('a-wa-prev').innerHTML =
    `<strong>Vista previa WhatsApp</strong>${msg.replace(/\n/g, '<br>')}`;
}

function adminConfirm() {
  const client = document.getElementById('a-client').value.trim();
  const cedula = document.getElementById('a-cedula').value.trim();
  const service = document.getElementById('a-service').value;
  const dt = document.getElementById('a-dt').value;
  const phone = document.getElementById('a-phone').value.trim();

  if (!client) { showToast('⚠ Ingresa el nombre del cliente'); return; }
  if (!cedula) { showToast('⚠ Ingresa la cédula del cliente'); return; }
  if (!phone) { showToast('⚠ Ingresa el teléfono del cliente'); return; }

  let dateStr = '[fecha por confirmar]';
  if (dt) {
    const d = new Date(dt);
    dateStr = d.toLocaleString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit'
    });

    const timeH = String(d.getHours()).padStart(2, '0') + ':00';
    let jsDay = d.getDay() - 1;
    if (jsDay < 0) jsDay = 0;
    if (jsDay > 5) jsDay = 5;

    SERENITY.citas.push({
      time: timeH,
      day: jsDay,
      client: client.split(' ')[0],
      cedula: cedula,
      service: service.split(' ')[0],
      phone: phone
    });
    
    // Si no existe el cliente, lo creamos
    if (!SERENITY.clientes.find(c => c.cedula === cedula)) {
        SERENITY.clientes.push({
            name: client,
            cedula: cedula,
            phone: phone,
            sessions: 1,
            next: `${SERENITY.diasSemana[jsDay]?.label || 'Día'} · ${timeH}`,
            history: []
        });
    }

    if (typeof saveData === 'function') saveData();
    buildGrid();
    buildMonthGrid();
  }

  const msg = `Hola ${client.split(' ')[0]}, te confirmamos tu cita 🌿\n\n💆 *${service}*\n📅 *${dateStr}*\n\n¡Te esperamos! Cualquier duda, escríbenos.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  showToast('✓ Confirmación enviada por WhatsApp');

  switchTab('agenda', document.querySelectorAll('.tab-btn')[0]);
}

// ── Init ──────────────────────────────────────────────────────
buildGrid();
buildMonthGrid();
buildServiceSelect();
renderClients(SERENITY.clientes);
updatePreview();