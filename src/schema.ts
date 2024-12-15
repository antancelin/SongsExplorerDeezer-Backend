// packages
import { buildSchema } from "graphql"; // import de la fonction pour la construction du schéma GraphQL

// définition du shcéma GraphQL avec les types et les requêtes disponibles
const schema = buildSchema(`

  type Artist {
    id: ID!
    name: String!
    biography: String
  }

  type Query {
    welcome: String
    getArtistBiography(artistId: ID!): Artist
  }
`);

export default schema; // export du schéma pour utilisation dans le serveur
