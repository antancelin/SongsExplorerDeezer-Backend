// packages
import axios from "axios"; // import d'Axios pour les requêtes HTTP
import { response } from "express";

const root = {
  welcome: () => "Welcome to Songs Explorer w/ Deezer 🎧", // résolveur simple pour le message de bienvenue

  // fonction utilitaire pour trouver un artiste et sa biographie sur Discogs
  async getArtistBiography(artistName: string) {
    try {
      // console.log("Searching for artist: ", artistName);

      // 1. recherche de l'artiste sur Discogs
      const searchResponse = await axios.get(
        `https://api.discogs.com/database/search?type=artist&q=${encodeURIComponent(
          artistName
        )}`, // url de l'API Discogs pour récuérer les données de l'artiste
        {
          headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`, // token d'accès pour authentifier la requête auprès de l'API Discogs
          },
        }
      );

      // console.log("Discogs search response: ", searchResponse.data);

      // 2. prendre le premier résultat (le plus pertinent)
      const firstResult = searchResponse.data.results[0];
      if (!firstResult) {
        // console.log("No results found for artist");
        return null;
      }

      // console.log("Found artist ID: ", firstResult.id);

      // 3. récupérer les détail complets de l'artiste
      const artistResponse = await axios.get(
        `https://api.discogs.com/artists/${firstResult.id}`,
        {
          headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`, // token d'accès pour authentifier la requête auprès de l'API Discogs
          },
        }
      );

      // console.log("Artist profile: ", artistResponse.data.profile);

      return artistResponse.data.profile; // retourne la biographie de l'artiste
    } catch (error) {
      console.error("Error finding artist on Discogs :", error); // affiche une erreur dans la console en cas de problème
      return null;
    }
  },

  // recherche simple de chansons
  searchTracks: async ({
    query,
    limit = 50,
    index = 0,
  }: {
    query: string;
    limit?: number;
    index?: number;
  }) => {
    try {
      // 1. Recherche des chansons via l'api Deezer
      const deezerResponse = await axios.get(
        `https://api.deezer.com/search/track?q=${encodeURIComponent(
          query
        )}&limit=${limit}&index=${index}`
      );

      return {
        data: deezerResponse.data.data.map((track: any) => ({
          id: track.id,
          title: track.title,
          duration: track.duration,
          artist: {
            id: track.artist.id,
            name: track.artist.name,
            picture: track.artist.picture_medium,
          },
          album: {
            id: track.album.id,
            title: track.album.title,
            cover: track.album.cover_medium,
          },
        })),
        total: deezerResponse.data.total,
        prev: deezerResponse.data.prev,
        next: deezerResponse.data.next,
      };
    } catch (error) {
      console.error("Error searching tracks:", error);
      throw new Error("Unable to search tracks");
    }
  },

  // récupération détaillée d'une chanson spécifique
  getTrackDetails: async ({ trackId }: { trackId: string }) => {
    try {
      // 1. récupérer les détails de la chanson depuis Deezer
      const trackResponse = await axios.get(
        `https://api.deezer.com/track/${trackId}`
      );

      const track = trackResponse.data;

      // 2. récupérer la biographie de l'artiste depuis Discogs
      const biography = await root.getArtistBiography(track.artist.name);

      // 3. construire et retourner la réponse complète
      return {
        id: track.id,
        title: track.title,
        duration: track.duration,
        releaseDate: track.release_date,
        artist: {
          id: track.artist.id,
          name: track.artist.name,
          picture: track.artist.picture_medium,
          biography: biography,
        },
        album: {
          id: track.album.id,
          title: track.album.title,
          cover: track.album.cover_medium,
          releaseDate: track.album.release_date,
        },
      };
    } catch (error) {
      console.error("Error fetching track details:", error);
      throw new Error("Unable to fetch track details");
    }
  },
};

export default root; // export des résolveurs pour utilisation dans le serveur
