const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {

    res.cookie('test', '!!!!!')
    const data = {
        title: 'hello!',
        content: 'hello content!'
    }

    res.render('hello', data)
})

router.get('/kohei', (req, res, next) => {

    console.log(req.cookies.test)
    const data = {
        title: 'kohei!',
        content: 'kohei content!'
    }

    res.render('hello', data)
})

module.exports = router