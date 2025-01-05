// packages
import axios from "axios"; // import d'Axios pour les requêtes HTTP

const root = {
  welcome: () => "Welcome to Songs Explorer w/ Deezer 🎧", // requête simple pour le message de bienvenue

  // fonction utilitaire pour trouver un artiste et sa biographie sur Discogs
  async getArtistBiography(artistName: string) {
    try {
      // recherche de l'artiste sur Discogs
      const searchResponse = await axios.get(
        `https://api.discogs.com/database/search?type=artist&q=${encodeURIComponent(
          artistName
        )}`, // url de l'API Discogs pour récuérer les données de l'artiste
        {
          headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`, // token d'accès à l'API Discogs
          },
        }
      );

      // prendre le premier résultat (le plus pertinent)
      const firstResult = searchResponse.data.results[0];
      if (!firstResult) {
        return null;
      }

      // récupérer les détail complets de l'artiste via son 'id'
      const artistResponse = await axios.get(
        `https://api.discogs.com/artists/${firstResult.id}`,
        {
          headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`, // token d'accès à l'API Discogs
          },
        }
      );

      // nettoyer la biographie
      const cleanBiography = (bio: string) => {
        // supprime les références [aXXXXXX]
        return (
          bio
            // supprime les références avec du texte entre [a=...] ou [l=...]
            .replace(/\[(a|l)=[^\]]+\]/g, "")
            // remplace les retours à la ligne multiples par un saut de ligne simple
            .replace(/\r\n\r\n/g, "\n")
            // remplace les retours à la ligne simples par des espaces
            .replace(/\r\n/g, " ")
            // remplace les espaces multiples par un seul
            .replace(/\s+/g, " ")
            .trim()
        );
      };

      return artistResponse.data.profile // clé contenant la biographie de l'artiste
        ? cleanBiography(artistResponse.data.profile)
        : null; // retourne la biographie de l'artiste
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
      // recherche des chansons via l'api Deezer
      const deezerResponse = await axios.get(
        `https://api.deezer.com/search/track?q=${encodeURIComponent(
          query
        )}&limit=${limit}&index=${index}`
      );

      // retourne un objet structuré selon le schema GraphQL
      return {
        data: deezerResponse.data.data.map((track: any) => ({
          // informations sur la chanson
          id: track.id,
          title: track.title,
          duration: track.duration,
          explicit: track.explicit_lyrics,
          // informations sur l'artiste
          artist: {
            id: track.artist.id,
            name: track.artist.name,
            picture: track.artist.picture_medium,
          },
          // informations sur l'album
          album: {
            id: track.album.id,
            title: track.album.title,
            coverSmall: track.album.cover_small,
            coverBig: track.album.cover_big,
          },
        })),
        // nombre total de résultats trouvés
        total: deezerResponse.data.total,
        prev: deezerResponse.data.prev,
        next: deezerResponse.data.next,
      };
    } catch (error) {
      // affichage de l'erreur dans la console en cas de problème
      console.error("Error searching tracks:", error);
      throw new Error("Unable to search tracks");
    }
  },

  // récupération détaillée d'une chanson spécifique
  getTrackDetails: async ({ trackId }: { trackId: string }) => {
    try {
      // récupérer les détails de la chanson depuis l'API Deezer via son 'id'
      const trackResponse = await axios.get(
        `https://api.deezer.com/track/${trackId}`
      );

      const track = trackResponse.data;

      // récupérer la biographie de l'artiste depuis l'API Discogs via la fonction utilitaire créée en amont
      const biography = await root.getArtistBiography(track.artist.name);

      // retourne un objet structuré et complet selon le schema GraphQL
      return {
        // informations de la chanson
        id: track.id,
        title: track.title,
        duration: track.duration,
        explicit: track.explicit_lyrics,
        // informations sur l'artiste
        artist: {
          id: track.artist.id,
          name: track.artist.name,
          picture: track.artist.picture_medium,
          biography: biography,
        },
        // informations sur l'album
        album: {
          id: track.album.id,
          title: track.album.title,
          coverSmall: track.album.cover_small,
          coverBig: track.album.cover_big,
        },
      };
    } catch (error) {
      // affichage de l'erreur dans la console en cas de problème
      console.error("Error fetching track details:", error);
      throw new Error("Unable to fetch track details");
    }
  },
};

export default root; // export des résolveurs pour utilisation dans le serveur
