// components/Admin/PlanningUsersList.tsx
import React from "react";
import { View, Text as RNText, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import fonts from "../../assets/fonts/fonts.js";

const StyledView = styled(View);

interface PlanningUsersListProps {
  users: any[];
  onUserPress?: (user: any) => void;
}

export default function PlanningUsersList({ users, onUserPress }: PlanningUsersListProps) {
  const planningUsers = users.filter(
    (u) => u.subscription?.status?.toLowerCase() === "planning"
  );

  return (
    <StyledView style={{ marginTop: 20 }}>
      <RNText
        style={{
          fontFamily: fonts.bold,
          fontSize: 22,
          color: "#195E4B",
          marginBottom: 12,
        }}
      >
        Users in Planning
      </RNText>

      {planningUsers.length === 0 ? (
        <RNText
          style={{
            fontFamily: fonts.medium,
            fontSize: 16,
            color: "#999999",
          }}
        >
          No users with "planning" status.
        </RNText>
      ) : (
        planningUsers.map((u) => (
          <TouchableOpacity
            key={u.id}
            onPress={() => onUserPress?.(u)}
            style={{
              backgroundColor: "#fff",
              padding: 12,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: "#195E4B" }}>
              {u.name || "N/A"}
            </RNText>
            <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#999999" }}>
              {u.email || "N/A"}
            </RNText>
            <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B" }}>
              Plan: {u.subscription?.plan || "N/A"}
            </RNText>
          </TouchableOpacity>
        ))
      )}
    </StyledView>
  );
}
