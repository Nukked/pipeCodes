const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Estrutura da Base de dados 
const DataSchema = new Schema(
  {
    id: Number,
    name: String,
    email: String,
    observations: String,
    date: String
  },
  { timestamps: true }
);

// Exportar o esquema para ser usado no server (Node.js)
module.exports = mongoose.model("Data", DataSchema);
