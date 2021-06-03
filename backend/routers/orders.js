const {Order} = require('../models/order');
const {OrderItem} = require('../models/order-item')
const express = require('express')
const router = express.Router();

router.get('/', async (req, res) =>{
    //we did filter also populte some fields from user model also sorted the results base on some attribute in desc order
    const orderList = await Order.find()
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
    
    
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderitem => {
        let newOrderItem = new OrderItem({
            quantity  : orderitem.quantity,
            product : orderitem.product
        })
       
        newOrderItem = await newOrderItem.save()
        return newOrderItem._id
    }))
    const orderItemsResolved = await orderItemsIds;

    
    
    let order = new Order({
        orderItems : orderItemsResolved,
        shippingAddress1 : req.body.shippingAddress1,
        shippingAddress2 : req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country : req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        user : req.body.user


    })
    
    
    order = await order.save();

    if (!order){
        return res.status(404).send('order cant be created')
    }
    res.send(order)

})


router.put('/:id', async (req, res) => {
    console.log('herere')
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