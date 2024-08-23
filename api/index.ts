import express from 'express';
import mongoose from 'mongoose';

const app = express();

// Cadena de conexión a MongoDB
const mongoUri =
    'mongodb+srv://sergioscardigno82:Argentina1982@cluster0.enjcq.mongodb.net/filamentos_db?retryWrites=true&w=majority&appName=Cluster0';

// Conexión a la base de datos MongoDB
mongoose
    .connect(mongoUri)
    .then(() => {
        console.log('Conectado a MongoDB');
    })
    .catch((err) => {
        console.error('Error al conectar a MongoDB:', err);
    });

// Definir el esquema y modelo
const productoSchema = new mongoose.Schema({
    negocio: String,
    producto_url: String,
    title: String,
    presentacion: String,
    precio: String,
    fecha: Date,
});

const Producto = mongoose.model('Producto', productoSchema);

// Ruta para obtener los precios
app.get('/precios', async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).send('Error al obtener los precios');
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});
