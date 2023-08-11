import {Router} from 'express';
import ProductManager from '../services/product.services.js';

const router = Router();
const productManger = new ProductManager('./src/bd/productos.json');

router.get('/',(req,res)=>{
    res.render('index',{});
})

router.get('/home',async(req,res)=>{
    try{
        const products = await productManger.getProducts();
        res.render('home',{products});
    }catch(e){console.log(e);}
})

router.get('/realTimeProducts',async(req,res)=>{
    try{
        const products = await productManger.getProducts();
        res.render('realTimeProducts',{products});
    }catch(e){console.log(e)};
})

router.get('/form-products',async(req,res)=>{
    res.render('form',{});
})

router.post('/form-products',async(req,res)=>{  
    try{
        const data = req.body;
        const result = await productManger.addProduct(data.title,
                                                      data.descripcion,
                                                      data.code,
                                                      data.price,
                                                      data.status,
                                                      data.stock,
                                                      data.category,
                                                      data.thumbail);
        res.redirect('/products');
    }
    catch(e){console.log(e)};
})

export default router;