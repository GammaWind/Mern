const expressJwt = require('express-jwt');

function authJwt()
{
    const secret  = process.env.secret;
    return expressJwt({  //expressJwt J must be capital
        secret,
        algorithms:['HS256']
        

        
    })
}

module.exports = authJwt;