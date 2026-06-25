// ============================================================
//  Reservar.js — Lógica de la vista del cliente
// ============================================================

let currentUser = null;
let currentCedula = null;
let selectedDay = null;
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
function initClientView() {
    buildServices();
    buildDays();
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

function buildDays() {
    const cont = document.getElementById('c-days');
    cont.innerHTML = SERENITY.diasSemana.map((d, i) => `
        <div class="day-pill" id="day-${d.idx}" onclick="selectDay(${d.idx})">
            <span class="lbl">${d.label}</span>
            <span class="num">${d.num}</span>
        </div>
    `).join('');
}

function selectDay(dayIdx) {
    selectedDay = dayIdx;
    selectedTime = null;
    
    // Update UI
    document.querySelectorAll('.day-pill').forEach(el => el.classList.remove('active'));
    document.getElementById(`day-${dayIdx}`).classList.add('active');
    
    buildTimes(dayIdx);
}

function buildTimes(dayIdx) {
    const cont = document.getElementById('c-times');
    
    // Find booked times for this day
    const bookedTimes = SERENITY.citas.filter(c => c.day === dayIdx).map(c => c.time);
    
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
function requestAppointment() {
    if (selectedDay === null || !selectedTime) {
        alert('Por favor selecciona un día y una hora.');
        return;
    }
    
    const service = document.getElementById('c-service').value;
    const dayObj = SERENITY.diasSemana.find(d => d.idx === selectedDay);
    
    const msg = `Hola Serenity Masajes 🌿\n\nSoy ${currentUser} (C.C. ${currentCedula}), me gustaría agendar una cita:\n\n💆 *${service}*\n📅 *${dayObj.label} ${dayObj.num}* a las *${selectedTime}*\n\n¿Me confirmas disponibilidad?`;
    
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
            const d = SERENITY.diasSemana.find(day => day.idx === c.day);
            const today = SERENITY.diasSemana.find(day => day.hoy);
            
            // Permitir reprogramar si la cita es mañana o después (idx > hoy.idx)
            const canReschedule = d && today && d.idx > today.idx;

            return `
            <div class="appointment-card upcoming">
                <div class="appointment-info">
                    <h4>${c.service}</h4>
                    <p><i class="ti ti-calendar-event"></i> ${d ? (d.label + ' ' + d.num) : 'Día ' + c.day} · ${c.time}</p>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="btn-outline cancel" onclick="cancelWhatsApp('${c.service}', '${d ? d.label + ' ' + d.num : ''}', '${c.time}')">
                        <i class="ti ti-x"></i> Cancelar
                    </button>
                    ${canReschedule ? `
                    <button class="btn-outline" onclick="rescheduleWhatsApp('${c.service}', '${d ? d.label + ' ' + d.num : ''}', '${c.time}')">
                        <i class="ti ti-refresh"></i> Reprogramar
                    </button>
                    ` : `
                    <button class="btn-outline" style="opacity:0.5; cursor:not-allowed;" onclick="alert('No puedes reprogramar con menos de 24 horas de anticipación. Por favor comunícate directamente por WhatsApp.')">
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
