// service/auth.js
const authService = {
    // ล็อกอิน
    async login(email, password) {
        return await firebase.auth().signInWithEmailAndPassword(email, password);
    },
    // เช็กสถานะการล็อกอิน
    checkAuthState(callback) {
        firebase.auth().onAuthStateChanged(callback);
    }
};