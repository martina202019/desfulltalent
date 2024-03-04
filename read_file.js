const fs = require('fs')
const express = require('express');
const router = express.Router();

router.get('/departments', (req, res) => {
    fs.readFile('department.json', 'utf8', (err, data) => {
        if(err){        
            res.status(500).send({'status': "error", "mssage": "Error obteniendo la informacion"})
            return;
        }        
        res.send(JSON.parse(data))
    })
})

router.post('/department', (req, res) => {
    fs.readFile('department.json', 'utf8', (err, data) => {
        var departments = JSON.parse(data)
        departments.push(req.body)     
        fs.writeFile('department.json', JSON.stringify(departments), (err) => {
            if(err){
                res.send(err)
                return;
            }
            res.send(req.body)
        })   
    })
})

module.exports = router