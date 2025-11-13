import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "../Firebase/firebaseConfig"; // RNFirebase firestore
import auth from "@react-native-firebase/auth";
import { setUserDetails } from "../store/store";

export const useUserDataListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = auth().onAuthStateChanged((user) => {
      if (!user) return;

      const userDocRef = doc(firestore, "users", user.uid);
      unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("User data:", userData);
          dispatch(setUserDetails(userData));
        }
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [dispatch]);
};
