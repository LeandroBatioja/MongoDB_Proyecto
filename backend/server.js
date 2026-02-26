/*

===========CÓDIGOS DEL SERVIDOR A ATLAS= 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Plato = require("./models/Plato");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(
    "mongodb+srv://leo:leo@reservas.r2wjucn.mongodb.net/platoDB?retryWrites=true&w=majority&appName=Reservas"
)
.then(() => console.log("Conectado a MongoDB Atlas ✅"))
.catch(err => console.log("Error de conexión:", err));

// GET: Listar platos (Ordenados por el más nuevo primero)
app.get("/platos", async (req, res) => {
    try {
        const platos = await Plato.find().sort({ _id: -1 });
        res.json(platos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener platos" });
    }
});

app.post("/platos", async (req, res) => {
    try {
        const nuevoPlato = new Plato(req.body);
        await nuevoPlato.save();
        res.json(nuevoPlato);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar" });
    }
});

app.put("/platos/:id", async (req, res) => {
    try {
        const actualizado = await Plato.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});

app.delete("/platos/:id", async (req, res) => {
    try {
        await Plato.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor listo en: http://192.168.100.17:${PORT}`);
});

*/

//Codigo de Conexion a Mongo Compas:
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 1. IMPORTANTE: Importar el modelo (o definirlo aquí mismo)
// Si ya tienes el archivo en models/Plato.js, usa esta línea:
const Plato = require("./models/Plato"); 

const app = express();
app.use(express.json());
app.use(cors());

// --- CONEXIÓN A MONGODB LOCAL (COMPASS) ---
// Usamos 127.0.0.1 que es más estable en Linux para Node.js
mongoose.connect("mongodb://127.0.0.1:27017/nutriDB")
.then(() => console.log("Conectado a MongoDB Local (Compass) ✅"))
.catch(err => console.log("Error al conectar a Compass:", err));

// --- CRUD ---

// GET: Listar platos
app.get("/platos", async (req, res) => {
    try {
        const platos = await Plato.find().sort({ _id: -1 });
        res.json(platos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener platos" });
    }
});

// POST: Guardar plato
app.post("/platos", async (req, res) => {
    try {
        // Ahora el body incluirá nombre, calorias y CATEGORIA
        const nuevoPlato = new Plato(req.body);
        await nuevoPlato.save();
        res.json(nuevoPlato);
    } catch (error) {
        res.status(500).json({ error: "Error al guardar" });
    }
});

// PUT: Actualizar plato
app.put("/platos/:id", async (req, res) => {
    try {
        const actualizado = await Plato.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});

// DELETE: Eliminar plato
app.delete("/platos/:id", async (req, res) => {
    try {
        await Plato.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Eliminado correctamente ✅" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor local listo en: http://192.168.100.17:${PORT}`);
});

//asasas