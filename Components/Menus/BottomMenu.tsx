import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const BottomMenu = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.menu}>
        {/* Home */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("DoozyHome")}
        >
          <MaterialIcons name="home" size={28} color="#999999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Account */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("DoozyAccountHome")}
        >
          <MaterialIcons name="person" size={28} color="#999999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Info (optional, add a screen later if you want) */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("DoozyInfoHome")}
        >
          <MaterialIcons name="info" size={28} color="#999999" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  menu: {
    flexDirection: "row",
    backgroundColor: "#195E4B",
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
});

export default BottomMenu;
