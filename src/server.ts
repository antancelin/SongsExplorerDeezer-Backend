// packages
import express from "express"; // création du serveur via Express
import { graphqlHTTP } from "express-graphql"; // middleware pour utilisation de GraphQL
import dotenv from "dotenv"; // permet la gestion des variables d'environnement
import rateLimit from "express-rate-limit"; //
dotenv.config(); // charge les variables d'environnement du fichier '.env'

// schema + root
import schema from "./schema"; // schéma GraphQL défini dans son propre fichier
import root from "./resolvers"; // résolveurs contenant la logique de traitement des requêtes

// instance d'application d'Express
const app = express();

// configuration du 'rate limiter'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par fenêtre
});

// utilisation du 'rate limiter' sur toutes les requêtes
app.use(limiter);

// configuration du middleware GraphQL
app.use(
  "/graphql", // point d'accès pour les requêtes GraphQL
  graphqlHTTP({
    schema: schema, // le schéma à utiliser
    rootValue: root, // les résolveurs à utiliser pour traiter les requêtes
  })
);

const PORT = 3000; // port sur lequel le serveur écoutera

// deméarrage du serveur et écoute des requêtes
app.listen(PORT, () => {
  console.log(`GraphQL server running on http://localhost:${PORT}/graphql 🚀`); // message de confirmation que le serveur fonctionne
});
