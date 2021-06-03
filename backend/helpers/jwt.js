const expressJwt = require('express-jwt');
require('dotenv/config');

function authJwt()
{
    const secret  = process.env.secret;
    return expressJwt({  //expressJwt J must be capital
        secret :  process.env.secret,
        algorithms:['HS256']
        

        
    }).unless({
        path: [
            {url: /\/api\/v1\/products(.*)/, methods:['GET','OPTIONS'] },
            '/api/v1/users/login',
            '/api/v1/users/register',
            
        ]
    })
}

module.exports = authJwt;