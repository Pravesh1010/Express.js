// const express = require("express");
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "./middleware/auth.js";
import { UUID } from "bson";
import Stripe from 'stripe';
const stripe = new Stripe('sk_test_51KpbhwSHVuORzoRvIbEyrRF37FKMpVK34fCAkNmJBv8RRK5GUHpk9k52M0SYSxahpuowO4dSY0MQIaAOkJG86jRm00e5DgdnRe');
import { v4 as uuidv4 } from 'uuid';

dotenv.config();
const app = express();

const PORT = process.env.PORT;
// const PORT = 5000;

app.use(cors());

const movies = [
  {
    id: "100",
    name: "Iron man 2",
    poster:
      "https://m.media-amazon.com/images/M/MV5BMTM0MDgwNjMyMl5BMl5BanBnXkFtZTcwNTg3NzAzMw@@._V1_FMjpg_UX1000_.jpg",
    rating: 7,
    summary:
      "With the world now aware that he is Iron Man, billionaire inventor Tony Stark (Robert Downey Jr.) faces pressure from all sides to share his technology with the military. He is reluctant to divulge the secrets of his armored suit, fearing the information will fall into the wrong hands. With Pepper Potts (Gwyneth Paltrow) and Rhodes (Don Cheadle) by his side, Tony must forge new alliances and confront a powerful new enemy.",
    trailer: "https://www.youtube.com/embed/wKtcmiifycU",
  },
  {
    id: "101",
    name: "No Country for Old Men",
    poster:
      "https://upload.wikimedia.org/wikipedia/en/8/8b/No_Country_for_Old_Men_poster.jpg",
    rating: 8.1,
    summary:
      "A hunter's life takes a drastic turn when he discovers two million dollars while strolling through the aftermath of a drug deal. He is then pursued by a psychopathic killer who wants the money.",
    trailer: "https://www.youtube.com/embed/38A__WT3-o0",
  },
  {
    id: "102",
    name: "Jai Bhim",
    poster:
      "https://m.media-amazon.com/images/M/MV5BY2Y5ZWMwZDgtZDQxYy00Mjk0LThhY2YtMmU1MTRmMjVhMjRiXkEyXkFqcGdeQXVyMTI1NDEyNTM5._V1_FMjpg_UX1000_.jpg",
    summary:
      "A tribal woman and a righteous lawyer battle in court to unravel the mystery around the disappearance of her husband, who was picked up the police on a false case",
    rating: 8.8,
    trailer: "https://www.youtube.com/embed/nnXpbTFrqXA",
  },
  {
    id: "103",
    name: "The Avengers",
    rating: 8,
    summary:
      "Marvel's The Avengers (classified under the name Marvel Avengers\n Assemble in the United Kingdom and Ireland), or simply The Avengers, is\n a 2012 American superhero film based on the Marvel Comics superhero team\n of the same name.",
    poster:
      "https://terrigen-cdn-dev.marvel.com/content/prod/1x/avengersendgame_lob_crd_05.jpg",
    trailer: "https://www.youtube.com/embed/eOrNdBpGMv8",
  },
  {
    id: "104",
    name: "Interstellar",
    poster: "https://m.media-amazon.com/images/I/A1JVqNMI7UL._SL1500_.jpg",
    rating: 8.6,
    summary:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA\n pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team\n of researchers, to find a new planet for humans.",
    trailer: "https://www.youtube.com/embed/zSWdZVtXT7E",
  },
  {
    id: "105",
    name: "Baahubali",
    poster: "https://flxt.tmsimg.com/assets/p11546593_p_v10_af.jpg",
    rating: 8,
    summary:
      "In the kingdom of Mahishmati, Shivudu falls in love with a young warrior woman. While trying to woo her, he learns about the conflict-ridden past of his family and his true legacy.",
    trailer: "https://www.youtube.com/embed/sOEg_YZQsTI",
  },
  {
    id: "106",
    name: "Ratatouille",
    poster:
      "https://resizing.flixster.com/gL_JpWcD7sNHNYSwI1ff069Yyug=/ems.ZW1zLXByZC1hc3NldHMvbW92aWVzLzc4ZmJhZjZiLTEzNWMtNDIwOC1hYzU1LTgwZjE3ZjQzNTdiNy5qcGc=",
    rating: 8,
    summary:
      "Remy, a rat, aspires to become a renowned French chef. However, he fails to realise that people despise rodents and will never enjoy a meal cooked by him.",
    trailer: "https://www.youtube.com/embed/NgsQ8mVkN8w",
  },
];

const pizzas = [
  {
    name: "Pepper Barbecue Chicken",
    varients: ["small", "medium", "large"],
    base: [
      "Whole Wheat",
      "Refined Wheat",
      "Italian Bread",
      "Thin Crust",
      "Cheese Crust",
    ],
    prices: [
      {
        small: 200,
        medium: 350,
        large: 400,
      },
    ],

    category: "nonveg",
    image:
      "https://www.dominos.co.in/theme2/front/images/menu-images/my-vegpizza.jpg",
    description: "Pepper Barbecue Chicken I Cheese",
  },
  {
    name: "Golden Corn Pizza",
    varients: ["small", "medium", "large"],
    base: [
      "Whole Wheat",
      "Refined Wheat",
      "Italian Bread",
      "Thin Crust",
      "Cheese Crust",
    ],
    prices: [
      {
        small: 200,
        medium: 350,
        large: 400,
      },
    ],

    category: "nonveg",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6foYkrwpAO87yvGauFQzCE9O8xSi98pRWgZ0FN8SMdd3wYc0rSHad5RxZ5SI-Lh_28u0&usqp=CAU",
    description: "Pepper Barbecue Chicken I Cheese",
  },
  {
    name: "Double Cheese Margherita Pizza",
    varients: ["small", "medium", "large"],
    base: [
      "Whole Wheat",
      "Refined Wheat",
      "Italian Bread",
      "Thin Crust",
      "Cheese Crust",
    ],
    prices: [
      {
        small: 200,
        medium: 350,
        large: 400,
      },
    ],

    category: "nonveg",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_j1dPSto1BeL90inFnnD3QbaxV9qDgj_tXjj-aClRrJUaeH_LyvJ9VUI5LXstc0o4aR8&usqp=CAU",
    description: "Pepper Barbecue Chicken I Cheese",
  },
  {
    name: "Jalapeno & Red Paprika Pizza",
    varients: ["small", "medium", "large"],
    base: [
      "Whole Wheat",
      "Refined Wheat",
      "Italian Bread",
      "Thin Crust",
      "Cheese Crust",
    ],
    prices: [
      {
        small: 200,
        medium: 350,
        large: 400,
      },
    ],

    category: "nonveg",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2jHPhPJ9eAyu72WeTjf_88Z2NH5n4WAKTB1GbqriUgZHp4ncIhA_hksGUJ5Zq0kcF-Y0&usqp=CAU",
    description: "Pepper Barbecue Chicken I Cheese",
  },
  {
    name: "Non Veg Supreme",
    varients: ["small", "medium", "large"],
    base: [
      "Whole Wheat",
      "Refined Wheat",
      "Italian Bread",
      "Thin Crust",
      "Cheese Crust",
    ],
    prices: [
      {
        small: 200,
        medium: 350,
        large: 400,
      },
    ],

    category: "nonveg",
    image:
      "https://www.kindpng.com/picc/m/106-1066049_mexican-pizza-png-pizza-top-view-png-transparent.png",
    description: "Pepper Barbecue Chicken I Cheese",
  },
  {
    name: "Margerita",
    varients: ["small", "medium", "large"],
    base: [
      "Whole Wheat",
      "Refined Wheat",
      "Italian Bread",
      "Thin Crust",
      "Cheese Crust",
    ],
    prices: [
      {
        small: 200,
        medium: 350,
        large: 400,
      },
    ],

    category: "nonveg",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFvQHIlUrHkXO5RPTdMBnQpAWrzO3dqrjTdhNxrLFGd21eFC327AoRb1QHj9NZ09YbZX0&usqp=CAU",
    description: "Pepper Barbecue Chicken I Cheese",
  },
];

export default pizzas;
// middleware -> intercept -> converting body to json
app.use(express.json());

// Creating mongo connection //
// const MONGO_URL = "mongodb://localhost";

const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected ✌");
  return client;
}
const client = await createConnection();
// Mongo connection done //

app.get("/", function (request, response) {
  response.send("Hello Pravesh..😁✌😎");
});

// app.get("/movies", function (request, response) {
//   response.send(movies);
// });

app.get("/movies/:id", async function (request, response) {
  const { id } = request.params;
  // const movie = movies.find((mv) => mv.id == id)
  const movie = await client
    .db("firstmongo")
    .collection("movies")
    .findOne({ id: id });
  movie
    ? response.send(movie)
    : response.status(404).send({ message: "No such movie found😢" });
});

app.post("/movies", async function (request, response) {
  const data = request.body;
  console.log(data);
  const result = await client
    .db("firstmongo")
    .collection("movies")
    .insertOne(data);
  response.send(result);
});

// const auth = (request, response, next) => {
//   const token = request.header("x-auth-token");
//   console.log(token);
//   next();
// }
// cursor -> pagination -> convert to Array (toArray)
app.get("/movies", async function (request, response) {
  const movies = await client
    .db("firstmongo")
    .collection("movies")
    .find({})
    .toArray();
  response.send(movies);
});

app.delete("/movies/:id", async function (request, response) {
  const { id } = request.params;
  // const movie = movies.find((mv) => mv.id == id)
  const result = await client
    .db("firstmongo")
    .collection("movies")
    .deleteOne({ id: id });
  response.send(result);
});

app.put("/movies/:id", async function (request, response) {
  const { id } = request.params;
  const updateData = request.body;
  // const movie = movies.find((mv) => mv.id == id)
  const result = await client
    .db("firstmongo")
    .collection("movies")
    .updateOne({ id: id }, { $set: updateData });
  response.send(result);
});

// Pizza App Backend
app.get("/pizzas", async function (request, response) {
  const pizzas = await client
    .db("firstmongo")
    .collection("pizzas")
    .find({})
    .toArray();
  response.send(pizzas);
});

app.post("/pizzas", async function (request, response) {
  const data = request.body;
  console.log(data);
  const result = await client
    .db("firstmongo")
    .collection("pizzas")
    .insertOne(data);
  response.send(result); 
});

app.listen(PORT, () => console.log(`Server Started in ${PORT}`));

app.get("/users", async function (request, response) {
  const users = await client
    .db("firstmongo")
    .collection("users")
    .find({})
    .toArray();
  response.send(users);
});

app.post("/users/signup", async function (request, response) {
  const user = request.body;
  // const { username, password } = request.body;
  // const hashPassword = await genPassword(password);

  // const newUser = {
  //   username: username,
  //   password: hashPassword,
  // };

  const result = await client
    .db("firstmongo")
    .collection("users")
    .insertOne(user);
  response.send(result);
});

// orders database//////////////////////////////////////
app.post("/orders", async function (request, response) {
  const order = request.body;

  const result = await client
    .db("firstmongo")
    .collection("orders")
    .insertOne(order);
  response.send(result);
});
// app.post("/placed/orders", async function (request, response) {
//   const order = request.body;
//   try{
//     const customer = await stripe.customers.create({
//       email: order.email,
//       source: order.id
//     })

//     const payment = await stripe.charges.create({
//       currency: 'inr',
//       customer: customer.id,
//       receipt_email: token.email
//     }, {
//       idempotencyKey : uuidv4()
//     })

//     if(payment){
//       response.send("Payment done")
//     }else{
//       response.send("payment failed")
//     }
//   }catch( error ){
//     response.send("error")
//   }
// });
app.get("/orders/pizza", async function (request, response) {
  const order = await client
    .db("firstmongo")
    .collection("orders")
    .find({})
    .toArray();
  response.send(order);
});
// orders database/////////////////////////////////////

async function genPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  return hashPassword;
}

app.post("/users/login", async function (request, response) {
  const { username, password } = request.body;

  const userFromDb = await client
    .db("firstmongo")
    .collection("users")
    .findOne({ username: username });
  console.log(userFromDb);
  if (!userFromDb) {
    response.status(401).send({ message: "Invaild Credentials" });
  } else {
    const storedPassword = userFromDb.password; //hashed password
    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    console.log(isPasswordMatch);
    if (isPasswordMatch) {
      const token = jwt.sign({ id: userFromDb._id }, process.env.SECRET_KEY);
      response.send({ message: "Successfull login", token: token });
    } else {
      response.send({ message: "Invalid Credentials" });
    }
  }
});
