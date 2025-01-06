// packages import
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import axios from "axios";

// axios mock configuration
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// resolvers import
import root from "../src/resolvers";

describe("GraphQL Resolvers", () => {
  // resetting mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test for welcome message
  describe("welcome", () => {
    it("should return the welcome message", () => {
      const result = root.welcome();
      expect(result).toBe("Welcome to Songs Explorer w/ Deezer 🎧");
    });
  });

  // test for biography retrieval via Discogs
  describe("getArtistBiography", () => {
    it("should return 'null' when no artist is found", async () => {
      // mock of Discogs search with no results
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [], // no results
        },
      });

      const result = await root.getArtistBiography("non-existent_artist");
      expect(result).toBeNull();
    });

    it("should handle Discogs API errors", async () => {
      // simulate an API error
      mockedAxios.get.mockRejectedValueOnce(new Error("Discogs API Error"));

      const result = await root.getArtistBiography("artist_with_error");
      expect(result).toBeNull();
    });

    it("should properly clean up a bio with different formats", async () => {
      // artist search mockup
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [{ id: 123 }],
        },
      });

      // mock artist details with a complex biography
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          profile:
            "This artist [a=Name1] is known\r\n\r\nfor [l=Label1] his music.\r\nHe  does   incredible   things",
        },
      });

      const result = await root.getArtistBiography("artist");

      // the biography should be cleaned of any special elements
      expect(result).toBe(
        "This artist is known for his music. He does incredible things"
      );
    });

    it("should return null when artist is found but has no bio", async () => {
      // artist search mockup - artist is found
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [{ id: 123 }],
        },
      });

      // mock artist details - no bio (profile is undefined)
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          // no 'profile' field
        },
      });

      const result = await root.getArtistBiography("artist");
      expect(result).toBeNull();
    });
  });

  // test for song search
  describe("searchTracks", () => {
    it("should return a list of songs", async () => {
      // preparation of mocked data
      const mockData = {
        data: {
          data: [
            {
              id: 1,
              title: "Formidable",
              duration: 200,
              artist: {
                id: 1,
                name: "Stromae",
              },
              album: {
                id: 1,
                title: "Racine Carrée",
              },
            },
          ],
          total: 1,
        },
      };

      // mock configuration
      mockedAxios.get.mockResolvedValueOnce(mockData);

      // execution of the tested function
      const result = await root.searchTracks({ query: "formidable" });

      // assertions
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("Formidable");
      expect(result.data[0].artist.name).toBe("Stromae");
    });

    it("should handle search errors", async () => {
      // simulation of an error
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      // checking error handling
      await expect(root.searchTracks({ query: "invalid" })).rejects.toThrow(
        "Unable to search tracks"
      );
    });
  });

  // test for song details
  describe("getTrackDetails", () => {
    it("should return full details with biography", async () => {
      // mock API responses
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 1,
          title: "Formidable",
          artist: {
            id: 1,
            name: "Stromae",
            picture_medium: "url_picture",
          },
          album: {
            id: 1,
            title: "Racine Carrée",
            cover_medium: "url_cover",
          },
        },
      });

      // mock Discogs search
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [
            {
              id: 123,
            },
          ],
        },
      });

      // mock Discogs artist details
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          profile: "Artist biography",
        },
      });

      const result = await root.getTrackDetails({ trackId: "1" });

      // checks
      expect(result.title).toBe("Formidable");
      expect(result.artist.biography).toBe("Artist biography");
      expect(result.album.title).toBe("Racine Carrée");
    });

    it("should handle Deezer API errors", async () => {
      // simulating a Deezer API error
      mockedAxios.get.mockRejectedValueOnce(new Error("Deezer API Error"));

      await expect(
        root.getTrackDetails({ trackId: "invalid_id" })
      ).rejects.toThrow("Unable to fetch track details");
    });

    it("should handle the case where the biography is not found", async () => {
      // mock the Deezer response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: 1,
          title: "Track Title",
          release_date: "2023-01-01",
          artist: {
            id: 1,
            name: "Artist Name",
            picture_medium: "url_picture",
          },
          album: {
            id: 1,
            title: "Album Title",
            cover_medium: "url_cover",
            release_date: "2023-01-01",
          },
        },
      });

      // mock a Discogs search with no results
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [], // no results for biography
        },
      });

      const result = await root.getTrackDetails({ trackId: "1" });
      expect(result.artist.biography).toBeNull();
    });
  });
});
