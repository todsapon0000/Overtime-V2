

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4lbyXTagHOX948IFpbXqaFb_FiSqKzeE",
  authDomain: "sao-overtime.firebaseapp.com",
  projectId: "sao-overtime",
  storageBucket: "sao-overtime.firebasestorage.app",
  messagingSenderId: "946252485329",
  appId: "1:946252485329:web:069b53e7f995d5ea30abf0",
  measurementId: "G-7WKWPCT6YE"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// สร้างตัวแปร db สำหรับเรียกใช้ Firestore ใน otService.js และ app.js
// ใน js/services/database.js
const db = firebase.firestore();

// 🟢 ใช้คำสั่งดักจับ persistence พื้นฐานเพื่อหลีกเลี่ยง Warning
db.enablePersistence().catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Persistence not supported');
    }
});