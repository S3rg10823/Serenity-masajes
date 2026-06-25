// firebase-config.js
// Configuración global de Firebase usando las librerías CDN en modo compatibilidad

const firebaseConfig = {
    apiKey: "AIzaSyBDM4Evm8RBsVUttUptEcyBVW9yP7krT38",
    authDomain: "masajes-7bc0c.firebaseapp.com",
    projectId: "masajes-7bc0c",
    storageBucket: "masajes-7bc0c.firebasestorage.app",
    messagingSenderId: "408681161494",
    appId: "1:408681161494:web:6d7bf2d714697710e8e637",
    measurementId: "G-F2GD1NY5RG"
};

// Inicializar Firebase solo si no ha sido inicializado antes
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();
