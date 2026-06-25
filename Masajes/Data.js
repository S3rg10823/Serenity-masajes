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
        { idx: 0, label: "Lun", num: "23" },
        { idx: 1, label: "Mar", num: "24" },
        { idx: 2, label: "Mié", num: "25", hoy: true },
        { idx: 3, label: "Jue", num: "26" },
        { idx: 4, label: "Vie", num: "27" },
        { idx: 5, label: "Sáb", num: "28" },
    ],

    // Citas agendadas (en producción esto vendría de una base de datos)
    citas: [
        { time: "09:00", day: 0, client: "Laura M.", service: "Relajante", phone: "573001111111" },
        { time: "10:00", day: 0, client: "Carlos R.", service: "Descontract.", phone: "573009999999" },
        { time: "11:00", day: 2, client: "María F.", service: "Piedras", phone: "573002222222" },
        { time: "14:00", day: 2, client: "Ana G.", service: "Reflexología", phone: "573003333333" },
        { time: "15:00", day: 2, client: "Paola H.", service: "Drenaje", phone: "573004444444" },
        { time: "09:00", day: 3, client: "Luis T.", service: "Relajante", phone: "573008888888" },
        { time: "10:30", day: 4, client: "Sandra Q.", service: "Cabeza", phone: "573005555555" },
        { time: "11:00", day: 5, client: "Marta E.", service: "Relajante", phone: "573007777777" },
        { time: "14:00", day: 5, client: "Roberto S.", service: "Descontract.", phone: "573006666666" },
        { time: "16:00", day: 1, client: "Julia P.", service: "Piedras", phone: "573001234500" },
        { time: "17:00", day: 3, client: "Carmen V.", service: "Drenaje", phone: "573001234501" },
    ],

    // Historial de clientes con notas internas
    clientes: [
        {
            name: "Laura Martínez",
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

let SERENITY;

function initData() {
    const stored = localStorage.getItem('serenity_data');
    if (stored) {
        SERENITY = JSON.parse(stored);
    } else {
        SERENITY = JSON.parse(JSON.stringify(DEFAULT_SERENITY));
        saveData();
    }
}

function saveData() {
    localStorage.setItem('serenity_data', JSON.stringify(SERENITY));
}

// Reset data (for testing)
function resetData() {
    localStorage.removeItem('serenity_data');
    initData();
}

initData();