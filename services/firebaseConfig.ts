
// @ts-ignore
import { initializeApp } from "firebase/app";
// @ts-ignore
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Configuração oficial do seu projeto Nexus Chat
const firebaseConfig = {
  apiKey: "AIzaSyDi2QVMauW691D_035_9VsRJOybmN17-xg",
  authDomain: "nexus-chat-2c3f5.firebaseapp.com",
  projectId: "nexus-chat-2c3f5",
  storageBucket: "nexus-chat-2c3f5.firebasestorage.app",
  messagingSenderId: "622642064892",
  appId: "1:622642064892:web:ef1a47ed4921cc4b24d679",
  measurementId: "G-M6G6D3KZLD"
};

// Inicialização do Firebase
let auth: any = null;
let googleProvider: any = null;

try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
} catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
}

export const isFirebaseConfigured = () => {
    return true; // Configurado com sucesso
};

export const loginWithGoogle = async () => {
    if (!auth) throw new Error("Erro na inicialização do Firebase. Verifique o console.");
    
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        return {
            id: user.uid,
            name: user.displayName || 'Usuário Google',
            email: user.email || '',
            avatar: user.photoURL || '',
            token: await user.getIdToken()
        };
    } catch (error: any) {
        // Tratamento de erros comuns
        if (error.code === 'auth/operation-not-allowed') {
            throw new Error("O login com Google não está ativado no Firebase Console. Vá em Authentication > Sign-in method e ative o Google.");
        }
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error("O login foi cancelado.");
        }
        if (error.code === 'auth/unauthorized-domain') {
             throw new Error(`Este domínio não está autorizado no Firebase. Vá em Authentication > Settings > Authorized Domains e adicione este site: ${window.location.hostname}`);
        }
        throw new Error(error.message);
    }
};

export const logoutFirebase = async () => {
    if (auth) {
        await signOut(auth);
    }
};
