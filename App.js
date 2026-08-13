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
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configurações do Supabase
const SUPABASE_URL = 'https://cgdkhufktnclezagrhek.supabase.co/rest/v1/usuario';
const SUPABASE_API_KEY = 'sb_publishable_IPsf8cTazQXIOxTS-EvkdQ_G7bVSGCj';

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_API_KEY,
  'Authorization': `Bearer ${SUPABASE_API_KEY}`,
};

// Handler para exibição de notificações enquanto o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // Controle de Navegação: 'cadastro' | 'login' | 'notificacao'
  const [telaAtual, setTelaAtual] = useState('cadastro');

<<<<<<< HEAD
  // Estados globais / autenticação
  const [expoPushToken, setExpoPushToken] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);
=======
useEffect(() => {
obterToken();
}, []);
>>>>>>> 715ad49703d130f9c809c561d024cc67e20fa8ea

  // Obter o Token de Notificação ao iniciar
  useEffect(() => {
    obterPushToken();
  }, []);

  async function obterPushToken() {
    try {
      if (!Device.isDevice) {
        console.log('Push Notifications exigem um dispositivo físico.');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Aviso', 'Permissão de notificação não concedida.');
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ||
        Constants?.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      setExpoPushToken(tokenData.data);
      console.log('Token obtido:', tokenData.data);
    } catch (error) {
      console.log('Erro ao obter token do dispositivo:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0052CC" />

      {/* TELA 1: CADASTRO */}
      {telaAtual === 'cadastro' && (
        <TelaCadastro
          expoPushToken={expoPushToken}
          irParaLogin={() => setTelaAtual('login')}
        />
      )}

      {/* TELA 2: LOGIN */}
      {telaAtual === 'login' && (
        <TelaLogin
          onLoginSucesso={(user) => {
            setUsuarioLogado(user);
            setTelaAtual('notificacao');
          }}
          irParaCadastro={() => setTelaAtual('cadastro')}
        />
      )}

      {/* TELA 3: ENVIO DE NOTIFICAÇÃO */}
      {telaAtual === 'notificacao' && (
        <TelaNotificacao
          usuarioLogado={usuarioLogado}
          onSair={() => {
            setUsuarioLogado(null);
            setTelaAtual('login');
          }}
        />
      )}
    </SafeAreaView>
  );
}

/* ====================================================================
   TELA 1: CADASTRO DE USUÁRIO
   ==================================================================== */
function TelaCadastro({ expoPushToken, irParaLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function cadastrarUsuario() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setCarregando(true);
    try {
      const payload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha,
        token: expoPushToken || '',
      };

      const resposta = await fetch(SUPABASE_URL, {
        method: 'POST',
        headers: {
          ...HEADERS,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      });

      if (resposta.ok) {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
          { text: 'Ir para Login', onPress: irParaLogin },
        ]);
        setNome('');
        setEmail('');
        setSenha('');
      } else {
        const erro = await resposta.json();
        Alert.alert('Erro no cadastro', erro.message || 'Verifique os dados informados.');
      }
    } catch (error) {
      console.log('Erro ao cadastrar:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitleText}>Criar Conta</Text>
        <Text style={styles.subTitleText}>Cadastre-se para começar a enviar notificações</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Maria Silva"
          placeholderTextColor="#9CA3AF"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: maria@email.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          placeholderTextColor="#9CA3AF"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Token de Notificação (Automático)</Text>
        <View style={styles.inputIconContainer}>
          <TextInput
            style={styles.inputFlex}
            value={expoPushToken}
            editable={false}
            placeholder="Obtendo token do dispositivo..."
            placeholderTextColor="#9CA3AF"
          />
          <Ionicons name="notifications-outline" size={22} color="#0052CC" />
        </View>
        <Text style={styles.helperText}>
          Token obtido automaticamente do seu aparelho via Expo.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={cadastrarUsuario}
        disabled={carregando}
        activeOpacity={0.8}
      >
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Cadastrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={irParaLogin}>
        <Text style={styles.secondaryButtonText}>Já possui uma conta? Faça Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ====================================================================
   TELA 2: LOGIN
   ==================================================================== */
function TelaLogin({ onLoginSucesso, irParaCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function realizarLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Informe o e-mail e a senha.');
      return;
    }

    setCarregando(true);
    try {
      const emailEncoded = encodeURIComponent(email.trim().toLowerCase());
      const senhaEncoded = encodeURIComponent(senha);
      const url = `${SUPABASE_URL}?email=eq.${emailEncoded}&senha=eq.${senhaEncoded}`;

      const resposta = await fetch(url, {
        method: 'GET',
        headers: HEADERS,
      });

      const dados = await resposta.json();

      if (Array.isArray(dados) && dados.length > 0) {
        onLoginSucesso(dados[0]);
      } else {
        Alert.alert('Erro de Autenticação', 'E-mail ou senha estão incorretos.');
      }
    } catch (error) {
      console.log('Erro ao realizar login:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao consultar a API.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitleText}>Bem-vindo de volta!</Text>
        <Text style={styles.subTitleText}>Acesse sua conta para continuar</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#9CA3AF"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={realizarLogin}
        disabled={carregando}
        activeOpacity={0.8}
      >
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={irParaCadastro}>
        <Text style={styles.secondaryButtonText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ====================================================================
   TELA 3: ENVIO DE NOTIFICAÇÃO PUSH
   ==================================================================== */
function TelaNotificacao({ usuarioLogado, onSair }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);

<<<<<<< HEAD
  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    setCarregandoUsuarios(true);
    try {
      const resposta = await fetch(SUPABASE_URL, {
        method: 'GET',
        headers: HEADERS,
      });

      const dados = await resposta.json();
      if (Array.isArray(dados)) {
        setUsuarios(dados);
      }
    } catch (error) {
      console.log('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível buscar a lista de usuários.');
    } finally {
      setCarregandoUsuarios(false);
    }
  }

  async function enviarNotificacao() {
    if (!usuarioSelecionado) {
      Alert.alert('Atenção', 'Selecione um usuário para receber a notificação.');
      return;
    }

    if (!usuarioSelecionado.token) {
      Alert.alert('Erro', 'O usuário selecionado não possui um token de notificação cadastrado.');
      return;
    }

    if (!mensagem.trim()) {
      Alert.alert('Atenção', 'Digite o conteúdo da mensagem.');
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: usuarioSelecionado.token,
          sound: 'default',
          title: titulo || 'Nova Notificação',
          body: mensagem,
          data: { remetente: usuarioLogado?.nome || 'Sistema' },
        }),
      });

      const resultado = await resposta.json();
      console.log('Resultado do envio:', resultado);

      Alert.alert('Sucesso', `Notificação enviada para ${usuarioSelecionado.nome}!`);
      setTitulo('');
      setMensagem('');
    } catch (error) {
      console.log('Erro ao enviar notificação:', error);
      Alert.alert('Erro', 'Não foi possível enviar a notificação.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.userBar}>
        <Text style={styles.userBarText}>Olá, {usuarioLogado?.nome || 'Usuário'}</Text>
        <TouchableOpacity onPress={onSair}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitleText}>Enviar Notificação</Text>
        <Text style={styles.subTitleText}>Escolha o destinatário e envie um push message</Text>
      </View>

      {/* Seleção do Usuário Destinatário */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Destinatário</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={usuarioSelecionado ? styles.selectButtonText : styles.selectPlaceholder}>
            {usuarioSelecionado ? `${usuarioSelecionado.nome} (${usuarioSelecionado.email})` : 'Selecione um usuário...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Título */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Título da Mensagem</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Aviso Importante"
          placeholderTextColor="#9CA3AF"
          value={titulo}
          onChangeText={setTitulo}
        />
      </View>

      {/* Mensagem */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mensagem</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Digite o texto da notificação..."
          placeholderTextColor="#9CA3AF"
          value={mensagem}
          onChangeText={setMensagem}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={enviarNotificacao}
        disabled={enviando}
        activeOpacity={0.8}
      >
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="paper-plane" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Enviar Notificação</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Modal de Seleção de Usuários */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione um Usuário</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {carregandoUsuarios ? (
              <ActivityIndicator style={{ padding: 20 }} color="#0052CC" />
            ) : (
              <FlatList
                data={usuarios}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.userItem}
                    onPress={() => {
                      setUsuarioSelecionado(item);
                      setModalVisivel(false);
                    }}
                  >
                    <Ionicons name="person-circle-outline" size={32} color="#0052CC" />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.nome}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ====================================================================
   ESTILOS
   ==================================================================== */
=======
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


>>>>>>> 715ad49703d130f9c809c561d024cc67e20fa8ea
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  userBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
  },
  userBarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0052CC',
  },
  headerTitleContainer: {
    marginBottom: 24,
  },
  headerTitleText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  subTitleText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
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
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  inputFlex: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  selectButtonText: {
    fontSize: 15,
    color: '#111827',
  },
  selectPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
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
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0052CC',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
});