import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import connectDB from "../../db/index.js";
import { User } from "../../models/user.model.js"

import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

const count = 1000;

const generateFakeUsers = (count) =>{
  const fakeUsers = [];

  for (let i = 0; i < count; i++){
    fakeUsers.push({
      username: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      fullName: faker.person.fullName(),
      avatar: faker.image.avatar(),
      isVerified: true,
      isFake: true,
    })
  }

  return fakeUsers;
}

const seedFakeUsers = async () =>{
  try {
    await connectDB();
    console.log("MongoDB connected");

    const fakeUsers = generateFakeUsers(count);
    await User.insertMany(fakeUsers);
    console.log(`Added ${count} fake users`);
  } catch (error) {
    console.log("Error seeding fake users: ", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

seedFakeUsers();