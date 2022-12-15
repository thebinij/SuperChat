import { useRef, useState } from "react";
import "./App.css";
import "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

import { useAuthState } from "react-firebase-hooks/auth";
import {
  useCollection,
} from "react-firebase-hooks/firestore";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyAkWDPn8sUn9XTBRQ25Jf2w6R9LQ3maE",
  authDomain: "super-chat-2c391.firebaseapp.com",
  projectId: "super-chat-2c391",
  storageBucket: "super-chat-2c391.appspot.com",
  messagingSenderId: "572938567417",
  appId: "1:572938567417:web:b31da1b7326dea96cbec28",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header"><h1>Super Chat App</h1><SignOut /></header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return <button onClick={signInWithGoogle}>Sign In with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => signOut(auth)}>Sign Out</button>
  );
}

function ChatRoom() {
  const emptydiv = useRef() as any;
  const messageRef = collection(db, "messages");
  const q = query(messageRef, orderBy("createdAt"), limit(25));
  const [messageSnapshot] = useCollection(q);
  let messages: DocumentData[] = [];
  messageSnapshot?.forEach((snap) => {
    let data = snap.data();
    data.id = snap.id;
    messages.push(data);
  });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e: any) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser!;
    const msgToSend = {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    };
    setFormValue("");

    await addDoc(messageRef, msgToSend);
    emptydiv.current.scrollIntoView({behaviour : 'smooth'})
  };
  return (
    <>
      <div className="msgScreen">
        {messages &&
          messages.map((msg) => <ChatMessage message={msg} key={msg.id} />)}

          <div ref={emptydiv}></div>
      </div>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props: any) {
  const { text, photoURL, uid } = props.message;

  const messageClass = uid == auth.currentUser?.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} />
      <p>{text}</p>
    </div>
  );
}

export default App;
