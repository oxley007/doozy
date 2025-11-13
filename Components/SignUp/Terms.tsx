import React from "react";
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { termsSections } from "./termsText";
import { Linking } from "react-native";

const Terms = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const from = route.params?.from;

  const handleBack = () => {
    if (from === "SignUpScreen") {
      navigation.navigate("SignUpScreen");
    } else if (from === "DoozyInfoHome") {
      navigation.navigate("DoozyInfoHome");
    } else {
      navigation.goBack(); // fallback
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        {termsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.title}>{section.title}</Text>
            {section.content.map((paragraph, i) => (
              <Text key={i} style={styles.paragraph}>
                {paragraph.split("Privacy Policy").map((part, j, arr) => {
                  if (j < arr.length - 1) {
                    return (
                      <Text key={j}>
                        {part}
                        <Text
                          style={styles.link}
                          onPress={() =>
                            Linking.openURL("https://www.apple.com/legal/privacy/")
                          }
                        >
                          Privacy Policy
                        </Text>
                      </Text>
                    );
                  } else return part;
                })}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: { padding: 16, backgroundColor: "#f2f2f2", marginTop: 60 },
  backButtonText: { fontSize: 16, color: "#195E4B", fontWeight: "bold" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  section: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#195E4B" },
  paragraph: { fontSize: 14, lineHeight: 22, marginBottom: 6, color: "#333" },
  link: { color: "#1E90FF", textDecorationLine: "underline" },
});

export default Terms;
