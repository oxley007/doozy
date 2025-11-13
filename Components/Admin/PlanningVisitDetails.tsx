import React from "react";
import { View, Text as RNText } from "react-native";
import fonts from "../../assets/fonts/fonts.js";

type VisitDetails = {
  homeNotes?: string;
  selectedDays?: string[];
  selectedTimes?: string[];
};

interface PlanningVisitDetailsProps {
  visitDetails?: VisitDetails | null;
}

export default function PlanningVisitDetails({ visitDetails }: PlanningVisitDetailsProps) {
  if (!visitDetails) {
    return (
      <View style={{ marginBottom: 20, marginTop: 40, padding: 15, backgroundColor: "#fff", borderRadius: 8 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: "#195E4B", marginBottom: 6 }}>
          Visit Details
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999" }}>
          No visit details. Se info in detail above.
        </RNText>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 20, marginTop: 40, padding: 15, backgroundColor: "#fff", borderRadius: 8 }}>
      <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: "#195E4B", marginBottom: 6 }}>
        Visit Details
      </RNText>

      {visitDetails.homeNotes && (
        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#333", marginBottom: 6 }}>
          🏠 Notes: {visitDetails.homeNotes}
        </RNText>
      )}

      {visitDetails.selectedDays?.length ? (
        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#333", marginBottom: 6 }}>
          📅 Days: {visitDetails.selectedDays.join(", ")}
        </RNText>
      ) : null}

      {visitDetails.selectedTimes?.length ? (
        <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#333" }}>
          ⏰ Times: {visitDetails.selectedTimes.join(", ")}
        </RNText>
      ) : null}
    </View>
  );
}
