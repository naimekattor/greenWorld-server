const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_KEY}@cluster0.uxyoe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("gardening").collection("sharedTips");
    const gradenersCollection = client.db("gardening").collection("gardeners");
    await gradenersCollection.createIndex({ name: 1 }, { unique: true });
    const gardenersData = require("./data.json");
    const existingCount = await gradenersCollection.countDocuments();
    if (existingCount === 0) {
      const result = await gradenersCollection.insertMany(gardenersData, {
        ordered: false,
      });
    }

    app.get("/explore", async (req, res) => {
      const result = await gradenersCollection.find().toArray();
      res.send(result);
    });

    app.get("/tips", async (req, res) => {
      const result = await database.find().toArray();
      res.send(result);
    });

    app.get("/share-tip/:id", async (req, res) => {
      const tipdId = req.params.id;
      const query = { _id: new ObjectId(tipdId) };
      const result = await database.findOne(query);
      res.send(result);
    });

    app.post("/share-tip", async (req, res) => {
      const formData = req.body;
      const result = await database.insertOne(formData);
      res.send(result);
      //console.log(`A document was inserted with the _id: ${result.insertedId}`);
      //console.log(formData);
    });

    app.delete("/tips/:id", async (req, res) => {
      const tipId = req.params.id;
      const query = { _id: new ObjectId(tipId) };
      const result = await database.deleteOne(query);
      res.send(result);
    });
    app.put("/share-tip/:id", async (req, res) => {
      const updatedData = req.body;
      const tipId = req.params.id;
      const query = { _id: new ObjectId(tipId) };
      const update = {
        $set: {
          updatedData,
        },
      };
      const result = await database.updateOne(query, update);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } catch (err) {
    //console.error(err);
  }
}
run()
  .catch
  //console.dir
  ();

app.get("/", (req, res) => {
  res.send("<h1>Welcome our Server</h1>");
});
//mongodb+srv://naimekattor:<db_password>@cluster0.uxyoe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.listen(PORT, () => {
  console.log(`The surver is running successfully at http://localhost:${PORT}`);
});
