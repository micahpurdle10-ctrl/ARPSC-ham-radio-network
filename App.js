import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  StyleSheet,
  Alert,
  Switch,
  StatusBar,
  Linking
} from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

const Tab = createBottomTabNavigator()

const ROLES = {
  OWNER: { pin: '501', name: 'Owner' },
  MOD: { pin: '236', name: 'Moderator' },
  USER: { pin: '958', name: 'User' }
}

const LOCAL_AREA = {
  city: 'Phoenix',
  state: 'AZ',
  county: 'Maricopa County'
}

const SAFETY_LINKS = {
  shelters: `https://www.google.com/maps/search/emergency+shelter+near+${encodeURIComponent(`${LOCAL_AREA.city} ${LOCAL_AREA.state}`)}/`,
  outagesLocal: `https://www.google.com/maps/search/power+outage+map+${encodeURIComponent(`${LOCAL_AREA.county} ${LOCAL_AREA.state}`)}/`,
  outagesAps: 'https://outagemap.aps.com/',
  outagesSrp: 'https://myaccount.srpnet.com/power/myaccount/outages/',
  noaaRadio: 'https://www.swpc.noaa.gov/communities/radio-communications'
}

const RESOURCE_BOARD = [
  { id: 'r1', label: 'Bottled Water', qty: '120 cases', status: 'Ready' },
  { id: 'r2', label: 'First Aid Kits', qty: '35 kits', status: 'Ready' },
  { id: 'r3', label: 'Blankets', qty: '90', status: 'Low' },
  { id: 'r4', label: 'Fuel Cans', qty: '14', status: 'Deploying' }
]

const EQUIPMENT_BOARD = [
  { id: 'e1', name: 'Portable HF Station', location: 'EOC', status: 'Available' },
  { id: 'e2', name: 'Mobile Repeater Trailer', location: 'West Shelter', status: 'Deployed' },
  { id: 'e3', name: 'Generator 5kW', location: 'North Shelter', status: 'Deployed' },
  { id: 'e4', name: 'Go-Kit #3', location: 'Maintenance Bay', status: 'Maintenance' }
]

function getPalette(isDark, stormMode) {
  if (stormMode) {
    return {
      bg: '#240808',
      panel: '#3b1010',
      text: '#ffe9e9',
      subText: '#ffcccc',
      border: '#8f2222',
      accent: '#ff5a5a',
      tabBackground: '#2f0c0c'
    }
  }

  if (isDark) {
    return {
      bg: '#1a1a1a',
      panel: '#2a2a2a',
      text: '#ffffff',
      subText: '#cccccc',
      border: '#333333',
      accent: '#ff9500',
      tabBackground: '#0f0f0f'
    }
  }

  return {
    bg: '#ffffff',
    panel: '#f5f5f5',
    text: '#000000',
    subText: '#333333',
    border: '#dddddd',
    accent: '#ff9500',
    tabBackground: '#f5f5f5'
  }
}

function getStatusColor(status) {
  if (status === 'Available' || status === 'Ready') return '#25b84f'
  if (status === 'Deployed' || status === 'Deploying') return '#f39c12'
  return '#e74c3c'
}

function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState('')
  const [callsign, setCallsign] = useState('')

  const handleLogin = () => {
    if (!callsign.trim()) {
      Alert.alert('Error', 'Please enter a callsign')
      return
    }
    if (!pin.trim()) {
      Alert.alert('Error', 'Please enter a PIN')
      return
    }

    let role = null
    for (const [key, val] of Object.entries(ROLES)) {
      if (val.pin === pin) {
        role = key
        break
      }
    }

    if (role) {
      onLogin({ callsign, role })
    } else {
      Alert.alert('Invalid PIN', 'Try: 501, 236, or 958')
    }
  }

  return (
    <SafeAreaView style={[appStyles.container, { backgroundColor: '#2c3e50' }]}>
      <ScrollView contentContainerStyle={appStyles.center}>
        <Text style={appStyles.logo}>📻</Text>
        <Text style={appStyles.title}>ARPSC Hams</Text>
        <Text style={appStyles.subtitle}>Ham Radio Club Network</Text>

        <View style={appStyles.form}>
          <Text style={appStyles.label}>Callsign</Text>
          <TextInput
            style={appStyles.input}
            placeholder="e.g., KE7ABC"
            placeholderTextColor="#999"
            value={callsign}
            onChangeText={setCallsign}
          />

          <Text style={appStyles.label}>PIN</Text>
          <TextInput
            style={appStyles.input}
            placeholder="Enter PIN"
            placeholderTextColor="#999"
            secureTextEntry
            value={pin}
            onChangeText={setPin}
          />

          <Text style={appStyles.hint}>Demo: 501 (Owner), 236 (Mod), 958 (User)</Text>

          <TouchableOpacity style={appStyles.btn} onPress={handleLogin}>
            <Text style={appStyles.btnText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function HomeScreen({ user, isDark, stormMode, onOpenSafety, onActivateStormMode }) {
  const palette = getPalette(isDark, stormMode)

  return (
    <SafeAreaView style={[appStyles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView>
        <View style={[appStyles.header, { borderBottomColor: palette.border }]}>
          <Text style={[appStyles.headerTitle, { color: palette.text }]}>ARPSC Hams</Text>
          <Text style={[appStyles.subtitle, { color: palette.subText }]}>Welcome, {user.callsign}</Text>
        </View>

        {stormMode && (
          <View style={[appStyles.stormBanner, { borderColor: palette.border }]}>
            <Text style={appStyles.stormBannerText}>Storm Mode Active: Emergency-first layout enabled.</Text>
          </View>
        )}

        <View style={[appStyles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={[appStyles.cardTitle, { color: palette.text }]}>Club Info</Text>
          <Text style={[appStyles.cardText, { color: palette.subText }]}>Main Repeater: 146.880 MHz</Text>
          <Text style={[appStyles.cardText, { color: palette.subText }]}>Weekly Net: Fridays 7 PM</Text>
          <Text style={[appStyles.cardText, { color: palette.subText }]}>Location: Phoenix, AZ</Text>
        </View>

        <TouchableOpacity style={[appStyles.quickActionBtn, { backgroundColor: palette.accent }]} onPress={onOpenSafety}>
          <Text style={appStyles.quickActionText}>OPEN SAFETY CENTER</Text>
        </TouchableOpacity>

        {(user.role === 'OWNER' || user.role === 'MOD') && (
          <TouchableOpacity style={appStyles.emergencyBtn} onPress={onActivateStormMode}>
            <Text style={appStyles.emergencyBtnText}>ACTIVATE STORM MODE</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function SafetyScreen({ isDark, stormMode, onToggleStormMode }) {
  const palette = getPalette(isDark, stormMode)
  const [showSafetyTools, setShowSafetyTools] = useState(false)
  const [loadingSolar, setLoadingSolar] = useState(false)
  const [solarError, setSolarError] = useState('')
  const [solarData, setSolarData] = useState(null)

  const openUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (!supported) {
        Alert.alert('Unable to Open Link', 'Your device cannot open this URL.')
        return
      }
      await Linking.openURL(url)
    } catch (error) {
      Alert.alert('Link Error', 'Could not open the requested map.')
    }
  }

  const fetchNoaaSolarData = async () => {
    setLoadingSolar(true)
    setSolarError('')

    try {
      const [fluxRes, kpRes, ssnRes] = await Promise.all([
        fetch('https://services.swpc.noaa.gov/json/f107_cm_flux.json'),
        fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json'),
        fetch('https://services.swpc.noaa.gov/json/solar-cycle/swpc_observed_ssn.json')
      ])

      if (!fluxRes.ok || !kpRes.ok || !ssnRes.ok) {
        throw new Error('NOAA service unavailable')
      }

      const [fluxData, kpData, ssnData] = await Promise.all([fluxRes.json(), kpRes.json(), ssnRes.json()])

      const latestFlux = Array.isArray(fluxData) && fluxData.length > 0 ? fluxData[fluxData.length - 1] : null
      const latestKp = Array.isArray(kpData) && kpData.length > 0 ? kpData[kpData.length - 1] : null
      const latestSsn = Array.isArray(ssnData) && ssnData.length > 0 ? ssnData[ssnData.length - 1] : null

      setSolarData({
        flux: typeof latestFlux?.flux === 'number' ? latestFlux.flux.toFixed(1) : 'N/A',
        kpIndex: typeof latestKp?.kp_index === 'number' ? latestKp.kp_index.toFixed(1) : 'N/A',
        sunspots: typeof latestSsn?.swpc_ssn === 'number' ? latestSsn.swpc_ssn.toString() : 'N/A',
        updatedAt: latestFlux?.time_tag || latestKp?.time_tag || latestSsn?.Obsdate || 'N/A'
      })
    } catch (error) {
      setSolarError('Could not load NOAA solar data right now.')
      setSolarData(null)
    } finally {
      setLoadingSolar(false)
    }
  }

  useEffect(() => {
    fetchNoaaSolarData()
  }, [])

  const handleSafetyAction = () => {
    setShowSafetyTools(true)
    if (!stormMode) {
      onToggleStormMode()
    }
  }

  return (
    <SafeAreaView style={[appStyles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView>
        <View style={[appStyles.header, { borderBottomColor: palette.border }]}>
          <Text style={[appStyles.headerTitle, { color: palette.text }]}>Safety Center</Text>
          <Text style={[appStyles.subtitle, { color: palette.subText }]}>One tap for emergency tools</Text>
        </View>

        <View style={[appStyles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <TouchableOpacity style={appStyles.safetyActionBtn} onPress={handleSafetyAction}>
            <Text style={appStyles.safetyActionText}>SAFETY MODE BUTTON</Text>
            <Text style={appStyles.safetyActionSubText}>Opens maps, boards, and storm layout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[appStyles.secondaryStormBtn, { borderColor: palette.border }]}
            onPress={onToggleStormMode}
          >
            <Text style={[appStyles.secondaryStormBtnText, { color: palette.text }]}>
              {stormMode ? 'Disable Storm Mode' : 'Enable Storm Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {showSafetyTools && (
          <>
            <View style={[appStyles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
              <Text style={[appStyles.cardTitle, { color: palette.text }]}>Local Shelter And Power Outage Maps ({LOCAL_AREA.city}, {LOCAL_AREA.state})</Text>
              <TouchableOpacity style={[appStyles.mapBtn, { backgroundColor: palette.accent }]} onPress={() => openUrl(SAFETY_LINKS.shelters)}>
                <Text style={appStyles.mapBtnText}>Open Local Shelter Map</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[appStyles.mapBtn, { backgroundColor: palette.accent }]} onPress={() => openUrl(SAFETY_LINKS.outagesLocal)}>
                <Text style={appStyles.mapBtnText}>Open {LOCAL_AREA.county} Outage Resources</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[appStyles.mapBtn, { backgroundColor: palette.accent }]} onPress={() => openUrl(SAFETY_LINKS.outagesAps)}>
                <Text style={appStyles.mapBtnText}>Open APS Outage Map</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[appStyles.mapBtn, { backgroundColor: palette.accent }]} onPress={() => openUrl(SAFETY_LINKS.outagesSrp)}>
                <Text style={appStyles.mapBtnText}>Open SRP Outage Map</Text>
              </TouchableOpacity>
            </View>

            <View style={[appStyles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
              <Text style={[appStyles.cardTitle, { color: palette.text }]}>Resource And Equipment Board</Text>
              {RESOURCE_BOARD.map(item => (
                <View key={item.id} style={[appStyles.boardRow, { borderColor: palette.border }]}>
                  <Text style={[appStyles.boardLabel, { color: palette.text }]}>{item.label}</Text>
                  <Text style={[appStyles.boardMeta, { color: palette.subText }]}>{item.qty}</Text>
                  <Text style={[appStyles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
              ))}
              {EQUIPMENT_BOARD.map(item => (
                <View key={item.id} style={[appStyles.boardRow, { borderColor: palette.border }]}>
                  <Text style={[appStyles.boardLabel, { color: palette.text }]}>{item.name}</Text>
                  <Text style={[appStyles.boardMeta, { color: palette.subText }]}>Location: {item.location}</Text>
                  <Text style={[appStyles.statusPill, { backgroundColor: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
              ))}
            </View>

            <View style={[appStyles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
              <Text style={[appStyles.cardTitle, { color: palette.text }]}>NOAA Solar Data</Text>

              {loadingSolar && <Text style={[appStyles.cardText, { color: palette.subText }]}>Loading NOAA solar data...</Text>}
              {solarError ? <Text style={appStyles.errorText}>{solarError}</Text> : null}

              {solarData && (
                <>
                  <Text style={[appStyles.cardText, { color: palette.subText }]}>Solar Flux (F10.7): {solarData.flux}</Text>
                  <Text style={[appStyles.cardText, { color: palette.subText }]}>Planetary K-Index: {solarData.kpIndex}</Text>
                  <Text style={[appStyles.cardText, { color: palette.subText }]}>Observed Sunspot Number: {solarData.sunspots}</Text>
                  <Text style={[appStyles.cardText, { color: palette.subText }]}>Updated: {solarData.updatedAt}</Text>
                </>
              )}

              <TouchableOpacity style={[appStyles.mapBtn, { backgroundColor: palette.accent }]} onPress={fetchNoaaSolarData}>
                <Text style={appStyles.mapBtnText}>Refresh NOAA Data</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[appStyles.linkBtn, { borderColor: palette.border }]} onPress={() => openUrl(SAFETY_LINKS.noaaRadio)}>
                <Text style={[appStyles.linkBtnText, { color: palette.text }]}>Open NOAA Radio Conditions Page</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function ChatScreen({ isDark, stormMode }) {
  const palette = getPalette(isDark, stormMode)
  const [messages] = useState([
    { id: 1, user: 'KE7ABC', text: 'Good evening everyone!' },
    { id: 2, user: 'N7XYZ', text: 'Hi there!' },
    { id: 3, user: 'KD7DEF', text: 'Anyone for the net?' }
  ])

  return (
    <SafeAreaView style={[appStyles.screen, { backgroundColor: palette.bg }]}>
      <View style={[appStyles.header, { borderBottomColor: palette.border }]}>
        <Text style={[appStyles.headerTitle, { color: palette.text }]}>Chat</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[appStyles.msg, { backgroundColor: palette.panel }]}>
            <Text style={[appStyles.msgUser, { color: palette.text }]}>{item.user}</Text>
            <Text style={[appStyles.msgText, { color: palette.subText }]}>{item.text}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

function FreqScreen({ isDark, stormMode }) {
  const palette = getPalette(isDark, stormMode)
  const freqs = [
    { name: 'Main Repeater', freq: '146.880 MHz' },
    { name: 'Backup Repeater', freq: '147.120 MHz' },
    { name: 'Emergency', freq: '146.520 MHz' },
    { name: 'APRS', freq: '144.390 MHz' },
    { name: 'UHF', freq: '449.500 MHz' },
    { name: 'D-STAR', freq: '145.330 MHz' }
  ]

  return (
    <SafeAreaView style={[appStyles.screen, { backgroundColor: palette.bg }]}>
      <View style={[appStyles.header, { borderBottomColor: palette.border }]}>
        <Text style={[appStyles.headerTitle, { color: palette.text }]}>Frequencies</Text>
      </View>
      <FlatList
        data={freqs}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[appStyles.freqCard, { backgroundColor: palette.panel }]}>
            <Text style={[appStyles.freqName, { color: palette.text }]}>{item.name}</Text>
            <Text style={[appStyles.freq, { color: palette.accent }]}>{item.freq}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

function WeatherScreen({ isDark, stormMode }) {
  const palette = getPalette(isDark, stormMode)

  return (
    <SafeAreaView style={[appStyles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView>
        <View style={[appStyles.header, { borderBottomColor: palette.border }]}>
          <Text style={[appStyles.headerTitle, { color: palette.text }]}>Weather</Text>
        </View>
        {stormMode && (
          <View style={[appStyles.card, { backgroundColor: '#7a1313', borderColor: '#ab2626' }]}>
            <Text style={[appStyles.cardTitle, { color: '#fff' }]}>Emergency Layout Enabled</Text>
            <Text style={[appStyles.cardText, { color: '#ffd9d9' }]}>Prioritizing storm and response information.</Text>
          </View>
        )}
        <View style={[appStyles.card, { backgroundColor: '#ffcc00', borderColor: '#d4a700' }]}>
          <Text style={appStyles.cardTitle}>Severe Thunderstorm Warning</Text>
          <Text style={appStyles.cardText}>Phoenix Metro Area</Text>
        </View>
        <View style={[appStyles.card, { backgroundColor: palette.panel, borderColor: palette.border }]}>
          <Text style={[appStyles.cardTitle, { color: palette.text }]}>Check-In Status</Text>
          <Text style={[appStyles.cardText, { color: palette.subText }]}>Alice KE7ABC - Online</Text>
          <Text style={[appStyles.cardText, { color: palette.subText }]}>Bob N7XYZ - Online</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function SettingsScreen({ isDark, stormMode, onToggleDark, onToggleStormMode, onLogout }) {
  const palette = getPalette(isDark, stormMode)

  return (
    <SafeAreaView style={[appStyles.screen, { backgroundColor: palette.bg }]}>
      <ScrollView>
        <View style={[appStyles.header, { borderBottomColor: palette.border }]}>
          <Text style={[appStyles.headerTitle, { color: palette.text }]}>Settings</Text>
        </View>
        <View style={[appStyles.settingRow, { borderBottomColor: palette.border }]}>
          <Text style={[appStyles.settingsLabel, { color: palette.text }]}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={onToggleDark} />
        </View>
        <View style={[appStyles.settingRow, { borderBottomColor: palette.border }]}>
          <Text style={[appStyles.settingsLabel, { color: palette.text }]}>Storm Mode</Text>
          <Switch value={stormMode} onValueChange={onToggleStormMode} />
        </View>
        <TouchableOpacity style={[appStyles.btn, { marginTop: 20, marginHorizontal: 20 }]} onPress={onLogout}>
          <Text style={appStyles.btnText}>LOGOUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [isDark, setIsDark] = useState(false)
  const [stormMode, setStormMode] = useState(false)

  useEffect(() => {
    if (stormMode && !isDark) {
      setIsDark(true)
    }
  }, [stormMode, isDark])

  if (!user) {
    return <LoginScreen onLogin={setUser} />
  }

  const tabPalette = getPalette(isDark, stormMode)

  return (
    <>
      <StatusBar barStyle={stormMode || isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color }) => {
              const icons = {
                Home: 'home',
                Safety: 'shield-checkmark',
                Chat: 'chatbubbles',
                Frequencies: 'radio',
                Weather: 'thunderstorm',
                Settings: 'settings'
              }
              return <Ionicons name={icons[route.name]} size={24} color={color} />
            },
            tabBarActiveTintColor: tabPalette.accent,
            tabBarInactiveTintColor: stormMode ? '#ffb0b0' : '#999',
            tabBarStyle: {
              backgroundColor: tabPalette.tabBackground,
              borderTopColor: tabPalette.border,
              borderTopWidth: 1
            }
          })}
        >
          <Tab.Screen name="Home">
            {({ navigation }) => (
              <HomeScreen
                user={user}
                isDark={isDark}
                stormMode={stormMode}
                onOpenSafety={() => navigation.navigate('Safety')}
                onActivateStormMode={() => setStormMode(true)}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Safety">
            {() => <SafetyScreen isDark={isDark} stormMode={stormMode} onToggleStormMode={() => setStormMode(!stormMode)} />}
          </Tab.Screen>
          <Tab.Screen name="Chat">
            {() => <ChatScreen isDark={isDark} stormMode={stormMode} />}
          </Tab.Screen>
          <Tab.Screen name="Frequencies">
            {() => <FreqScreen isDark={isDark} stormMode={stormMode} />}
          </Tab.Screen>
          <Tab.Screen name="Weather">
            {() => <WeatherScreen isDark={isDark} stormMode={stormMode} />}
          </Tab.Screen>
          <Tab.Screen name="Settings">
            {() => (
              <SettingsScreen
                isDark={isDark}
                stormMode={stormMode}
                onToggleDark={() => setIsDark(!isDark)}
                onToggleStormMode={() => setStormMode(!stormMode)}
                onLogout={() => setUser(null)}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  )
}

const appStyles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center', flexGrow: 1, padding: 20 },
  logo: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 16, marginBottom: 8 },
  form: { width: '100%', maxWidth: 300 },
  label: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8, marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#1a1a1a',
    marginBottom: 10
  },
  hint: { fontSize: 12, color: '#999', marginTop: 10, textAlign: 'center' },
  btn: { backgroundColor: '#ff9500', borderRadius: 8, padding: 14, marginTop: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  screen: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  card: { margin: 15, padding: 15, borderRadius: 8, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  cardText: { fontSize: 14, marginBottom: 4 },
  quickActionBtn: { marginHorizontal: 15, borderRadius: 8, padding: 14, alignItems: 'center' },
  quickActionText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  emergencyBtn: { backgroundColor: '#cc0000', borderRadius: 8, margin: 15, padding: 15, alignItems: 'center' },
  emergencyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  stormBanner: { margin: 15, marginBottom: 0, borderRadius: 8, borderWidth: 1, padding: 12, backgroundColor: '#6d1414' },
  stormBannerText: { color: '#fff0f0', fontWeight: '700' },
  safetyActionBtn: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  safetyActionText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  safetyActionSubText: { color: '#ffe3e3', marginTop: 4, fontSize: 12 },
  secondaryStormBtn: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  secondaryStormBtnText: { fontSize: 14, fontWeight: '700' },
  mapBtn: {
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center'
  },
  mapBtnText: { color: '#fff', fontWeight: '700' },
  linkBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    alignItems: 'center'
  },
  linkBtnText: { fontWeight: '700' },
  boardRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 8
  },
  boardLabel: { fontSize: 14, fontWeight: '700' },
  boardMeta: { fontSize: 13, marginTop: 4 },
  statusPill: {
    alignSelf: 'flex-start',
    color: '#fff',
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontWeight: '700',
    fontSize: 12
  },
  errorText: { color: '#ff6b6b', fontWeight: '700', marginBottom: 8 },
  msg: { margin: 10, padding: 12, borderRadius: 8 },
  msgUser: { fontWeight: 'bold', marginBottom: 4 },
  msgText: { fontSize: 14 },
  freqCard: { margin: 10, padding: 15, borderRadius: 8 },
  freqName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  freq: { fontSize: 18, fontWeight: '600' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1
  },
  settingsLabel: { fontSize: 15, fontWeight: '600' }
})

