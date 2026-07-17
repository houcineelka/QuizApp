import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { db } from '../auth/firebase'; 
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from "../auth/contexts/AuthContext";
import { Database } from "lucide-react";

const ConnectFirebase = ({ProjectLink,ApiKey,AuthDomain}) => {
  const [success, setSuccess] = useState(false);
  const [FirebaseProjectLink, setFirebaseProjectLink] = useState("");
  const [FirebaseApiKey, setFirebaseApiKey] = useState("");
  const [FirebaseAuthDomain, setFirebaseAuthDomain] = useState("");
  const { currentUser } = useAuth();


  const saveFormDataToJsonFile = async (data) => {
    try {

      await setDoc(doc(db, 'connectFirebase',currentUser.uid ), data);
    } catch (error) {
      toast.error('Failed to save data', { position: 'bottom-right' });
    }
  };
  
  

  const handleConnect = async (e) => {
    e.preventDefault();
    setSuccess(false);


    try {

      ProjectLink(FirebaseProjectLink);
      ApiKey(FirebaseApiKey);
      AuthDomain(FirebaseAuthDomain);
      

      const firebaseConfig = {
        apiKey: FirebaseApiKey,
        authDomain: FirebaseAuthDomain,
        databaseURL: FirebaseProjectLink,
        projectId: FirebaseProjectLink.split('.')[0].split('//')[1],
        storageBucket: `${FirebaseProjectLink.split('.')[0].split('//')[1]}.appspot.com`,
      };

      initializeApp(firebaseConfig);

      toast.success('Firebase connected successfully', { position: 'bottom-right' });

      const formData = {
        FirebaseProjectLink,
        FirebaseApiKey,
        FirebaseAuthDomain,
        idUser: currentUser.uid,
        status: true
      };
      await saveFormDataToJsonFile(formData);


      setSuccess(true);
    } catch (error) {
      toast.error('Error connecting to Firebase', { position: 'bottom-right' });
      setSuccess(false);
    } 
  };


  useEffect(() => {

    const docRef = doc(db, 'connectFirebase',currentUser.uid);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        let data = doc.data();
        setFirebaseProjectLink(data.FirebaseProjectLink);
        setFirebaseApiKey(data.FirebaseApiKey);
        setFirebaseAuthDomain(data.FirebaseAuthDomain);
        setSuccess(data.status);
      } else {
        console.log("");}
    }, (error) => {
      console.log(error);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);



  return (
    <div className="overflow-x-hidden h-full">
  

      <div className="flex items-center gap-2 px-4 pt-6 pb-2 border-b-2 border-gray-200">
        <Database width={20} />
        <h3 className="text-md font-bold">Database settings</h3>
      </div>
      <div className="grid sm:grid-cols-12 gap-1 px-4 lg:justify-center items-center pt-3">
        <form className="sm:col-span-12" onSubmit={handleConnect}>
          <div className="sm:col-span-12 flex items-center mt-3">
            <label className="inline-block text-sm text-gray-800">
              Firebase Project Link
            </label>
          </div>
          <div className="sm:col-span-12 flex items-center">
            <input
              type="text"
              defaultValue={FirebaseProjectLink}
              id="FirebaseProjectLink"
              name="FirebaseProjectLink"
              onChange={(e) => setFirebaseProjectLink(e.target.value)}
              className="QuizName border-2 shadow-sm py-2 px-3 pe-11 block w-full border-gray-300 rounded text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://your-project.firebaseio.com"
              required
            />
          </div>

          <div className="sm:col-span-12 flex items-center mt-3">
            <label className="inline-block text-sm text-gray-800">
              API Key
            </label>
          </div>
          <div className="sm:col-span-12 flex items-center">
            <input
              type="text"
              defaultValue={FirebaseApiKey}
              id="APIKey"
              name="APIKey"
              onChange={(e) => setFirebaseApiKey(e.target.value)}
              className="QuizName border-2 shadow-sm py-2 px-3 pe-11 block w-full border-gray-300 rounded text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXX" required
            />
          </div>

          <div className="sm:col-span-12 flex items-center mt-3">
            <label className="inline-block text-sm text-gray-800">
              Auth Domain
            </label>
          </div>
          <div className="sm:col-span-12 flex items-center">
            <input
              type="text"
              defaultValue={FirebaseAuthDomain}
              id="AuthDomain"
              name="AuthDomain"
              className="QuizName border-2 shadow-sm py-2 px-3 pe-11 block w-full border-gray-300 rounded text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
              onChange={(e) => setFirebaseAuthDomain(e.target.value)}
              placeholder="your-project.firebaseapp.com" required
            />
          </div>

          <div className="sm:col-span-12 flex items-center mt-3">
            <button
              type="submit"
              className="flex items-center justify-center gap-3 bg-green-400 text-white w-full inline-block rounded-lg border py-3 text-xs font-medium"
            >
            <img className="w-4 h-4" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAChElEQVR4nO2Z0WrUQBSGp3dKq30FURF8iErrFi9bFKGv0N7sVYVFH6RWBJ+hWm8UrApCX0CrN15UsIUSrdvaG8FPDj3CMJtkJulmMoV8sJANM7Pn3+Rkzn9iTEdHR/IA88ATYAc40o8crwM9kzrAdeAdft7KWJMiwCyQEU4GzJiUAG4Bx1TnRzJXRu554CQnyA29SpP6kePnOeO2UhXxF1gtmfMwR8ztuJGHiegHzN105q3FiXo0kLm6Iqw/weaTiQ1wEzisK0IALjnzf5mYABPAh7OIEIDLzhqHJibAnZxEHdRYp+es8bGZiIsDeOYE8EquUo11Xraa7MAXJ4CFGms8yLmqc81EXBzEb+vHt4ELev4usAccAPdL5vc1p2zeRBXhCBER03puCfhjBXZQQUQGXGtDyGePCGE/UMSJlC3RRWhAKx4R8v1eoIheKyKc4IpELDl7zuDcipAHALAIvHbGxBEhFaha0R31CUeaEysVRExrDhFdBHC1xJ76EjtURNZoYnvs6bhEbDX6iC1xdpVE6JhlKcXV7g6ldpKyg6Z37BIRUjstWDu2V0SKzm5gF4DnVUTfGbcYkBPLbYmYDbWnwDePiO3oHsLqAGahzg747hEhDE1sGN0nSu2p3lq7wFc51nMXnUfssI2GsstqjXVEXKv2dN0JYKPGGhM5tdPTZiIuQOslm8qlgj6a2+0OcrrT2kxWnJ/nJ943F3G4kKkzivgJ3DCx4bQsr3xrlTi7uB2PkmR/YTwkaU8Z7eoJjzx9p7RE/Eff2blsqiuc0qZyL6cDmI4IAbiizbOqiIh5kxLATI2Xle30nXyI5Sy4zeLa0zG/cXqslnQY1Z52dHSYcfAP2R7pPImBIA8AAAAASUVORK5CYII=" alt="link--v1" />
              Connect
            </button>
          </div>
        </form>
        {success && (
          <div className="sm:col-span-12 flex items-center mt-6 px-4">
            <div className="online-indicator">
              <span className="blink"></span>
            </div>
            <h2 className="text-sm text-gray-800">Firebase connected successfully</h2>

          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectFirebase;