import React, { useMemo, useEffect } from "react";
import { View, Text as RNText, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { styled } from "nativewind";

import fonts from '../../assets/fonts/fonts.js';
import { RootState } from "../../store/store";

const StyledView = styled(View);

// Format JS Date into "Monday 11th August"
function formatDate(date: Date) {
  return date.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Subscription status messages
function getSubscriptionStatusLabel(status?: string) {
  switch (status) {
    case "trialing":
    case "trial":
      return "No payment required until after your first month.";
    case "active":
      return "Active subscription";
    case "past_due":
      return "Payment overdue";
    case "canceled":
      return "Canceled";
    case "incomplete":
      return "Payment setup incomplete";
    case "incomplete_expired":
      return "Payment setup expired";
    case "unpaid":
      return "Unpaid";
    case "planning":
      return "Scheduling your Doozy. Check back soon";
    default:
      return "No plan";
  }
}

export default function NextPaymentDue() {
  const user = useSelector((state: RootState) => state.user);

  const nextPaymentDate = useMemo(() => {
    if (!user?.subscription?.nextInvoiceDate) return null;
    return new Date(user.subscription.nextInvoiceDate);
  }, [user]);

  const paymentLabel = useMemo(() => {
    const status = user?.subscription?.status;

    if (nextPaymentDate) {
      return `Next payment due: ${formatDate(nextPaymentDate)}`;
    } else if (status) {
      return getSubscriptionStatusLabel(status);
    } else {
      return "Next payment date not available";
    }
  }, [user, nextPaymentDate]);

  // --- Debug log ---
  useEffect(() => {
    console.log("🔹 NextPaymentDue debug:");
    console.log("User subscription:", user?.subscription);
    console.log("Next invoice date (raw):", user?.subscription?.nextInvoiceDate);
    console.log("Next invoice date (JS Date):", nextPaymentDate);
    console.log("Payment label:", paymentLabel);
  }, [user, nextPaymentDate, paymentLabel]);

  return (
    <StyledView
      style={{
        borderRadius: 5,
        elevation: 0,
        shadowColor: "transparent",
        padding: 20,
        marginBottom: 40,
        backgroundColor: "#eeeeee",
      }}
    >
      <View style={{ paddingTop: 20, paddingBottom: 20 }}>
        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 24,
            color: "#195E4B",
            marginBottom: 8,
          }}
        >
          Next Payment
        </RNText>

        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 20,
            color: "#999999",
            lineHeight: 24,
          }}
        >
          {paymentLabel}
        </RNText>

        <RNText
          style={{
            fontFamily: fonts.medium,
            fontSize: 14,
            color: "#999999",
            lineHeight: 18,
            paddingTop: 10,
          }}
        >
          We'll email you after your first month with payment instructions. Payments become available after your first month of service and will then be automatically billed every 28 days.
        </RNText>
      </View>
    </StyledView>
  );
}
