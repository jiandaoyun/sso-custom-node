const qs = require('querystring');
const express = require('express');
const jwt = require('jsonwebtoken');

const config = {
    acs: 'https://www.jiandaoyun.com/sso/custom/5d03911587833c7bf2e19c38/acs',
    secret: 'jdy',
    issuer: 'com.example',
    username: 'angelmsger'
};

const app = express();

function getResponse(request, callback) {
    // Should be Asynchronous in Prod
    try {
        const decoded = jwt.verify(request, config.secret, {
            algorithms: ['HS256', 'HS384', 'HS512'],
            audience: config.issuer,
            issuer: 'com.jiandaoyun',
            clockTolerance: 3600
        });
        if (decoded.type !== 'sso_req') {
            throw new Error('Wrong Type.');
        }
        const encoded = jwt.sign({
            type: 'sso_res',
            username: config.username
        }, config.secret, {
            algorithm: 'HS256',
            expiresIn: 60000,
            audience: 'com.jiandaoyun',
            issuer: config.issuer
        });
        callback(undefined, encoded);
    } catch (e) {
        callback(e);
    }
}

app.get('/sso', (req, res) => {
    const {
        query
    } = req;
    const {
        request,
        state
    } = query;
    getResponse(request, (e, response) => {
        if (e) {
            console.log(e);
            res.status(400);
            res.send('Bad Request.');
        } else {
            const responseQuery = qs.stringify({
                response,
                state
            });
            res.redirect(`${ config.acs }?${ responseQuery }`);
        }
    });
});

app.listen(8080);
