import { Router } from "express";
import fs from 'fs';

const router = Router();

const filePathProducts = './src/productos.json';
const filePathCarts = './src/carrito.json';

router.get('/', async (req, res) => {
    try {
        const data = await fs.promises.readFile(filePathCarts, 'utf-8');
        const carts = JSON.parse(data);
        res.status(200).json(carts);
    } catch (error) {
        console.log('Error al obtener los carritos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
  
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const data = await fs.promises.readFile(filePathCarts, 'utf-8');
        const carts = JSON.parse(data);
        const cart = carts.find((cart) => cart.id == cartId);
  
        if (!cart) {
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }
  
        res.status(200).json(cart.products);
    } catch (error) {
        console.log('Error al obtener los productos del carrito:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
  
router.post('/', async (req, res) => {
    try {
        const data = await fs.promises.readFile(filePathCarts, 'utf-8');
        const carts = JSON.parse(data);
  
        // Generar un nuevo ID para el carrito
        const newCartId = carts.length === 0 ? 1 : carts[carts.length - 1].id + 1;
        const newCart = {
            id: newCartId,
            products: []
        };
  
        carts.push(newCart);
  
        await fs.promises.writeFile(filePathCarts, JSON.stringify(carts, null, 2));
  
        res.status(201).json(newCart);
    } catch (error) {
        console.log('Error al crear el carrito:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
  
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
  
        // Leer el archivo de productos
        const productsData = await fs.promises.readFile(filePathProducts, 'utf-8');
        const products = JSON.parse(productsData);
  
        // Buscar el producto por su ID
        const product = products.find((product) => product.id == productId);
  
        if (!product) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
  
        // Leer el archivo de carritos
        const cartsData = await fs.promises.readFile(filePathCarts, 'utf-8');
        const carts = JSON.parse(cartsData);
  
        // Buscar el carrito por su ID
        const cartIndex = carts.findIndex((cart) => cart.id == cartId);
  
        if (cartIndex === -1) {
            res.status(404).json({ error: 'Carrito no encontrado' });
            return;
        }
  
        const cart = carts[cartIndex];
  
        // Verificar si el producto ya está en el carrito
        const existingProduct = cart.products.find((item) => item.product === productId);
  
        if (existingProduct) {
            // Si el producto ya está en el carrito, incrementar la cantidad
            existingProduct.quantity++;
        } else {
            // Si el producto no está en el carrito, agregarlo con cantidad 1
            cart.products.push({
                product: productId,
                quantity: 1
            });
        }
  
        // Guardar los cambios en el archivo de carritos
        await fs.promises.writeFile(filePathCarts, JSON.stringify(carts, null, 2));
  
        res.status(201).json(cart);
    } catch (error) {
        console.log('Error al agregar producto al carrito:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;

        // Leer el archivo de carritos
        const cartsData = await fs.promises.readFile(filePathCarts, 'utf-8');
        const carts = JSON.parse(cartsData);

        if (cartId) {
            // Si se proporciona un ID de carrito, eliminar el carrito específico

            // Buscar el carrito por su ID
            const cartIndex = carts.findIndex((cart) => cart.id == cartId);

            if (cartIndex === -1) {
                res.status(404).json({ error: 'Carrito no encontrado' });
                return;
            }

            // Eliminar el carrito específico
            carts.splice(cartIndex, 1);

            // Guardar los cambios en el archivo de carritos
            await fs.promises.writeFile(filePathCarts, JSON.stringify(carts));

            res.status(200).json({ message: 'Carrito eliminado satisfactoriamente' });
        } else {
            // Si no se proporciona un ID de carrito, eliminar todos los carritos
            await fs.promises.writeFile(filePathCarts, '[]');
            res.status(200).json({ message: 'Todos los carritos han sido eliminados' });
        }
    } catch (error) {
        console.log('Error al eliminar el carrito:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

export default router;
