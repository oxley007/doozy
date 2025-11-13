import React, { useEffect, useState } from "react";
import { View, Text as RNText, TextInput, Button, StyleSheet, ScrollView, Dimensions, KeyboardAvoidingView, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import fonts from "../../assets/fonts/fonts.js";
import { useNavigation } from "@react-navigation/native";
import { styled } from "nativewind";

import BottomMenu from '../Menus/BottomMenu';
import AdminBottomMenu from '../Menus/AdminBottomMenu';

const StyledView = styled(View);

interface SoilTestGraphProps {
  userId: string;
}

interface SoilTest {
  id: string;
  date: any;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
}

export default function SoilInfo({ userId }: SoilTestGraphProps) {
  const navigation = useNavigation();

  return (
    <StyledView className="flex-1 p-4 bg-gray-100" style={{ backgroundColor: "#E9FCDA" }}>
      <ScrollView style={{ padding: '5%', paddingTop: 60 }}>

      <View style={{ marginTop: 20, marginBottom: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: "#195E4B", marginBottom: 8 }}>
          🟢 Lawn Health & Dog Urine Quick Guide
        </RNText>

        <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 6 }}>
          {/* Table Header */}
          <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 6 }}>
            {['Test', 'Low', 'Medium', 'High', 'Ideal for Reducing Urine Burn', 'Notes / Action'].map((header) => (
              <RNText key={header} style={{ flex: 1, fontFamily: fonts.bold, fontSize: 12, color: '#333' }}>
                {header}
              </RNText>
            ))}
          </View>

          {/* Table Rows */}
          {[
            {
              test: 'pH',
              low: '<6.0',
              medium: '6.0–7.0',
              high: '>7.5',
              ideal: '6.0–7.0',
              notes: 'Acidic soil (<6) → lime; Alkaline (>7.5) → sulfur. Neutral soil buffers urine nitrogen.',
            },
            {
              test: 'Nitrogen (N)',
              low: '1',
              medium: '2',
              high: '3–4',
              ideal: '2 (Medium)',
              notes: 'Avoid over-fertilising. Water urine spots immediately to dilute excess nitrogen.',
            },
            {
              test: 'Phosphorus (P)',
              low: '1',
              medium: '2',
              high: '3',
              ideal: '2–3 (Medium–High)',
              notes: 'Supports recovery from stress; helps grass regrow in urine spots.',
            },
            {
              test: 'Potassium (K)',
              low: '1–2',
              medium: '3',
              high: '4',
              ideal: '3–4 (High)',
              notes: 'Strengthens grass, improves water retention, reduces burn severity.',
            },
          ].map((row) => (
            <View key={row.test} style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#eee', padding: 6 }}>
              {Object.values(row).map((val, i) => (
                <RNText key={i} style={{ flex: 1, fontFamily: fonts.medium, fontSize: 12, color: '#555' }}>
                  {val}
                </RNText>
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 12 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: "#195E4B", marginBottom: 6 }}>
          🌱 pH Levels
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#555", marginBottom: 4 }}>
          Range: 4.5 – 7.5 (sometimes up to 8)
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#555", marginBottom: 10 }}>
          Color scale: Orange (acidic, ~4.5) → Green (neutral, ~6.5–7) → Blue/Purple (alkaline, ~7.5–8)
        </RNText>

        <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: "#195E4B", marginBottom: 6 }}>
          🌱 Nitrogen (N), Phosphorus (P), Potassium (K)
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#555" }}>
          Nutrient scale (Rapitest kit):
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#555", marginBottom: 4 }}>
          0 = Depleted / Very Low
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#555", marginBottom: 4 }}>
          1 = Low
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#555", marginBottom: 4 }}>
          2 = Adequate / Medium
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#555", marginBottom: 4 }}>
          3 = Sufficient / High
        </RNText>
        <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: "#555", marginBottom: 10 }}>
          4 = Surplus / Very High
        </RNText>
      </View>

      <View style={{ paddingBottom: 220 }} />

      </ScrollView>



      <AdminBottomMenu />
      <BottomMenu />
      </StyledView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    borderColor: "#195E4B",
    marginBottom: 10,
    fontSize: 16,
    paddingVertical: 6,
  },
});
