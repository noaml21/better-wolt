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
  createProduct,
  updateProduct,
} from '../services/api';

export default function ProductFormScreen({
  route,
  navigation,
}) {
  const restaurantId =
    route?.params?.restaurantId;

  const existingProduct =
    route?.params?.product || null;

  const isEditing = Boolean(
    existingProduct?.id
  );

  const { token } = useAuth();

  const [name, setName] = useState(
    existingProduct?.name || ''
  );

  const [description, setDescription] =
    useState(
      existingProduct?.description || ''
    );

  const [price, setPrice] = useState(
    existingProduct?.price
      ? String(existingProduct.price)
      : ''
  );

  const [submitting, setSubmitting] =
    useState(false);

  const submitForm = async () => {
    const normalizedName = name.trim();
    const normalizedDescription =
      description.trim();

    const numericPrice = Number(price);

    if (!restaurantId) {
      Alert.alert(
        'חסרה מסעדה',
        'לא ניתן לשמור מנה ללא מזהה מסעדה.'
      );

      return;
    }

    if (!normalizedName) {
      Alert.alert(
        'חסר שם מנה',
        'יש להזין שם למנה.'
      );

      return;
    }

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      Alert.alert(
        'מחיר לא תקין',
        'יש להזין מחיר גדול מאפס.'
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

    const productData = {
      name: normalizedName,
      description: normalizedDescription,
      price: numericPrice,
    };

    try {
      setSubmitting(true);

      if (isEditing) {
        await updateProduct(
          token,
          restaurantId,
          existingProduct.id,
          productData
        );

        Alert.alert(
          'המנה עודכנה',
          'פרטי המנה עודכנו בהצלחה.'
        );
      } else {
        await createProduct(
          token,
          restaurantId,
          productData
        );

        Alert.alert(
          'המנה נוספה',
          'המנה נוספה לתפריט בהצלחה.'
        );
      }

      navigation?.goBack();
    } catch (error) {
      console.error(
        'Failed to save product:',
        error
      );

      if (
        error.status === 401 ||
        error.status === 403
      ) {
        Alert.alert(
          'אין הרשאה',
          'אין לך הרשאה לשנות את התפריט של מסעדה זו.'
        );

        return;
      }

      Alert.alert(
        'שמירת המנה נכשלה',
        error.message ||
          'לא הצלחנו לשמור את המנה.'
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
            ? 'עריכת מנה'
            : 'הוספת מנה'}
        </Text>

        <Text style={styles.label}>
          שם המנה
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="הזיני שם מנה"
          style={styles.input}
          textAlign="right"
        />

        <Text style={styles.label}>
          תיאור
        </Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="הזיני תיאור קצר"
          style={[
            styles.input,
            styles.descriptionInput,
          ]}
          textAlign="right"
          multiline
        />

        <Text style={styles.label}>
          מחיר
        </Text>

        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="לדוגמה: 39.90"
          keyboardType="decimal-pad"
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
                : 'הוספת מנה'}
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

  descriptionInput: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: 'top',
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