const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

//middlewares
const authJwt = require('./helpers/jwt');

app.use(morgan('tiny'));
app.use(authJwt);


require('dotenv/config');
const api = process.env.API_URL
const productsRouter = require('../backend/routers/product')
const categoriesRouter = require('./routers/categories')
const usersRouter = require('./routers/users');





//routers - controllers
app.use(`${api}/products`,productsRouter);
app.use(`${api}/categories`,categoriesRouter);
app.use(`${api}/users`,usersRouter);






mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log("DB is ready")
})
.catch(err =>{
    console.log(err)
})



app.listen(3000, ()=> {
    console.log("server started with port 3000");
})