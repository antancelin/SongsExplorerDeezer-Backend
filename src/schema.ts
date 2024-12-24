// packages
import { buildSchema } from "graphql"; // import de la fonction pour la construction du schéma GraphQL

// définition du shcéma GraphQL avec les types et les requêtes disponibles
const schema = buildSchema(`

  type Artist {
    id: ID!
    name: String!
    picture: String
    biography: String
  }

  type Album {
    id: ID!
    title: String!
    cover: String
  }

  type Track {
    id: ID!
    title: String!
    duration: Int
    artist: Artist!
    album: Album
  }

  type SearchResult {
    data: [Track!]!
    total: Int!
    prev: String
    next: String
  }

  type Query {
    welcome: String
    searchTracks(query: String!, limit: Int): SearchResult!
    getTrackDetails(trackId: ID!): Track
  }
`);

export default schema; // export du schéma pour utilisation dans le serveur
