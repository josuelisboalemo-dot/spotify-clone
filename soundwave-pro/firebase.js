const firebaseConfig = {
  apiKey: "AIzaSyBS8bm58zcJkb2_Wk8kJG_UQ3sMy7nqle4",
  authDomain: "oundwave-340a1.firebaseapp.com",
  projectId: "oundwave-340a1",
  storageBucket: "oundwave-340a1.firebasestorage.app",
  messagingSenderId: "1011315891173",
  appId: "1:1011315891173:web:2f2d4b72c8daf36cbded0c"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();