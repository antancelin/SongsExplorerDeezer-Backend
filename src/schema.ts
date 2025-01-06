// packages import
import { buildSchema } from "graphql";

// defining GraphQL schema with available types and queries
const schema = buildSchema(`

  # type representing an artist
  type Artist {
    id: ID!
    name: String!
    picture: String
    biography: String
  }

  # type representing an album
  type Album {
    id: ID!
    title: String!
    coverSmall: String
    coverBig: String
  }

  # type representing a song
  type Track {
    id: ID!
    title: String!
    duration: Int
    explicit: Boolean!
    artist: Artist!
    album: Album
  }

  # type for search results (with pagination)
  type SearchResult {
    data: [Track!]!
    total: Int!
    prev: String
    next: String
  }

  # type for available queries
  type Query {

    # welcome request
    welcome: String

    # query to search songs
    searchTracks(query: String!, limit: Int, index: Int): SearchResult!

    # query to get song details
    getTrackDetails(trackId: ID!): Track
  }
`);

export default schema;
