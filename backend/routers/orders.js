const {Order} = require('../models/order');
const {OrderItem} = require('../models/order-item')
const express = require('express')
const router = express.Router();
const { clearKey } = require("../helpers/cache");

// imported clearkey from redis

router.get('/', async (req, res) =>{
    //we did filter also populte some fields from user model also sorted the results base on some attribute in desc order
    
    //also .cache() is the mentho to chache here it is dramatically decreasing the lookup times
    const orderList = await Order.find().cache()
    .populate('user','name')
    .populate({path : 'orderItems' , populate:  'product'})
    .sort({'dateOrdered':-1});

    if (!orderList) {
        res.status(500).json({success:false})
    }
    res.send(orderList)
})



router.get('/:id', async (req, res) =>{
    //we did filter also populte some fields from user model also sorted the results base on some attribute in desc order
    const order = await Order.findById(req.params.id)
    .populate('user','name')
    .populate({path : 'orderItems' , populate:{path: 'product' , populate: ['category']}});

    if (!order) {
        res.status(500).json({success:false})
    }
    res.send(order)
})


router.post(`/`,async (req, res) => {
    
    //fetch all the products from orderItems array
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderitem => {
        let newOrderItem = new OrderItem({
            quantity  : orderitem.quantity,
            product : orderitem.product
        })
       
        newOrderItem = await newOrderItem.save()
        return newOrderItem._id
    }))
    const orderItemsResolved = await orderItemsIds;

    //fetch/calculate the total price of the all the ordered products

    const totalPrices = await Promise.all(orderItemsResolved.map(async (orderitemId )=> {
        const orderItem = await OrderItem.findById(orderitemId).populate('product','price');
        
        const totalPrice = orderItem.quantity * orderItem.product.price;
        return totalPrice

    }))
    //sum of the array containing prices for all orderitems
    const totalPrice = totalPrices.reduce((a , b) => a + b ,0);

    
    let order = new Order({
        orderItems : orderItemsResolved,
        shippingAddress1 : req.body.shippingAddress1,
        shippingAddress2 : req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country : req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user : req.body.user


    })
    try {
        order = await order.save();
        clearKey(Order.collection.collectionName);
        res.send(order);
      } catch (err) {
        res.send(400, err);
      }
    
    

    if (!order){
        return res.status(404).send('order cant be created')
    }
    res.send(order)

})


router.put('/:id', async (req, res) => {
    
    let order = await Order.findByIdAndUpdate(
        req.params.id , 
        {
            status: req.body.status
        },
        {
            new:true
        }
    )
    if (!order){
        return res.status(404).send('order cant be modified')
    }
    res.send(order)


})

router.delete(`/:id`, (req, res) => {

    Order.findByIdAndRemove(req.params.id).then(async order => {
        if(order){
            await order.orderItems.map(async orderitem =>{
                
                await OrderItem.findByIdAndRemove(orderitem)
            })


            return res.status(200).json({success:true, message:'order deleted successfully'})
        }
        else{
            return res.status(404).json({success:false, message:'could not find order'})
        }
    })
    .catch(err =>{
        return res.status(400).json({success:false, error:err})
    })
})



module.exports = router;