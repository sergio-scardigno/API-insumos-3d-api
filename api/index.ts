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
    const { producto_url, presentacion, marca, color, negocio, search } =
        req.query;

    try {
        const match: any = {};

        // Filtrar por las tiendas específicas
        const tiendasEspecificas = ['3dcasabureu', 'i3dtienda', 'Printalot'];
        match.negocio = { $in: tiendasEspecificas };

        if (producto_url) {
            match.producto_url = producto_url;
        }
        if (presentacion) {
            match.presentacion = presentacion;
        }

        if (marca || color) {
            const regexParts = [];
            if (marca) {
                regexParts.push(marca);
            }
            if (color) {
                regexParts.push(color);
            }
            match.title = { $regex: regexParts.join('|'), $options: 'i' };
        }

        // Añadir búsqueda estricta en el campo title si se proporciona el parámetro `search`
        if (typeof search === 'string') {
            match.title = { $regex: new RegExp(`\\b${search}\\b`, 'i') };
        }

        // Agregación para obtener los 5 mejores precios por negocio
        const productos = await Producto.aggregate([
            {
                $match: {
                    ...match,
                    fecha: { $ne: null }, // Excluir documentos con fecha null
                    precio_num: { $ne: null }, // Excluir documentos con precio_num null
                },
            },
            { $sort: { fecha: -1, precio_num: 1 } }, // Ordenar por fecha y luego por precio_num
            {
                $group: {
                    _id: '$negocio',
                    productos: { $push: '$$ROOT' },
                },
            },
            {
                $project: {
                    _id: 0,
                    negocio: '$_id',
                    productos: { $slice: ['$productos', 5] }, // Limitar a los primeros 5
                },
            },
        ]);

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

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
