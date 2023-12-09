const express = require("express");
const port = process.env.PORT || 5000;
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.gbdj4eh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const products = client.db("styleSpotDB").collection("products");
    const brands = client.db("styleSpotDB").collection("brands");
    const carts = client.db("styleSpotDB").collection("carts");
    const advertisement = client.db("styleSpotDB").collection("advertisement");


    // get request 
    // called it from home page for gettin all brand 
    app.get("/", async (req, res) => {
      const query = {}
      const result = await brands.find(query).toArray();
      res.send(result);
    });

    // called it from brand for get single brand all products 
    app.get("/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand }
      const cursor = products.find(query);
      const result = await cursor.toArray()
      res.send(result);
    });
    // called from brand page for getting slider images 
    app.get("/sliders/:brand", async(req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand };
      const result = await advertisement.findOne(query);
      res.send(result);
    });

    // called i from product details page for getting product details 
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await products.findOne(query);
      res.send(product);
    });
    // called it from update page for display previos data 
    app.get("/update/:id", async (req, res) => {
      console.log("getoneforupdate");
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const product = await products.findOne(query);
      console.log(product);
      res.send(product);
    });
    // patch request 
    // called it from update for for update product data 
    app.patch("/update/:id", async (req, res) => {
      console.log("pacht hitted");
      const updatedProduct = req.body;
      const productId = req.params.id;

      const filter = { _id: new ObjectId(productId) };


      const updateDoc = {
        $set: {
          image: updatedProduct.image,
          name: updatedProduct.name,
          brand: updatedProduct.brand,
          type: updatedProduct.type,
          price: updatedProduct.price,
          rating: updatedProduct.rating,
        },
      };
      const result = await products.updateOne(filter, updateDoc);
      res.send(result);

    });

    // post request 
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      const result = await products.insertOne(newProduct);
      res.send(result);
    });

    // carts related api 
    // called from product detail page to add cart 
    app.post("/carts", async (req, res) => {
      const cartItem = req.body;
      const result = await carts.insertOne(cartItem);
      res.send(result);
    });
    // called from cart page for display cart 
    app.get("/carts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { orderedBy: email }
      const cursor = await carts.find(query).toArray();
      res.send(cursor);
    })
    // called from cart page to delete cart item 
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await carts.deleteOne(query);
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});