import React, { useMemo } from "react";
import { View, Text as RNText, StyleSheet } from "react-native";
import { styled } from "nativewind";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

// Format JS Date into "Monday 11th August"
function formatDate(date: Date) {
  return date.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function DisplayPreviousPaymentDate() {
  const user = useSelector((state: RootState) => state.user);

  const lastPaymentLabel = useMemo(() => {
    const status = user?.subscription?.status?.toLowerCase() || "";
    const noPaymentsStatuses = ["planning", "trial", "trialing"];

    if (!user?.subscription?.lastPaymentDate || noPaymentsStatuses.includes(status)) {
      return "No payments yet";
    }

    return `Last payment: ${formatDate(new Date(user.subscription.lastPaymentDate))}`;
  }, [user]);

  return (
    <StyledView style={styles.card} className="flex-1 p-4 bg-white">
      <View style={{ paddingVertical: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>
          Most Recent Payment
        </RNText>
        <RNText style={styles.info}>{lastPaymentLabel}</RNText>
        <RNText style={styles.infoPayment}>Payments are automatically billed every 28 days.</RNText>
      </View>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 5,
    elevation: 0,
    shadowColor: "transparent",
    padding: 20,
    marginBottom: 40,
    backgroundColor: "#eeeeee",
  },
  info: {
    fontFamily: fonts.Medium,
    fontSize: 18,
    color: "#999999",
    paddingTop: 10
  },
  infoPayment: {
    fontFamily: fonts.Medium,
    fontSize: 14,
    color: "#999999",
    paddingTop: 20
  },
});
