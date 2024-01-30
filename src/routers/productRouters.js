import { Router } from "express";
import fs from 'fs';

const router = Router();

const filePathProducts = './src/productos.json';

router.get('/', async (req, res) => {
  console.log('¡Solicitud recibida!');
  const limit = req.query.limit;
  try {
    const data = await fs.promises.readFile(filePathProducts, 'utf-8');
    const products = JSON.parse(data);
    if (!limit) {
      res.status(200).json({ products });
    } else {
      const productsLimit = products.slice(0, limit);
      res.status(200).json({ products: productsLimit });
    }
  } catch (error) {
    console.log('Error al leer el archivo:', error);
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
});

router.get('/:pid', async (req, res) => {
  const id = req.params.pid;
  try {
    const data = await fs.promises.readFile(filePathProducts, 'utf-8');
    const products = JSON.parse(data);
    const product = products.find((product) => product.id == id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.log('Error al leer el archivo:', error);
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
});

router.post('/', async (req, res) => {
  console.log('¡Nuevo producto agregado!');
  try {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
  
    // Validar que se proporcionen los campos obligatorios
    if (!title || !description || !code || !price || !stock || !category) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }
  
    const data = await fs.promises.readFile(filePathProducts, 'utf-8');
    const products = JSON.parse(data);
  
    // Verificar si el producto ya existe por el código
    const existingProduct = products.find((product) => product.code === code);
    if (existingProduct) {
      res.status(400).json({ error: 'El producto ya existe' });
      return;
    }
  
    // Generar un nuevo ID
    const newProductId = products.length === 0 ? 1 : products[products.length - 1].id + 1;
  
    const newProduct = {
      id: newProductId,
      title,
      description,
      code,
      price,
      status: true,
      stock,
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [thumbnails].filter(Boolean), 
    };
  
    products.push(newProduct);
  
    await fs.promises.writeFile(filePathProducts, JSON.stringify(products, null, 2));
  
    res.status(201).json(newProduct);
  } catch (error) {
    console.log('Error al leer/escribir el archivo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/:pid', async (req, res) => {
  console.log('¡Producto actualizado!');
  try {
    const productId = req.params.pid;
    const updatedFields = req.body;

    const data = await fs.promises.readFile(filePathProducts, 'utf-8');
    const products = JSON.parse(data);

    const productIndex = products.findIndex((product) => product.id == productId);

    if (productIndex === -1) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    // Remover el campo "id" del objeto de campos actualizados si está presente
    delete updatedFields.id;

    const updatedProduct = { ...products[productIndex], ...updatedFields };
    products[productIndex] = updatedProduct;

    await fs.promises.writeFile(filePathProducts, JSON.stringify(products, null, 2));

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log('Error al leer/escribir el archivo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.delete('/:pid', async (req, res) => {
  console.log('¡Producto eliminado!');
  const id = await req.params.pid;
  try {
    const data = await fs.promises.readFile(filePathProducts, 'utf-8');
    const products = JSON.parse(data);
    const productIndex = products.findIndex((product) => product.id == id);
    if (productIndex != -1) {
      products.splice(productIndex, 1);
      await fs.promises.writeFile(filePathProducts,JSON.stringify(products, null, 2));
      res.status(204).json({ message: 'Producto eliminado' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.log('Error al leer el archivo:', error);
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
});

export default router; 
