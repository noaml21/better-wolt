import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function BottomNavBar({ navigation }) {
    return (
        <View style={styles.navContainer}>
            <Pressable style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.navText}>בית</Text>
            </Pressable>
           
            <Pressable style={styles.navItem} onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.navText}>הזמנות</Text>
            </Pressable>

            <Pressable style={styles.navItem} onPress={() => navigation.navigate('Cart')}>
                <Text style={styles.navText}>עגלה</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff', // צבע רקע לבן לשורה
        height: 60,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0', // פס דק שמפריד מהמסך
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    }
});