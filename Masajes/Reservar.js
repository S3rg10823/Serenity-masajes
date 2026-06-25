// ============================================================
//  Reservar.js — Lógica de la vista del cliente
// ============================================================

let currentUser = null;
let currentCedula = null;
let selectedClientDate = null;
let selectedTime = null;

// ── Auth ──────────────────────────────────────────────────────
function login() {
    const name = document.getElementById('c-name').value.trim();
    const cedula = document.getElementById('c-cedula').value.trim();
    if (!name || !cedula) {
        alert('Por favor ingresa tu nombre y cédula.');
        return;
    }
    
    currentUser = name;
    currentCedula = cedula;
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    
    document.getElementById('welcome-msg').textContent = `Hola, ${name.split(' ')[0]}`;
    
    initClientView();
}

function logout() {
    currentUser = null;
    currentCedula = null;
    document.getElementById('c-name').value = '';
    document.getElementById('c-cedula').value = '';
    document.getElementById('auth-view').classList.remove('hidden');
    document.getElementById('main-view').classList.add('hidden');
}

// ── Tabs ──────────────────────────────────────────────────────
function switchClientTab(id, btn) {
    ['agendar', 'miscitas'].forEach(t => {
        document.getElementById('tab-' + t).classList.add('hidden');
    });
    document.getElementById('tab-' + id).classList.remove('hidden');
    
    const nav = btn.parentElement;
    nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
}

// ── Init View ─────────────────────────────────────────────────
async function initClientView() {
    await loadFirestoreData();
    buildServices();
    
    // Configurar el date picker para bloquear fechas pasadas
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('c-date');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }
    
    renderMyCitas();
}

function buildServices() {
    const sel = document.getElementById('c-service');
    sel.innerHTML = '';
    SERENITY.servicios.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        sel.appendChild(opt);
    });
}

function selectClientDate(dateStr) {
    selectedClientDate = dateStr;
    selectedTime = null;
    buildTimes(dateStr);
}

function buildTimes(dateStr) {
    const cont = document.getElementById('c-times');
    
    // Obtener los horarios ocupados de las citas
    const bookedTimes = SERENITY.citas.filter(c => c.date === dateStr).map(c => c.time);
    
    let html = '';
    SERENITY.horarios.forEach(time => {
        const isBooked = bookedTimes.includes(time);
        if (isBooked) {
            html += `<button class="time-btn" disabled>${time}</button>`;
        } else {
            html += `<button class="time-btn" id="time-${time.replace(':','')}" onclick="selectTime('${time}')">${time}</button>`;
        }
    });
    
    cont.innerHTML = html;
}

function selectTime(time) {
    selectedTime = time;
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById(`time-${time.replace(':','')}`).classList.add('selected');
}

// ── WhatsApp Action ───────────────────────────────────────────
async function requestAppointment() {
    if (!selectedClientDate || !selectedTime) {
        alert('Por favor selecciona un día y una hora.');
        return;
    }
    
    const service = document.getElementById('c-service').value;
    const msg = `Hola Serenity Masajes 🌿\n\nSoy ${currentUser} (C.C. ${currentCedula}), me gustaría agendar una cita:\n\n💆 *${service}*\n📅 *${selectedClientDate}* a las *${selectedTime}*\n\n¿Me confirmas disponibilidad?`;
    
    // Guardar la solicitud en Firestore como cita "pendiente" o simplemente ocupada temporalmente
    await dbAddCita({
        time: selectedTime,
        date: selectedClientDate,
        client: currentUser.split(' ')[0],
        cedula: currentCedula,
        service: service.split(' ')[0],
        phone: "", // No tenemos su telefono aquí, lo confirmará en WhatsApp
        createdAt: new Date().toISOString()
    });

    // Crear cliente si no existe
    let cliente = SERENITY.clientes.find(c => c.cedula === currentCedula);
    if (!cliente) {
        cliente = {
            name: currentUser,
            cedula: currentCedula,
            phone: "",
            sessions: 0,
            next: `${selectedClientDate} · ${selectedTime}`,
            history: []
        };
        await dbUpdateCliente(cliente);
    }

    renderMyCitas(); // Refresh the list
    
    const url = `https://wa.me/${SERENITY.whatsappBusiness}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

// ── Mis Citas ─────────────────────────────────────────────────
function renderMyCitas() {
    // Buscar en el historial de "clientes" y en "citas" activas
    // Buscamos usando la cédula para mayor precisión
    
    // Citas activas (próximas)
    const upcoming = SERENITY.citas.filter(c => c.cedula === currentCedula);
    
    const contUp = document.getElementById('citas-upcoming');
    if (upcoming.length === 0) {
        contUp.innerHTML = `<div class="empty-state"><i class="ti ti-calendar-off"></i> No tienes citas próximas.</div>`;
    } else {
        contUp.innerHTML = upcoming.map(c => {
            const todayStr = new Date().toISOString().split('T')[0];
            const dateLabel = c.date || ('Día ' + c.day);
            const canReschedule = dateLabel > todayStr;

            return `
            <div class="appointment-card upcoming">
                <div class="appointment-info">
                    <h4>${c.service}</h4>
                    <p><i class="ti ti-calendar-event"></i> ${dateLabel} · ${c.time}</p>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn-outline cancel" onclick="cancelWhatsApp('${c.service}', '${dateLabel}', '${c.time}')">
                        <i class="ti ti-x"></i> Cancelar
                    </button>
                    ${canReschedule ? `
                    <button class="btn-outline" onclick="rescheduleWhatsApp('${c.service}', '${dateLabel}', '${c.time}')">
                        <i class="ti ti-refresh"></i> Reprogramar
                    </button>
                    ` : `
                    <button class="btn-outline" style="opacity:0.5; cursor:not-allowed;" onclick="alert('No puedes reprogramar citas para el mismo día o en el pasado. Comunícate directamente por WhatsApp.')">
                        <i class="ti ti-refresh"></i> Reprogramar
                    </button>
                    `}
                </div>
            </div>
            `;
        }).join('');
    }
    
    // Historial pasado
    const clientData = SERENITY.clientes.find(c => c.cedula === currentCedula);
    const contPast = document.getElementById('citas-past');
    
    if (!clientData || clientData.history.length === 0) {
        contPast.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.9rem;">No hay historial de citas pasadas.</div>`;
    } else {
        contPast.innerHTML = clientData.history.map(h => `
            <div class="appointment-card">
                <div class="appointment-info">
                    <h4>${h.service}</h4>
                    <p><i class="ti ti-history"></i> ${h.date}</p>
                </div>
            </div>
        `).join('');
    }
}

function cancelWhatsApp(service, day, time) {
    const msg = `Hola Serenity Masajes,\n\nSoy ${currentUser} (C.C. ${currentCedula}), necesito *cancelar* mi cita de ${service} programada para el ${day} a las ${time}.`;
    window.open(`https://wa.me/${SERENITY.whatsappBusiness}?text=${encodeURIComponent(msg)}`, '_blank');
}

function rescheduleWhatsApp(service, day, time) {
    const msg = `Hola Serenity Masajes,\n\nSoy ${currentUser} (C.C. ${currentCedula}), necesito *reprogramar* mi cita de ${service} programada para el ${day} a las ${time}. ¿Qué otros horarios tienen disponibles?`;
    window.open(`https://wa.me/${SERENITY.whatsappBusiness}?text=${encodeURIComponent(msg)}`, '_blank');
}
