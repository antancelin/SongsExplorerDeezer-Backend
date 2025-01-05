// packages
import { buildSchema } from "graphql"; // import de la fonction pour la construction du schéma GraphQL

// définition du shcéma GraphQL avec les types et les requêtes disponibles
const schema = buildSchema(`

  # type représentant un artiste
  type Artist {
    id: ID!
    name: String!
    picture: String
    biography: String
  }

  # type représentant un album
  type Album {
    id: ID!
    title: String!
    coverSmall: String
    coverBig: String
  }

  # type représentant une chanson
  type Track {
    id: ID!
    title: String!
    duration: Int
    explicit: Boolean!
    artist: Artist!
    album: Album
  }

  # type pour les résultats de recherche (avec pagination)
  type SearchResult {
    data: [Track!]!
    total: Int!
    prev: String
    next: String
  }

  # type pour les requêtes disponibles
  type Query {

    # requête de bienvenue
    welcome: String

    # requête pour rechercher des chansons
    searchTracks(query: String!, limit: Int, index: Int): SearchResult!

    # requête pour obtenir les détails d'une chanson
    getTrackDetails(trackId: ID!): Track
  }
`);

export default schema; // export du schéma pour utilisation dans le serveur
