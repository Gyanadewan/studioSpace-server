import express from "express";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors"
const client = new MongoClient(process.env.MONGODB_URL);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoClient = await connectToMongoDB();
const db = mongoClient.db("studio-space");
const studiosCollection = db.collection("studios");
const bookingsCollection = db.collection("bookings");


const app = express();
app.use(express.json())
const port = 8000;

app.use(cors())
app.get("/featured-studios", async (req, res) => {
  const result = await studiosCollection
    .find({ isAvailable: true })
    .sort({ rating: -1 })
    .limit(6)
    .toArray();

  res.send(result);
});


app.get("/categories", async (req, res) => {
  try {
    const categories = await db
      .collection("studios")
      .distinct("category");

    res.send(categories);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch categories",
    });
  }
});

app.get("/studios",async(req,res) => {
  const studios = await studiosCollection.find(req.query.category? {category: req.query.category}:{}).toArray()
  res.send(studios)
})

app.post("/studios",async (req,res)=> {
  const studioData = req.body;
  console.log(studioData)
  const result = await studiosCollection.insertOne(studioData)
  res.send(result)
})


app.get("/studios/:id", async (req, res) => {
  try {
    const studio = await studiosCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(studio);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch studio" });
  }
});


app.post("/bookings", async (req, res) => {
  const result = await bookingsCollection.insertOne({
    ...req.body,
    status: "Pending",
    createdAt: new Date(),
  });

  res.send(result);
});


app.get("/my-bookings/:email", async (req, res) => {
  const bookings = await bookingsCollection
    .find({ customerEmail: req.params.email })
    .sort({ createdAt: -1 })
    .toArray();

  res.send(bookings);
});


app.delete("/bookings/:id",async(req,res) => {
  const result = await bookingsCollection.deleteOne({
    _id: new ObjectId(req.params.id)
  });
  res.send(result)
})

app.get("/", (req, res) => {
  res.send("Hello World ..");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
