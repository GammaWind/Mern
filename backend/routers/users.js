const express = require('express');
const router  =  express.Router();
const {User} = require('../models/user');
const bcrypt =  require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv/config');

//get all users
router.get(`/`,async (req, res)=>{
    const userList = await User.find().select('-passwordHash');

    if(!userList){
        res.status(500).json({success : false});
    }

    res.send(userList);


})

//get user by id
router.get(`/:id`, async (req, res) =>{
    let user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({success: false, message:'category not found'})
    } 
    res.send(user);
})

//create or register a user
router.post(`/`,async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone ,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip :req.body.zip,
        city: req.body.city,
        country: req.body.country
    

    })
    user = await user.save();

    if (!user){
        return res.status(404).send('user cngt be created');
    }
    res.send(user)

})


//login user
router.post('/login', async (req,res) => {
    console.log(req.body)
    const user = await User.findOne({email: req.body.email})
    
    const secret = process.env.secret;
    if(!user) {
        return res.status(400).send('The user not found');
    }

    if(user && bcrypt.compareSync(req.body.passwordHash, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn : '1d'}
        )
       
        res.status(200).send({user: user.email , token: token}) 
    } else {
       res.status(400).send('password is wrong!');
    }

    
})

//register user
router.post(`/register`,async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone ,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip :req.body.zip,
        city: req.body.city,
        country: req.body.country
    

    })
    user = await user.save();

    if (!user){
        return res.status(404).send('user cngt be created');
    }
    res.send(user)

})


module.exports = router;