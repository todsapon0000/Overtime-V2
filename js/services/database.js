

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
const db = firebase.firestore();