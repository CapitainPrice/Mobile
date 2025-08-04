import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  FlatList, 
  Alert, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [formData, setFormData] = useState({
    nome: '',
    peso: '',
    altura: '',
    idade: '',
    sexo: 'masculino',
    telefone: '',
    email: '',
    endereco: ''
  });
  const [pacientes, setPacientes] = useState([]);
  const [imcResultado, setImcResultado] = useState(null); 

  useEffect(() => { 
    const carregarPacientes = async () => {
      try {
        const pacientesSalvos = await AsyncStorage.getItem('pacientes');
        if (pacientesSalvos) {
          setPacientes(JSON.parse(pacientesSalvos));
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os pacientes.');
      }
    };

    carregarPacientes();
  }, []);

  const salvarPacientes = async (novosPacientes) => {
    try {
      await AsyncStorage.setItem('pacientes', JSON.stringify(novosPacientes));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os pacientes.');
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calcularIMC = (peso, altura) => {
    const imc = peso / (altura * altura);
    let classificacao = '';
    
    if (imc < 18.5) classificacao = 'Abaixo do peso';
    else if (imc >= 18.5 && imc < 24.9) classificacao = 'Peso normal';
    else if (imc >= 25 && imc < 29.9) classificacao = 'Sobrepeso';
    else classificacao = 'Obesidade';

    return {
      valor: imc.toFixed(2),
      classificacao
    };
  };

  const calcularPesoIdeal = (altura, sexo) => {
    const alturaCm = altura * 100;
    let pesoIdeal = 0;

    if (sexo === 'masculino') {
      pesoIdeal = (alturaCm - 100) - ((alturaCm - 150) / 4);
    } else {
      pesoIdeal = (alturaCm - 100) - ((alturaCm - 150) / 2);
    }
    return pesoIdeal.toFixed(2);
  };

  const adicionarPaciente = () => {
    const { nome, peso, altura, idade, sexo } = formData;
    
    if (!nome || !peso || !altura || !idade || !sexo) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    
    if (isNaN(pesoNum)) {
      Alert.alert('Erro', 'Peso inválido!');
      return;
    }
    
    if (isNaN(alturaNum)) {
      Alert.alert('Erro', 'Altura inválida!');
      return;
    }

    const imcData = calcularIMC(pesoNum, alturaNum);
    
    const novoPaciente = {
      id: Math.random().toString(),
      nome,
      peso: pesoNum,
      altura: alturaNum,
      idade,
      sexo,
      telefone: formData.telefone,
      email: formData.email,
      endereco: formData.endereco,
      imc: imcData.valor,
      classificacao: imcData.classificacao,
      pesoIdeal: calcularPesoIdeal(alturaNum, sexo),
    };

    const novosPacientes = [...pacientes, novoPaciente];
    setPacientes(novosPacientes);
    salvarPacientes(novosPacientes);
    setImcResultado(imcData);
  };

  const excluirPaciente = (id) => {
    const novosPacientes = pacientes.filter(p => p.id !== id);
    setPacientes(novosPacientes);
    salvarPacientes(novosPacientes);
  };

  const editarPaciente = (paciente) => {
    setFormData({
      nome: paciente.nome,
      peso: paciente.peso.toString(),
      altura: paciente.altura.toString(),
      idade: paciente.idade,
      sexo: paciente.sexo,
      telefone: paciente.telefone || '',
      email: paciente.email || '',
      endereco: paciente.endereco || ''
    });
    setCurrentScreen('register');
  };

  const limparFormulario = () => {
    setFormData({
      nome: '',
      peso: '',
      altura: '',
      idade: '',
      sexo: 'masculino',
      telefone: '',
      email: '',
      endereco: ''
    });
    setImcResultado(null);
  };

  const HomeScreen = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>NutriCare</Text>
      <Text style={styles.subtitle}>Dra. Márcia - Nutricionista</Text>
      <Text style={styles.description}>
        Especialista em nutrição clínica e esportiva com mais de 10 anos de experiência.
        Atendimento personalizado para alcançar seus objetivos de saúde.
      </Text>
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          limparFormulario();
          setCurrentScreen('register');
        }}
      >
        <Text style={styles.buttonText}>Cadastrar Novo Paciente</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setCurrentScreen('list')}
      >
        <Text style={styles.buttonText}>Ver Lista de Pacientes</Text>
      </TouchableOpacity>
    </View>
  );

  const RegisterScreen = () => (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.title}>Cadastro de Paciente</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome completo*"
        value={formData.nome}
        onChangeText={(text) => handleInputChange('nome', text)}
        placeholderTextColor="#888"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Peso (kg)*"
        keyboardType="numeric"
        value={formData.peso}
        onChangeText={(text) => handleInputChange('peso', text)}
        placeholderTextColor="#888"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Altura (m)*"
        keyboardType="numeric"
        value={formData.altura}
        onChangeText={(text) => handleInputChange('altura', text)}
        placeholderTextColor="#888"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Idade*"
        keyboardType="numeric"
        value={formData.idade}
        onChangeText={(text) => handleInputChange('idade', text)}
        placeholderTextColor="#888"
      />
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Sexo:</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioButton, 
              formData.sexo === 'masculino' && styles.radioSelectedMasculino
            ]}
            onPress={() => handleInputChange('sexo', 'masculino')}
          >
            <Text style={[
              styles.radioText, 
              formData.sexo === 'masculino' && styles.radioTextSelected
            ]}>
              Masculino
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.radioButton, 
              formData.sexo === 'feminino' && styles.radioSelectedFeminino
            ]}
            onPress={() => handleInputChange('sexo', 'feminino')}
          >
            <Text style={[
              styles.radioText, 
              formData.sexo === 'feminino' && styles.radioTextSelected
            ]}>
              Feminino
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Telefone"
        keyboardType="phone-pad"
        value={formData.telefone}
        onChangeText={(text) => handleInputChange('telefone', text)}
        placeholderTextColor="#888"
      />
      
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(text) => handleInputChange('email', text)}
        placeholderTextColor="#888"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Endereço"
        value={formData.endereco}
        onChangeText={(text) => handleInputChange('endereco', text)}
        placeholderTextColor="#888"
      />
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={adicionarPaciente}
      >
        <Text style={styles.buttonText}>Calcular IMC e Salvar</Text>
      </TouchableOpacity>
      
      {imcResultado && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado do IMC</Text>
          <Text style={styles.resultText}>Valor: {imcResultado.valor}</Text>
          <Text style={styles.resultText}>Classificação: {imcResultado.classificacao}</Text>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={limparFormulario}
            >
              <Text style={styles.buttonText}>Novo Cadastro</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentScreen('list')}
            >
              <Text style={styles.buttonText}>Ver Pacientes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.backButtonText}>Voltar para Início</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const ListScreen = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Lista de Pacientes</Text>
      
      {pacientes.length === 0 ? (
        <Text style={styles.emptyMessage}>Nenhum paciente cadastrado</Text>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.patientItem}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{item.nome}</Text>
                <Text style={styles.patientDetail}>Idade: {item.idade} anos</Text>
                <Text style={styles.patientDetail}>IMC: {item.imc} ({item.classificacao})</Text>
              </View>
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => editarPaciente(item)}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => excluirPaciente(item.id)}
                >
                  <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          limparFormulario();
          setCurrentScreen('register');
        }}
      >
        <Text style={styles.buttonText}>Adicionar Paciente</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.backButtonText}>Voltar para Início</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'register' && <RegisterScreen />}
      {currentScreen === 'list' && <ListScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    color: '#3498db',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#2c3e50',
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  radioSelectedMasculino: {
    backgroundColor: '#3498db',
  },
  radioSelectedFeminino: {
    backgroundColor: '#FF69B4',
  },
  radioText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  radioTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  secondaryButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#7f8c8d',
    fontWeight: '500',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  patientItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  patientDetail: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#f39c12',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#7f8c8d',
    marginVertical: 30,
  },
});