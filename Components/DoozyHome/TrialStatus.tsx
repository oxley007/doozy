import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";

const TrialStatus = () => {
  const { profile } = useSelector((state) => state.auth);

  if (!profile || !profile.subscription) return null;

  const now = new Date();
  const trialUntil = new Date(profile.subscription.trialUntil);

  const isTrialExpired = now > trialUntil;

  return (
    <View style={{ padding: 16 }}>
      {isTrialExpired ? (
        <Text style={{ color: "red", fontWeight: "bold" }}>
          Your trial has ended. Subscribe now to continue!
        </Text>
      ) : (
        <Text style={{ color: "green" }}>
          Your trial is active until {trialUntil.toDateString()}.
        </Text>
      )}
    </View>
  );
};

export default TrialStatus;
