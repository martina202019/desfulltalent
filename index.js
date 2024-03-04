/** Configuracion de express */
const express = require('express') //Importo la libreria
const app = express() //Inicializacion de la variable que usara la libreria
const router = express.Router(); // Enrutar los servicios web
const port = 3000; // Escuchar la ejecucion del servidor
/** Importacion de variables de entorno */
require('dotenv').config() // Obetenmos las variables de entorno
/** Web Sockets */
const socket = require('socket.io') // Importamos la libreria socket.io
const http = require('http').Server(app)
const io = socket(http)

/** Importar la libreria server de graphQL */
const { createYoga } = require('graphql-yoga');
const schema = require('./graphql/schema');

/** Conexion a BD */
const DB_URL = process.env.DB_URL || '';
const mongoose = require('mongoose'); // Importo la libreria mongoose
mongoose.connect(DB_URL) // Creo la cadena de conexion

/** Importacion de Rutas */
const userRoutes = require('./routes/UserRoutes');
const houseRoutes = require('./routes/HouseRoutes');
const messageRoutes = require('./routes/MessageRoutes');
const departmentRoutes = require('./read_file');

const MessageSchema = require('./models/Message');

//Metodo [GET, POST, PUT, PATCH, DELETE]
// Nombre del servicio [/]
router.get('/', (req, res) => {
    //Informacion a modificar
    res.send("Hello world")
})

/** Metodos websocket */
io.on('connect', (socket) => {
    console.log("connected")
    //Escuchando eventos desde el servidor
    socket.on('message', (data) => {
        /** Almacenando el mensaje en la BD */
        var payload = JSON.parse(data)
        console.log(payload)
        /** Lo almaceno en la BD */
        MessageSchema(payload).save().then((result) => {
            /** Enviando el mensaje a todos los clientes conectados al websocket */
            socket.broadcast.emit('message-receipt', payload)
        }).catch((err) => {
            console.log({"status" : "error", "message" :err.message})
        })        
    })

    socket.on('disconnect', (socket) => {
        console.log("disconnect")    
    })
})

/** Configuraciones express */
app.use(express.urlencoded({extended: true})) // Acceder a la informacion de las urls
app.use(express.json()) // Analizar informacion en formato JSON
app.use((req, res, next) => {
    res.io = io
    next()
})

const yoga = new createYoga({ schema });
app.use('/graphql', yoga);

//Ejecuto el servidor
app.use(router)
app.use('/uploads', express.static('uploads'));
app.use('/', userRoutes)
app.use('/', houseRoutes)
app.use('/', messageRoutes)
app.use('/', departmentRoutes)

/** Ejecucion del servidor */
http.listen(port, () => {
    console.log('Listen on ' + port)
})

module.exports = http