import React, { useState } from "react";
import { View, Text as RNText, TouchableOpacity } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setUserDetails } from '../../store/store';
import firestore from '@react-native-firebase/firestore';
import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function ExtraDetailsForm() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [dogNames, setDogNames] = useState("");
  const [accessYard, setAccessYard] = useState("");
  const [specialInstruct, setSpecialInstruct] = useState("");
  const [homeNotes, setHomeNotes] = useState("");
  const [hasOutdoorTap, setHasOutdoorTap] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  // 🔹 New: track which form is open ('extra' | 'visit' | null)
  const [openForm, setOpenForm] = useState<"extra" | "visit" | null>(null);

  const subscription = useSelector((state: RootState) => state.subscription);
  const plan = subscription?.plan ?? "";
  const isPremium = subscription?.plan?.includes("Premium");
  const isArtificialGrass = plan.includes("Artificial Grass");

  const authState = useSelector((state: RootState) => state.auth);
  const user = useSelector((state: RootState) => state.user);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const times = ["9am-12pm", "12pm-5pm", "5pm-8pm"];

  const toggleDay = (day: string) => {
    setSelectedDays(selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day]);
  };

  const toggleTime = (time: string) => {
    setSelectedTimes(selectedTimes.includes(time)
      ? selectedTimes.filter(t => t !== time)
      : [...selectedTimes, time]);
  };

  const handleSubmit = async () => {
    try {
      const extraDetailsObj = { dogNames, accessYard, specialInstruct, homeNotes };
      await firestore().collection("users").doc(user.uid).update({ extraDetails: extraDetailsObj });
      dispatch(setUserDetails({ extraDetails: extraDetailsObj }));
      navigation.navigate("DetailsConfirmed");
    } catch (err: any) {
      console.error("ExtraDetailsForm error:", err);
      alert("Update failed: " + err.message);
    }
  };

  const handleVisitSubmit = async () => {
    try {
      const visitDetailsObj = { selectedTimes, selectedDays, homeNotes };
      await firestore().collection("users").doc(user.uid).update({ visitDetails: visitDetailsObj });
      dispatch(setUserDetails({ visitDetails: visitDetailsObj }));
      navigation.navigate("VisitConfirmed");
    } catch (err: any) {
      console.error("ExtraDetailsForm visit error:", err);
      alert("Visit scheduling failed: " + err.message);
    }
  };

  return (
    <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: '#eeeeee' }} className="flex-1 p-4 bg-white">
    <View style={{ paddingTop: 20, paddingBottom: 20 }}>
      <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B' }}>Whats next?</RNText>
      <RNText style={{ fontFamily: fonts.bold, fontSize: 22, color: '#999999', lineHeight: 24 }}>We need a few more details from you.</RNText>
    </View>
    <View style={{ paddingTop: 20, paddingBottom: 20 }}>
      <RNText style={{ fontFamily: fonts.bold, fontSize: 15, color: '#999999', lineHeight: 24 }}>You can either fill in the extra details in the form below, or we can arrange for one of our Doozy team members to visit your home for an initial meet-and-greet with you and your dog(s). You can then show our ‘Doozy’ how to access your yard and share any other important details. See the bottom of the page for the 'Arrange a visit' form.</RNText>
    </View>

      {/* Extra Details Form Toggle */}
      <TouchableOpacity
        onPress={() => setOpenForm(openForm === "extra" ? null : "extra")}
        style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
      >
        <RNText style={{ fontSize: 18, fontFamily: fonts.bold, color: '#195E4B' }}>
          {openForm === "extra" ? '– ' : '+ '} Submit extra details
        </RNText>
      </TouchableOpacity>

      {openForm === "extra" && (
        <View>
          {/* Dog Names */}
          <View className="mb-4">
            <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginBottom: 8 }}>Dog Name(s)</RNText>
            <TextInput
              value={dogNames}
              onChangeText={setDogNames}
              mode="outlined"
              placeholder="Wiggles von Waggletail, Mutt Damon"
              placeholderTextColor="#888888"
              outlineColor="#ccc"
              style={{ backgroundColor: '#cccccc' }}
              contentStyle={{ color: '#333333' }}
            />
          </View>

          {/* Access Yard */}
          <View className="mb-4">
            <RNText
              style={{
                fontFamily: fonts.bold,
                fontSize: 14,
                color: '#999999',
                marginBottom: 8,
                marginTop: 10,
              }}
            >
              How do we access your yard?
            </RNText>

            <TextInput
              value={accessYard}
              onChangeText={setAccessYard}
              mode="outlined"
              placeholder="See examples below."
              placeholderTextColor="#888888"
              outlineColor="#ccc"
              multiline   // 👈 allows multiple lines
              numberOfLines={4} // 👈 default height
              style={{
                backgroundColor: '#cccccc',
                minHeight: 100, // 👈 ensures it looks like a text area
                textAlignVertical: 'top', // 👈 keeps text starting at the top
              }}
              contentStyle={{ color: '#333333' }}
            />
            <RNText
              style={{
                fontFamily: fonts.medium,
                fontSize: 14,
                color: '#999999',
                marginBottom: 8,
                marginTop: 10,
              }}
            >
              <RNText
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 14,
                  color: '#999999',
                  marginBottom: 8,
                  marginTop: 10,
                }}
              >
                Examples:{"\n"}
              </RNText>
              Side gate (please specify location){"\n"}
              Back door (please specify location){"\n"}
              Meet at door{"\n"}
              Door code{"\n"}
              Gate code{"\n"}
              Use the buzzer/intercom at the gate{"\n"}
              Garage door code/door opener{"\n"}
              Front porch keybox code{"\n"}
              Key under the doormat{"\n"}
              Neighbour to give access to enter (name & contact ph)
            </RNText>
          </View>

          <View className="mb-4">
            <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginBottom: 8, marginTop: 10 }}>
              Any special instructions or notes about your dog?
            </RNText>
            <TextInput
              value={specialInstruct}
              onChangeText={setSpecialInstruct}
              mode="outlined"
              className="mb-4"
              placeholder="See examples below."
              placeholderTextColor="#888888"
              outlineColor="#ccc"
              multiline   // 👈 allows multiple lines
              numberOfLines={4} // 👈 default height
              style={{
                backgroundColor: '#cccccc',
                minHeight: 100, // 👈 ensures it looks like a text area
                textAlignVertical: 'top', // 👈 keeps text starting at the top
              }}
              contentStyle={{ color: '#333333' }}
            />
            <RNText
              style={{
                fontFamily: fonts.medium,
                fontSize: 14,
                color: '#999999',
                marginBottom: 8,
                marginTop: 10,
              }}
            >
              <RNText
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 14,
                  color: '#999999',
                  marginBottom: 8,
                  marginTop: 10,
                }}
              >
                Examples:{"\n"}
              </RNText>
              Anxious around strangers{"\n"}
              Allergies (please specify){"\n"}
              Aggressive or protective behavior{"\n"}
              Medical conditions or medications{"\n"}
              Favourite treats or toys to calm them{"\n"}
              Best way to approach (slowly, quietly, etc.){"\n"}
              Avoid loud noises or sudden movements{"\n"}
              Dogs that need to stay on leash or in a specific area{"\n"}
              Other pets on property (cats, chickens, etc.){"\n"}
            </RNText>
          </View>

          {/* Home Notes */}
          <View className="mb-4">
            <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginBottom: 8 }}>Any notes to help us find your home?</RNText>
            <TextInput
              value={homeNotes}
              onChangeText={setHomeNotes}
              mode="outlined"
              placeholder="e.g., down a long driveway, flat at the back, landmarks"
              placeholderTextColor="#888888"
              outlineColor="#ccc"
              multiline
              numberOfLines={4}
              style={{ backgroundColor: '#cccccc', minHeight: 100, textAlignVertical: 'top' }}
              contentStyle={{ color: '#333333' }}
            />
          </View>

          {(isPremium || isArtificialGrass) && (
            <TouchableOpacity
              onPress={() => setHasOutdoorTap(!hasOutdoorTap)}
              style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
            >
              <View style={{
                width: 26, height: 26, borderWidth: 1.5, borderColor: '#195E4B', borderRadius: 4,
                justifyContent: 'center', alignItems: 'center', backgroundColor: hasOutdoorTap ? '#195E4B' : '#fff'
              }}>
                {hasOutdoorTap && <RNText style={{ color: '#fff', fontSize: 18 }}>✓</RNText>}
              </View>
              <RNText style={{ marginLeft: 8 }}>I have an outdoor tap and hose that can be used for yard maintenance and repair</RNText>
            </TouchableOpacity>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            buttonColor="#195E4B"   // background color
            textColor="#FFFFFF"     // text color
            style={{
              paddingVertical: 12,
              borderRadius: 6,
              marginTop: 15,
            }}
            labelStyle={{ fontSize: 16, fontWeight: '800' }}
          >
            Submit Details
          </Button>
        </View>
      )}

      {/* Visit Form Toggle */}
      <TouchableOpacity
        onPress={() => setOpenForm(openForm === "visit" ? null : "visit")}
        style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}
      >
        <RNText style={{ fontSize: 18, fontFamily: fonts.bold, color: '#195E4B' }}>
          {openForm === "visit" ? '– ' : '+ '} Arrange a visit
        </RNText>
      </TouchableOpacity>

      {openForm === "visit" && (
        <View>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 15, color: '#999999', lineHeight: 24 }}>
            We can arrange for a member of our Doozy team to visit your home for an initial meet-and-greet.
          </RNText>

          <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginTop: 16, marginBottom: 8 }}>
            Best day(s) of the week for the visit?
          </RNText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {days.map(day => {
              const isSelected = selectedDays.includes(day);
              return (
                <Button
                  key={day}
                  mode={isSelected ? "contained" : "outlined"}
                  onPress={() => toggleDay(day)}
                  compact
                  uppercase={false}
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                    borderColor: "#195E4B",
                    borderWidth: isSelected ? 0 : 1,
                    backgroundColor: isSelected ? "#195E4B" : "transparent",
                    borderRadius: 5,
                  }}
                  labelStyle={{ color: isSelected ? "white" : "#195E4B", fontSize: 14 }}
                >
                  {day}
                </Button>
              );
            })}
          </View>

          <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginTop: 16, marginBottom: 8 }}>
            Preferred time for the visit?
          </RNText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {times.map(time => {
              const isSelected = selectedTimes.includes(time);
              return (
                <Button
                  key={time}
                  mode={isSelected ? "contained" : "outlined"}
                  onPress={() => toggleTime(time)}
                  compact
                  uppercase={false}
                  style={{
                    marginRight: 8,
                    marginBottom: 8,
                    borderColor: "#195E4B",
                    borderWidth: isSelected ? 0 : 1,
                    backgroundColor: isSelected ? "#195E4B" : "transparent",
                    borderRadius: 5,
                  }}
                  labelStyle={{ color: isSelected ? "white" : "#195E4B", fontSize: 14 }}
                >
                  {time}
                </Button>
              );
            })}
          </View>

          <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999', marginTop: 16, marginBottom: 8 }}>
            Any notes to help us find your home?
          </RNText>
          <TextInput
            value={homeNotes}
            onChangeText={setHomeNotes}
            mode="outlined"
            placeholder="e.g., down a long driveway, flat at the back, landmarks"
            placeholderTextColor="#888888"
            outlineColor="#ccc"
            multiline
            numberOfLines={4}
            style={{ backgroundColor: '#cccccc', minHeight: 100, textAlignVertical: 'top' }}
            contentStyle={{ color: '#333333' }}
          />

          <Button
            mode="contained"
            onPress={handleVisitSubmit}
            buttonColor="#195E4B"   // background color
            textColor="#FFFFFF"     // text color
            style={{
              paddingVertical: 12,
              borderRadius: 6,
              marginTop: 15,
            }}
            labelStyle={{ fontSize: 16, fontWeight: '800' }}
          >
            Arrange a Visit
          </Button>
        </View>
      )}
    </StyledView>
  );
}
