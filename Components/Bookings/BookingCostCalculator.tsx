import React, { useEffect, useState } from 'react';
import { View, Text as RNText, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import fonts from '../../assets/fonts/fonts.js';
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDates } from '../../store/bookingSlice';


const StyledView = styled(View);

interface CostCalculatorProps {
  walkSelected: boolean;
  dooSelected: boolean;
  deodSelected: boolean;
  numberOfDogs: number;
  central: boolean;
  yardSize?: string | null;
  onTotalChange?: (total: number) => void; // new prop
}

interface LineItem {
  label: string;
  amount: number;
}

export default function BookingCostCalculator({
  walkSelected,
  dooSelected,
  deodSelected,
  numberOfDogs,
  central,
  yardSize,
  onTotalChange,
}: CostCalculatorProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [total, setTotal] = useState(0);
  const dispatch = useDispatch();

  // Get upcoming unconfirmed bookings from Redux
  const allBookings = useSelector((state: any) => state.booking?.bookings || []);
  const user = useSelector((state: RootState) => state.user);
  const selectedDates = useSelector((state: RootState) => state.booking.selectedDates);

  const dooPickupPlans = [
    "Twice a week Premium",
    "Once a week Premium Friday",
    "Once a week Premium",
    "Twice a week Artificial Grass",
    "Once a week Artificial Grass",
    "Twice a week",
    "Once a week Friday",
    "Once a week"
  ];

  // Sunday = 0, Monday = 1, ..., Saturday = 6
  const dooPickupServiceDays: Record<string, number[]> = {
    "Twice a week Premium": [1, 5],
    "Twice a week": [1, 5],
    "Twice a week Artificial Grass": [1, 5],
    "Once a week Premium Friday": [5],
    "Once a week Friday": [5],
    "Once a week Premium": [3],
    "Once a week": [3],
    "Once a week Artificial Grass": [3],
  };

  useEffect(() => {

    console.log('BookingCostCalculator recalculating...');
    console.log({ walkSelected, dooSelected, deodSelected, numberOfDogs, central, yardSize });

    const items: LineItem[] = [];
    let subtotal = 0;

    console.log('Line items:', items);
    console.log('Subtotal:', subtotal);

    // Count upcoming unconfirmed bookings
    const now = new Date().setHours(0, 0, 0, 0);
    const upcomingDates = selectedDates.map((slotKey) => {
      const [timestamp] = slotKey.split("-");
      return { date: Number(timestamp) };
    })
      .filter((b: any, idx: number, arr: any[]) => {
        const dayStart = new Date(b.date).setHours(0, 0, 0, 0);
        return !arr.slice(0, idx).some((prev: any) => new Date(prev.date).setHours(0, 0, 0, 0) === dayStart);
      });

    const numDates = upcomingDates.length || 1; // at least 1

    // --- Walk cost ---
    if (walkSelected) {
      const walkPrice = (central || dooPickupPlans.includes(user.subscription?.plan)) ? 45 : 55;
      const discountedPrice = numberOfDogs > 1 ? walkPrice * 0.75 : walkPrice;
      const totalDogsCost = discountedPrice * numberOfDogs * numDates; // multiply by dates

      items.push({
        label:
          numberOfDogs > 1
            ? `30min doggy street walk (${numberOfDogs} dogs — $${discountedPrice.toFixed(2)} each, 25% off!) x ${numDates} date(s)`
            : `30min doggy street walk x ${numDates} date(s)`,
        amount: totalDogsCost,
      });
      subtotal += totalDogsCost;
    }

    // --- Dog waste ---
    if (dooSelected) {
      const dooBasePrice = central ? 35 : 45;
      const dooTotal = dooBasePrice * numDates;

      items.push({
        label: `Dog poop waste removal x ${numDates} date(s)`,
        amount: dooTotal,
      });
      subtotal += dooTotal;

      const extraDogs = Math.max(0, numberOfDogs - 1);
      if (extraDogs > 0) {
        const extraDogsPrice = extraDogs * 5 * numDates;
        items.push({ label: `Extra dogs for waste removal`, amount: extraDogsPrice }); // label without x dates
        subtotal += extraDogsPrice;
      }
    }

    // --- Deodorising ---
    if (deodSelected) {
      const deodTotal = 5 * numDates;
      items.push({ label: 'Deodorising spray', amount: deodTotal }); // label without x dates
      subtotal += deodTotal;
    }

    // --- Yard size ---
    if (yardSize && dooSelected) {
      let yardPrice = 0;
      if (yardSize.includes('Medium')) yardPrice = 5;
      else if (yardSize.includes('Large')) yardPrice = 15;

      if (yardPrice > 0) {
        const yardTotal = yardPrice * numDates;
        items.push({ label: 'Yard size adjustment', amount: yardTotal }); // label without x dates
        subtotal += yardTotal;
      }
    }

    // --- Combo discount ---
    if (walkSelected && dooSelected) {
      const discount = subtotal * 0.25;
      items.push({ label: 'Combo discount (25%)', amount: -discount });
      subtotal -= discount;
    }

    // --- Multi-date discount ---
    if (numDates > 1) {
      const multiDiscount = subtotal * 0.15;
      items.push({
        label: `Multi-date discount (15% off for ${numDates} bookings)`,
        amount: -multiDiscount,
      });
      subtotal -= multiDiscount;
    }

    // --- Current subscriber discount (20%) per eligible date ---
    if (user.subscription?.plan && dooPickupPlans.includes(user.subscription.plan)) {
      const serviceDays = dooPickupServiceDays[user.subscription.plan] || [];

      // Count only selected dates that match service days
      const eligibleDates = upcomingDates.filter((b: any) => {
        const date = new Date(b.date);
        return serviceDays.includes(date.getDay());
      });

      if (eligibleDates.length > 0) {
        let subscriberDiscount = 0;

        // Compute discount **per eligible date** for doo service only
        eligibleDates.forEach(() => {
          // assume doo cost per date as previously calculated
          const dooBasePrice = central ? 35 : 45;
          const extraDogs = Math.max(0, numberOfDogs - 1);
          const dooTotalPerDate = dooBasePrice + extraDogs * 5;
          subscriberDiscount += dooTotalPerDate * 0.2;
        });

        items.push({
          label: `Discount for booking on your regular doo pickup day (20%)`,
          amount: -subscriberDiscount,
        });
        subtotal -= subscriberDiscount;
      }
    }

    // --- ✅ First booking discount (20%) ---
    const hasConfirmedBookings =
      user?.bookings?.some((b: any) => b.confirmed === true) ?? false;

    if (!hasConfirmedBookings) {
      const firstBookingDiscount = subtotal * 0.20;
      items.push({
        label: 'First booking discount (20%)',
        amount: -firstBookingDiscount,
      });
      subtotal -= firstBookingDiscount;
    }

    console.log('After adding walk cost:', items, subtotal);

    setLineItems(items);
    setTotal(subtotal);

    // Pass total back to parent
    if (onTotalChange) {
      onTotalChange(subtotal);
    }

  }, [walkSelected, dooSelected, deodSelected, numberOfDogs, central, yardSize, allBookings, selectedDates]);

  const removeDate = (dateToRemove: string) => {
    const newDates = selectedDates.filter(date => date !== dateToRemove);
    dispatch(setSelectedDates(newDates));
  };

  return (
    <StyledView style={{ padding: 16, backgroundColor: '#f9f9f9', borderRadius: 10, marginTop: 20 }}>
      <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: '#195E4B', marginBottom: 12 }}>
        Your Booking Summary
      </RNText>

      {/* Selected Booking Dates (not confirmed yet) */}
      {selectedDates.map((dateKey) => {
        if (!dateKey) return null; // skip invalid entries
        const [timestamp] = dateKey.split("-");
        const dateNum = Number(timestamp);
        const dateStr = new Date(dateNum).toLocaleDateString("en-NZ", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

        const matchingBooking = allBookings.find((b: any) => {
          if (!b.slotKey) return false; // skip invalid slotKey
          const [bTimestamp] = b.slotKey.split("-");
          return Number(bTimestamp) === dateNum;
        });

        const [ , start = "", end = "" ] = (matchingBooking?.slotKey || "").split("-");
        const employeeName = matchingBooking?.employeeName || "TBD";

        return (
          <View
            key={dateKey}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 8,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 6,
              marginBottom: 6,
            }}
          >
            {/* Text column */}
            <View style={{ flex: 1 }}>
              <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: '#333', marginBottom: 2 }}>
                {dateStr} - {start}-{end}
              </RNText>
              <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: '#333' }}>
                 with {employeeName}
              </RNText>
            </View>

            {/* Remove button */}
            <TouchableOpacity onPress={() => removeDate(dateKey)}>
              <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: "red" }}>×</RNText>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* Line items */}
      {lineItems.map((item, idx) => (
        <View
          key={idx}
          style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
        >
          <RNText
            style={{
              fontFamily: fonts.medium,
              fontSize: 16,
              color: '#333',
              flex: 1,
              flexWrap: 'wrap',
              marginRight: 10,
            }}
          >
            {item.label}
          </RNText>
          <RNText
            style={{
              fontFamily: fonts.medium,
              fontSize: 16,
              color: '#333',
              textAlign: 'right',
              minWidth: 60,
            }}
          >
            ${item.amount.toFixed(2)}
          </RNText>
        </View>
      ))}

      <View style={{ borderTopWidth: 1, borderTopColor: '#ccc', marginVertical: 10 }} />

      {/* Total */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: '#195E4B' }}>TOTAL</RNText>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 18, color: '#195E4B' }}>${total.toFixed(2)}</RNText>
      </View>
    </StyledView>
  );
}
