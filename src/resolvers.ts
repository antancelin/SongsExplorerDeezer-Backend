// packages
import axios from "axios"; // import d'Axios pour les requêtes HTTP

const root = {
  welcome: () => "Welcome to Songs Explorer w/ Deezer 🎧", // résolveur simple pour le message de bienvenue

  getArtistBiography: async ({ artistId }: { artistId: number }) => {
    try {
      const response = await axios.get(
        `https://api.discogs.com/artists/${artistId}`, // url de l'API Discogs pour récuérer les données de l'artiste
        {
          headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`, // token d'accès pour authentifier la requête auprès de l'API Discogs
          },
        }
      );

      const artistData = response.data; // récupération des données de l'artiste depuis la réponse de l'API

      return {
        id: artistData.id, // retourne l'ID de l'artiste
        name: artistData.name, // retourne le nom de l'artiste
        biography: artistData.profile, // retourne la biographie de l'artiste
      };
    } catch (error) {
      console.error("Error retrieving artist data :", error); // affiche une erreur dans la console en cas de problème
      throw new Error("Unable to retrieve artist information"); // lance une erreur si la récupération échoue
    }
  },

  searchTracks: async ({
    query,
    limit = 25,
  }: {
    query: string;
    limit?: number;
  }) => {
    try {
      // 1. Recherche des chansons via l'api Deezer
      const deezerResponse = await axios.get(
        `https://api.deezer.com/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=${limit}`
      );

      // 2. Pour chaque piste, enrichir les données de l'artiste avec sa biographie

      const enrichedTracks = await Promise.all(
        deezerResponse.data.data.map(async (track: any) => {
          try {
            const artistBio = await root.getArtistBiography({
              artistId: track.artist.id,
            });
            return {
              ...track,
              artist: {
                ...track.artist,
                biography: artistBio?.biography || null,
              },
            };
          } catch (error) {
            console.error(
              `Error fetching bio for artist ${track.artist.id}:`,
              error
            );
            return track;
          }
        })
      );

      return {
        date: enrichedTracks,
        total: deezerResponse.data.total,
        prev: deezerResponse.data.prev,
        next: deezerResponse.data.next,
      };
    } catch (error) {
      console.error("Error searching tracks:", error);
      throw new Error("Unable to search tracks");
    }
  },
};

export default root; // export des résolveurs pour utilisation dans le serveur
