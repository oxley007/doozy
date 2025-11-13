import auth from "@react-native-firebase/auth";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { resetApp } from "../../store/store"; // 👈 new import

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const logout = async () => {
    try {
      await auth().signOut();
      dispatch(resetApp()); // 👈 clears ALL Redux slices (auth, user, plan, booking, etc.)

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err: any) {
      console.error("Logout error:", err);
      alert("Failed to logout: " + err.message);
    }
  };

  return logout;
};
