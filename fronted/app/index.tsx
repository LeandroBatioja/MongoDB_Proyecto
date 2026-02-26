import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, TextInput, StyleSheet, Alert, 
  SafeAreaView, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

const CATEGORIAS = [
  { label: 'Todos', valor: 'Todos', color: '#7f8c8d' },
  { label: 'Desayuno', valor: 'Desayuno', color: '#f1c40f' },
  { label: 'Almuerzo', valor: 'Almuerzo', color: '#e67e22' },
  { label: 'Cena', valor: 'Cena', color: '#9b59b6' },
  { label: 'Snack', valor: 'Snack', color: '#3498db' },
];

export default function App() {
  const [platos, setPlatos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [calorias, setCalorias] = useState('');
  const [categoriaSel, setCategoriaSel] = useState('Desayuno'); 
  const [filtroActivo, setFiltroActivo] = useState('Todos');    
  const [cargando, setCargando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const API_URL = 'http://192.168.100.17:3000/platos';

  const obtenerPlatos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setPlatos(data);
      await AsyncStorage.setItem('@cache_platos', JSON.stringify(data));
    } catch (error) {
      const cache = await AsyncStorage.getItem('@cache_platos');
      if (cache) setPlatos(JSON.parse(cache));
    }
  };

  useEffect(() => { obtenerPlatos(); }, []);

  const guardarPlato = async () => {
    if (!nombre.trim()) return Alert.alert("Error", "El nombre es obligatorio");
    if (!calorias || Number(calorias) <= 0) return Alert.alert("Error", "Calorías inválidas");

    setCargando(true);
    try {
      const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
      const metodo = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: nombre.trim(), 
          calorias: Number(calorias),
          categoria: categoriaSel, // <--- Se agregó coma aquí
          ingredientes: [] 
        })
      });

      if (res.ok) {
        setNombre(''); 
        setCalorias(''); 
        setEditandoId(null);
        setCategoriaSel('Desayuno');
        obtenerPlatos();
      }
    } catch (e) { 
      Alert.alert("Error", "Servidor no disponible"); 
    } finally { 
      setCargando(false); 
    }
  };

  const prepararEdicion = (plato: any) => {
    setNombre(plato.nombre);
    setCalorias(plato.calorias.toString());
    setCategoriaSel(plato.categoria || 'Desayuno');
    setEditandoId(plato._id);
  };

  const eliminarPlato = (id: string) => {
    Alert.alert("Confirmar", "¿Eliminar plato?", [
      { text: "No" },
      { text: "Sí", style: "destructive", onPress: async () => {
          await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
          obtenerPlatos();
        } 
      }
    ]);
  };

  const platosAMostrar = filtroActivo === 'Todos' 
    ? platos 
    : platos.filter((p: any) => p.categoria === filtroActivo);

  const dataGrafico = CATEGORIAS.filter(c => c.valor !== 'Todos').map(c => ({
    name: c.label,
    count: platos.filter((p: any) => p.categoria === c.valor).length,
    color: c.color,
    legendFontColor: "#7F7F7F",
    legendFontSize: 12
  })).filter(d => d.count > 0);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>📊 PlatosDb </Text>

      {platos.length > 0 && (
        <View style={styles.cardGrafico}>
          <PieChart
            data={dataGrafico} width={screenWidth - 60} height={160}
            chartConfig={{ color: (op = 1) => `rgba(0,0,0,${op})` }}
            accessor={"count"} backgroundColor={"transparent"} paddingLeft={"15"} absolute
          />
        </View>
      )}

      <View style={styles.form}>
        <Text style={styles.formLabel}>{editandoId ? "EDITANDO PLATO" : "NUEVO PLATO"}</Text>
        <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
        <TextInput placeholder="Kcal" value={calorias} onChangeText={setCalorias} keyboardType="numeric" style={styles.input} />
        
        <View style={styles.catRow}>
          {CATEGORIAS.filter(c => c.valor !== 'Todos').map(cat => (
            <TouchableOpacity 
              key={cat.valor} 
              onPress={() => setCategoriaSel(cat.valor)}
              style={[styles.catBtn, { backgroundColor: categoriaSel === cat.valor ? cat.color : '#f0f0f0' }]}
            >
              <Text style={{ fontSize: 9, color: categoriaSel === cat.valor ? '#fff' : '#666', fontWeight: 'bold' }}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: editandoId ? '#f39c12' : '#2ecc71', flex: 1 }]} onPress={guardarPlato}>
            {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{editandoId ? "Actualizar" : "Agregar"}</Text>}
          </TouchableOpacity>
          {editandoId && (
            <TouchableOpacity style={styles.btnCancel} onPress={() => { setEditandoId(null); setNombre(''); setCalorias(''); }}>
              <Text style={styles.btnText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text style={styles.formLabel}>FILTRAR LISTA POR:</Text>
        <FlatList 
          horizontal data={CATEGORIAS}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setFiltroActivo(item.valor)}
              style={[styles.filtroTag, { backgroundColor: filtroActivo === item.valor ? item.color : '#fff', borderColor: item.color }]}
            >
              <Text style={{ color: filtroActivo === item.valor ? '#fff' : item.color, fontWeight: 'bold', fontSize: 12 }}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={platosAMostrar}
        keyExtractor={(item: any) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => {setRefreshing(true); await obtenerPlatos(); setRefreshing(false);}} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay platos en esta categoría.</Text>}
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <View style={[styles.badge, { backgroundColor: CATEGORIAS.find(c => c.valor === item.categoria)?.color || '#ccc' }]} />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.cardTit}>{item.nombre}</Text>
              <Text style={styles.cardSub}>{item.categoria} • {item.calorias} kcal</Text>
            </View>
            <View style={styles.acciones}>
              <TouchableOpacity onPress={() => prepararEdicion(item)}><Text style={styles.btnEdit}>Editar</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarPlato(item._id)}><Text style={styles.btnDel}>Borrar</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10, color: '#2c3e50' },
  cardGrafico: { backgroundColor: '#fff', borderRadius: 20, padding: 10, elevation: 3, marginBottom: 15, alignItems: 'center' },
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 4, marginBottom: 15 },
  formLabel: { fontSize: 10, fontWeight: 'bold', color: '#95a5a6', marginBottom: 8, letterSpacing: 1 },
  input: { borderBottomWidth: 1, borderBottomColor: '#f1f1f1', marginBottom: 12, padding: 5, fontSize: 16 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  catBtn: { paddingVertical: 8, paddingHorizontal: 5, borderRadius: 8, width: '23%', alignItems: 'center' },
  row: { flexDirection: 'row' },
  btn: { padding: 12, borderRadius: 10, alignItems: 'center' },
  btnCancel: { backgroundColor: '#e74c3c', marginLeft: 10, paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  filtroTag: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  cardItem: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', elevation: 2 },
  badge: { width: 6, height: 55 },
  cardTit: { fontSize: 16, fontWeight: 'bold', color: '#34495e' },
  cardSub: { color: '#2ecc71', fontSize: 13, fontWeight: '600', marginTop: 2 },
  acciones: { flexDirection: 'row', paddingRight: 10 },
  btnEdit: { color: '#f39c12', fontWeight: 'bold', marginRight: 15 },
  btnDel: { color: '#e74c3c', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 20, color: '#bdc3c7' }
});