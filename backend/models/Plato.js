const mongoose = require("mongoose");

const platoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  calorias: {
    type: Number,
    required: true
  },
  ingredientes: {
    type: [String],
    required: true
  },
  categoria: {
    type: String
  }
});

// Exportamos el modelo
module.exports = mongoose.model("Plato", platoSchema);
