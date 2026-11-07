import express from "express";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

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

const app = express();

const port = 8000;


app.get("/featured-studios", async (req, res) => {
  const result = await studiosCollection
    .find({ isAvailable: true })
    .sort({ rating: -1 })
    .limit(6)
    .toArray();

  res.send(result);
});




app.get("/", (req, res) => {
  res.send("Hello World ..");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
