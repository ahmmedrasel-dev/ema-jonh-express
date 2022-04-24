const express = require('express')
const app = express();
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());


const { response } = require('express');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.hqdjl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productCollection = client.db('emajonhsimple').collection('products');

    app.get('/product', async (req, res) => {
      const selectedPage = parseInt(req.query.selectedPage);
      const numOfProduct = parseInt(req.query.numOfProduct);
      const quarry = {};
      const cursor = productCollection.find(quarry);
      let products;
      if (selectedPage || numOfProduct) {
        /* Skip() hocchy je par page a by default 10 ta product thakbe to ami jokhon 2nd page a jabo tokhon 2nd page er product asbe 1st page a je product gulo show kora hoichy tar pore theke. 
        
        limit() hoitechy ami koto gulo product perpage a show korabo.
        */
        products = await cursor.skip(selectedPage * numOfProduct).limit(numOfProduct).toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send(products);
    })

    app.get('/product-count', async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    })

    app.post('/productByKeys', async (req, res) => {
      const keys = req.body;
      console.log('keys', keys)
      const ids = keys.map(id => ObjectId(id));
      const query = { _id: { $in: ids } }
      const cursor = productCollection.find(query);
      const products = await cursor.toArray()
      res.send(products);
    })
  }
  finally {
    // await client.close()
  }
}
run().catch(console.dir)

app.listen(port, () => {
  console.log('Ema-Jonh server running port is', port);
})