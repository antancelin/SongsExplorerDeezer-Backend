// packages import
import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
dotenv.config();

// schema + root import
import schema from "./schema";
import root from "./resolvers";

// Express application instance
const app = express();

// activation of cors for road access
app.use(cors());

// 'rate limite' configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again in 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// use of 'rate limit' on all queries
app.use("/graphql", limiter);

// GraphQL middleware configuration
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
  })
);

// starting the server and listening for requests
app.listen(process.env.PORT, () => {
  console.log(`GraphQL server running 🚀`); // log message to confirm server startup
});
