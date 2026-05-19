import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  // Bạn cần điền thêm apiKey và các thông tin khác lấy từ Firebase Console
  // Project Settings > General > Your apps (Web app)
  apiKey: "YOUR_API_KEY",
  authDomain: "spy-finder-d42a3.firebaseapp.com",
  databaseURL: "https://spy-finder-d42a3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "spy-finder-d42a3",
  storageBucket: "spy-finder-d42a3.appspot.com",
  messagingSenderId: "514274420702",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const db = getDatabase(app);
