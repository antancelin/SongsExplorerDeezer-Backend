// packages import
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import axios from "axios";

// configuration du mock d'axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// resolvers import
import root from "../src/resolvers";

describe("GraphQL Resolvers", () => {
  // réinitialisation des mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test pour le message de bienvenue
  describe("welcome", () => {
    it("devrait retourner le message de bienvenue", () => {
      const result = root.welcome();
      expect(result).toBe("Welcome to Songs Explorer w/ Deezer 🎧");
    });
  });

  // test pour la récupération de la biographie via Discogs
  describe("getArtistBiography", () => {
    it("devrait retourner null quand aucun artiste n'est trouvé", async () => {
      // mock de la recherche Discogs sans résultats
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [], // Aucun résultat
        },
      });

      const result = await root.getArtistBiography("artiste_inexistant");
      expect(result).toBeNull();
    });

    it("devrait gérer les erreurs de l'API Discogs", async () => {
      // simulation d'une erreur de l'API
      mockedAxios.get.mockRejectedValueOnce(new Error("Discogs API Error"));

      const result = await root.getArtistBiography("artiste_avec_erreur");
      expect(result).toBeNull();
    });

    it("devrait nettoyer correctement une biographie avec différents formats", async () => {
      // Mock de la recherche d'artiste
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [{ id: 123 }],
        },
      });

      // Mock des détails de l'artiste avec une biographie complexe
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          profile:
            "Cet artiste [a=Nom1] est connu\r\n\r\npour [l=Label1] sa musique.\r\nIl fait   des  choses   incroyables  ",
        },
      });

      const result = await root.getArtistBiography("Artiste");

      // La biographie devrait être nettoyée de tous les éléments spéciaux
      expect(result).toBe(
        "Cet artiste est connu pour sa musique. Il fait des choses incroyables"
      );
    });

    it("devrait retourner null quand l'artiste est trouvé mais n'a pas de biographie", async () => {
      // Mock de la recherche d'artiste - l'artiste est trouvé
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [{ id: 123 }],
        },
      });

      // Mock des détails de l'artiste - pas de biographie (profile est undefined)
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          // pas de champ 'profile'
        },
      });

      const result = await root.getArtistBiography("Artiste");
      expect(result).toBeNull();
    });
  });

  // test pour la recherche de chansons
  describe("searchTracks", () => {
    it("devrait retourner une liste de chansons", async () => {
      // préparation des données mockées
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

      // configuration du mock
      mockedAxios.get.mockResolvedValueOnce(mockData);

      // exécution de la fonction testée
      const result = await root.searchTracks({ query: "formidable" });

      // assertions
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("Formidable");
      expect(result.data[0].artist.name).toBe("Stromae");
    });

    it("devrait gérer les erreurs de recherche", async () => {
      // simulation d'une erreur
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      // vérification de la gestion d'erreur
      await expect(root.searchTracks({ query: "invalid" })).rejects.toThrow(
        "Unable to search tracks"
      );
    });
  });

  // test pour les détails d'une chanson
  describe("getTrackDetails", () => {
    it("devrait retourner les détails complets avec biographie", async () => {
      // mock des réponses des APIs
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
          profile: "Biographie de l'artiste",
        },
      });

      const result = await root.getTrackDetails({ trackId: "1" });

      // vérifications
      expect(result.title).toBe("Formidable");
      expect(result.artist.biography).toBe("Biographie de l'artiste");
      expect(result.album.title).toBe("Racine Carrée");
    });

    it("devrait gérer les erreurs de l'API Deezer", async () => {
      // Simulation d'une erreur de l'API Deezer
      mockedAxios.get.mockRejectedValueOnce(new Error("Deezer API Error"));

      await expect(
        root.getTrackDetails({ trackId: "invalid_id" })
      ).rejects.toThrow("Unable to fetch track details");
    });

    it("devrait gérer le cas où la biographie n'est pas trouvée", async () => {
      // Mock de la réponse Deezer
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

      // Mock d'une recherche Discogs sans résultats
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [], // Aucun résultat pour la biographie
        },
      });

      const result = await root.getTrackDetails({ trackId: "1" });
      expect(result.artist.biography).toBeNull();
    });
  });
});
