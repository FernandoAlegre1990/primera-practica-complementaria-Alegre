import express from 'express'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import productsRouter from './routers/productRouters.js'
import cartsRouter from './routers/cartRouters.js'
import viewsRouter from './routers/viewsRouters.js'

const PORT = 8080; // puerto en el que va a escuchar el servidor


const app = express(); // crea una instancia de una aplicación de express
app.use(express.json()); // middleware para parsear el body de las requests a JSON
app.use(express.static('src/public'));

app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.setHeader('Content-Type', 'text/javascript');
    }
    next();
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { products: [] }); // Puedes enviar datos de productos si los tienes disponibles
});


const serverHttp = app.listen(PORT, () => console.log('server up')) // levanta el servidor en el puerto especificado
const io = new Server(serverHttp) // instancia de socket.io

app.use((req, res, next) => {
    req.io = io
    next()
}) // middleware para agregar la instancia de socket.io a la request

// Configuración del motor de plantillas handlebars
const hbs = handlebars.create(); // Crea una instancia de handlebars
app.engine('handlebars', hbs.engine);
app.set('views', './src/views');
app.set('view engine', 'handlebars');

app.get('/', (req, res) => res.render('index')); // ruta raíz

app.use('/products', viewsRouter); // ruta para renderizar la vista de productos
app.use('/api/products', productsRouter); // registra el router de productos en la ruta /api/products
app.use('/api/carts', cartsRouter); // registra el router de carritos en la ruta /api/carts

io.on('connection', socket => {
    console.log('Nuevo cliente conectado!')
    socket.on('updatedProducts', data => { 
        io.emit('productList', data) // emite el evento productList con la lista de productos
    }) // evento que se ejecuta cuando se actualiza la lista de productos
}) // evento que se ejecuta cuando un cliente se conecta