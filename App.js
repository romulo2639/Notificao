import React, { useState, useEffect } from 'react';
import {
StyleSheet,
Text,
View,
TextInput,
TouchableOpacity,
Alert,
SafeAreaView,
ScrollView,
StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
handleNotification: async () => ({
shouldShowAlert: true,
shouldPlaySound: true,
shouldSetBadge: false,
}),
});

export default function App() {
const [expoPushToken, setExpoPushToken] = useState('');
const [titulo, setTitulo] = useState('');
const [mensagem, setMensagem] = useState('');
const [status, setStatus] = useState('');

useEffect(() => {
obterToken();
}, []);

async function obterToken() {
try {
if (!Device.isDevice) {
console.log('Use um dispositivo físico.');
return;
}

const { status: existingStatus } = await Notifications.getPermissionsAsync();
let finalStatus = existingStatus;

if (existingStatus !== 'granted') {
const { status } = await Notifications.requestPermissionsAsync();
finalStatus = status;
}

if (finalStatus !== 'granted') {
Alert.alert('Erro', 'Permissão de notificação negada.');
return;
}

const projectId =
Constants?.expoConfig?.extra?.eas?.projectId ||
Constants?.easConfig?.projectId;

if (!projectId) {
console.log('ProjectId não encontrado no app.json.');
return;
}

const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
setExpoPushToken(pushToken.data);
console.log('EXPO PUSH TOKEN:', pushToken.data);
} catch (e) {
console.log('Erro ao obter token:', e);
}
}

async function enviarNotificacao() {
if (!expoPushToken.trim()) {
Alert.alert('Atenção', 'Informe o Token do dispositivo.');
return;
}

if (!mensagem.trim()) {
Alert.alert('Atenção', 'Digite uma mensagem.');
return;
}

try {
const resposta = await fetch('https://exp.host/--/api/v2/push/send', {
method: 'POST',
headers: {
Accept: 'application/json',
'Accept-Encoding': 'gzip, deflate',
'Content-Type': 'application/json',
},
body: JSON.stringify({
to: expoPushToken,
sound: 'default',
title: titulo || 'Nova notificação',
body: mensagem,
data: { origem: 'painel' },
}),
});

const resultado = await resposta.json();
console.log(resultado);

Alert.alert('Sucesso', 'Notificação enviada!');
setTitulo('');
setMensagem('');
} catch (error) {
console.log(error);
Alert.alert('Erro', 'Não foi possível enviar a notificação.');
}
}

return (
<SafeAreaView style={styles.container}>
<StatusBar barStyle="light-content" backgroundColor="#0052CC" />

<View style={styles.header}>
<Text style={styles.headerTitle}>Enviar Notificação</Text>
</View>

<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

<View style={styles.inputGroup}>
<Text style={styles.label}>Token do dispositivo</Text>
<View style={styles.inputIconContainer}>
<TextInput
style={styles.inputFlex}
placeholder="ExponentPushToken[...]"
placeholderTextColor="#9CA3AF"
value={expoPushToken}
onChangeText={setExpoPushToken}
autoCapitalize="none"
/>
<Ionicons name="scan-outline" size={22} color="#6B7280" />
</View>
<Text style={styles.helperText}>
Cole o Expo Push Token do dispositivo que irá receber a notificação.
</Text>
</View>

<View style={styles.inputGroup}>
<Text style={styles.label}>Título</Text>
<TextInput
style={styles.input}
placeholder="Ex: Promoção Especial"
placeholderTextColor="#9CA3AF"
value={titulo}
onChangeText={setTitulo}
/>
<Text style={styles.helperText}>
Título que aparecerá na notificação.
</Text>
</View>

<View style={styles.inputGroup}>
<Text style={styles.label}>Mensagem</Text>
<TextInput
style={[styles.input, styles.textArea]}
placeholder="Digite sua mensagem..."
placeholderTextColor="#9CA3AF"
value={mensagem}
onChangeText={setMensagem}
multiline
numberOfLines={6}
textAlignVertical="top"
/>
<Text style={styles.helperText}>
Mensagem que será enviada na notificação.
</Text>
</View>

<TouchableOpacity style={styles.button} onPress={enviarNotificacao} activeOpacity={0.8}>
<Ionicons name="paper-plane" size={20} color="#FFFFFF" style={styles.buttonIcon} />
<Text style={styles.buttonText}>Enviar Notificação</Text>
</TouchableOpacity>

</ScrollView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#FAF9F6',
},
header: {
backgroundColor: '#0052CC',
height: 60,
justifyContent: 'center',
alignItems: 'center',
},
headerTitle: {
color: '#FFFFFF',
fontSize: 20,
fontWeight: 'bold',
},
content: {
padding: 20,
paddingBottom: 40,
},
inputGroup: {
marginBottom: 24,
},
label: {
fontSize: 16,
fontWeight: 'bold',
color: '#111827',
marginBottom: 8,
},
input: {
backgroundColor: '#FFFFFF',
borderWidth: 1,
borderColor: '#D1D5DB',
borderRadius: 10,
paddingHorizontal: 14,
paddingVertical: 12,
fontSize: 15,
color: '#1F2937',
},
inputIconContainer: {
flexDirection: 'row',
alignItems: 'center',
backgroundColor: '#FFFFFF',
borderWidth: 1,
borderColor: '#D1D5DB',
borderRadius: 10,
paddingHorizontal: 14,
height: 48,
},
inputFlex: {
flex: 1,
fontSize: 15,
color: '#1F2937',
},
textArea: {
height: 180,
paddingTop: 12,
},
helperText: {
fontSize: 13,
color: '#6B7280',
marginTop: 6,
},
button: {
backgroundColor: '#0052CC',
borderRadius: 10,
paddingVertical: 16,
flexDirection: 'row',
justifyContent: 'center',
alignItems: 'center',
marginTop: 10,
},
buttonIcon: {
marginRight: 10,
},
buttonText: {
color: '#FFFFFF',
fontSize: 18,
fontWeight: 'bold',
},
});
