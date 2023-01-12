require('dotenv').config();
const express = require('express');
const moment = require('moment');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const config = require('./config.js');
const port = config.port;
const pug = require('pug');
const { default: axios } = require('axios');


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname + '/assets')));
app.use('/views', express.static(path.join(__dirname + '/views')));

app.get('/', (req, res)=>{
    axios.get('http://localhost:8080/Blogosdi').then(results=>{
        results.data.forEach(element => {
            element.date = moment(element.date).format('YYYY-MM-DD hh:mm')
        });
        res.status(200).send(pug.renderFile('./assets/views/blogs.pug', {blogok: results.data}));
    });
})

app.get('/csakegy/blog/:blogID', (req, res)=>{
    axios.get(`http://localhost:8080/Blogosdi/${req.params.blogID}`).then(results=>{
        results.data[0].date = moment(results.data[0].date).format('YYYY-MM-DD hh:mm')
        res.status(200).send(pug.renderFile('./assets/views/egyBlog.pug', {blog: results.data[0]}));
    });
})
app.get('/edit/:blogID', (req, res)=>{
    axios.get(`http://localhost:8080/Blogosdi/${req.params.blogID}`).then(results=>{
        results.data[0].date = moment(results.data[0].date).format('YYYY-MM-DD hh:mm')
        res.status(200).send(pug.renderFile('./assets/views/edit.pug', {blog: results.data[0], now: moment(new Date()).format('YYYY-MM-DD hh:mm'), type: "edit"}));
    });
})

app.post('/edit/:id', (req, res) => {
    axios({
        method: 'patch',
        url: `http://localhost:8080/Blogosdi/${req.params.id}`,
        headers:{
            'content-type': 'application/json'
        },
        data: [req.body]
    }).then(results=>{
        res.redirect('/');
    })
})

app.get('/delete/:id', (req, res) => {
    axios.delete(`http://localhost:8080/Blogosdi/${req.params.id}`).then(results=>{
        res.redirect('/');
    });
})


app.get('/addNew', (req, res)=>{
    let data = {
        short: "",
        content: "",
        title: "",
    };
    res.status(200).send(pug.renderFile('./assets/views/edit.pug', {blog: data, now: moment(new Date()).format('YYYY-MM-DD hh:mm'), type: "add"}));
})

app.post('/add/:id', (req, res) => {
    axios({
        method: 'post',
        url: `http://localhost:8080/Blogosdi`,
        headers:{
            'content-type': 'application/json'
        },
        data: [req.body]
    }).then(results=>{
        res.redirect('/');
    })
})






const uri = `mongodb+srv://${config.user}:${config.password}@${config.host}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
    if (err != null) {
        console.log(err);
    } else {
        console.log("Connected to MongoDB Database...");
    }

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
        console.log(req.body);
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
            res.send(results)
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
        console.log(req.body)
        console.log(req.params.id)
        console.log(req.params.table)

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

app.listen(port, () => {
    console.log(`A szerver ezen a porton hallgat: ${port}...`)
});