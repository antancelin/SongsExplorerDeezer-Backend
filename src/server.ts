// packages
import express from "express"; // création du serveur via Express
import { graphqlHTTP } from "express-graphql"; // middleware pour utilisation de GraphQL
import dotenv from "dotenv"; // permet la gestion des variables d'environnement
import rateLimit from "express-rate-limit"; //
import cors from "cors"; // import des cors pour accès à la route
dotenv.config(); // charge les variables d'environnement du fichier '.env'

// schema + root
import schema from "./schema"; // schéma GraphQL défini dans son propre fichier
import root from "./resolvers"; // résolveurs contenant la logique de traitement des requêtes

// instance d'application d'Express
const app = express();

// activation des cors pour accès à la route
app.use(cors());

// configuration du 'rate limiter'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
  message:
    "Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes",
  standardHeaders: true, // retourne les headers 'RateLimit-*' dans la réponse
  legacyHeaders: false, // désactive les headers 'X-RateLimit-*'
});

// utilisation du 'rate limiter' sur toutes les requêtes
app.use("/graphql", limiter);

// configuration du middleware GraphQL
app.use(
  "/graphql", // point d'accès pour les requêtes GraphQL
  graphqlHTTP({
    schema: schema, // le schéma à utiliser
    rootValue: root, // les résolveurs à utiliser pour traiter les requêtes
  })
);

// deméarrage du serveur et écoute des requêtes
app.listen(process.env.PORT, () => {
  console.log(`GraphQL server running 🚀`); // message de confirmation que le serveur fonctionne
});
