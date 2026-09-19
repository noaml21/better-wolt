import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  // שמירת ערכי השדות
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  
  const usernameInputRef = useRef(null);
  
  const { login } = useAuth();

  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);
  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('חובה להזין שם משתמש וסיסמה.');
      return;
    }
   

    setError('');
    setIsLoading(true);

    try {
      await login({ 
        username,
         password 
        });
    } catch (err) {
      // Wrong credentials keep the friendly message; anything else
      // (e.g. 429 Too many requests) shows the server's error text.
      setError(err.status === 401 ? 'שם משתמש או סיסמה לא נכונים.' : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>התחברות 🔐</Text>
      {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>שם משתמש</Text>
        <TextInput
          ref={usernameInputRef}
          style={[styles.input, error && !username.trim() ? styles.inputError : null]}
          value={username}
          onChangeText={setUsername}
          placeholder="הזן שם משתמש"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>סיסמה</Text>
        <TextInput
          style={[styles.input, error && !password.trim() ? styles.inputError : null]}
          value={password}
          onChangeText={setPassword}
          placeholder="הזן סיסמה"
          secureTextEntry
        />
      </View>

      {/* כפתור ההתחברות */}
      <TouchableOpacity 
        style={styles.submitBtn} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>היכנס</Text>
        )}
      </TouchableOpacity>

      {/* קישור למסך ההרשמה */}
      <View style={styles.authSwitch}>
        <Text style={styles.authSwitchText}>עוד אין לך חשבון? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>הירשם כאן</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// עיצוב הדף
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#6e0483',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#52006bc7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#5b0371',
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
    color: '#d097ff',
  },
  linkText: {
    fontSize: 16,
    color: '#e8004d4d',
    fontWeight: 'bold',
  },
});