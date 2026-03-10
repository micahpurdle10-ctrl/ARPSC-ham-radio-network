import React, { useState, useEffect } from 'react'
import {
    Text,
    View,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    ActivityIndicator,
    Switch,
    StatusBar,
    Linking
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    addDoc,
    query,
    onSnapshot,
    orderBy,
    deleteDoc,
    doc,
    where,
    updateDoc,
    getDocs,
    setDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore'
import firebaseConfig from './firebaseConfig'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const clubInfo = {
    name: 'ARPSC Hams',
    description: 'Welcome to the ARPSC Ham Radio Club! Chat, see members, and get info about frequencies and meetings.',
    frequencies: 'Repeater: 146.880 MHz',
    meetings: 'Every Friday at 7 PM',
    callsign: 'K7ABC',
    location: 'Phoenix, AZ',
    emergencyFreq: '146.520 MHz'
}

const members = [
    { id: '1', name: 'Alice Johnson', callsign: 'KE7ABC', license: 'Extra', status: 'online' },
    { id: '2', name: 'Bob Smith', callsign: 'N7XYZ', license: 'General', status: 'online' },
    { id: '3', name: 'Charlie Brown', callsign: 'KD7DEF', license: 'Technician', status: 'away' },
    { id: '4', name: 'Diana Prince', callsign: 'W7WXY', license: 'Extra', status: 'online' },
    { id: '5', name: 'Eve Davis', callsign: 'KE7GHI', license: 'General', status: 'offline' }
]

const events = [
    { id: '1', title: 'Weekly Net', date: 'Every Friday 7 PM', frequency: '146.880 MHz' },
    { id: '2', title: 'Field Day', date: 'June 24-25, 2026', location: 'City Park' },
    { id: '3', title: 'ARRL Sweepstakes', date: 'November 2026', type: 'Contest' },
    { id: '4', title: 'Technician Class', date: 'March 15, 2026', location: 'Fire Station' }
]

// Comprehensive frequency list
const FREQUENCY_LIST = [
    {
        id: 'main',
        name: 'Main Repeater',
        freq: '146.880',
        offset: '-600',
        tone: '100.0',
        type: 'VHF',
        notes: 'Primary club repeater'
    },
    {
        id: 'backup',
        name: 'Backup Repeater',
        freq: '147.120',
        offset: '+600',
        tone: '100.0',
        type: 'VHF',
        notes: 'Secondary repeater'
    },
    {
        id: 'simplex',
        name: 'Simplex Emergency',
        freq: '146.520',
        offset: 'None',
        tone: 'None',
        type: 'VHF',
        notes: 'National simplex frequency'
    },
    {
        id: 'aprs',
        name: 'APRS',
        freq: '144.390',
        offset: 'None',
        tone: 'None',
        type: 'VHF',
        notes: 'APRS digital frequency'
    },
    {
        id: 'uhf',
        name: 'UHF Repeater',
        freq: '449.500',
        offset: '-5000',
        tone: '100.0',
        type: 'UHF',
        notes: 'UHF club repeater'
    },
    {
        id: 'dstar',
        name: 'D-STAR Repeater',
        freq: '145.330',
        offset: '-600',
        tone: 'DCS023',
        type: 'Digital',
        notes: 'D-STAR digital mode'
    }
]

// Sample weather alerts (would connect to real API)
const SAMPLE_WEATHER_ALERTS = [
    {
        id: '1',
        type: 'severe_thunderstorm',
        severity: 'warning',
        title: 'Severe Thunderstorm Warning',
        message: 'Severe thunderstorm warning in effect until 8:00 PM. Seek shelter immediately.',
        area: 'Phoenix Metro Area',
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        active: true
    },
    {
        id: '2',
        type: 'flash_flood',
        severity: 'watch',
        title: 'Flash Flood Watch',
        message: 'Flash flood watch in effect. Monitor local conditions.',
        area: 'Maricopa County',
        expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
        active: true
    }
]

// Default chat rooms
const DEFAULT_ROOMS = [
    { id: 'general', name: 'General Chat', icon: 'chatbubbles', description: 'Main club chat', public: true },
    { id: 'tech', name: 'Technical Discussion', icon: 'hardware-chip', description: 'Equipment and tech talk', public: true },
    { id: 'emergency', name: 'Emergency Net', icon: 'warning', description: 'Emergency communications', public: true },
    { id: 'contests', name: 'Contests & Events', icon: 'trophy', description: 'Contest coordination', public: true },
    { id: 'skywarn', name: 'SKYWARN', icon: 'thunderstorm', description: 'Storm spotter network', public: true }
]

// PIN Authentication
const USER_ROLES = {
    MOD: { pin: '236', name: 'Moderator', badge: '🛡️', level: 2 },
    OWNER: { pin: '501', name: 'Owner', badge: '👑', level: 3 },
    USER: { pin: '958', name: 'User', badge: '👤', level: 1 }
}

// User Status Options
const USER_STATUS = {
    ONLINE: { label: 'Online', icon: 'radio-button-on', color: '#00cc00' },
    AWAY: { label: 'Away', icon: 'time', color: '#ffaa00' },
    DND: { label: 'Do Not Disturb', icon: 'remove-circle', color: '#cc0000' },
    OFFLINE: { label: 'Offline', icon: 'radio-button-off', color: '#999999' }
}

// Emoji reactions
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '👏', '📻']

function LoginScreen({ onLogin }) {
    const [pin, setPin] = useState('')
    const [showPin, setShowPin] = useState(false)
    const [callsign, setCallsign] = useState('')

    const handleLogin = () => {
        if (!callsign.trim()) {
            Alert.alert('Callsign Required', 'Please enter your callsign')
            return
        }

        let role = null
        if (pin === USER_ROLES.MOD.pin) {
            role = USER_ROLES.MOD
        } else if (pin === USER_ROLES.OWNER.pin) {
            role = USER_ROLES.OWNER
        } else if (pin === USER_ROLES.USER.pin) {
            role = USER_ROLES.USER
        } else {
            Alert.alert('Invalid PIN', 'Please enter a valid PIN to continue.')
            setPin('')
            return
        }

        onLogin({ ...role, callsign: callsign.toUpperCase() })
    }

    return (
        <SafeAreaView style={styles.loginContainer}>
            <View style={styles.loginBox}>
                <Ionicons name="radio-outline" size={80} color="#003366" />
                <Text style={styles.loginTitle}>ARPSC Hams</Text>
                <Text style={styles.loginSubtitle}>Ham Radio Emergency Network</Text>

                <View style={styles.loginFormContainer}>
                    <Text style={styles.loginLabel}>Your Callsign</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., KE7ABC"
                        value={callsign}
                        onChangeText={setCallsign}
                        autoCapitalize="characters"
                    />

                    <Text style={[styles.loginLabel, { marginTop: 15 }]}>Enter Your PIN</Text>
                    <View style={styles.pinInputContainer}>
                        <TextInput
                            style={styles.pinInput}
                            placeholder="Enter PIN"
                            value={pin}
                            onChangeText={setPin}
                            keyboardType="numeric"
                            maxLength={3}
                            secureTextEntry={!showPin}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowPin(!showPin)}
                        >
                            <Ionicons
                                name={showPin ? 'eye-off-outline' : 'eye-outline'}
                                size={24}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, (pin.length < 3 || !callsign.trim()) && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={pin.length < 3 || !callsign.trim()}
                    >
                        <Text style={styles.loginButtonText}>Login & Check In</Text>
                    </TouchableOpacity>

                    <View style={styles.roleInfoContainer}>
                        <Text style={styles.roleInfoTitle}>Available Roles:</Text>
                        <Text style={styles.roleInfo}>👑 Owner (501) • 🛡️ Mod (236) • 👤 User (958)</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

// NEW: Weather & Emergency Screen
function WeatherEmergencyScreen({ userRole, isDarkMode }) {
    const [weatherAlerts, setWeatherAlerts] = useState(SAMPLE_WEATHER_ALERTS)
    const [showEmergencyAlert, setShowEmergencyAlert] = useState(false)
    const [emergencyMessage, setEmergencyMessage] = useState('')
    const [showRadar, setShowRadar] = useState(false)

    const sendEmergencyAlert = async () => {
        if (!emergencyMessage.trim()) {
            Alert.alert('Error', 'Please enter an emergency message')
            return
        }

        try {
            await addDoc(collection(db, 'emergency_alerts'), {
                message: emergencyMessage,
                sentBy: userRole.callsign,
                sentByRole: userRole.name,
                timestamp: new Date(),
                active: true
            })

            Alert.alert(
                '🚨 Emergency Alert Sent',
                'All operators have been notified',
                [{ text: 'OK' }]
            )
            setEmergencyMessage('')
            setShowEmergencyAlert(false)
        } catch (error) {
            Alert.alert('Error', 'Failed to send emergency alert')
        }
    }

    const openWeatherRadar = () => {
        // In production, this would open a weather radar API or web view
        Linking.openURL('https://weather.com/weather/radar')
    }

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <ScrollView>
                {/* Emergency Alert Button */}
                {userRole.level >= 2 && (
                    <TouchableOpacity
                        style={styles.emergencyAlertButton}
                        onPress={() => setShowEmergencyAlert(true)}
                    >
                        <Ionicons name="alert-circle" size={32} color="#fff" />
                        <Text style={styles.emergencyAlertText}>SEND EMERGENCY ALERT</Text>
                    </TouchableOpacity>
                )}

                {/* Active Alerts */}
                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="warning" size={24} color="#ff6600" />
                        <Text style={[styles.subtitle, { marginBottom: 0, marginLeft: 8 }, isDarkMode && styles.darkText]}>
                            Active Weather Alerts
                        </Text>
                    </View>

                    {weatherAlerts.filter(a => a.active).length === 0 ? (
                        <View style={styles.noAlertsContainer}>
                            <Ionicons name="checkmark-circle" size={48} color="#00cc00" />
                            <Text style={[styles.noAlertsText, isDarkMode && styles.darkSubText]}>
                                No active alerts
                            </Text>
                        </View>
                    ) : (
                        weatherAlerts.filter(a => a.active).map(alert => (
                            <View
                                key={alert.id}
                                style={[
                                    styles.alertCard,
                                    alert.severity === 'warning' ? styles.alertWarning : styles.alertWatch,
                                    isDarkMode && styles.darkCard
                                ]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                    <Ionicons
                                        name={alert.severity === 'warning' ? 'warning' : 'alert-circle-outline'}
                                        size={20}
                                        color={alert.severity === 'warning' ? '#cc0000' : '#ff6600'}
                                    />
                                    <Text style={[styles.alertTitle, isDarkMode && styles.darkText]}>
                                        {alert.title}
                                    </Text>
                                </View>
                                <Text style={[styles.alertArea, isDarkMode && styles.darkSubText]}>
                                    📍 {alert.area}
                                </Text>
                                <Text style={[styles.alertMessage, isDarkMode && styles.darkSubText]}>
                                    {alert.message}
                                </Text>
                                <Text style={[styles.alertExpires, isDarkMode && styles.darkSubText]}>
                                    Expires: {alert.expires.toLocaleTimeString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Weather Radar */}
                <TouchableOpacity
                    style={[styles.section, isDarkMode && styles.darkSection]}
                    onPress={openWeatherRadar}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="rainy" size={24} color="#0066cc" />
                        <Text style={[styles.subtitle, { marginBottom: 0, marginLeft: 8 }, isDarkMode && styles.darkText]}>
                            Weather Radar
                        </Text>
                    </View>
                    <View style={styles.radarPlaceholder}>
                        <Ionicons name="map" size={64} color="#0066cc" />
                        <Text style={[styles.radarText, isDarkMode && styles.darkText]}>
                            Tap to view live radar
                        </Text>
                        <Text style={[styles.radarSubtext, isDarkMode && styles.darkSubText]}>
                            Opens weather.com radar
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Storm Spotter Info */}
                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="thunderstorm" size={24} color="#9900cc" />
                        <Text style={[styles.subtitle, { marginBottom: 0, marginLeft: 8 }, isDarkMode && styles.darkText]}>
                            SKYWARN Storm Spotters
                        </Text>
                    </View>
                    <Text style={[styles.bodyText, isDarkMode && styles.darkSubText]}>
                        Join our SKYWARN network to report severe weather conditions.
                    </Text>
                    <TouchableOpacity style={styles.skywarnButton}>
                        <Text style={styles.skywarnButtonText}>Report Weather Condition</Text>
                    </TouchableOpacity>
                </View>

                {/* Emergency Frequencies */}
                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="radio" size={24} color="#cc0000" />
                        <Text style={[styles.subtitle, { marginBottom: 0, marginLeft: 8 }, isDarkMode && styles.darkText]}>
                            Emergency Frequencies
                        </Text>
                    </View>
                    <View style={styles.freqCard}>
                        <Text style={[styles.freqCardTitle, isDarkMode && styles.darkText]}>
                            Primary: {clubInfo.emergencyFreq}
                        </Text>
                        <Text style={[styles.freqCardDetail, isDarkMode && styles.darkSubText]}>
                            Simplex emergency communications
                        </Text>
                    </View>
                    <View style={styles.freqCard}>
                        <Text style={[styles.freqCardTitle, isDarkMode && styles.darkText]}>
                            Backup: {clubInfo.frequencies}
                        </Text>
                        <Text style={[styles.freqCardDetail, isDarkMode && styles.darkSubText]}>
                            Club repeater for coordination
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Emergency Alert Modal */}
            <Modal visible={showEmergencyAlert} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, isDarkMode && styles.darkSection]}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <Ionicons name="alert-circle" size={64} color="#cc0000" />
                            <Text style={[styles.modalTitle, { color: '#cc0000' }, isDarkMode && styles.darkText]}>
                                EMERGENCY ALERT
                            </Text>
                        </View>

                        <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Alert Message:</Text>
                        <TextInput
                            style={[styles.emergencyInput, isDarkMode && styles.darkInput]}
                            placeholder="Enter emergency message..."
                            placeholderTextColor={isDarkMode ? '#999' : '#666'}
                            value={emergencyMessage}
                            onChangeText={setEmergencyMessage}
                            multiline
                            numberOfLines={4}
                        />

                        <Text style={[styles.warningText, isDarkMode && styles.darkSubText]}>
                            ⚠️ This will notify ALL club members immediately
                        </Text>

                        <TouchableOpacity
                            style={[styles.emergencyButton, !emergencyMessage.trim() && styles.loginButtonDisabled]}
                            onPress={sendEmergencyAlert}
                            disabled={!emergencyMessage.trim()}
                        >
                            <Text style={styles.primaryButtonText}>SEND ALERT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => {
                                setShowEmergencyAlert(false)
                                setEmergencyMessage('')
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

// NEW: Operator Check-In Screen
function CheckInScreen({ userRole, isDarkMode }) {
    const [checkedInOps, setCheckedInOps] = useState([])
    const [showCheckInModal, setShowCheckInModal] = useState(false)
    const [checkInStatus, setCheckInStatus] = useState('available')
    const [checkInLocation, setCheckInLocation] = useState('')

    useEffect(() => {
        const q = query(collection(db, 'operator_checkins'), orderBy('timestamp', 'desc'))
        const unsubscribe = onSnapshot(q, snapshot => {
            const checkins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setCheckedInOps(checkins)
        }, error => {
            console.error('Error fetching check-ins:', error)
        })
        return () => unsubscribe()
    }, [])

    const checkIn = async () => {
        try {
            await addDoc(collection(db, 'operator_checkins'), {
                callsign: userRole.callsign,
                name: userRole.name,
                status: checkInStatus,
                location: checkInLocation || 'Not specified',
                timestamp: new Date(),
                active: true
            })

            Alert.alert('✅ Checked In', 'You are now checked in to the net')
            setShowCheckInModal(false)
            setCheckInLocation('')
        } catch (error) {
            Alert.alert('Error', 'Failed to check in')
        }
    }

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={[styles.section, isDarkMode && styles.darkSection]}>
                <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
                    📻 Operator Check-In System
                </Text>
                <TouchableOpacity
                    style={styles.checkInButton}
                    onPress={() => setShowCheckInModal(true)}
                >
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    <Text style={styles.checkInButtonText}>CHECK IN NOW</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.section, isDarkMode && styles.darkSection]}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                    Active Operators ({checkedInOps.length})
                </Text>
            </View>

            <FlatList
                data={checkedInOps}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.checkInCard, isDarkMode && styles.darkCard]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.checkInCallsign, isDarkMode && styles.darkAccent]}>
                                    {item.callsign}
                                </Text>
                                <Text style={[styles.checkInLocation, isDarkMode && styles.darkSubText]}>
                                    📍 {item.location}
                                </Text>
                                <Text style={[styles.checkInTime, isDarkMode && styles.darkSubText]}>
                                    Checked in: {new Date(item.timestamp.toDate()).toLocaleTimeString()}
                                </Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: item.status === 'available' ? '#00cc00' : '#ffaa00' }
                            ]}>
                                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, isDarkMode && styles.darkSubText]}>
                        No operators checked in yet
                    </Text>
                }
            />

            {/* Check-In Modal */}
            <Modal visible={showCheckInModal} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, isDarkMode && styles.darkSection]}>
                        <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Check In</Text>

                        <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Status:</Text>
                        <View style={styles.statusPicker}>
                            <TouchableOpacity
                                style={[
                                    styles.statusPickerButton,
                                    checkInStatus === 'available' && styles.statusPickerButtonSelected
                                ]}
                                onPress={() => setCheckInStatus('available')}
                            >
                                <Text style={styles.statusPickerText}>Available</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.statusPickerButton,
                                    checkInStatus === 'monitoring' && styles.statusPickerButtonSelected
                                ]}
                                onPress={() => setCheckInStatus('monitoring')}
                            >
                                <Text style={styles.statusPickerText}>Monitoring</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Location (Optional):</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="e.g., North Phoenix"
                            placeholderTextColor={isDarkMode ? '#999' : '#666'}
                            value={checkInLocation}
                            onChangeText={setCheckInLocation}
                        />

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={checkIn}
                        >
                            <Text style={styles.primaryButtonText}>Check In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => {
                                setShowCheckInModal(false)
                                setCheckInLocation('')
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

// NEW: Meeting Scheduler Screen
function MeetingsScreen({ userRole, isDarkMode }) {
    const [meetings, setMeetings] = useState([])
    const [showCreateMeeting, setShowCreateMeeting] = useState(false)
    const [newMeetingTitle, setNewMeetingTitle] = useState('')
    const [newMeetingDate, setNewMeetingDate] = useState('')
    const [newMeetingTime, setNewMeetingTime] = useState('')
    const [newMeetingLocation, setNewMeetingLocation] = useState('')
    const [newMeetingFreq, setNewMeetingFreq] = useState('')

    useEffect(() => {
        const q = query(collection(db, 'meetings'), orderBy('date', 'asc'))
        const unsubscribe = onSnapshot(q, snapshot => {
            const mtgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setMeetings(mtgs)
        }, error => {
            console.error('Error fetching meetings:', error)
        })
        return () => unsubscribe()
    }, [])

    const createMeeting = async () => {
        if (!newMeetingTitle.trim() || !newMeetingDate.trim() || !newMeetingTime.trim()) {
            Alert.alert('Error', 'Please fill in all required fields')
            return
        }

        try {
            await addDoc(collection(db, 'meetings'), {
                title: newMeetingTitle,
                date: newMeetingDate,
                time: newMeetingTime,
                location: newMeetingLocation || 'TBD',
                frequency: newMeetingFreq || 'N/A',
                createdBy: userRole.callsign,
                timestamp: new Date()
            })

            Alert.alert('✅ Meeting Created', 'Meeting has been scheduled')
            setShowCreateMeeting(false)
            setNewMeetingTitle('')
            setNewMeetingDate('')
            setNewMeetingTime('')
            setNewMeetingLocation('')
            setNewMeetingFreq('')
        } catch (error) {
            Alert.alert('Error', 'Failed to create meeting')
        }
    }

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={[styles.section, isDarkMode && styles.darkSection]}>
                <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
                    📅 Meeting Scheduler
                </Text>
                {userRole.level >= 2 && (
                    <TouchableOpacity
                        style={styles.createMeetingButton}
                        onPress={() => setShowCreateMeeting(true)}
                    >
                        <Ionicons name="add-circle" size={20} color="#fff" />
                        <Text style={styles.createMeetingButtonText}>Schedule New Meeting</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={meetings}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.meetingCard, isDarkMode && styles.darkCard]}>
                        <Text style={[styles.meetingTitle, isDarkMode && styles.darkText]}>
                            {item.title}
                        </Text>
                        <Text style={[styles.meetingDetail, isDarkMode && styles.darkSubText]}>
                            📅 {item.date} at {item.time}
                        </Text>
                        <Text style={[styles.meetingDetail, isDarkMode && styles.darkSubText]}>
                            📍 {item.location}
                        </Text>
                        {item.frequency !== 'N/A' && (
                            <Text style={[styles.meetingDetail, isDarkMode && styles.darkSubText]}>
                                📻 {item.frequency}
                            </Text>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, isDarkMode && styles.darkSubText]}>
                        No upcoming meetings scheduled
                    </Text>
                }
            />

            {/* Create Meeting Modal */}
            <Modal visible={showCreateMeeting} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <ScrollView style={{ width: '100%' }}>
                        <View style={[styles.modalContent, isDarkMode && styles.darkSection, { marginTop: 50 }]}>
                            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Schedule Meeting</Text>

                            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Meeting Title *</Text>
                            <TextInput
                                style={[styles.input, isDarkMode && styles.darkInput]}
                                placeholder="e.g., Monthly Club Meeting"
                                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                                value={newMeetingTitle}
                                onChangeText={setNewMeetingTitle}
                            />

                            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Date *</Text>
                            <TextInput
                                style={[styles.input, isDarkMode && styles.darkInput]}
                                placeholder="e.g., March 15, 2026"
                                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                                value={newMeetingDate}
                                onChangeText={setNewMeetingDate}
                            />

                            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Time *</Text>
                            <TextInput
                                style={[styles.input, isDarkMode && styles.darkInput]}
                                placeholder="e.g., 7:00 PM"
                                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                                value={newMeetingTime}
                                onChangeText={setNewMeetingTime}
                            />

                            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Location</Text>
                            <TextInput
                                style={[styles.input, isDarkMode && styles.darkInput]}
                                placeholder="e.g., Community Center"
                                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                                value={newMeetingLocation}
                                onChangeText={setNewMeetingLocation}
                            />

                            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Frequency (if on-air)</Text>
                            <TextInput
                                style={[styles.input, isDarkMode && styles.darkInput]}
                                placeholder="e.g., 146.880 MHz"
                                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                                value={newMeetingFreq}
                                onChangeText={setNewMeetingFreq}
                            />

                            <TouchableOpacity
                                style={[styles.primaryButton, (!newMeetingTitle.trim() || !newMeetingDate.trim() || !newMeetingTime.trim()) && styles.loginButtonDisabled]}
                                onPress={createMeeting}
                                disabled={!newMeetingTitle.trim() || !newMeetingDate.trim() || !newMeetingTime.trim()}
                            >
                                <Text style={styles.primaryButtonText}>Create Meeting</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => {
                                    setShowCreateMeeting(false)
                                    setNewMeetingTitle('')
                                    setNewMeetingDate('')
                                    setNewMeetingTime('')
                                    setNewMeetingLocation('')
                                    setNewMeetingFreq('')
                                }}
                            >
                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

// NEW: Enhanced Frequency List Screen
function FrequencyListScreen({ isDarkMode }) {
    const [selectedType, setSelectedType] = useState('All')
    const [filteredFreqs, setFilteredFreqs] = useState(FREQUENCY_LIST)

    useEffect(() => {
        if (selectedType === 'All') {
            setFilteredFreqs(FREQUENCY_LIST)
        } else {
            setFilteredFreqs(FREQUENCY_LIST.filter(f => f.type === selectedType))
        }
    }, [selectedType])

    const types = ['All', 'VHF', 'UHF', 'Digital']

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={[styles.section, isDarkMode && styles.darkSection]}>
                <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
                    📻 Ham Radio Frequencies
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {types.map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.filterButton,
                                selectedType === type && styles.filterButtonSelected
                            ]}
                            onPress={() => setSelectedType(type)}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                selectedType === type && styles.filterButtonTextSelected
                            ]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredFreqs}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.frequencyCard, isDarkMode && styles.darkCard]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.freqListName, isDarkMode && styles.darkText]}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.freqListFreq, isDarkMode && styles.darkAccent]}>
                                    {item.freq} MHz
                                </Text>
                            </View>
                            <View style={[styles.freqTypeBadge, {
                                backgroundColor:
                                    item.type === 'VHF' ? '#0066cc' :
                                        item.type === 'UHF' ? '#9900cc' : '#00aa00'
                            }]}>
                                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                                    {item.type}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.freqDetailsRow}>
                            <Text style={[styles.freqDetailSmall, isDarkMode && styles.darkSubText]}>
                                Offset: {item.offset === 'None' ? 'None' : item.offset + ' kHz'}
                            </Text>
                            <Text style={[styles.freqDetailSmall, isDarkMode && styles.darkSubText]}>
                                Tone: {item.tone}
                            </Text>
                        </View>
                        <Text style={[styles.freqNotes, isDarkMode && styles.darkSubText]}>
                            {item.notes}
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

// Update existing HomeScreen with emergency status
function HomeScreen({ userRole, userStatus, onLogout, onStatusChange, isDarkMode }) {
    const bgColor = isDarkMode ? styles.darkContainer : styles.container

    return (
        <SafeAreaView style={[styles.container, bgColor]}>
            <ScrollView>
                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <View style={styles.headerWithLogout}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, isDarkMode && styles.darkText]}>
                                📻 {clubInfo.name}
                            </Text>
                            <Text style={[styles.callsign, isDarkMode && styles.darkAccent]}>
                                {userRole.callsign}
                            </Text>
                            <View style={styles.userInfoRow}>
                                <Text style={[styles.roleBadge, isDarkMode && styles.darkAccent]}>
                                    {userRole.badge} {userRole.name}
                                </Text>
                                <View style={styles.statusBadge}>
                                    <Ionicons
                                        name={USER_STATUS[userStatus].icon}
                                        size={12}
                                        color={USER_STATUS[userStatus].color}
                                    />
                                    <Text style={[styles.statusText, { color: USER_STATUS[userStatus].color }]}>
                                        {USER_STATUS[userStatus].label}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                            <Ionicons name="log-out-outline" size={24} color="#cc0000" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Access Emergency Button */}
                <View style={[styles.section, { backgroundColor: '#fff3cd' }, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                        🚨 Emergency Quick Access
                    </Text>
                    <Text style={[styles.bodyText, isDarkMode && styles.darkSubText]}>
                        Emergency Simplex: {clubInfo.emergencyFreq}
                    </Text>
                    <TouchableOpacity style={styles.emergencyQuickButton}>
                        <Ionicons name="call" size={20} color="#fff" />
                        <Text style={styles.emergencyQuickButtonText}>Open Emergency Net</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>📍 Quick Info</Text>
                    <Text style={[styles.infoText, isDarkMode && styles.darkSubText]}>Location: {clubInfo.location}</Text>
                    <Text style={[styles.infoText, isDarkMode && styles.darkSubText]}>Repeater: {clubInfo.frequencies}</Text>
                    <Text style={[styles.infoText, isDarkMode && styles.darkSubText]}>Meetings: {clubInfo.meetings}</Text>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>📅 Upcoming Events</Text>
                    {events.slice(0, 3).map(event => (
                        <View key={event.id} style={styles.eventItem}>
                            <Text style={[styles.eventTitle, isDarkMode && styles.darkText]}>{event.title}</Text>
                            <Text style={[styles.eventDate, isDarkMode && styles.darkSubText]}>{event.date}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

// Keep existing InfoScreen, MembersScreen, EventsScreen, SettingsScreen, ChatScreen from previous version
function InfoScreen({ isDarkMode }) {
    const [showFreqModal, setShowFreqModal] = useState(false)

    const frequencies = [
        { name: 'Main Repeater', freq: '146.880 MHz', offset: '-600 kHz', tone: '100.0 Hz' },
        { name: 'Backup Repeater', freq: '147.120 MHz', offset: '+600 kHz', tone: '100.0 Hz' },
        { name: 'Simplex', freq: '146.520 MHz', offset: 'None', tone: 'None' },
        { name: 'APRS', freq: '144.390 MHz', offset: 'None', tone: 'None' }
    ]

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <ScrollView>
                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>📡 About the Club</Text>
                    <Text style={[styles.bodyText, isDarkMode && styles.darkSubText]}>{clubInfo.description}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.section, isDarkMode && styles.darkSection]}
                    onPress={() => setShowFreqModal(true)}
                >
                    <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>📻 Frequencies (Tap for details)</Text>
                    <Text style={[styles.bodyText, isDarkMode && styles.darkSubText]}>{clubInfo.frequencies}</Text>
                    <Text style={[styles.linkText, isDarkMode && styles.darkAccent]}>View all frequencies →</Text>
                </TouchableOpacity>

                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>🗓️ Meetings</Text>
                    <Text style={[styles.bodyText, isDarkMode && styles.darkSubText]}>{clubInfo.meetings}</Text>
                    <Text style={[styles.bodyText, isDarkMode && styles.darkSubText]}>Location: Community Center, Room 101</Text>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>📧 Contact</Text>
                    <Text style={[styles.bodyText, isDarkMode && styles.darkSubText]}>Email: info@arpschams.org</Text>
                    <Text style={[styles.bodyText, isDarkMode && styles.darkSubText]}>Website: www.arpschams.org</Text>
                </View>

                <Modal visible={showFreqModal} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalContent, isDarkMode && styles.darkSection]}>
                            <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>All Frequencies</Text>
                            {frequencies.map((freq, index) => (
                                <View key={index} style={[styles.freqItem, isDarkMode && styles.darkCard]}>
                                    <Text style={[styles.freqName, isDarkMode && styles.darkText]}>{freq.name}</Text>
                                    <Text style={[styles.freqDetail, isDarkMode && styles.darkSubText]}>Frequency: {freq.freq}</Text>
                                    <Text style={[styles.freqDetail, isDarkMode && styles.darkSubText]}>Offset: {freq.offset}</Text>
                                    <Text style={[styles.freqDetail, isDarkMode && styles.darkSubText]}>Tone: {freq.tone}</Text>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowFreqModal(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
}

function MembersScreen({ isDarkMode }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredMembers, setFilteredMembers] = useState(members)

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredMembers(members)
        } else {
            const filtered = members.filter(member =>
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.callsign.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredMembers(filtered)
        }
    }, [searchQuery])

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={[styles.section, isDarkMode && styles.darkSection]}>
                <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>👥 Members ({members.length})</Text>
                <TextInput
                    style={[styles.searchInput, isDarkMode && styles.darkInput]}
                    placeholder="Search by name or callsign..."
                    placeholderTextColor={isDarkMode ? '#999' : '#666'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={filteredMembers}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.memberCard, isDarkMode && styles.darkCard]}>
                        <View style={styles.memberHeader}>
                            <Text style={[styles.memberName, isDarkMode && styles.darkText]}>{item.name}</Text>
                            <Text style={[styles.licenseClass, isDarkMode && styles.darkBadge]}>{item.license}</Text>
                        </View>
                        <Text style={[styles.memberCallsign, isDarkMode && styles.darkAccent]}>{item.callsign}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No members found</Text>
                }
            />
        </SafeAreaView>
    )
}

function ChatScreen({ userRole, isDarkMode }) {
    const [chatMessages, setChatMessages] = useState([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedRoom, setSelectedRoom] = useState('general')
    const [rooms, setRooms] = useState(DEFAULT_ROOMS)
    const [showRoomList, setShowRoomList] = useState(false)
    const [showCreateRoom, setShowCreateRoom] = useState(false)
    const [newRoomName, setNewRoomName] = useState('')
    const [newRoomDesc, setNewRoomDesc] = useState('')
    const [newRoomPublic, setNewRoomPublic] = useState(true)
    const [newRoomPin, setNewRoomPin] = useState('')
    const [showReactions, setShowReactions] = useState(null)

    useEffect(() => {
        const q = query(
            collection(db, 'messages'),
            where('roomId', '==', selectedRoom),
            orderBy('createdAt', 'desc')
        )
        const unsubscribe = onSnapshot(q, snapshot => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setChatMessages(msgs)
            setLoading(false)
        }, error => {
            console.error('Error fetching messages:', error)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [selectedRoom])

    const sendMessage = async () => {
        if (message.trim()) {
            try {
                await addDoc(collection(db, 'messages'), {
                    text: message,
                    userName: userRole.callsign,
                    userRole: userRole.name,
                    roomId: selectedRoom,
                    createdAt: new Date(),
                    reactions: {}
                })
                setMessage('')
            } catch (error) {
                console.error('Error sending message:', error)
                Alert.alert('Error', 'Failed to send message')
            }
        }
    }

    const deleteMessage = async (messageId) => {
        Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'messages', messageId))
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete message')
                        }
                    }
                }
            ]
        )
    }

    const addReaction = async (messageId, emoji) => {
        try {
            const messageRef = doc(db, 'messages', messageId)
            const message = chatMessages.find(m => m.id === messageId)
            const reactions = message.reactions || {}
            const userReaction = reactions[userRole.callsign] || []

            if (userReaction.includes(emoji)) {
                reactions[userRole.callsign] = userReaction.filter(e => e !== emoji)
            } else {
                reactions[userRole.callsign] = [...userReaction, emoji]
            }

            await updateDoc(messageRef, { reactions })
            setShowReactions(null)
        } catch (error) {
            console.error('Error adding reaction:', error)
        }
    }

    const createRoom = () => {
        if (!newRoomName.trim()) {
            Alert.alert('Error', 'Room name is required')
            return
        }

        const newRoom = {
            id: newRoomName.toLowerCase().replace(/\s+/g, '-'),
            name: newRoomName,
            description: newRoomDesc,
            icon: 'chatbubble',
            public: newRoomPublic,
            pin: newRoomPin,
            createdBy: userRole.callsign
        }

        setRooms([...rooms, newRoom])
        setShowCreateRoom(false)
        setNewRoomName('')
        setNewRoomDesc('')
        setNewRoomPin('')
        setNewRoomPublic(true)
        Alert.alert('Success', `Room "${newRoomName}" created!`)
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        const hours = date.getHours()
        const minutes = date.getMinutes().toString().padStart(2, '0')
        const ampm = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        return `${displayHours}:${minutes} ${ampm}`
    }

    const currentRoom = rooms.find(r => r.id === selectedRoom)

    const getReactionCount = (reactions) => {
        if (!reactions) return {}
        const counts = {}
        Object.values(reactions).forEach(userReactions => {
            userReactions.forEach(emoji => {
                counts[emoji] = (counts[emoji] || 0) + 1
            })
        })
        return counts
    }

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={styles.chatContainer}>
                <TouchableOpacity
                    style={[styles.chatHeader, isDarkMode && styles.darkSection]}
                    onPress={() => setShowRoomList(true)}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name={currentRoom?.icon || 'chatbubble'} size={20} color="#003366" />
                            <Text style={[styles.roomTitle, isDarkMode && styles.darkText]}>
                                {currentRoom?.name || 'General Chat'}
                            </Text>
                        </View>
                        <Text style={[styles.roomDesc, isDarkMode && styles.darkSubText]}>
                            {currentRoom?.description}
                        </Text>
                    </View>
                    <Ionicons name="chevron-down" size={24} color="#666" />
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator size="large" color="#003366" style={styles.loader} />
                ) : (
                    <FlatList
                        data={chatMessages}
                        keyExtractor={item => item.id}
                        inverted
                        renderItem={({ item }) => {
                            const reactionCounts = getReactionCount(item.reactions)
                            const isMyMessage = item.userName === userRole.callsign
                            const canDelete = isMyMessage || userRole.level >= 2

                            return (
                                <View>
                                    <TouchableOpacity
                                        style={[
                                            styles.chatBubble,
                                            isMyMessage && styles.myMessage,
                                            isDarkMode && (isMyMessage ? styles.darkMyMessage : styles.darkChatBubble)
                                        ]}
                                        onLongPress={() => setShowReactions(item.id)}
                                    >
                                        <View style={styles.messageHeader}>
                                            <Text style={[
                                                styles.messageUser,
                                                isMyMessage && { color: '#ffffff' },
                                                isDarkMode && !isMyMessage && styles.darkText
                                            ]}>
                                                {item.userName}
                                            </Text>
                                            <Text style={[
                                                styles.messageTime,
                                                isMyMessage && { color: '#cce6ff' },
                                                isDarkMode && { color: '#999' }
                                            ]}>
                                                {formatTime(item.createdAt)}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.chatText,
                                            isMyMessage && { color: '#ffffff' },
                                            isDarkMode && !isMyMessage && styles.darkText
                                        ]}>
                                            {item.text}
                                        </Text>

                                        {Object.keys(reactionCounts).length > 0 && (
                                            <View style={styles.reactionsContainer}>
                                                {Object.entries(reactionCounts).map(([emoji, count]) => (
                                                    <TouchableOpacity
                                                        key={emoji}
                                                        style={styles.reactionBubble}
                                                        onPress={() => addReaction(item.id, emoji)}
                                                    >
                                                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                                                        <Text style={styles.reactionCount}>{count}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}

                                        {canDelete && (
                                            <TouchableOpacity
                                                style={styles.deleteMessageButton}
                                                onPress={() => deleteMessage(item.id)}
                                            >
                                                <Ionicons name="trash-outline" size={14} color={isMyMessage ? '#fff' : '#cc0000'} />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>

                                    {showReactions === item.id && (
                                        <View style={[styles.reactionPicker, isDarkMode && styles.darkCard]}>
                                            {REACTIONS.map(emoji => (
                                                <TouchableOpacity
                                                    key={emoji}
                                                    style={styles.reactionPickerButton}
                                                    onPress={() => addReaction(item.id, emoji)}
                                                >
                                                    <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
                                                </TouchableOpacity>
                                            ))}
                                            <TouchableOpacity
                                                style={styles.reactionPickerButton}
                                                onPress={() => setShowReactions(null)}
                                            >
                                                <Ionicons name="close" size={24} color="#cc0000" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )
                        }}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
                        }
                    />
                )}

                <View style={[styles.inputContainer, isDarkMode && styles.darkInput]}>
                    <TextInput
                        style={[styles.chatInput, isDarkMode && { color: '#fff' }]}
                        placeholder="Type a message..."
                        placeholderTextColor={isDarkMode ? '#999' : '#666'}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={sendMessage}
                        disabled={message.trim() === ''}
                    >
                        <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={showRoomList} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, isDarkMode && styles.darkSection]}>
                        <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Chat Rooms</Text>
                        <ScrollView style={styles.roomList}>
                            {rooms.map(room => (
                                <TouchableOpacity
                                    key={room.id}
                                    style={[
                                        styles.roomItem,
                                        selectedRoom === room.id && styles.roomItemSelected,
                                        isDarkMode && styles.darkCard
                                    ]}
                                    onPress={() => {
                                        setSelectedRoom(room.id)
                                        setShowRoomList(false)
                                    }}
                                >
                                    <Ionicons name={room.icon} size={24} color="#003366" />
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={[styles.roomName, isDarkMode && styles.darkText]}>{room.name}</Text>
                                        <Text style={[styles.roomDescription, isDarkMode && styles.darkSubText]}>
                                            {room.description}
                                        </Text>
                                    </View>
                                    {!room.public && <Ionicons name="lock-closed" size={16} color="#666" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {(userRole.level >= 2) && (
                            <TouchableOpacity
                                style={styles.createRoomButton}
                                onPress={() => {
                                    setShowRoomList(false)
                                    setShowCreateRoom(true)
                                }}
                            >
                                <Ionicons name="add-circle" size={20} color="#fff" />
                                <Text style={styles.createRoomButtonText}>Create New Room</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowRoomList(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showCreateRoom} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, isDarkMode && styles.darkSection]}>
                        <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>Create New Room</Text>

                        <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Room Name</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="e.g., DX Discussion"
                            placeholderTextColor={isDarkMode ? '#999' : '#666'}
                            value={newRoomName}
                            onChangeText={setNewRoomName}
                        />

                        <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Description</Text>
                        <TextInput
                            style={[styles.input, isDarkMode && styles.darkInput]}
                            placeholder="What's this room about?"
                            placeholderTextColor={isDarkMode ? '#999' : '#666'}
                            value={newRoomDesc}
                            onChangeText={setNewRoomDesc}
                        />

                        <View style={styles.switchRow}>
                            <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Public Room</Text>
                            <Switch
                                value={newRoomPublic}
                                onValueChange={setNewRoomPublic}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={newRoomPublic ? '#003366' : '#f4f3f4'}
                            />
                        </View>

                        {!newRoomPublic && (
                            <>
                                <Text style={[styles.inputLabel, isDarkMode && styles.darkText]}>Room PIN (optional)</Text>
                                <TextInput
                                    style={[styles.input, isDarkMode && styles.darkInput]}
                                    placeholder="3-digit PIN"
                                    placeholderTextColor={isDarkMode ? '#999' : '#666'}
                                    value={newRoomPin}
                                    onChangeText={setNewRoomPin}
                                    keyboardType="numeric"
                                    maxLength={3}
                                />
                            </>
                        )}

                        <TouchableOpacity
                            style={[styles.primaryButton, !newRoomName.trim() && styles.loginButtonDisabled]}
                            onPress={createRoom}
                            disabled={!newRoomName.trim()}
                        >
                            <Text style={styles.primaryButtonText}>Create Room</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => {
                                setShowCreateRoom(false)
                                setNewRoomName('')
                                setNewRoomDesc('')
                                setNewRoomPin('')
                            }}
                        >
                            <Text style={styles.secondaryButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

function EventsScreen({ isDarkMode }) {
    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <View style={[styles.section, isDarkMode && styles.darkSection]}>
                <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>📅 Events & Activities</Text>
            </View>
            <FlatList
                data={events}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.eventCard, isDarkMode && styles.darkCard]}>
                        <Text style={[styles.eventCardTitle, isDarkMode && styles.darkText]}>{item.title}</Text>
                        <Text style={[styles.eventCardDate, isDarkMode && styles.darkSubText]}>📅 {item.date}</Text>
                        {item.frequency && (
                            <Text style={[styles.eventCardDetail, isDarkMode && styles.darkSubText]}>📻 {item.frequency}</Text>
                        )}
                        {item.location && (
                            <Text style={[styles.eventCardDetail, isDarkMode && styles.darkSubText]}>📍 {item.location}</Text>
                        )}
                        {item.type && (
                            <Text style={[styles.eventCardDetail, isDarkMode && styles.darkSubText]}>🏆 {item.type}</Text>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

function SettingsScreen({ userRole, userStatus, onStatusChange, isDarkMode, onToggleDarkMode, onLogout }) {
    const [notifications, setNotifications] = useState({
        messages: true,
        emergency: true,
        events: false
    })

    return (
        <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
            <ScrollView>
                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>⚙️ Settings</Text>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>User Profile</Text>
                    <Text style={[styles.settingLabel, isDarkMode && styles.darkSubText]}>Callsign: {userRole.callsign}</Text>
                    <Text style={[styles.settingLabel, isDarkMode && styles.darkSubText]}>Role: {userRole.badge} {userRole.name}</Text>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Status</Text>
                    {Object.entries(USER_STATUS).map(([key, status]) => (
                        <TouchableOpacity
                            key={key}
                            style={[styles.statusOption, userStatus === key && styles.statusOptionSelected]}
                            onPress={() => onStatusChange(key)}
                        >
                            <Ionicons name={status.icon} size={20} color={status.color} />
                            <Text style={[styles.statusOptionText, isDarkMode && styles.darkText]}>{status.label}</Text>
                            {userStatus === key && <Ionicons name="checkmark" size={20} color="#003366" />}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Appearance</Text>
                    <View style={styles.switchRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={20} color={isDarkMode ? '#ffa500' : '#003366'} />
                            <Text style={[styles.settingLabel, { marginLeft: 10 }, isDarkMode && styles.darkText]}>
                                Dark Mode
                            </Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={onToggleDarkMode}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={isDarkMode ? '#ffa500' : '#f4f3f4'}
                        />
                    </View>
                </View>

                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Notifications</Text>
                    <View style={styles.switchRow}>
                        <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>New Messages</Text>
                        <Switch
                            value={notifications.messages}
                            onValueChange={(value) => setNotifications({ ...notifications, messages: value })}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={notifications.messages ? '#003366' : '#f4f3f4'}
                        />
                    </View>
                    <View style={styles.switchRow}>
                        <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Emergency Alerts</Text>
                        <Switch
                            value={notifications.emergency}
                            onValueChange={(value) => setNotifications({ ...notifications, emergency: value })}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={notifications.emergency ? '#003366' : '#f4f3f4'}
                        />
                    </View>
                    <View style={styles.switchRow}>
                        <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Event Reminders</Text>
                        <Switch
                            value={notifications.events}
                            onValueChange={(value) => setNotifications({ ...notifications, events: value })}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={notifications.events ? '#003366' : '#f4f3f4'}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButtonFull} onPress={onLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                    <Text style={styles.logoutButtonFullText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const Tab = createBottomTabNavigator()

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userRole, setUserRole] = useState(null)
    const [userStatus, setUserStatus] = useState('ONLINE')
    const [isDarkMode, setIsDarkMode] = useState(false)

    const handleLogin = (role) => {
        setUserRole(role)
        setIsLoggedIn(true)
        Alert.alert(
            'Login Successful',
            `Welcome ${role.name}! ${role.badge}`,
            [{ text: 'OK' }]
        )
    }

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        setIsLoggedIn(false)
                        setUserRole(null)
                        setUserStatus('ONLINE')
                    }
                }
            ]
        )
    }

    const handleStatusChange = (newStatus) => {
        setUserStatus(newStatus)
        Alert.alert('Status Updated', `Your status is now: ${USER_STATUS[newStatus].label}`)
    }

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />
    }

    return (
        <>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => {
                            let iconName
                            if (route.name === 'Home') iconName = 'home-outline'
                            else if (route.name === 'Weather') iconName = 'thunderstorm-outline'
                            else if (route.name === 'Check-In') iconName = 'checkmark-circle-outline'
                            else if (route.name === 'Meetings') iconName = 'calendar-outline'
                            else if (route.name === 'Frequencies') iconName = 'radio-outline'
                            else if (route.name === 'Chat') iconName = 'chatbubbles-outline'
                            else if (route.name === 'Members') iconName = 'people-outline'
                            else if (route.name === 'Events') iconName = 'trophy-outline'
                            else if (route.name === 'Info') iconName = 'information-circle-outline'
                            else if (route.name === 'Settings') iconName = 'settings-outline'
                            return <Ionicons name={iconName} size={size} color={color} />
                        },
                        tabBarActiveTintColor: isDarkMode ? '#66b3ff' : '#003366',
                        tabBarInactiveTintColor: isDarkMode ? '#999' : 'gray',
                        tabBarStyle: {
                            backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                            borderTopColor: isDarkMode ? '#333' : '#e0e0e0'
                        }
                    })}
                >
                    <Tab.Screen name="Home">
                        {props => (
                            <HomeScreen
                                {...props}
                                userRole={userRole}
                                userStatus={userStatus}
                                onLogout={handleLogout}
                                onStatusChange={handleStatusChange}
                                isDarkMode={isDarkMode}
                            />
                        )}
                    </Tab.Screen>
                    <Tab.Screen name="Weather">
                        {props => <WeatherEmergencyScreen {...props} userRole={userRole} isDarkMode={isDarkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Check-In">
                        {props => <CheckInScreen {...props} userRole={userRole} isDarkMode={isDarkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Meetings">
                        {props => <MeetingsScreen {...props} userRole={userRole} isDarkMode={isDarkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Frequencies">
                        {props => <FrequencyListScreen {...props} isDarkMode={isDarkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Chat">
                        {props => <ChatScreen {...props} userRole={userRole} isDarkMode={isDarkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Members">
                        {props => <MembersScreen {...props} isDarkMode={isDarkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Events">
                        {props => <EventsScreen {...props} isDarkMode={isDarkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Info">
                        {props => <InfoScreen {...props} isDarkMode={isDarkMode} />}
                    </Tab.Screen>
                    <Tab.Screen name="Settings">
                        {props => (
                            <SettingsScreen
                                {...props}
                                userRole={userRole}
                                userStatus={userStatus}
                                onStatusChange={handleStatusChange}
                                isDarkMode={isDarkMode}
                                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                                onLogout={handleLogout}
                            />
                        )}
                    </Tab.Screen>
                </Tab.Navigator>
            </NavigationContainer>
        </>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8'
    },
    darkContainer: {
        backgroundColor: '#121212'
    },
    section: {
        margin: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3
    },
    darkSection: {
        backgroundColor: '#1e1e1e',
        shadowColor: '#000',
        shadowOpacity: 0.3
    },
    darkCard: {
        backgroundColor: '#2a2a2a'
    },
    darkText: {
        color: '#ffffff'
    },
    darkSubText: {
        color: '#cccccc'
    },
    darkAccent: {
        color: '#66b3ff'
    },
    darkInput: {
        backgroundColor: '#2a2a2a',
        borderColor: '#444',
        color: '#ffffff'
    },
    darkBadge: {
        backgroundColor: '#003366',
        color: '#66b3ff'
    },
    darkChatBubble: {
        backgroundColor: '#2a2a2a'
    },
    darkMyMessage: {
        backgroundColor: '#004080'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#003366'
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#003366'
    },
    callsign: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0066cc',
        marginTop: 4
    },
    infoText: {
        fontSize: 14,
        marginVertical: 3,
        color: '#333'
    },
    bodyText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginBottom: 8
    },
    linkText: {
        fontSize: 14,
        color: '#0066cc',
        marginTop: 8
    },
    eventItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#003366'
    },
    eventDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 10,
        marginTop: 8,
        borderRadius: 8,
        backgroundColor: '#f9f9f9'
    },
    memberCard: {
        margin: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2
    },
    memberHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366'
    },
    memberCallsign: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0066cc'
    },
    licenseClass: {
        fontSize: 12,
        backgroundColor: '#e6f0ff',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        color: '#003366'
    },
    chatContainer: {
        flex: 1,
        padding: 10
    },
    chatHeader: {
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    roomTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
        marginLeft: 8
    },
    roomDesc: {
        fontSize: 12,
        color: '#666',
        marginLeft: 28
    },
    userBadge: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic'
    },
    chatBubble: {
        backgroundColor: '#e6f0ff',
        padding: 12,
        borderRadius: 12,
        marginVertical: 4,
        maxWidth: '80%',
        alignSelf: 'flex-start'
    },
    myMessage: {
        backgroundColor: '#003366',
        alignSelf: 'flex-end'
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    messageUser: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003366'
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        marginLeft: 8
    },
    chatText: {
        fontSize: 14,
        color: '#003366'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 25,
        paddingHorizontal: 10,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: -2 },
        elevation: 5
    },
    chatInput: {
        flex: 1,
        padding: 10,
        fontSize: 14,
        maxHeight: 100
    },
    sendButton: {
        backgroundColor: '#003366',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 12,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 8,
        fontSize: 16
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 10
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        fontSize: 14
    },
    eventCard: {
        margin: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3
    },
    eventCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 8
    },
    eventCardDate: {
        fontSize: 14,
        color: '#333',
        marginVertical: 3
    },
    eventCardDetail: {
        fontSize: 13,
        color: '#666',
        marginVertical: 2
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        width: '85%',
        maxHeight: '70%'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 15,
        textAlign: 'center'
    },
    freqItem: {
        padding: 12,
        backgroundColor: '#f0f4f8',
        borderRadius: 8,
        marginBottom: 10
    },
    freqName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 5
    },
    freqDetail: {
        fontSize: 13,
        color: '#333',
        marginVertical: 2
    },
    closeButton: {
        backgroundColor: '#003366',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    primaryButton: {
        backgroundColor: '#003366',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    secondaryButton: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: 'bold'
    },
    loginContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
        padding: 20
    },
    loginBox: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8
    },
    loginTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#003366',
        marginTop: 15
    },
    loginSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30
    },
    loginFormContainer: {
        width: '100%',
        marginTop: 20
    },
    loginLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8
    },
    pinInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#003366',
        borderRadius: 10,
        backgroundColor: '#f9f9f9'
    },
    pinInput: {
        flex: 1,
        padding: 15,
        fontSize: 18,
        letterSpacing: 8,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    eyeButton: {
        padding: 10
    },
    loginButton: {
        backgroundColor: '#003366',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#003366',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3
    },
    loginButtonDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    roleInfoContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#e6f0ff',
        borderRadius: 10
    },
    roleInfoTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 5,
        textAlign: 'center'
    },
    roleInfo: {
        fontSize: 14,
        color: '#003366',
        textAlign: 'center'
    },
    headerWithLogout: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%'
    },
    logoutButton: {
        alignItems: 'center',
        padding: 8
    },
    logoutText: {
        fontSize: 10,
        color: '#cc0000',
        marginTop: 2,
        fontWeight: '600'
    },
    roleBadge: {
        fontSize: 14,
        color: '#0066cc',
        marginTop: 8,
        fontWeight: '600'
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        paddingHorizontal: 8,
        paddingVertical: 3,
        backgroundColor: '#f0f0f0',
        borderRadius: 10
    },
    statusText: {
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '600'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 10
    },
    settingLabel: {
        fontSize: 14,
        color: '#333',
        marginVertical: 3
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginVertical: 4,
        backgroundColor: '#f9f9f9'
    },
    statusOptionSelected: {
        backgroundColor: '#e6f0ff',
        borderWidth: 2,
        borderColor: '#003366'
    },
    statusOptionText: {
        fontSize: 14,
        marginLeft: 10,
        flex: 1,
        color: '#333'
    },
    logoutButtonFull: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cc0000',
        margin: 10,
        padding: 15,
        borderRadius: 10
    },
    logoutButtonFullText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10
    },
    roomList: {
        maxHeight: 400
    },
    roomItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginVertical: 4
    },
    roomItemSelected: {
        backgroundColor: '#e6f0ff',
        borderWidth: 2,
        borderColor: '#003366'
    },
    roomName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#003366'
    },
    roomDescription: {
        fontSize: 12,
        color: '#666'
    },
    createRoomButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00aa00',
        padding: 12,
        borderRadius: 8,
        marginTop: 10
    },
    createRoomButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8
    },
    reactionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5
    },
    reactionBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 4,
        marginTop: 2
    },
    reactionEmoji: {
        fontSize: 14
    },
    reactionCount: {
        fontSize: 10,
        marginLeft: 2,
        color: '#666',
        fontWeight: 'bold'
    },
    reactionPicker: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        padding: 8,
        borderRadius: 20,
        alignSelf: 'center',
        marginVertical: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5
    },
    reactionPickerButton: {
        padding: 6,
        marginHorizontal: 2
    },
    reactionPickerEmoji: {
        fontSize: 24
    },
    deleteMessageButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        padding: 4
    },
    // NEW STYLES FOR EMERGENCY/WEATHER FEATURES
    emergencyAlertButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cc0000',
        margin: 10,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#cc0000',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6
    },
    emergencyAlertText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10
    },
    alertCard: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderLeftWidth: 4
    },
    alertWarning: {
        backgroundColor: '#ffe6e6',
        borderLeftColor: '#cc0000'
    },
    alertWatch: {
        backgroundColor: '#fff3e6',
        borderLeftColor: '#ff6600'
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#cc0000',
        marginLeft: 8
    },
    alertArea: {
        fontSize: 13,
        color: '#666',
        marginTop: 5
    },
    alertMessage: {
        fontSize: 14,
        color: '#333',
        marginTop: 8,
        lineHeight: 20
    },
    alertExpires: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic'
    },
    noAlertsContainer: {
        alignItems: 'center',
        padding: 20
    },
    noAlertsText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10
    },
    radarPlaceholder: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#e6f0ff',
        borderRadius: 10,
        marginTop: 10
    },
    radarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0066cc',
        marginTop: 10
    },
    radarSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 5
    },
    skywarnButton: {
        backgroundColor: '#9900cc',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    skywarnButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    freqCard: {
        backgroundColor: '#f0f4f8',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10
    },
    freqCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 5
    },
    freqCardDetail: {
        fontSize: 13,
        color: '#666'
    },
    emergencyInput: {
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 12,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 8,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top'
    },
    emergencyButton: {
        backgroundColor: '#cc0000',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15
    },
    warningText: {
        fontSize: 12,
        color: '#ff6600',
        textAlign: 'center',
        marginVertical: 10
    },
    // CHECK-IN STYLES
    checkInButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00aa00',
        padding: 15,
        borderRadius: 10,
        marginTop: 10
    },
    checkInButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10
    },
    checkInCard: {
        margin: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2
    },
    checkInCallsign: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0066cc',
        marginBottom: 5
    },
    checkInLocation: {
        fontSize: 14,
        color: '#666',
        marginTop: 3
    },
    checkInTime: {
        fontSize: 12,
        color: '#999',
        marginTop: 3
    },
    statusPicker: {
        flexDirection: 'row',
        gap: 10,
        marginVertical: 10
    },
    statusPickerButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center'
    },
    statusPickerButtonSelected: {
        backgroundColor: '#00aa00'
    },
    statusPickerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333'
    },
    // MEETINGS STYLES
    createMeetingButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0066cc',
        padding: 12,
        borderRadius: 8,
        marginTop: 10
    },
    createMeetingButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8
    },
    meetingCard: {
        margin: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#0066cc'
    },
    meetingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 8
    },
    meetingDetail: {
        fontSize: 14,
        color: '#666',
        marginVertical: 3
    },
    // FREQUENCY LIST STYLES
    filterScroll: {
        marginTop: 10
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8
    },
    filterButtonSelected: {
        backgroundColor: '#003366'
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666'
    },
    filterButtonTextSelected: {
        color: '#ffffff'
    },
    frequencyCard: {
        margin: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2
    },
    freqListName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#003366',
        marginBottom: 4
    },
    freqListFreq: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0066cc',
        marginBottom: 8
    },
    freqTypeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginLeft: 10
    },
    freqDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    freqDetailSmall: {
        fontSize: 12,
        color: '#666'
    },
    freqNotes: {
        fontSize: 13,
        color: '#333',
        fontStyle: 'italic',
        marginTop: 5
    },
    emergencyQuickButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cc0000',
        padding: 12,
        borderRadius: 8,
        marginTop: 10
    },
    emergencyQuickButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8
    }
})

