import firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/firestore';

// TODO: we're better than this
const config = {
  apiKey: "AIzaSyBrw99GFpJdG8qKV3gmgKlj_b4qJhY5Xcw",
  databaseURL: "https://sheety-builder.firebaseio.com",
  storageBucket: "sheety-builder.appspot.com",
  authDomain: "sheety-builder.firebaseapp.com",
  messagingSenderId: "786616803238",
  projectId: "sheety-builder"
};

firebase.initializeApp(config);

export default firebase;
