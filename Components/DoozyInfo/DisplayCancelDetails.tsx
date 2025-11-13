import React, { useMemo } from "react";
import { View, Text as RNText, StyleSheet } from "react-native";
import { styled } from "nativewind";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

import EmailButton from '../DoozyAccount/EmailButton';
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

export default function DisplayCancelDetails() {
  const user = useSelector((state: RootState) => state.user);

  const lastPaymentLabel = useMemo(() => {
    if (!user?.subscription?.lastPaymentDate) return "No payments yet";
    return `Last payment: ${formatDate(new Date(user.subscription.lastPaymentDate))}`;
  }, [user]);

  return (
    <StyledView style={styles.card}>
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText style={styles.title}>
          Cancel Subscription
        </RNText>

        <View style={{ marginTop: 20 }}>
        <EmailButton
          email="andrew@4dot6digital.com"
          subject="Cancel My Subscription"
          label="Cancel my Subscription"
          body={`Hi Doozy Team,

        I (User ID: ${user.uid}) would like to cancel my subscription.

        [Add any extra details here]

        `}
         />

        </View>
      </View>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    elevation: 0,
    shadowColor: "transparent",
    padding: 20,
    marginBottom: 40,
    backgroundColor: "#eeeeee",
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: '#195E4B',
    marginBottom: 12,
  },
  info: {
    fontFamily: "Inter 24pt Medium",
    fontSize: 18,
    color: "#999999",
    lineHeight: 24,
  },
});
