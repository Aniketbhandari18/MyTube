import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import connectDB from "../../db/index.js";
import { User } from "../../models/user.model.js";
import { Video } from "../../models/video.model.js";

import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

const count = 300;

const videoUrls = [
  "https://res.cloudinary.com/aniketbhandari/video/upload/v1741193259/dk2lvffrhdyimhct4dpw.mp4",
  "https://res.cloudinary.com/aniketbhandari/video/upload/v1741101014/v6jxuu2otlyhvvr8ufal.mp4",
  "https://res.cloudinary.com/aniketbhandari/video/upload/v1741100539/tgp6hut9n6wuhdudfok1.mp4",
  "https://res.cloudinary.com/aniketbhandari/video/upload/v1745051887/Flying_Jett_etrxe8.mp4",
  "https://res.cloudinary.com/aniketbhandari/video/upload/v1745052011/CountDown_tcncbo.mp4",
  "https://res.cloudinary.com/aniketbhandari/video/upload/v1745052135/Clouds_or4qdk.mp4",
]

const generateFakeVideos = async (count) =>{
  const users = await User.find({ isVerified: true });
  const fakeVideos = [];

  for (let i = 0; i < count; i++){
    const randomUser = users[Math.floor(Math.random() * users.length)];

    fakeVideos.push({
      title: faker.lorem.sentence({min: 4, max: 8}),
      description: faker.lorem.paragraphs({min: 1, max: 2}, "\n"),
      videoFile: videoUrls[Math.floor(Math.random() * videoUrls.length)],
      thumbnail: faker.image.urlPicsumPhotos({
        width: 1280,
        height: 720,
      }),
      owner: randomUser._id,
      duration: faker.number.int({ min: 30, max: 1200 }),
      views: faker.number.int({ min: 0, max: 1500 }),
      isPublished: true,
      isFake: true,
    })
  }

  return fakeVideos;
}

const seedFakeVideos = async () =>{
  try {
    await connectDB();
    console.log("MongoDB connected");

    const fakeVideos = await generateFakeVideos(count);
    await Video.insertMany(fakeVideos);
    console.log(`Added ${count} fake videos`);
  } catch (error) {
    console.log("Error seeding fake videos: ", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

seedFakeVideos();