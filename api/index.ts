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
        // Asumiendo el formato del precio es algo como "$ 9.500,00"
        // Necesitarás ajustar esta conversión según tu formato específico
        return parseFloat(
            this.precio.replace(/[^\d,.-]/g, '').replace(',', '.')
        );
    }
    return NaN; // Valor no numérico si `precio` es nulo o indefinido
});

const Producto = mongoose.model('Producto', productoSchema);

// Ruta para obtener los 5 productos más baratos por URL y presentación
app.get('/precios', async (req, res) => {
    const { producto_url, presentacion } = req.query;

    try {
        const query: any = {};
        if (producto_url) {
            query.producto_url = producto_url;
        }
        if (presentacion) {
            query.presentacion = presentacion;
        }

        // Buscar los productos que coincidan con los filtros y ordenar por precio de manera ascendente
        const productos = await Producto.find(query)
            .sort({ precio_num: 1 }) // Ordenar por precio ascendente
            .limit(5); // Limitar a los 5 productos más baratos

        if (productos.length > 0) {
            res.json(productos); // Devolver los 5 productos más baratos
        } else {
            res.status(404).send('No se encontraron productos');
        }
    } catch (error) {
        res.status(500).send('Error al obtener los productos');
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});
