import express from 'express'
import fs from 'fs'
import productsRouter from './routers/productRouters.js'
import cartsRouter from './routers/cartRouters.js'

const app = express(); 
app.use(express.json()); 

const PORT = 8080; 

app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter); 


app.listen(PORT, () => console.log('server up on port 8080')) 
