import React, { useEffect, useMemo } from "react";
import { View, Text as RNText, Button } from "react-native";
import { styled } from "nativewind";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector, useDispatch } from "react-redux";
import { RootState, addBooking } from "../../store/store";
import fonts from "../../assets/fonts/fonts";

const StyledView = styled(View);

const BookingDetails = () => {
  const userBookings = useSelector((state: RootState) => state.user.booking) || [];
  const numberOfDogs = useSelector((state: RootState) => state.user.numberOfDogs);
  const user = useSelector((state: RootState) => state.user);

  const futureBookings = useMemo(() => {
    if (!userBookings.length) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const seen = new Set<number>();

    return userBookings
      .map(b => {
        const [ts, startTime, endTime] = b.slotKey.split("-");
        const bookingDate = new Date(Number(ts));

        return {
          ...b,
          bookingDate,
          startTime,
          endTime,
          walkSelected: !!b.walkSelected,
          dooSelected: !!b.dooSelected,
          yardSize: b.yardSize?.trim() || "",
          deodSelected: !!b.deodSelected,
          employeeName: b.employeeName || "TBD",
        };
      })
      .filter(b => {
        if (!b.confirmed) return false;

        const bookingDay = new Date(
          b.bookingDate.getFullYear(),
          b.bookingDate.getMonth(),
          b.bookingDate.getDate()
        );
        const time = bookingDay.getTime();
        if (time < today.getTime() || seen.has(time)) return false;
        seen.add(time);
        return true;
      })
      .sort((a, b) => a.bookingDate.getTime() - b.bookingDate.getTime());
  }, [userBookings]);

  if (!futureBookings.length) {
    return (
      <StyledView style={{ borderRadius: 5, padding: 20, marginBottom: 40, backgroundColor: "#eeeeee" }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 20, color: "#999999" }}>
          No upcoming one-off bookings
        </RNText>
      </StyledView>
    );
  }

  return (
    <StyledView style={{ borderRadius: 5, padding: 20, paddingBottom: 0, marginBottom: 40, backgroundColor: "#eeeeee" }}>
      <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: "#195E4B" }}>
        Upcoming bookings
      </RNText>
      <View style={{ paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#ccc" }} />
      {futureBookings.map((booking, idx) => {
        const { walkSelected, dooSelected, yardSize, deodSelected, bookingDate, startTime, endTime, employeeName, confirmed } = booking;

        // Format date
        const day = bookingDate.getDate();
        const weekday = bookingDate.toLocaleDateString("en-NZ", { weekday: "long" });
        const month = bookingDate.toLocaleDateString("en-NZ", { month: "long" });
        const year = bookingDate.getFullYear();
        const suffix =
          day % 10 === 1 && day !== 11 ? "st" :
          day % 10 === 2 && day !== 12 ? "nd" :
          day % 10 === 3 && day !== 13 ? "rd" : "th";
        const formattedDate = `${weekday} ${day}${suffix} ${month} ${year}`;

        // Service label
        const serviceLabel =
          walkSelected && dooSelected ? "Walk + Doo pickup" :
          walkSelected ? "Dog walk" :
          dooSelected ? "Doo pickup" :
          "Unknown service";

        // Yard size label
        const yardLabel = yardSize || "Not specified";

        const details = [
          {
            icon: "event",
            label: `Date: ${formattedDate}, ${startTime}-${endTime} — served by ${employeeName}`
          },
          { icon: "miscellaneous-services", label: `Service: ${serviceLabel}` },
          { icon: "yard", label: `Yard: ${yardLabel}` },
          { icon: "pets", label: `Number of dogs: ${numberOfDogs || "Not specified"}` },
          { icon: "check-circle", label: `Confirmed: ${confirmed ? "Yes" : "No"}` }
        ];

        if (deodSelected) details.push({ icon: "local-florist", label: "Extra: Deodorising spray" });

        return (
          <View key={idx} style={{ paddingBottom: 20, paddingTop: 20, borderBottomWidth: idx < futureBookings.length - 1 ? 1 : 0, borderBottomColor: "#ccc" }}>
            {details.map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <MaterialIcons name={item.icon} size={20} color="#195E4B" style={{ marginRight: 6 }} />
                <RNText style={{ fontFamily: fonts.medium, fontSize: 16, color: "#195E4B" }}>{item.label}</RNText>
              </View>
            ))}
          </View>
        );
      })}
    </StyledView>
  );
};

export default BookingDetails;

/*
redux if needed
<Button title="Show Redux Store" onPress={handlePress} color="#FF6347" />
*/
