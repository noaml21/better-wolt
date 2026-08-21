import React, { useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { register } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
export default function RegisterScreen({ navigation }) {
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        email: '',
        password: '',
        confirm: '',
        address: '',
        role: 'customer'
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // toDo : add picture
    const [preview, setPreview] = useState(null);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleImageChange = async () => {
        try {
            // 1. בקשת הרשאות לגשת לגלריה
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert("שגיאה", "נראה שסירבת לתת גישה לגלריה. לא נוכל להעלות תמונה.");
                return;
            }

            // 2. פתיחת הגלריה
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            // 3. אם המשתמש בחר תמונה (לא ביטל), נשמור את הנתיב שלה
            if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
                setPreview(pickerResult.assets[0].uri);
            }
        } catch (err) {
            console.error("Image picker error: ", err);
        }
    };

    const handleSubmit = async () => {
        const { username, displayName, email, password, confirm, address, role } = formData;

        // ולידציות
        if (!username.trim() || !displayName.trim() || !email.trim() || !password || !confirm || !address.trim()) {
            return setError('יש למלא את כל שדות החובה 🙃');
        }
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            return setError('הסיסמה חייבת להכיל לפחות 8 תווים, כולל אות וספרה.');
        }
        if (password !== confirm) {
            return setError('הסיסמאות אינן תואמות.');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return setError('מבנה כתובת האימייל אינו תקין.');
        }
        setError('');
        setIsLoading(true);
        try {
            // הכנת התמונה לשרת (הפיכה ל-Base64 כפי שהיה ב-Web)
            let base64Image = '';
            if (preview) {
                try {
                    const base64 = await FileSystem.readAsStringAsync(preview, { encoding: FileSystem.EncodingType.Base64 });
                    base64Image = `data:image/jpeg;base64,${base64}`;
                } catch (fsError) {
                    console.error("File system error: ", fsError);
                }
            }

            const payload = {
                username: username.trim(),
                displayName: displayName.trim(),
                email: email.trim(),
                password,
                address: address.trim(),
                image: base64Image,
                role
            };

            await register(payload);

            Alert.alert('איזה כיף!', 'הרשמה עברה בהצלחה! מעביר להתחברות...', [
                { text: 'המשך', onPress: () => navigation.navigate('Login') }
            ]);

        } catch (err) {
            setError('ההרשמה נכשלה: ' + (err?.message || 'שגיאה לא ידועה'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>הרשמה למערכת 📝</Text>

            {error !== '' && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <View style={styles.formGroup}>
                <Text style={styles.label}>שם משתמש</Text>
                <TextInput
                    style={styles.input}
                    value={formData.username}
                    onChangeText={(text) => handleChange('username', text)}
                    placeholder="בחר שם משתמש"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>שם תצוגה</Text>
                <TextInput
                    style={styles.input}
                    value={formData.displayName}
                    onChangeText={(text) => handleChange('displayName', text)}
                    placeholder="איך תרצה שנקרא לך?"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>כתובת אימייל</Text>
                <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    placeholder="הזן אימייל"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>כתובת משלוח</Text>
                <TextInput
                    style={styles.input}
                    value={formData.address}
                    onChangeText={(text) => handleChange('address', text)}
                    placeholder="הזן כתובת מלאה"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>סיסמה</Text>
                <TextInput
                    style={styles.input}
                    value={formData.password}
                    onChangeText={(text) => handleChange('password', text)}
                    placeholder="8 תווים, אות וספרה"
                    secureTextEntry
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>אימות סיסמה</Text>
                <TextInput
                    style={styles.input}
                    value={formData.confirm}
                    onChangeText={(text) => handleChange('confirm', text)}
                    placeholder="הקלד סיסמה שוב"
                    secureTextEntry
                />
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>אני נרשמ/ת בתור:</Text>
                <View style={styles.radioContainer}>
                    <TouchableOpacity
                        style={[styles.radioBtn, formData.role === 'customer' && styles.radioBtnActive]}
                        onPress={() => handleChange('role', 'customer')}
                    >
                        <Text style={[styles.radioText, formData.role === 'customer' && styles.radioTextActive]}>
                            לקוח
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.radioBtn, formData.role === 'restaurant' && styles.radioBtnActive]}
                        onPress={() => handleChange('role', 'restaurant')}
                    >
                        <Text style={[styles.radioText, formData.role === 'restaurant' && styles.radioTextActive]}>
                            בעל מסעדה
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.formGroup, { alignItems: 'center' }]}>
                <TouchableOpacity style={styles.imageBtn} onPress={handleImageChange}>
                    <Text style={styles.imageBtnText}>📸 בחר תמונת פרופיל</Text>
                </TouchableOpacity>
                {preview && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: preview }} style={styles.previewImage} />
                    </View>
                )}
            </View>


            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>צור חשבון</Text>}
            </TouchableOpacity>

            <View style={styles.authSwitch}>
                <Text style={styles.authSwitchText}>כבר יש לך חשבון? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.linkText}>היכנס כאן</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
        color: '#000000',
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#010001',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    errorContainer: {
        backgroundColor: '#f50404',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorText: {
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    radioContainer: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 5,
    },
    radioBtn: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    radioBtnActive: {
        borderColor: '#750786',
        backgroundColor: '#f7ddff',
    },
    radioText: {
        color: '#555',
        fontSize: 16,
    },
    radioTextActive: {
        color: '#a600e8',
        fontWeight: 'bold',
    },
    imageBtn: {
        backgroundColor: '#8d338e',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    imageBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitBtn: {
        backgroundColor: '#510671',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    submitBtnText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    authSwitch: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    authSwitchText: {
        fontSize: 16,
        color: '#555',
    },
    linkText: {
        fontSize: 16,
        color: '#560464',
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 12,
        paddingVertical: 11,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#FBE6EA',
    },

    logoutButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#A02E49',
    },
});
