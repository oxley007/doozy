import React from "react";
import {
  View,
  Text as RNText,
  ScrollView,
  StyleSheet,
} from "react-native";
import fonts from "../../assets/fonts/fonts";
import BottomMenu from "../Menus/BottomMenu";
import AdminBottomMenu from "../Menus/AdminBottomMenu";

export default function LawnSaverRoutine() {
  return (
    <View style={{ flex: 1, backgroundColor: "#E9FCDA" }}>
      <ScrollView style={{ padding: 20, paddingTop: 100 }}>
        {/* Title */}
        <RNText style={styles.title}>
          🌱 Lawn Saver Routine for Dog Owners
        </RNText>

        {/* Intro */}
        <RNText style={styles.paragraph}>
          Dog urine is strongest in the morning and can burn your grass.
          Here’s a simple 2-step routine to protect your lawn every day:
        </RNText>

        {/* Step 1 */}
        <RNText style={styles.stepTitle}>Step 1: Auto-Prep (Insurance Watering)</RNText>
        <RNText style={styles.paragraph}>
          Set your smart sprinkler to run for 1–2 minutes about 30 minutes
          before letting your dog out in the morning.
        </RNText>
        <RNText style={styles.paragraph}>
          This keeps the grass damp, so the first morning wee doesn’t hit dry lawn.
        </RNText>
        <RNText style={styles.paragraph}>
          Think of it as your lawn’s “morning coffee” — a safety spray.
        </RNText>

        {/* Step 2 */}
        <RNText style={styles.stepTitle}>Step 2: Spot Flush (The Real Fix)</RNText>
        <RNText style={styles.paragraph}>
          After your dog comes back inside, open the sprinkler app and hit
          “Water Now” for 2 minutes.
        </RNText>
        <RNText style={styles.paragraph}>
          This rinses and dilutes the urine before it can burn.
        </RNText>
        <RNText style={styles.paragraph}>
          Quick, easy, and saves your grass from yellow patches.
        </RNText>

        {/* Why it works */}
        <RNText style={styles.sectionTitle}>✅ Why It Works</RNText>
        <RNText style={styles.paragraph}>
          Pre-water = insurance (helps if you forget).
        </RNText>
        <RNText style={styles.paragraph}>
          Post-water = cure (directly stops the burn).
        </RNText>
        <RNText style={styles.paragraph}>
          Uses only a little water each day but saves hours of lawn repair.
        </RNText>

        {/* Extra Tips */}
        <RNText style={styles.sectionTitle}>💡 Extra Tips</RNText>
        <RNText style={styles.paragraph}>
          • Encourage your dog to drink more water (helps dilute urine naturally).
        </RNText>
        <RNText style={styles.paragraph}>
          • Rotate pee zones if possible, or train your dog to use one hardy spot.
        </RNText>
        <RNText style={styles.paragraph}>
          • Mow high — longer grass tolerates more stress.
        </RNText>

        {/* Closing */}
        <RNText style={styles.sectionTitle}>
          👉 Daily Routine = Healthy Lawn + Happy Dog
        </RNText>

        <View style={{ paddingBottom: 350 }} />
      </ScrollView>

      {/* Menus */}
      <AdminBottomMenu />
      <BottomMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: "#195E4B",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: "#195E4B",
    marginTop: 20,
    marginBottom: 8,
  },
  stepTitle: {
    fontFamily: fonts.medium,
    fontSize: 18,
    color: "#2E8B57",
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
    lineHeight: 22,
  },
});
