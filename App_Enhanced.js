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
    StatusBar
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
    serverTimestamp
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
    location: 'Phoenix, AZ'
}

const members = [
    { id: '1', name: 'Alice Johnson', callsign: 'KE7ABC', license: 'Extra' },
    { id: '2', name: 'Bob Smith', callsign: 'N7XYZ', license: 'General' },
    { id: '3', name: 'Charlie Brown', callsign: 'KD7DEF', license: 'Technician' },
    { id: '4', name: 'Diana Prince', callsign: 'W7WXY', license: 'Extra' },
    { id: '5', name: 'Eve Davis', callsign: 'KE7GHI', license: 'General' }
]

const events = [
    { id: '1', title: 'Weekly Net', date: 'Every Friday 7 PM', frequency: '146.880 MHz' },
    { id: '2', title: 'Field Day', date: 'June 24-25, 2026', location: 'City Park' },
    { id: '3', title: 'ARRL Sweepstakes', date: 'November 2026', type: 'Contest' },
    { id: '4', title: 'Technician Class', date: 'March 15, 2026', location: 'Fire Station' }
]

// Default chat rooms
const DEFAULT_ROOMS = [
    { id: 'general', name: 'General Chat', icon: 'chatbubbles', description: 'Main club chat', public: true },
    { id: 'tech', name: 'Technical Discussion', icon: 'hardware-chip', description: 'Equipment and tech talk', public: true },
    { id: 'emergency', name: 'Emergency Alerts', icon: 'warning', description: 'Weather and emergency info', public: true },
    { id: 'contests', name: 'Contests & Events', icon: 'trophy', description: 'Contest coordination', public: true }
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
                <Text style={styles.loginSubtitle}>Ham Radio Club</Text>

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
                        <Text style={styles.loginButtonText}>Login</Text>
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

function HomeScreen({ userRole, userStatus, onLogout, onStatusChange, isDarkMode }) {
    const bgColor = isDarkMode ? styles.darkContainer : styles.container

    return (
        <SafeAreaView style={[styles.container, bgColor]}>
            <ScrollView>
                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <View style={styles.headerWithLogout}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, isDarkMode && styles.darkText]}>
                                📻 Welcome to {clubInfo.name}!
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
    const [selectedRoom, setSelectedRoom] = useState('general')
    const [showRoomList, setShowRoomList] = useState(false)
    const [showCreateRoom, setShowCreateRoom] = useState(false)
    const [showPrivateMessages, setShowPrivateMessages] = useState(false)
    const [rooms, setRooms] = useState(DEFAULT_ROOMS)
    const [message, setMessage] = useState('')
    const [chatMessages, setChatMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [showReactions, setShowReactions] = useState(null)

    // New Room Creation
    const [newRoomName, setNewRoomName] = useState('')
    const [newRoomDesc, setNewRoomDesc] = useState('')
    const [newRoomPin, setNewRoomPin] = useState('')
    const [newRoomPublic, setNewRoomPublic] = useState(true)

    useEffect(() => {
        const q = query(
            collection(db, 'messages'),
            where('roomId', '==', selectedRoom),
            orderBy('createdAt', 'desc')
        )
        const unsubscribe = onSnapshot(
            q,
            snapshot => {
                const msgs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setChatMessages(msgs)
                setLoading(false)
            },
            error => {
                console.error('Error fetching messages:', error)
                setLoading(false)
            }
        )
        return () => unsubscribe()
    }, [selectedRoom])

    const sendMessage = async () => {
        if (message.trim() !== '') {
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
                // Remove reaction
                reactions[userRole.callsign] = userReaction.filter(e => e !== emoji)
            } else {
                // Add reaction
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
                {/* Room Header */}
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

                {/* Messages */}
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

                                        {/* Reactions Display */}
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

                                    {/* Reaction Picker */}
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

                {/* Input */}
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

            {/* Room List Modal */}
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

            {/* Create Room Modal */}
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

                {/* User Info */}
                <View style={[styles.section, isDarkMode && styles.darkSection]}>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>User Profile</Text>
                    <Text style={[styles.settingLabel, isDarkMode && styles.darkSubText]}>Callsign: {userRole.callsign}</Text>
                    <Text style={[styles.settingLabel, isDarkMode && styles.darkSubText]}>Role: {userRole.badge} {userRole.name}</Text>
                </View>

                {/* Status */}
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

                {/* Appearance */}
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

                {/* Notifications */}
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

                {/* Logout */}
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
                            else if (route.name === 'Info') iconName = 'information-circle-outline'
                            else if (route.name === 'Members') iconName = 'people-outline'
                            else if (route.name === 'Chat') iconName = 'chatbubbles-outline'
                            else if (route.name === 'Events') iconName = 'calendar-outline'
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
    }
})
