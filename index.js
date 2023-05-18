const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xiw11k9.mongodb.net/?retryWrites=true&w=majority`;

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
    const jobCollection = client.db("jobDB").collection("jobs");

    //  creating index on two fields
    const indexKeys = { title: 1, category: 1 }; //replace fild1 and fild2 with your actual field names
    const indexOption = { name: "titleCategory" }; //replace index_name with the desired index name
      const result = await jobCollection.createIndex(indexKeys, indexOption);
      


    app.get("/jobSearchByTitle/:text", async (req, res) => {
      const serchText = req.params.text;
      const result = await jobCollection
        .find({
          $or: [
            { title: { $regex: serchText, $options: "i" } },
            { category: { $regex: serchText, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });
      
      
      

    app.post("/jobPost", async (req, res) => {
      const body = req.body;
      body.createAt = new Date();
      const result = await jobCollection.insertOne(body);
      //   console.log(body);
      res.send(result);
    });

    app.get("/jobDetails/:id", async (req, res) => {
      const id = req.params.id;
      const queary = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(queary);
      res.send(result);
    });

    app.get("/myjobs/:email", async (req, res) => {
      const result = await jobCollection
        .find({ postedBy: req.params.email })
        .toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/allJobs/:value", async (req, res) => {
      if (req.params.value == "remote" || req.params.value == "offline") {
        const result = await jobCollection
          .find({ status: req.params.value })
          .sort({ createAt: -1 })
          .toArray();
        console.log(result);
        return res.send(result);
      }
      const result = await jobCollection
        .find({})
        .sort({ createAt: -1 })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Job server is running");
});

app.listen(port, () => {
  console.log("runnign on port " + port);
});
