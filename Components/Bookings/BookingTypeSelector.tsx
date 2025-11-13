import 'react-native-get-random-values';
import React, { useState, useEffect } from "react";
import { View, Text as RNText, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { TextInput, Button, Checkbox, Menu, HelperText } from "react-native-paper";
import { styled } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setUserDetails } from '../../store/store';
import { setUser } from "../../store/authSlice";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import fonts from '../../assets/fonts/fonts.js';
import BookingCostCalculator from './BookingCostCalculator';
import BookingCalendar from './BookingCalendar';
import { addBooking, setSelectedDate, setBookingComplete, setSelectedDates, } from '../../store/bookingSlice';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import InAppBrowser from "react-native-inappbrowser-reborn";

const StyledView = styled(View);

export default function BookingAndOwnerForm() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const plan = useSelector((state: RootState) => state.plan);
  const user = useSelector((state: RootState) => state.user);
  // 🗓️ Create booking locally in Redux only
  const selectedDates = useSelector((state: RootState) => state.booking.selectedDates) || [];
  const userFromRedux = useSelector((state: RootState) => state.user);
  const central = user.address?.central || false;

  // --- Booking selections ---
  const [walkSelected, setWalkSelected] = useState(false);
  const [dooSelected, setDooSelected] = useState(false);
  const [yardSize, setYardSize] = useState<string | null>(null);
  const [deodSelected, setDeodSelected] = useState(false);
  const [yardMenuVisible, setYardMenuVisible] = useState(false);
  const [numberOfDogsError, setNumberOfDogsError] = useState('');
  const [bookingTotal, setBookingTotal] = useState(0);
  const [assignedEmployee, setAssignedEmployee] = useState<{ id: string; name: string } | null>(null);

  const yardSizes = [
    { label: "Small - Typical townhouse or small backyard" },
    { label: "Medium - Standard suburban backyard" },
    { label: "Large - Big property" },
  ];

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

  const baseWalkPrice = (central || dooPickupPlans.includes(user.subscription?.plan)) ? 45 : 55;
  const discountedPrice = (baseWalkPrice * 0.75).toFixed(2);
  const extraDogText = `We love walking multiple dogs, but we only do one at a time. For each extra dog, a separate 30min walk will be arranged at just $${discountedPrice} each (instead of $${baseWalkPrice} each) — making it easy and fair!`;

  // --- Owner form fields ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dogBreeds, setDogBreeds] = useState("");
  const [numberOfDogs, setNumberOfDogs] = useState<string | null>(null);
  const [accessYard, setAccessYard] = useState("");
  const [specialInstruct, setSpecialInstruct] = useState("");
  const [homeNotes, setHomeNotes] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [dogBreedsError, setDogBreedsError] = useState(false);
  const [accessYardError, setAccessYardError] = useState(false);
  const [yardSizeError, setYardSizeError] = useState(false);

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDogBreeds(user.dogBreeds || "");
      setNumberOfDogs(user.numberOfDogs || null);
      setAccessYard(user.accessYard || user.extraDetails?.accessYard || "");
      setSpecialInstruct(user.specialInstruct || user.extraDetails?.specialInstruct || "");
      setHomeNotes(user.homeNotes || user.extraDetails?.homeNotes || "");
      setYardSize(user.yardSize || "");
      setWalkSelected(false); // default false, unless you want to auto-check
      setDooSelected(false);  // default false, unless you want to auto-check
      setDeodSelected(false); // default false, unless you want to auto-check
    }
  }, [user]);

  const inputProps = {
    mode: "outlined",
    placeholderTextColor: "#888888",
    style: { color: "#333333", backgroundColor: "#ccc", marginBottom: 16 },
    theme: { colors: { text: "#333333", placeholder: "#888888", primary: "#195E4B", surface: "#ccc" } },
    contentStyle: { color: '#333333' },
  };

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const generateRandomPassword = (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleSubmit = async () => {
    let firebaseUser = auth().currentUser;

    // ✅ Validate inputs
    if (!walkSelected && !dooSelected) return Alert.alert("Select at least one service");
    if (!name.trim()) return Alert.alert("Enter your name");
    if (!email.trim()) return Alert.alert("Enter your email");
    if (!validateEmail(email)) return Alert.alert("Enter a valid email");
    if (!firebaseUser && !password.trim()) return Alert.alert("Enter a password");
    if (!phone.trim()) return Alert.alert("Enter your phone number");
    if (!dogBreeds.trim()) return Alert.alert("Enter dog breeds");
    if (!numberOfDogs || parseInt(numberOfDogs) < 1) return Alert.alert("At least 1 dog");
    if (parseInt(numberOfDogs) > 3) return Alert.alert("Max 3 dogs");
    if (!accessYard.trim()) return Alert.alert("Tell us how we access yard");
    if (dooSelected && !yardSize) return Alert.alert("Tell us the yard size");
    if (!assignedEmployee) return Alert.alert("Select an employee for your booking");
    if (!acceptedTerms) return Alert.alert("Accept Terms & Conditions");
    if (!selectedDates.length) return Alert.alert("Select at least one booking date");

    setLoading(true);

    try {
      // ✅ Create Firebase user if needed
      if (!firebaseUser) {
        const signInMethods = await auth().fetchSignInMethodsForEmail(email.trim());
        if (signInMethods.length > 0) {
          setLoading(false);
          return Alert.alert("Email registered", "Log in or use a different email");
        }

        const userCred = await auth().createUserWithEmailAndPassword(email.trim(), password);
        firebaseUser = userCred.user;

        const userData = {
          uid: firebaseUser.uid,
          email: email.trim(),
          name: name.trim(),
          phone,
          dogBreeds,
          numberOfDogs: parseInt(numberOfDogs),
          extraDetails: { accessYard, specialInstruct, homeNotes },
          role: "user",
          booking: [], // start empty
        };

        await firestore().collection("users").doc(firebaseUser.uid).set(userData);
        dispatch(setUserDetails(userData));
      }

      // ✅ Create booking documents
      const bookingServices = { walk: walkSelected, doo: dooSelected, deod: deodSelected };
      const userDetails = {
        name,
        email,
        phone,
        dogBreeds,
        numberOfDogs: parseInt(numberOfDogs),
        address: user.address?.formattedAddress || "",
        lat: user.address?.lat ?? null,
        lng: user.address?.lng ?? null,
        accessYard,
        specialInstruct,
        homeNotes,
      };

      const bookingsArray: any[] = [];

      for (const slotKey of selectedDates) {
        const [timestampStr, slot, employeeId] = slotKey.split("-");
        const timestamp = parseInt(timestampStr, 10);
        const employee = assignedEmployee || { id: employeeId, name: "Unknown" };

        const bookingRef = firestore().collection("bookings").doc();

        const newBooking = {
          id: bookingRef.id,
          bookedByUid: firebaseUser.uid,
          BookingType: plan.selectedPlan || "custom",
          bookingServices,
          date: timestamp,
          slot,
          employeeId: employee.id,
          employeeName: employee.name,
          confirmed: false,
          createdAt: firestore.FieldValue.serverTimestamp(),
          userDetails,
          slotKey,
        };

        await bookingRef.set(newBooking);
        dispatch(addBooking(newBooking));

        bookingsArray.push({
          confirmed: false,
          date: timestamp,
          dooSelected,
          walkSelected,
          deodSelected,
          yardSize: yardSize || null,
          employeeId: employee.id,
          employeeName: employee.name,
          id: bookingRef.id,
          slotKey,
        });
      }

      // ✅ Update Firestore user bookings array
      const userRef = firestore().collection("users").doc(firebaseUser.uid);
      await userRef.update({
        booking: firestore.FieldValue.arrayUnion(...bookingsArray),
      });

      // ✅ Update Redux user state
      const updatedUserBookings = [
        ...(user?.booking ?? []),
        ...bookingsArray,
      ];
      dispatch(setUserDetails({ booking: updatedUserBookings }));

      // ✅ Clear selected dates + mark complete
      // dispatch(setSelectedDates([]));
      dispatch(setBookingComplete(true));

      // ✅ Trigger payment if needed
      if (bookingTotal > 0) {
        await handlePayCallback(bookingTotal, bookingsArray.map(b => b.id), firebaseUser);
      } else {
        Alert.alert("Booking complete!", "No payment required.");
        navigation.navigate("DoozyHome");
      }

    } catch (err: any) {
      console.error("Booking error:", err);
      Alert.alert("Booking failed", err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };


const handlePayCallback = async (amountCents: number, bookingIds: string[], firebaseUser: any) => {
  if (!firebaseUser) return Alert.alert("Error", "Firebase not initialized");

  setLoading(true);

  try {
    const idToken = await firebaseUser.getIdToken(true);

    const res = await fetch(
      "https://create-delayed-subscription-725766869893.australia-southeast1.run.app/create-callback-payment-session",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountCents, bookingIds }),
      }
    );

    const data = await res.json();
    if (!data.url) throw new Error("No checkout URL returned");

    if (await InAppBrowser.isAvailable()) {
      await InAppBrowser.open(data.url, {
        dismissButtonStyle: "close",
        preferredBarTintColor: "#195E4B",
        preferredControlTintColor: "white",
        animated: true,
        modalPresentationStyle: "fullScreen",
      });
    } else {
      Linking.openURL(data.url);
    }
  } catch (err) {
    console.error("Payment error:", err);
    Alert.alert("Error", err.message || JSON.stringify(err));
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <StyledView className="mb-6">
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', marginBottom: 6 }}>
          Select What Service You Want to Book
        </RNText>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: '#999999', marginBottom: 20 }}>
          Select both options for a 25% discount!
        </RNText>
      </StyledView>

      {/* Walk selection */}
      <TouchableOpacity
        onPress={() => setWalkSelected(!walkSelected)}
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          padding: 16,
          borderWidth: 2,
          borderColor: walkSelected ? "#195E4B" : "#cccccc",
          borderRadius: 8,
          backgroundColor: walkSelected ? "#DFF5E1" : "#fff",
          marginBottom: 12,
        }}
      >
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
        <MaterialIcons
          name={walkSelected ? "check-circle" : "radio-button-unchecked"}
          size={26}
          color={walkSelected ? "#195E4B" : "#999"}
        />
        <RNText
          style={{
            fontFamily: fonts.bold,
            fontSize: 16,
            marginLeft: 12,
            color: "#195E4B",
            flexShrink: 1,   // allows text to wrap instead of overflow
            flex: 1,         // take remaining horizontal space
          }}
        >
          30min premium doggy street walk
        </RNText>
      </View>

        {/* Always show walk details */}
        <View style={{ marginTop: 10, width: "100%" }}>
          {[
            "30-minute on-leash walk around your local neighbourhood",
            "Pick-up and drop-off from your home included",
            "Fresh water break and poop pickup during the walk",
            "Real-time updates via the Doozy app",
            "Friendly, dog-loving local service — guaranteed smiles",
          ].map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <MaterialIcons
                name="check"
                size={18}
                color={walkSelected ? "#195E4B" : "#999"}
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <RNText
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 14,
                  color: walkSelected ? "#333" : "#888",
                  flexShrink: 1,
                  flex: 1,
                }}
              >
                {item}
              </RNText>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* Doo selection */}
      <TouchableOpacity
        onPress={() => setDooSelected(!dooSelected)}
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          padding: 16,
          borderWidth: 2,
          borderColor: dooSelected ? "#195E4B" : "#cccccc",
          borderRadius: 8,
          backgroundColor: dooSelected ? "#DFF5E1" : "#fff",
          marginBottom: 12,
        }}
      >
        {/* Header with icon and title */}
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
          <MaterialIcons
            name={dooSelected ? "check-circle" : "radio-button-unchecked"}
            size={26}
            color={dooSelected ? "#195E4B" : "#999"}
          />
          <RNText
            style={{
              fontFamily: fonts.bold,
              fontSize: 16,
              marginLeft: 12,
              color: "#195E4B",
              flexShrink: 1,
              flex: 1,
            }}
          >
            Dog poop waste removal
          </RNText>
        </View>

        {/* Always show description */}
        <View style={{ marginTop: 10, width: "100%" }}>
          {[
            "Full backyard poop pickup — all areas included",
            "Easy one-time payment through the app — no bank transfers required!",
            "We can service even if you’re not home (dog-safe access)",
            "Friendly local service — satisfaction guaranteed",
          ].map((item, index) => (
            <View
              key={index}
              style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6 }}
            >
              <MaterialIcons
                name="check"
                size={18}
                color={dooSelected ? "#195E4B" : "#999"}
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <RNText
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 14,
                  color: dooSelected ? "#333" : "#888",
                  flexShrink: 1,
                }}
              >
                {item}
              </RNText>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {dooSelected && (
        <View style={{ marginTop: 12, padding: 16, borderRadius: 10, backgroundColor: '#f9f9f9' }}>
          <RNText style={{ fontFamily: fonts.bold, fontSize: 18, marginBottom: 12, color: '#195E4B' }}>
            Extra info & services
          </RNText>

          {/* Yard size dropdown */}
          <Menu
            visible={yardMenuVisible}
            onDismiss={() => setYardMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setYardMenuVisible(true)}
                style={{
                  padding: 14,
                  borderWidth: 2,
                  borderColor: yardSizeError ? 'red' : (yardSize ? '#195E4B' : '#ccc'),
                  borderRadius: 8,
                  backgroundColor: yardSize ? '#DFF5E1' : '#fff',
                  marginBottom: 12,
                }}
              >
                <RNText style={{ fontFamily: fonts.bold, fontSize: 16, color: yardSize ? '#195E4B' : '#195E4B' }}>
                  {yardSize || "How big is your yard?"}
                </RNText>
              </TouchableOpacity>
            }
          >
            {yardSizes.map(size => (
              <Menu.Item
                key={size.label}
                title={size.label}
                onPress={() => { setYardSize(size.label); setYardMenuVisible(false); }}
              />
            ))}
          </Menu>

          {/* Deodorising spray */}
          <TouchableOpacity
            onPress={() => setDeodSelected(!deodSelected)}
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: 14,
              borderWidth: 2,
              borderColor: deodSelected ? '#195E4B' : '#ccc',
              borderRadius: 8,
              backgroundColor: deodSelected ? '#DFF5E1' : '#fff',
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons
                name={deodSelected ? 'check-circle' : 'radio-button-unchecked'}
                size={26}
                color={deodSelected ? '#195E4B' : '#999'}
              />
              <RNText
                style={{
                  fontFamily: fonts.bold,
                  fontSize: 16,
                  marginLeft: 12,
                  color: '#195E4B',
                  flex: 1,
                  flexWrap: 'wrap',
                }}
              >
                I would like Deodorising spray
              </RNText>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* --- Dog Owner Details Form --- */}
      <StyledView style={{ marginTop: 20 }}>
        <RNText style={{ fontFamily: fonts.bold, fontSize: 24, color: '#195E4B', marginBottom: 10 }}>Dog Owner Details</RNText>

        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>Your Name</RNText>
        {nameError && <HelperText type="error">Name is required</HelperText>}
        <TextInput
          {...inputProps}
          placeholder="Jane Smith"
          value={name}
          onChangeText={text => { setName(text); setNameError(false); }}
          style={[
            inputProps.style,
            nameError ? { borderColor: 'red' } : {}
          ]}
        />


        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>Email</RNText>
        {emailError && <HelperText type="error" visible={emailError}>Please enter a valid email</HelperText>}
        <TextInput {...inputProps} placeholder="jane@doozy.co.nz" value={email} onChangeText={text => { setEmail(text); setEmailError(false); }} keyboardType="email-address" autoCapitalize="none" />


        {!user?.uid && (
          <>
            <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>
              Password
            </RNText>

            <RNText style={{ fontFamily: fonts.medium, fontSize: 12, color: '#666', marginBottom: 8 }}>
              Creating a login allows you to view special weekly discounts, see notes about our service at your house, follow your dog on our walks, and heaps of other member benefits.
            </RNText>

            <TextInput
              {...inputProps}
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(text.length < 6 ? "Password must be at least 6 characters" : "");
              }}
              secureTextEntry
            />
            {passwordError ? (
              <HelperText type="error" visible={!!passwordError}>
                {passwordError}
              </HelperText>
            ) : null}
          </>
        )}

        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>Phone</RNText>
        {phoneError && <HelperText type="error">Phone number is required</HelperText>}
        <TextInput
          {...inputProps}
          value={phone}
          onChangeText={text => { setPhone(text); setPhoneError(false); }}
          style={[
            inputProps.style,
            phoneError ? { borderColor: 'red' } : {}
          ]}
        />


        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>Dog Breed(s)</RNText>
        {dogBreedsError && <HelperText type="error">Dog breed(s) required</HelperText>}
        <TextInput
          {...inputProps}
          value={dogBreeds}
          onChangeText={text => { setDogBreeds(text); setDogBreedsError(false); }}
          style={[
            inputProps.style,
            dogBreedsError ? { borderColor: 'red' } : {}
          ]}
        />

        {walkSelected && numberOfDogs && parseInt(numberOfDogs) > 1 && parseInt(numberOfDogs) < 4 && (
          <RNText style={{ fontFamily: fonts.medium, fontSize: 14, color: '#FF0000', marginBottom: 10 }}>
            {extraDogText}
          </RNText>
        )}
        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>Number of Dogs</RNText>

        <TextInput
          {...inputProps}
          placeholder="1"
          value={numberOfDogs}
          onChangeText={(value) => {
            const numericValue = value.replace(/[^0-9]/g, '');
            setNumberOfDogs(numericValue);

            if (parseInt(numericValue || '0', 10) > 3) {
              setNumberOfDogsError('Maximum dogs service is 3 at one household.');
            } else {
              setNumberOfDogsError('');
            }
          }}
          keyboardType="numeric"
        />
        {numberOfDogsError ? (
          <RNText style={{ color: 'red', marginBottom: 10, fontFamily: fonts.medium }}>
            {numberOfDogsError}
          </RNText>
        ) : null}

        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>How do we access your yard / Pick up your dog for walkies?</RNText>
        {accessYardError && <HelperText type="error">Access instructions required</HelperText>}
        <TextInput
          {...inputProps}
          value={accessYard}
          onChangeText={text => { setAccessYard(text); setAccessYardError(false); }}
          multiline
          numberOfLines={4}
          placeholder="See examples below."
          placeholderTextColor="#888888"
          style={[
            inputProps.style,
            accessYardError ? { borderColor: 'red' } : {},
            { minHeight: 100, textAlignVertical: 'top' }
          ]}
        />


        <View>
          <RNText
            style={{
              fontFamily: fonts.medium,
              fontSize: 14,
              color: '#999999',
              marginBottom: 20,
              marginTop: 0,
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

        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>Any special instructions or notes about your dog?</RNText>
        <TextInput {...inputProps} value={specialInstruct} onChangeText={setSpecialInstruct} multiline numberOfLines={4} placeholder="See examples below." placeholderTextColor="#888888" style={{ ...inputProps.style, minHeight: 100, textAlignVertical: 'top' }} />
        <View>
          <RNText
            style={{
              fontFamily: fonts.medium,
              fontSize: 14,
              color: '#999999',
              marginBottom: 20,
              marginTop: 0,
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

        <RNText style={{ fontFamily: fonts.bold, fontSize: 14, color: '#999999' }}>Any notes to help us find your home?</RNText>
        <TextInput {...inputProps} value={homeNotes} onChangeText={setHomeNotes} multiline numberOfLines={4} style={{ ...inputProps.style, minHeight: 100, textAlignVertical: 'top' }} />

        <BookingCalendar
          user={user}
          name={name}
          email={email}
          phone={phone}
          dogBreeds={dogBreeds}
          numberOfDogs={numberOfDogs || ""}
          accessYard={accessYard}
          yardSize={yardSize}
          walkSelected={walkSelected}
          dooSelected={dooSelected}
          onEmployeeSelected={(id, name) => {
              console.log("Employee Selected:", id, name);
              setAssignedEmployee({ id, name });
            }}
        />

        <BookingCostCalculator
          walkSelected={walkSelected}
          dooSelected={dooSelected}
          deodSelected={deodSelected}
          numberOfDogs={numberOfDogs ? parseInt(numberOfDogs) : 1}
          central={user.address?.central || false}
          yardSize={yardSize}
          onTotalChange={setBookingTotal} // pass callback
        />

        {/* T&C */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            style={{
              width: 26, height: 26, borderWidth: 1.5, borderColor: '#195E4B', borderRadius: 4,
              justifyContent: 'center', alignItems: 'center', backgroundColor: acceptedTerms ? '#195E4B' : '#fff'
            }}
          >
            {acceptedTerms && <RNText style={{ color: '#fff', fontSize: 18 }}>✓</RNText>}
          </TouchableOpacity>
          <RNText style={{ marginLeft: 8 }}>I agree to the{' '}
            <RNText style={{ color: 'blue' }} onPress={() => navigation.navigate('Terms', { from: 'DoozyHome' })}>
              Terms & Conditions
            </RNText>
          </RNText>
        </View>

        <Button
          mode="contained"
          textColor="#FFFFFF"
          onPress={handleSubmit}
          disabled={loading || !acceptedTerms || !!numberOfDogsError || !numberOfDogs || parseInt(numberOfDogs || '0', 10) < 1}
          style={{
            paddingVertical: 12,
            borderRadius: 6,
            backgroundColor: loading || !acceptedTerms || !!numberOfDogsError || !numberOfDogs || parseInt(numberOfDogs || '0', 10) < 1
              ? '#999999'
              : '#195E4B',
            marginBottom: 40,
          }}
          labelStyle={{ fontSize: 16, fontWeight: '800' }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : "Book & Go to Payment"}
        </Button>
      </StyledView>
    </ScrollView>
  );
}
