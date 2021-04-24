const { debug } = require('dotenv/lib/env-options');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const {Product} = require('../models/product');
const mongoose = require('mongoose');


// get all products
router.get( `/`, async (req, res) => {
    const productList = await Product.find().populate('category');

    if (!productList){
        res.status(500).json({
            success:false
        })
    }
    res.send(productList);
})

//get product by id
router.get(`/:id`, async (req, res) =>{
    let product = await Product.findById(req.params.id);
    console.log(product)
    if(!product)
    return res.status(500).send('product not found')

    res.send(product)
})

//get selected feilds for product
router.get( '/get/selected' , async (req, res) => {
    
    const productL = await Product.find().select('name');

    if (!productL){
        res.status(500).json({
            success:false
        })
    }
    res.send(productL);
})
//get selected feilds for sepecific product
router.get( '/selected/:id' , async (req, res) => {
    
    const productL = await Product.findById(req.params.id).select('image');

    if (!productL){
        res.status(500).json({
            success:false
        })
    }
    res.send(productL);
})


//add new products
router.post( `/`, async (req, res) => {
    
    let category = await  Category.findById(req.body.category);
    if (!category)
    return res.status(500).send('Invalid Category')

    let newProduct = new Product({
        name : req.body.name,
        description : req.body.description,
        richDescription : req.body.richDescription,
        image : req.body.image,
        brand : req.body.brand,
        price : req.body.price,
        category : req.body.category,
        countInStock : req.body.countInStock,
        rating : req.body.rating,
        numReviews : req.body.numReviews,
        isFeatured : req.body.isFeatured

    })
    newProduct = await newProduct.save()

    if(!newProduct)
    return res.status(500).send('product cannot be added');

    res.send(newProduct); 

    
    
})

//update product


router.put('/:id', async (req, res) => {
    //check if updated category is correct

    let category = await  Category.findById(req.body.category);
    if (!category)
    return res.status(500).send('Invalid Category')

    //check if product is present and if then update
    let product = await Product.findByIdAndUpdate(
        req.params.id , 
        {
        name : req.body.name,
        description : req.body.description,
        richDescription : req.body.richDescription,
        image : req.body.image,
        brand : req.body.brand,
        price : req.body.price,
        category : req.body.category,
        countInStock : req.body.countInStock,
        rating : req.body.rating,
        numReviews : req.body.numReviews,
        isFeatured : req.body.isFeature
        },
        {
            new:true
        }
    )
    
    if (!product){
        return res.status(404).send('product not foun d or cant be updated')
    }
    res.send(product)


})

//delete product
router.delete(`/:id`, (req, res) => {
    if(! mongoose.isValidObjectId(req.params.id)){
        return res.status(404).json({success:false, message:'could nott find product'})

    }

    Category.findByIdAndRemove(req.params.id).then(product => {
        if(product){
            return res.status(200).json({success:true, message:'product deleted successfully'})
        }
        else{
            return res.status(404).json({success:false, message:'could not find product'})
        }
    })
    .catch(err =>{
        return res.status(400).json({success:false, error:err})
    })
})





module.exports =router;