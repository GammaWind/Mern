const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

require('dotenv/config');
const api = process.env.API_URL
const productsRouter = require('../backend/routers/product')
const categoriesRouter = require('./routers/categories')


app.use(express.json());
app.use(morgan('tiny'));

app.use(`${api}/products`,productsRouter)

app.use(`${api}/categories`,categoriesRouter)




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