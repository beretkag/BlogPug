const express = require('express');
const moment = require('moment');
//const ejs = require('ejs');  // ??
const config = require('../config.js');
const app = express();

const router = express.Router();


const uri = `mongodb+srv://${config.user}:${config.password}@${config.host}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
console.log('Connected to MongoDB Databae...');
const database = client.db("CRUD_Blog");

    //GET ALL RECORDS
    app.get('/:table', (req, res)=>{
        let collection = database.collection(req.params.table);
        collection.find().toArray()
        .then(results => {
            res.send(results);
        })
        .catch(error => {
            res.send(error)
        })
    })

    //GET ONE RECORD BY ID
    app.get('/:table/:id', (req, res)=>{
        let blogID = req.params.id;
        let collection = database.collection(req.params.table);

        collection.find({'_id': ObjectId(blogID)}).toArray()
        .then(results => {
            res.send(results);
        })
        .catch(error => {
            res.send(error)
        })
    })

    //INSERT RECORD
    app.post('/:table', (req, res)=>{
        let collection = database.collection(req.params.table);
        let data = req.body;
        collection.insertOne(data)
        .then(results => {
            res.send(results);
        })
        .catch(error => {
            res.send(error)
        })
    })

    //DELETE ONE RECORD BY ID
    app.delete('/:table/:id', (req, res)=>{
        let blogID = req.params.id;
        let collection = database.collection(req.params.table);

        collection.deleteOne({'_id': ObjectId(blogID)})
        .then(results => {
            res.send(results);
        })
        .catch(error => {
            res.send(error)
        })
    })

    //DELETE ALL RECORDS
    app.delete('/:table', (req, res)=>{
        let collection = database.collection(req.params.table);

        collection.deleteMany({})
        .then(results => {
            res.send(results);
        })
        .catch(error => {
            res.send(error)
        })
    })

    //UPDATE RECORD BY ID
    app.patch('/:table/:id', (req, res)=>{
        let blogID = req.params.id;
        let collection = database.collection(req.params.table);
        let data = req.body;

        collection.updateOne({'_id': ObjectId(blogID)},{$set:data})
        .then(results => {
            res.send(results);
        })
        .catch(error => {
            res.send(error)
        })

    })
});