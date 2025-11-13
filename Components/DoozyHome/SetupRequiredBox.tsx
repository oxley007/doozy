import React, { useMemo } from "react";
import { View, Text as RNText } from "react-native";
import { useSelector } from "react-redux";
import { styled } from "nativewind";
import { Button } from "react-native-paper";
import { RootState } from "../../store/store";
import fonts from "../../assets/fonts/fonts.js";
import { useNavigation } from "@react-navigation/native";

const StyledView = styled(View);

export default function SetupRequiredBox({ onPress }: { onPress: () => void }) {
  const navigation = useNavigation<any>();
  const address = useSelector((state: RootState) => state.user?.address);

  const backToCheckAddress = () => navigation.navigate("CheckAddressHome");

  // ✅ determine if setup is incomplete
  const showSetupBox = useMemo(() => {
    return !address || !address.formattedAddress;
  }, [address]);

  if (!showSetupBox) return null;

  return (
    <StyledView
      style={{
        borderRadius: 8,
        backgroundColor: "#fff7e6",
        padding: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: "#ffcc80",
      }}
    >
      <RNText
        style={{
          fontFamily: fonts.bold,
          fontSize: 20,
          color: "#e65100",
          marginBottom: 12,
        }}
      >
        Setup Required
      </RNText>

      <RNText
        style={{
          fontFamily: fonts.medium,
          fontSize: 16,
          color: "#444444",
          marginBottom: 16,
        }}
      >
        Please complete your setup to continue using Doozy.
      </RNText>

      <Button
        mode="contained"
        onPress={backToCheckAddress}
        style={{
          backgroundColor: "#195E4B",
          borderRadius: 8,
          paddingVertical: 6,
        }}
        labelStyle={{
          fontSize: 16,
          fontWeight: "bold",
          color: "white",
        }}
      >
        Please Complete Setup
      </Button>
    </StyledView>
  );
}
