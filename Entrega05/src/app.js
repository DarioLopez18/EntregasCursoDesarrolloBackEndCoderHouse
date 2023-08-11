import express from 'express'; //Importamos express
import productsRouter from './routes/product.routes.js'; //Importamos la ruta de los productos 
import cartsRouter from './routes/cart.routes.js';  //Importamos la ruta de los carritos
import {Server} from 'socket.io'; //Importamos desde socket.io para utilizar el servidor websockets
import handlebars from 'express-handlebars'; //importamos handlebars
import __dirname from './utils.js'; //Utilizamos utils.js para un mejor manejo de las rutas
import viewsRouter from './routes/views.router.js'; //importamos la ruta de las vistas
import ProductManager from './services/product.services.js'; //Importamos el manejador de productos

const PORT = 8080; //Declaramos una variable para definir el puerto que vamos a usar

const app = express(); //Creamos el servidor

//Ponemos a escuchar el servidor
const httpServer = app.listen(PORT,console.log(`✅Server escuchando in the port: ${PORT}`)); 

//Creamos el servidor con websockets
const io = new Server(httpServer);

app.use(express.json()); //Para el manejo de datos en formato JSON
app.use(express.urlencoded({extended:true})); //Para manejar los datos enviados desde formulario
app.use(express.static(__dirname + '/public')); //Declaramos cuales van a ser los archivos estaticos 

app.engine('handlebars',handlebars.engine()); //iniciamos el motor de plantilla handlebars
app.set('views',__dirname+'/views'); //seteamos las vistas para el motor
app.set('view engine','handlebars'); //declaramos que motor vamos a usar

app.use('/',viewsRouter); //Definimos que cuando se entre a la ruta raiz se dirija a las vistas 
app.use('/api/products',productsRouter); //endpoint para los productos
app.use('/api/carts',cartsRouter); //endpoint para los carritos

//Definimos el websocket para hacer la conexion

io.on('connection',socket=>{
    //Logueamos cuando un cliente se conecta
    console.log('Cliente conectado');
    //ponemos a escuchar el socket 
    const productManager = new ProductManager('./src/bd/productos.json'); 
    socket.on('new-product',async data=>{
        try{
            await productManager.addProduct(data.title,
                                            data.descripcion,
                                            data.code,
                                            data.price,
                                            data.status,
                                            data.stock,
                                            data.category,
                                            data.thumbail);
            
            const products = await productManager.getProducts();
            /*
            Cuando creamos un producto lo enviamos a la tabla donde tenemos los otros para tener los productos
            actualizados en tiempo real.
            */
            io.emit('reload-table',products);
        }catch(e){console.log(e);}
    })
    socket.on('delete-product',async id=>{
        try{
            await productManager.deleteProduct(id);
            const products = await productManager.getProducts();
            io.emit('reload-table',products);
        }catch(e){console.log(e);}
    })
})
