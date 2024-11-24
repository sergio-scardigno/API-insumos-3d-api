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
    negocio: { type: String, required: true },
    producto_url: { type: String, required: true },
    title: { type: String, required: true },
    presentacion: { type: String, required: true },
    precio: { type: String, required: true },
    fecha: { type: Date, required: true },
});

// Convertir el precio de cadena a número para comparaciones
productoSchema.virtual('precio_num').get(function () {
    if (this.precio) {
        return parseFloat(
            this.precio.replace(/[^\d,.-]/g, '').replace(',', '.')
        );
    }
    return NaN; // Valor no numérico si `precio` es nulo o indefinido
});

const Producto = mongoose.model('Producto', productoSchema);

// Ruta para obtener productos con filtros adicionales
app.get('/precios', async (req, res) => {
    const { producto_url, presentacion, marca, color, negocio } = req.query;

    try {
        const query: any = {};

        if (producto_url) {
            query.producto_url = producto_url;
        }
        if (presentacion) {
            query.presentacion = presentacion;
        }

        if (marca || color) {
            const regexParts = [];
            if (marca) {
                regexParts.push(marca);
            }
            if (color) {
                regexParts.push(color);
            }
            query.title = { $regex: regexParts.join('|'), $options: 'i' };
        }

        // Asegurarse de que negocio sea una cadena antes de crear la RegExp
        if (typeof negocio === 'string') {
            query.negocio = { $regex: new RegExp(negocio, 'i') };
        }

        const productos = await Producto.find(query)
            .sort({ fecha: -1, precio_num: 1 }) // Ordena por fecha descendente, luego por precio ascendente
            .limit(5);

        if (productos.length > 0) {
            res.json(productos);
        } else {
            res.status(404).send('No se encontraron productos');
        }
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});
