import React, { useEffect, useState } from 'react';
import { View, Text as RNText, ScrollView, Image } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { styled } from "nativewind";
import { RootState, setUserDetails } from "../../store/store";
import firestore from '@react-native-firebase/firestore';
import { setSelectedDates } from "../../store/bookingSlice";

import BottomMenu from '../Menus/BottomMenu';
import fonts from '../../assets/fonts/fonts.js';

const StyledView = styled(View);

export default function PaymentSuccessBookingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const bookingRedux = useSelector((state: RootState) => state.booking);
  const user = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(false);

  const backToDoozyHome = () => navigation.navigate("DoozyHome");

  useEffect(() => {
    const confirmBookings = async () => {
      console.log("Booking Redux state:", bookingRedux);
      console.log("User info:", user);
      console.log("Selected slotKeys:", bookingRedux.selectedDates);

      if (!user?.uid || !bookingRedux.selectedDates?.length) {
        console.log("No user UID or no selected dates found.");
        setLoading(false);
        return;
      }

      try {
        const userRef = firestore().collection("users").doc(user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          console.error("User doc not found");
          setLoading(false);
          return;
        }

        // Get existing user bookings safely
        let userBookings: any[] = Array.isArray(userDoc.data()?.booking)
          ? userDoc.data()?.booking
          : [];

        for (const slotKey of bookingRedux.selectedDates) {
          const bookingData = bookingRedux.bookings.find(b => b.slotKey === slotKey);

          if (!bookingData) {
            console.warn(`No bookingData found for slotKey: ${slotKey}, skipping.`);
            continue;
          }

          // Ensure booking ID exists or generate a new one
          const bookingId = bookingData.id ?? firestore().collection("bookings").doc().id;

          const bookingDoc = {
            BookingType: bookingData.BookingType ?? "custom",
            bookedByUid: user.uid ?? "",
            bookingServices: {
              deod: bookingData.deodSelected ?? false,
              doo: bookingData.dooSelected ?? false,
              walk: bookingData.walkSelected ?? false,
            },
            confirmed: true,
            createdAt: bookingData.createdAt ?? firestore.FieldValue.serverTimestamp(),
            date: bookingData.date ?? 0,
            employeeId: bookingData.employeeId ?? "",
            employeeName: bookingData.employeeName ?? "",
            id: bookingId,
            slot: bookingData.slot ?? "",
            slotKey: bookingData.slotKey ?? "",
            userDetails: {
              accessYard: user.extraDetails?.accessYard ?? "",
              address: user.address?.formattedAddress ?? "",
              dogBreeds: user.dogBreeds ?? "",
              email: user.email ?? "",
              homeNotes: user.extraDetails?.homeNotes ?? "",
              lat: user.address?.lat ?? null,
              lng: user.address?.lng ?? null,
              name: user.name ?? "",
              numberOfDogs: Number(user.numberOfDogs) || 0,
              phone: user.phone ?? "",
              specialInstruct: user.extraDetails?.specialInstruct ?? "",
            },
          };

          // Write/update booking in Firestore (merge ensures overwrite)
          const bookingRef = firestore().collection("bookings").doc(bookingId);
          await bookingRef.set(bookingDoc, { merge: true });
          console.log(`Booking doc written/updated: ${bookingId}`);

          // Update user's bookings array safely with overwrite logic
          const userBookingObj = {
            confirmed: bookingDoc.confirmed,
            date: bookingDoc.date,
            dooSelected: bookingDoc.bookingServices.doo,
            walkSelected: bookingDoc.bookingServices.walk,
            deodSelected: bookingDoc.bookingServices.deod,
            employeeId: bookingDoc.employeeId,
            employeeName: bookingDoc.employeeName,
            id: bookingDoc.id,
            slotKey: bookingDoc.slotKey,
            yardSize: bookingData.yardSize ?? null,
          };

          const existingIndex = userBookings.findIndex(b => b.id === bookingDoc.id);
          if (existingIndex > -1) {
            userBookings[existingIndex] = userBookingObj;
          } else {
            userBookings.push(userBookingObj);
          }
        }

        // Write back updated user bookings array
        await userRef.update({ booking: userBookings });
        dispatch(setUserDetails({ booking: userBookings }));
        console.log("User bookings updated with overwrite logic");

      } catch (err: any) {
        console.error("Error confirming/creating bookings:", err.code, err.message);
      } finally {
        // Clear Redux state automatically after all bookings saved
        dispatch(setSelectedDates([]));
        dispatch(setBookings([]));
        setLoading(false);
        console.log("All bookings processed, Redux cleared, loading set to false.");
      }
    };

    confirmBookings();
  }, []);

  return (
    <View className="flex-1 p-4 bg-gray-100" style={{ backgroundColor: '#E9FCDA', minHeight: '100%' }}>
      <ScrollView style={{ padding: 20 }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('../../assets/images/Doozy_dog_logo.png')}
            style={{ width: 325, height: 325 }}
            resizeMode="contain"
          />
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 32, color: '#195E4B', textAlign: 'center' }}>
            Booking Confirmed!
          </RNText>
          <RNText style={{ fontFamily: fonts.medium, fontSize: 22, color: '#999999', lineHeight: 26, paddingTop: 20, textAlign: 'center' }}>
            {loading ? "Finalizing your booking..." : "Your booking was successfully confirmed! Thank you for choosing Doozy."}
          </RNText>
        </View>

        {!loading && (
          <Button
            mode="contained"
            buttonColor="#195E4B"
            textColor="#FFFFFF"
            onPress={backToDoozyHome}
            style={{ marginTop: 10, marginBottom: 20 }}
          >
            Back Home
          </Button>
        )}
      </ScrollView>

      <BottomMenu />
    </View>
  );
}
