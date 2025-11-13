import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import serviceAreasData from '../../data/serviceAreas.json';


const dayOrder = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const formatDisplayName = (fullName: string = "") => {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0]; // single name fallback

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}`;
};

const makeDefaultRules = (employeeId: string, fullName: string) => ({
  employeeId,
  name: formatDisplayName(fullName), // e.g. "Andrew O"
  profilePic: "default.png",
  serviceAreas: [],
  days: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  },
});

export default function AvailabilityEditor() {
  const user = useSelector((state: any) => state.user); // ✅ correct
  const employeeId = user?.employeeId;

  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<any>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [tempStart, setTempStart] = useState("08:00");
  const [tempEnd, setTempEnd] = useState("08:30");
  const [showSaveReminder, setShowSaveReminder] = useState(false);
  const [showServiceAreas, setShowServiceAreas] = useState(false);


  const isNZ = user?.address?.formattedAddress?.includes("New Zealand");
  const isAU = user?.address?.formattedAddress?.includes("Australia");

  useEffect(() => {
    if (!employeeId) return; // no employee, don't run

    const ref = firestore().collection('settings').doc(`bookingRules_${employeeId}`);

    const unsubscribe = ref.onSnapshot(async (snap) => {
      let data = snap.data();

      // If no document exists → create default
      if (!snap.exists || !data) {
        data = makeDefaultRules(employeeId, user?.name || '');
        await ref.set(data, { merge: true });
      }

      // 🛠 Normalize days — ensure all 7 keys exist and are arrays
      const fixedDays: Record<string, any[]> = {};
      dayOrder.forEach((day) => {
        fixedDays[day] = Array.isArray(data?.days?.[day]) ? data.days[day] : [];
      });

      setRules({ ...data, days: fixedDays });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [employeeId]);

  if (!employeeId) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>No employee ID found.</Text>
      </View>
    );
  }

  const toggleServiceArea = (code: string) => {
    setRules((prev) => {
      const list = prev.serviceAreas ?? [];
      return {
        ...prev,
        serviceAreas: list.includes(code)
          ? list.filter((c) => c !== code)
          : [...list, code],
      };
    });
    setShowSaveReminder(true);
  };

  const filteredServiceAreas = serviceAreasData.filter((area) => {
    const isNZArea = area.name.includes("Auckland") || area.name.includes("Hamilton") || area.name.includes("Wellington") || area.name.includes("Christchurch") || area.name.includes("Queenstown") || area.name.includes("Wanaka") || area.name.includes("Dunedin");
    const isAUArea = area.name.includes("Sydney") || area.name.includes("Melbourne") || area.name.includes("Brisbane") || area.name.includes("Perth") || area.name.includes("Adelaide");

    if (isNZ) return isNZArea;
    if (isAU) return isAUArea;
    return false; // default if no match
  });

  const save = async () => {
    try {
      await firestore().collection('settings').doc(`bookingRules_${employeeId}`).set(rules, { merge: true });
      Alert.alert('Saved');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const startAddSlot = (day: string) => {
    setEditingDay(day);
    setTempStart("08:00");
    setTempEnd("08:30");
  };

  const confirmAddSlot = () => {
    if (!editingDay) return;

    const newSlot = {
      start: tempStart,
      end: tempEnd,
      subscribed: false,
    };

    setRules((prev: any) => ({
      ...prev,
      days: {
        ...prev.days,
        [editingDay]: [
          ...(prev?.days?.[editingDay] ?? []),
          newSlot,
        ],
      },
    }));

    setEditingDay(null);
    setShowSaveReminder(true); // We'll add this
  };

  const removeSlot = (day: string, index: number) => {
    setRules((prev: any) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: prev.days[day].filter((_: any, i: number) => i !== index),
      },
    }));
  };

  if (loading || !rules) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading availability...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>

    <TouchableOpacity
      style={{ backgroundColor: 'green', padding: 14, borderRadius: 8, marginTop: 0, marginBottom: 10 }}
      onPress={save}
    >
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Save</Text>
    </TouchableOpacity>

    {showSaveReminder && (
      <Text style={{ color: 'red', marginBottom: 10 }}>
        Don't forget to press Save to apply your changes!
      </Text>
    )}

    <View style={{borderTopWidth: 1, borderTopColor: '#888', marginBottom: 10, marginTop: 10}} />

    <Text style={{ color: '#195E4B', fontWeight: '700', fontSize: 22, marginBottom: 0, marginTop: 10, textTransform: 'capitalize' }}>
      Add/Edit Service Areas
    </Text>

    <View style={{ marginTop: 10, marginBottom: 16 }}>
      <TouchableOpacity
        onPress={() => setShowServiceAreas(prev => !prev)}
        style={{
          paddingVertical: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderColor: '#ddd',
          backgroundColor: '#007bff',
          padding: 10,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontWeight: '700', fontSize: 18, color: '#fff' }}>
          Service Areas
        </Text>
        <Text style={{ fontSize: 28, color: '#fff' }}>{showServiceAreas ? "-" : "+"}</Text>
      </TouchableOpacity>
      {showServiceAreas && (
        <View style={{ paddingVertical: 10 }}>
          {filteredServiceAreas.map((area) => {
            const selected = rules?.serviceAreas?.includes(area.code);
            return (
              <TouchableOpacity
                key={area.code}
                onPress={() => toggleServiceArea(area.code)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: selected ? '#007bff' : '#999',
                    backgroundColor: selected ? '#007bff' : 'transparent',
                    marginRight: 10,
                  }}
                />
                <Text>{area.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

    </View>

    <View style={{borderTopWidth: 1, borderTopColor: '#888', marginBottom: 20}} />

    <Text style={{ color: '#195E4B', fontWeight: '700', fontSize: 22, marginBottom: 10, textTransform: 'capitalize' }}>
      Add/Edit Availability
    </Text>

      {dayOrder.map((day) => (
        <View key={day} style={{ marginBottom: 18 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 6, textTransform: 'capitalize' }}>
            {day}
          </Text>

          {rules.days[day].length === 0 ? (
            <Text style={{ color: '#777' }}>No slots</Text>
          ) : (
            rules.days[day].map((slot: any, index: number) => (
              <View
                key={index}
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}
              >
                <Text>{slot.start} - {slot.end}</Text>
                <TouchableOpacity onPress={() => removeSlot(day, index)}>
                  <Text style={{ color: 'red' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {editingDay === day ? (
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <TextInput
                  style={{ borderWidth: 1, padding: 6, width: 80, marginRight: 8 }}
                  value={tempStart}
                  onChangeText={setTempStart}
                  placeholder="Start"
                />
                <Text style={{ marginHorizontal: 4 }}>–</Text>
                <TextInput
                  style={{ borderWidth: 1, padding: 6, width: 80, marginLeft: 8 }}
                  value={tempEnd}
                  onChangeText={setTempEnd}
                  placeholder="End"
                />
              </View>

              <TouchableOpacity
                onPress={confirmAddSlot}
                style={{ backgroundColor: 'green', padding: 6, borderRadius: 6, marginBottom: 4 }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>Add Slot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditingDay(null)}
                style={{ backgroundColor: '#ccc', padding: 6, borderRadius: 6 }}
              >
                <Text style={{ textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => startAddSlot(day)}
              style={{ marginTop: 4, padding: 6, backgroundColor: '#007bff', borderRadius: 6 }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Add Slot</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}


      <View style={{paddingBottom: 200}} />
    </ScrollView>
  );
}
