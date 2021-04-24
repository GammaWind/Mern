const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();


//API get categories
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.send(categoryList);
})

//get categories by id
router.get(`/:id`, async (req, res) =>{
    let category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({success: false, message:'category not found'})
    } 
    res.send(category);
})

//update category
router.put('/:id', async (req, res) => {
    let category = await Category.findByIdAndUpdate(
        req.params.id , 
        {
            name : req.body.name,
            icon : req.body.icon,
            color: req.body.color
        },
        {
            new:true
        }
    )
    if (!category){
        return res.status(404).send('category cant be created')
    }
    res.send(category)


})


//add new category
router.post(`/`,async (req, res) => {
    let category = new Category({
        name : req.body.name,
        icon : req.body.icon,
        color : req.body.color

    })
    category = await category.save();

    if (!category){
        return res.status(404).send('category cant be created')
    }
    res.send(category)

})


//delete category
router.delete(`/:id`, (req, res) => {

    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category){
            return res.status(200).json({success:true, message:'category deleted successfully'})
        }
        else{
            return res.status(404).json({success:false, message:'could not find category'})
        }
    })
    .catch(err =>{
        return res.status(400).json({success:false, error:err})
    })
})

module.exports =router;