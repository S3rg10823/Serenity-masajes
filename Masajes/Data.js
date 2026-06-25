// ============================================================
//  data.js — Sincronización con Firebase Firestore
// ============================================================

const DEFAULT_SERENITY = {
    whatsappBusiness: "573169201539",
    nombre: "Serenity Masajes",
    servicios: [
        "Masaje relajante 60 min",
        "Masaje descontracturante 60 min",
        "Masaje con piedras calientes 90 min",
        "Reflexología 45 min",
        "Drenaje linfático 60 min",
        "Masaje de cabeza y cuello 30 min",
    ],
    horarios: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"],
    
    // Estos se generarán dinámicamente ahora
    diasSemana: [],
    citas: [],
    clientes: [],
};

function getDurationMins(serviceName) {
    if (!serviceName) return 60;
    const match = serviceName.match(/(\d+)\s*min/i);
    return match ? parseInt(match[1]) : 60;
}

function timeToMins(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

let SERENITY = JSON.parse(JSON.stringify(DEFAULT_SERENITY));

// Generar diasSemana desde el lunes actual
function generateCurrentWeek() {
    const today = new Date();
    // Ajustar a la zona horaria local o a un lunes
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const week = [];

    for (let i = 0; i < 6; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        
        const dateStr = d.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];

        week.push({
            idx: i,
            label: labels[i],
            num: d.getDate().toString(),
            date: dateStr,
            hoy: isToday
        });
    }
    SERENITY.diasSemana = week;
}

generateCurrentWeek();

// ---- FIREBASE SYNC ----

async function loadFirestoreData() {
    try {
        // Cargar Config
        const configDoc = await db.collection("config").doc("main").get();
        if (configDoc.exists) {
            const data = configDoc.data();
            SERENITY.whatsappBusiness = data.whatsappBusiness || SERENITY.whatsappBusiness;
            SERENITY.nombre = data.nombre || SERENITY.nombre;
            SERENITY.servicios = data.servicios || SERENITY.servicios;
            SERENITY.horarios = data.horarios || SERENITY.horarios;
        } else {
            // Inicializar config
            await db.collection("config").doc("main").set({
                whatsappBusiness: SERENITY.whatsappBusiness,
                nombre: SERENITY.nombre,
                servicios: SERENITY.servicios,
                horarios: SERENITY.horarios
            });
        }

        // Cargar Clientes
        const clientesSnap = await db.collection("clientes").get();
        SERENITY.clientes = [];
        clientesSnap.forEach(doc => {
            SERENITY.clientes.push(doc.data());
        });

        // Cargar Citas
        const citasSnap = await db.collection("citas").get();
        SERENITY.citas = [];
        citasSnap.forEach(doc => {
            SERENITY.citas.push({ id: doc.id, ...doc.data() });
        });

    } catch (e) {
        console.error("Error cargando datos de Firestore:", e);
    }
}

async function dbAddCita(cita) {
    const docRef = await db.collection("citas").add(cita);
    cita.id = docRef.id;
    SERENITY.citas.push(cita);
    return docRef.id;
}

async function dbDeleteCita(cedula) {
    const citaIndex = SERENITY.citas.findIndex(c => c.cedula === cedula);
    if (citaIndex !== -1) {
        const citaId = SERENITY.citas[citaIndex].id;
        if (citaId) {
            await db.collection("citas").doc(citaId).delete();
        }
        SERENITY.citas.splice(citaIndex, 1);
    }
}

async function dbUpdateCliente(cliente) {
    await db.collection("clientes").doc(cliente.cedula).set(cliente);
    const idx = SERENITY.clientes.findIndex(c => c.cedula === cliente.cedula);
    if (idx !== -1) SERENITY.clientes[idx] = cliente;
    else SERENITY.clientes.push(cliente);
}

// Ya no usamos resetData() en prod, pero lo dejamos vacío
function resetData() {
    alert("Reset inhabilitado en producción conectada a Firebase.");
}