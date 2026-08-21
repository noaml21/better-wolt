import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // מניח שיש לכם קובץ api מסודר

export default function EditProfileScreen({ navigation }) {
    const { user } = useAuth();

    // שמים כברירת מחדל את הערכים הנוכחיים של המשתמש
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');

    const handleSave = async () => {
        try {
            // שליחת הנתונים המעודכנים לשרת שלכם
            const response = await api.put('/users/update-profile', {
                userId: user?._id,
                username: username,
                email: email
            });

            Alert.alert("הצלחה", "הפרטים עודכנו בבסיס הנתונים!");
            navigation.goBack(); // חוזרים למסך הבית

        } catch (error) {
            Alert.alert("שגיאה", "משהו השתבש בעדכון הפרטים");
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>עריכת פרופיל</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>שם משתמש:</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>אימייל:</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>שמור שינויים</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', marginTop: 20 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 16, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 },
    saveButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});