import React, { useEffect, useState, useMemo, useCallback } from "react";
import { View, Text as RNText, TouchableOpacity, FlatList, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigation } from "@react-navigation/native";
import fonts from "../../assets/fonts/fonts";

interface ServiceNote {
  id: string;
  date: any;
  notes: string;
  services: string[];
  adminNotes?: string;
  timeAtHouse?: string;
  timeLeavingHouse?: string;
}

interface Props {
  userId: string;
}

const ServiceNoteItem = React.memo(({ item, user, onEdit }: any) => (
  <View style={styles.noteCard}>
    <RNText style={styles.dateText}>
      {item.date
        ? item.date.toDate().toLocaleString("en-NZ", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "—"}
    </RNText>

    {item.services.length > 0 && (
      <RNText style={styles.servicesText}>{item.services.join(", ")}</RNText>
    )}

    <RNText style={styles.notesText}>{item.notes}</RNText>

    {user.isAdmin && (
      <>
        {item.adminNotes ? <RNText style={styles.adminNotes}>Admin Notes: {item.adminNotes}</RNText> : null}
        {item.timeAtHouse ? <RNText style={styles.times}>Time at House: {item.timeAtHouse}</RNText> : null}
        {item.timeLeavingHouse ? <RNText style={styles.times}>Time Leaving: {item.timeLeavingHouse}</RNText> : null}
      </>
    )}

    {user.isAdmin && (
      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <RNText style={styles.editButtonText}>Edit Note</RNText>
      </TouchableOpacity>
    )}
  </View>
));

export default function UserServiceNotes({ userId }: Props) {
  const [serviceNotes, setServiceNotes] = useState<ServiceNote[]>([]);
  const [showAll, setShowAll] = useState(false);
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection("users")
      .doc(userId)
      .collection("serviceNotes")
      .orderBy("date", "desc")
      .limit(50)
      .onSnapshot((snap) => {
        if (!snap || snap.empty) {
          setServiceNotes([]);
          return;
        }
        const data = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            notes: d.notes || "",
            services: Array.isArray(d.services) ? d.services : [],
            date: d.date || null,
            adminNotes: d.adminNotes || "",
            timeAtHouse: d.timeAtHouse || "",
            timeLeavingHouse: d.timeLeavingHouse || "",
          } as ServiceNote;
        });
        setServiceNotes(data);
      });

    return () => unsubscribe();
  }, [userId]);

  const MAX_VISIBLE = 6;
  const displayedNotes = showAll ? serviceNotes : serviceNotes.slice(0, MAX_VISIBLE);

  const handleEdit = useCallback(
    (noteId: string) => navigation.navigate("EditUserServiceNote", { userId, noteId }),
    [navigation, userId]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        <RNText style={styles.title}>Service Notes</RNText>

        {serviceNotes.length === 0 ? (
          <RNText style={styles.noNotes}>No notes yet.</RNText>
        ) : (
          <FlatList
            data={displayedNotes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ServiceNoteItem item={item} user={user} onEdit={() => handleEdit(item.id)} />
            )}
            scrollEnabled={false} // ScrollView handles scrolling
          />
        )}

        {serviceNotes.length > MAX_VISIBLE && (
          <TouchableOpacity
            style={[styles.showMoreButton, { backgroundColor: showAll ? "#999" : "#195E4B" }]}
            onPress={() => setShowAll(!showAll)}
          >
            <RNText style={styles.showMoreText}>{showAll ? "Show Less" : "Show More"}</RNText>
          </TouchableOpacity>
        )}

        {user.isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("AddUserServiceNotes", { userId })}
          >
            <RNText style={styles.addButtonText}>Add Service Notes</RNText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 22, color: "#195E4B", marginBottom: 12 },
  noNotes: { fontFamily: fonts.medium, fontSize: 16, color: "#999" },
  noteCard: { marginBottom: 16, padding: 12, backgroundColor: "#fff", borderRadius: 6, borderWidth: 1, borderColor: "#ddd" },
  dateText: { fontFamily: fonts.medium, fontSize: 14, color: "#333" },
  servicesText: { marginTop: 6, fontFamily: fonts.medium, color: "#195E4B" },
  notesText: { marginTop: 6, fontFamily: fonts.regular, color: "#444" },
  adminNotes: { marginTop: 6, fontFamily: fonts.medium, color: "#b00" },
  times: { marginTop: 2, fontFamily: fonts.regular, color: "#555" },
  editButton: { padding: 10, backgroundColor: "#2980b9", borderRadius: 6, marginTop: 10 },
  editButtonText: { color: "#fff", textAlign: "center", fontSize: 14 },
  showMoreButton: { padding: 10, borderRadius: 6, marginBottom: 10, marginTop: 10 },
  showMoreText: { color: "#fff", textAlign: "center" },
  addButton: { marginTop: 16, padding: 10, backgroundColor: "#195E4B", borderRadius: 6 },
  addButtonText: { color: "#fff", textAlign: "center" },
});
