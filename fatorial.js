const express = require('express');
const redis = require('redis');

const PORT = process.env.PORT || 8081;
const REDIS_PORT = process.env.PORT || 6379;

const redisClient = redis.createClient(REDIS_PORT);

const app = express();

function fatorial(n){
	if(n === 0) return 1;
	if(n === 1) return 1;
	return n * fatorial(n-1);
}

app.listen(8081, () => {
    console.log(`App listening on port ${PORT}`);
})

redisClient.on('connect', () => {
    console.log('Redis is ready');
});
   
redisClient.on('error', (e) => {
    console.log('Redis error', e);
});

const getCache = (key) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, value) => {
            if(err){
                reject(err);
            }else{
                resolve(value);
            }
        })
    })
}

const setCache = (key, value) => {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, 'EX', 300, (err) =>{
            if(err){
                reject(err);
            }else{
                resolve(true);
            }
        })
    })
}

app.get('/fatorial/:num', async (req, res) => {
    const num = req.params.num
    const value = await getCache('fatorial:' + num);

    if(value){
        console.log('Pegando resultado do cache: ' + JSON.stringify(value))
        res.send('Pegando resultado do cache: ' + JSON.stringify(value));
    }else{
        const calcValue = fatorial(num);
        await setCache('fatorial:' + num, calcValue);
        console.log('Calculando resultado: ' + calcValue);
        res.send('Calculando resultado: ' + calcValue);
    }
})