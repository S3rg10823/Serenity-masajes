// ============================================================
//  data.js — Estado compartido entre admin y cliente
//  Modifica aquí: servicios, horarios, número de WhatsApp
// ============================================================

const DEFAULT_SERENITY = {

    // Tu número de WhatsApp (formato internacional sin +)
    whatsappBusiness: "573001234567",

    // Nombre del negocio
    nombre: "Serenity Masajes",

    // Servicios disponibles
    servicios: [
        "Masaje relajante 60 min",
        "Masaje descontracturante 60 min",
        "Masaje con piedras calientes 90 min",
        "Reflexología 45 min",
        "Drenaje linfático 60 min",
        "Masaje de cabeza y cuello 30 min",
    ],

    // Horarios de trabajo
    horarios: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"],

    // Días visibles en la agenda (0=Lun, 5=Sáb)
    diasSemana: [
        { idx: 0, label: "Lun", num: "22", date: "2026-06-22", hoy: false },
        { idx: 1, label: "Mar", num: "23", date: "2026-06-23", hoy: false },
        { idx: 2, label: "Mié", num: "24", date: "2026-06-24", hoy: false },
        { idx: 3, label: "Jue", num: "25", date: "2026-06-25", hoy: true },
        { idx: 4, label: "Vie", num: "26", date: "2026-06-26", hoy: false },
        { idx: 5, label: "Sáb", num: "27", date: "2026-06-27", hoy: false },
    ],

    // Citas iniciales de demostración
    citas: [
        { time: "09:00", day: 3, date: "2026-06-25", client: "Luis T.", cedula: "88888888", service: "Relajante", phone: "573008888888" },
        { time: "10:30", day: 4, date: "2026-06-26", client: "Sandra Q.", cedula: "55555555", service: "Cabeza", phone: "573005555555" },
        { time: "11:00", day: 5, date: "2026-06-27", client: "Marta E.", cedula: "77777777", service: "Relajante", phone: "573007777777" },
        { time: "14:00", day: 5, date: "2026-06-27", client: "Roberto S.", cedula: "66666666", service: "Descontract.", phone: "573006666666" },
        { time: "16:00", day: 1, date: "2026-06-23", client: "Julia P.", cedula: "12345000", service: "Piedras", phone: "573001234500" },
        { time: "17:00", day: 3, date: "2026-06-25", client: "Carmen V.", cedula: "12345001", service: "Drenaje", phone: "573001234501" },
    ],

    // Historial de clientes con notas internas
    clientes: [
        {
            name: "Laura Martínez",
            cedula: "11111111",
            phone: "573001111111",
            sessions: 8,
            next: "Lun 23 · 09:00",
            history: [
                { date: "23 Jun 2025", service: "Masaje relajante 60 min", notes: "Tensión en hombros. Mejoró notablemente." },
                { date: "10 Jun 2025", service: "Masaje relajante 60 min", notes: "Primera vez con aceite de lavanda." },
                { date: "27 May 2025", service: "Masaje descontracturante 60 min", notes: "Contractura lumbar. Trabajo especial en glúteos." },
                { date: "13 May 2025", service: "Drenaje linfático 60 min", notes: "Inicio de tratamiento." },
            ],
        },
        {
            name: "María Fernández",
            cedula: "22222222",
            phone: "573002222222",
            sessions: 5,
            next: "Mié 25 · 11:00",
            history: [
                { date: "25 Jun 2025", service: "Masaje con piedras calientes 90 min", notes: "Solicitó presión media." },
                { date: "5 Jun 2025", service: "Masaje relajante 60 min", notes: "Muy relajada. Aroma de naranja." },
                { date: "20 May 2025", service: "Reflexología 45 min", notes: "Foco en zona digestiva." },
            ],
        },
        {
            name: "Ana González",
            cedula: "33333333",
            phone: "573003333333",
            sessions: 12,
            next: "Mié 25 · 14:00",
            history: [
                { date: "25 Jun 2025", service: "Reflexología 45 min", notes: "Seguimiento mensual." },
                { date: "28 May 2025", service: "Reflexología 45 min", notes: "Tensión cervical." },
                { date: "30 Abr 2025", service: "Masaje relajante 60 min", notes: "" },
                { date: "1 Abr 2025", service: "Drenaje linfático 60 min", notes: "Post-operatorio. Cuidado extremo." },
            ],
        },
        {
            name: "Paola Herrera",
            cedula: "44444444",
            phone: "573004444444",
            sessions: 3,
            next: "Mié 25 · 15:00",
            history: [
                { date: "25 Jun 2025", service: "Drenaje linfático 60 min", notes: "" },
                { date: "10 Jun 2025", service: "Drenaje linfático 60 min", notes: "Segunda sesión. Mejora visible." },
                { date: "28 May 2025", service: "Drenaje linfático 60 min", notes: "Primera sesión. Cliente nueva." },
            ],
        },
        {
            name: "Sandra Quintero",
            cedula: "55555555",
            phone: "573005555555",
            sessions: 6,
            next: "Vie 27 · 10:30",
            history: [
                { date: "27 Jun 2025", service: "Masaje de cabeza y cuello 30 min", notes: "Migrañas frecuentes. Protocolo especial." },
                { date: "15 Jun 2025", service: "Masaje de cabeza y cuello 30 min", notes: "" },
                { date: "1 Jun 2025", service: "Masaje relajante 60 min", notes: "Primera visita." },
            ],
        },
    ],
};

const DATA_VERSION = 2;

let SERENITY;

function initData() {
    const stored = localStorage.getItem('serenity_data');
    const storedVersion = localStorage.getItem('serenity_version');

    if (stored && storedVersion && parseInt(storedVersion) === DATA_VERSION) {
        SERENITY = JSON.parse(stored);
    } else {
        // Datos antiguos o inexistentes → cargar los nuevos defaults
        SERENITY = JSON.parse(JSON.stringify(DEFAULT_SERENITY));
        saveData();
    }
}

function saveData() {
    localStorage.setItem('serenity_data', JSON.stringify(SERENITY));
    localStorage.setItem('serenity_version', DATA_VERSION.toString());
}

// Reset data (for testing)
function resetData() {
    localStorage.removeItem('serenity_data');
    localStorage.removeItem('serenity_version');
    initData();
}

initData();