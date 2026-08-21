import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

import {
  createRestaurant,
  updateRestaurant,
} from '../services/api';

export default function RestaurantFormScreen({
  route,
  navigation,
}) {
  const existingRestaurant =
    route?.params?.restaurant || null;

  const isEditing = Boolean(
    existingRestaurant?.id
  );

  const { token, user } = useAuth();

  const [name, setName] = useState(
    existingRestaurant?.name || ''
  );

  const [phone, setPhone] = useState(
    existingRestaurant?.phone || ''
  );

  const [address, setAddress] = useState(
    existingRestaurant?.address || ''
  );

  const [image, setImage] = useState(
    existingRestaurant?.image || ''
  );

  const [submitting, setSubmitting] =
    useState(false);

  const submitForm = async () => {
    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedAddress = address.trim();
    const normalizedImage = image.trim();

    if (!normalizedName) {
      Alert.alert(
        'חסר שם מסעדה',
        'יש להזין שם למסעדה.'
      );

      return;
    }

    if (!normalizedAddress) {
      Alert.alert(
        'חסרה כתובת',
        'יש להזין כתובת למסעדה.'
      );

      return;
    }

    if (!token) {
      Alert.alert(
        'נדרשת התחברות',
        'יש להתחבר כבעל מסעדה כדי לבצע את הפעולה.'
      );

      return;
    }

    const restaurantData = {
      name: normalizedName,
      phone: normalizedPhone,
      address: normalizedAddress,
      image: normalizedImage,
      username: user?.username,
    };

    try {
      setSubmitting(true);

      if (isEditing) {
        await updateRestaurant(
          token,
          existingRestaurant.id,
          restaurantData
        );

        Alert.alert(
          'המסעדה עודכנה',
          'פרטי המסעדה עודכנו בהצלחה.'
        );
      } else {
        await createRestaurant(
          token,
          restaurantData
        );

        Alert.alert(
          'המסעדה נוצרה',
          'המסעדה נוצרה בהצלחה.'
        );
      }

      navigation?.goBack();
    } catch (error) {
      console.error(
        'Failed to save restaurant:',
        error
      );

      if (
        error.status === 401 ||
        error.status === 403
      ) {
        Alert.alert(
          'אין הרשאה',
          'אין לך הרשאה לבצע את הפעולה.'
        );

        return;
      }

      Alert.alert(
        'שמירת המסעדה נכשלה',
        error.message ||
          'לא הצלחנו לשמור את המסעדה.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isEditing
            ? 'עריכת מסעדה'
            : 'יצירת מסעדה'}
        </Text>

        <Text style={styles.label}>
          שם המסעדה
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="הזיני שם מסעדה"
          style={styles.input}
          textAlign="right"
        />

        <Text style={styles.label}>
          מספר טלפון
        </Text>

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="הזיני מספר טלפון"
          keyboardType="phone-pad"
          style={styles.input}
          textAlign="right"
        />

        <Text style={styles.label}>
          כתובת
        </Text>

        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="הזיני כתובת"
          style={styles.input}
          textAlign="right"
        />

        <Text style={styles.label}>
          כתובת תמונה
        </Text>

        <TextInput
          value={image}
          onChangeText={setImage}
          placeholder="הזיני URL של תמונה"
          autoCapitalize="none"
          keyboardType="url"
          style={styles.input}
          textAlign="right"
        />

        <Pressable
          style={[
            styles.saveButton,
            submitting &&
              styles.disabledButton,
          ]}
          disabled={submitting}
          onPress={submitForm}
        >
          {submitting ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.saveText}>
              {isEditing
                ? 'שמירת שינויים'
                : 'יצירת מסעדה'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4FA',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    marginBottom: 24,
    fontSize: 29,
    fontWeight: '800',
    color: '#351440',
    textAlign: 'right',
  },

  label: {
    marginTop: 15,
    marginBottom: 7,
    fontSize: 15,
    fontWeight: '700',
    color: '#351440',
    textAlign: 'right',
  },

  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D9CEDD',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#351440',
  },

  saveButton: {
    minHeight: 50,
    marginTop: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#542163',
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});