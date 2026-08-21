import React, {
    useCallback,
    useState,
} from 'react';

import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    useFocusEffect,
} from '@react-navigation/native';

import RestaurantCard from '../components/RestaurantCard';
import { useAuth } from '../context/AuthContext';
import { getRestaurants } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';

export default function HomeScreen({
    navigation,
}) {
    const { user, logout } = useAuth();

    const [restaurants, setRestaurants] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] = useState('');

    const openSearch = () => {
        navigation.navigate('SearchResults');
    };

    const handleLogout = async () => {
        await logout();
    };

    const loadRestaurants = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError('');

                const result =
                    await getRestaurants();

                if (!Array.isArray(result)) {
                    throw new Error(
                        'The server returned an invalid response'
                    );
                }

                setRestaurants(result);
            } catch (err) {
                console.error(
                    'Failed to load restaurants:',
                    err
                );

                setError(
                    err.message ||
                    'לא הצלחנו לטעון את המסעדות.'
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useFocusEffect(
        useCallback(() => {
            loadRestaurants();
        }, [loadRestaurants])
    );

    const openRestaurant = (restaurant) => {
        if (!restaurant?.id) {
            setError(
                'למסעדה שנבחרה אין מזהה תקין.'
            );

            return;
        }

        navigation?.navigate(
            'RestaurantDetails',
            {
                restaurantId: restaurant.id,
            }
        );
    };

    const openWorldCup = () => {
        navigation?.navigate('WorldCup');
    };
    const openCreateRestaurant = () => {
        navigation?.navigate(
            'RestaurantForm'
        );
    };

    const canCreateRestaurant =
        user?.role === 'restaurant';

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer} >
                <ActivityIndicator size="large" />

                <Text style={styles.message}>
                    טוען מסעדות...
                </Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView
                style={styles.centerContainer}
            >
                <Text style={styles.errorTitle}>
                    משהו השתבש
                </Text>

                <Text style={styles.message}>
                    {error}
                </Text>

                <Pressable
                    style={styles.retryButton}
                    onPress={() =>
                        loadRestaurants()
                    }
                >
                    <Text style={styles.retryText}>
                        נסי שוב
                    </Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={restaurants}
                keyExtractor={(item) =>
                    String(item.id)
                }
                renderItem={({ item }) => (
                    <RestaurantCard
                        restaurant={item}
                        onPress={() =>
                            openRestaurant(item)
                        }
                    />
                )}
                contentContainerStyle={[
                    styles.list,
                    restaurants.length === 0 &&
                    styles.emptyList,
                ]}
                showsVerticalScrollIndicator={
                    false
                }
                refreshing={refreshing}
                onRefresh={() =>
                    loadRestaurants(true)
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/Logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.profilePicture}>
                            {user?.image ? (
                                <Image
                                    source={{ uri: user.image }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            ) : (
                                <Text style={styles.profilePlaceholder}>
                                    👤
                                </Text>
                            )}
                        </View>
                        <Pressable
                            style={styles.searchButton}
                            onPress={openSearch}
                        >
                            <Text style={styles.searchButtonText}>
                                חיפוש מסעדה או מנה
                            </Text>
                        </Pressable>

                        <Text style={styles.title}>
                            המסעדות שלנו
                        </Text>

                        <Text style={styles.subtitle}>
                            מה תרצי להזמין היום?
                        </Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.worldCupButton,
                                pressed && styles.worldCupButtonPressed,
                            ]}
                            onPress={openWorldCup}
                        >
                            <Text style={styles.worldCupIcon}>
                                ⚽
                            </Text>

                            <View style={styles.worldCupTextContainer}>
                                <Text style={styles.worldCupTitle}>
                                    חגיגת המונדיאל
                                </Text>

                                <Text style={styles.worldCupSubtitle}>
                                    צפייה בתפריט והזמנת מנות מיוחדות
                                </Text>
                            </View>
                        </Pressable>
                        {canCreateRestaurant ? (
                            <Pressable
                                style={
                                    styles.createButton
                                }
                                onPress={
                                    openCreateRestaurant
                                }
                            >
                                <Text
                                    style={
                                        styles.createButtonText
                                    }
                                >
                                    יצירת מסעדה חדשה
                                </Text>
                            </Pressable>
                        ) : null}

                        <Pressable
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutButtonText}>
                                התנתקות
                            </Text>
                        </Pressable>
                    </View>
                }
                ListEmptyComponent={
                    <View
                        style={styles.emptyContainer}
                    >
                        <Text style={styles.emptyTitle}>
                            אין מסעדות להצגה
                        </Text>

                        <Text style={styles.message}>
                            כרגע אין מסעדות זמינות.
                        </Text>
                    </View>
                }
            />
            <BottomNavBar navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F4FA',
    },

    list: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 30,
    },

    emptyList: {
        flexGrow: 1,
    },

    header: {
        marginBottom: 22,
    },

    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#351440',
        textAlign: 'right',
    },

    subtitle: {
        marginTop: 5,
        fontSize: 16,
        color: '#666666',
        textAlign: 'right',
    },

    createButton: {
        marginTop: 18,
        paddingVertical: 13,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#542163',
    },

    createButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    centerContainer: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F7F4FA',
    },

    message: {
        marginTop: 10,
        fontSize: 15,
        lineHeight: 21,
        color: '#666666',
        textAlign: 'center',
    },

    errorTitle: {
        fontSize: 21,
        fontWeight: '700',
        color: '#351440',
    },

    retryButton: {
        marginTop: 22,
        paddingHorizontal: 25,
        paddingVertical: 13,
        borderRadius: 12,
        backgroundColor: '#542163',
    },

    retryText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    emptyContainer: {
        flex: 1,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#351440',
    },
    worldCupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#351440',
    },

    worldCupButtonPressed: {
        opacity: 0.82,
    },

    worldCupIcon: {
        marginRight: 14,
        fontSize: 38,
    },

    worldCupTextContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },

    worldCupTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'right',
    },

    worldCupSubtitle: {
        marginTop: 5,
        fontSize: 13,
        color: '#E8DDED',
        textAlign: 'right',
    },

    logoContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },

    logo: {
        width: 150,
        height: 110,
    },

    profilePicture: {
        alignItems: 'center',
        marginBottom: 12,
    },

    image: {
        width: 150,
        height: 110,
    },

    searchButton: {
        marginTop: 18,
        paddingVertical: 13,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#EFE4F2',
    },

    searchButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#542163',
    },
    profilePlaceholder: {
        fontSize: 60,
    },
});