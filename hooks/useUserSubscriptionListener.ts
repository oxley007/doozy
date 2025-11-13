// hooks/useUserSubscriptionListener.ts
import auth from "@react-native-firebase/auth"; // ✅ correct
import { useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { firestore } from "../Firebase/firebaseConfig";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../store/store";

export default function useUserSubscriptionListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = auth().onAuthStateChanged((user) => {
      if (!user) return;

      const userDocRef = doc(firestore, "users", user.uid);
      unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          dispatch(setUserDetails(docSnap.data()));
        }
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [dispatch]);
}
