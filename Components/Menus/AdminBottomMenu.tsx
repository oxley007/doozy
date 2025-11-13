import React from "react";
import { View, TouchableOpacity, StyleSheet, Text as RNText } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const AdminBottomMenu = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  if (!user?.isAdmin) {
    return null; // hide menu if not admin
  }

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <RNText style={styles.titleText}>Admin Menu</RNText>
      </View>
      <View style={styles.menu}>
        {/* Admin Home */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("AdminHome")}
        >
          <MaterialIcons name="calendar-today" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Manage Users */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("UsersHome")}
        >
          <MaterialIcons name="group" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Reports */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("WeeklyPickups")}
        >
          <MaterialIcons name="event-repeat" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  menu: {
    flexDirection: "row",
    backgroundColor: "#8C2B2B",
    borderRadius: 50,
    overflow: "hidden",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  title: {
    backgroundColor: "#8C2B2B", // matches your red palette
    marginBottom: 0,
    width: '40%',
    alignItems: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: '#fff',
    paddingBottom: 5,
    paddingTop: 5
  },
});

export default AdminBottomMenu;
