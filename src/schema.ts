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
    releaseDate: String
  }

  type Track {
    id: ID!
    title: String!
    duration: Int
    releaseDate: String
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
    searcheTracks(query: String!, limit: Int): SearchResult!
    getTrackDetails(trackId: ID!): Track
    getArtistBiography(artistId: ID!): Artist
  }
`);

export default schema; // export du schéma pour utilisation dans le serveur
