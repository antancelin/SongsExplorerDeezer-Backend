// packages import
import axios from "axios"; // Axios import for HTTP requests

const root = {
  welcome: () => "Welcome to Songs Explorer w/ Deezer 🎧",

  // utility function to find an artist and their biography on Discogs
  async getArtistBiography(artistName: string) {
    try {
      // search for the artist on Discogs
      const searchResponse = await axios.get(
        `https://api.discogs.com/database/search?type=artist&q=${encodeURIComponent(
          artistName
        )}`, // Discogs API url to retrieve artist data
        {
          headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`, // Discogs API access token
          },
        }
      );

      // take the first (most relevant) result
      const firstResult = searchResponse.data.results[0];
      if (!firstResult) {
        return null;
      }

      // retrieve the artist's full details via their 'id'
      const artistResponse = await axios.get(
        `https://api.discogs.com/artists/${firstResult.id}`,
        {
          headers: {
            Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}`, // Discogs API access token
          },
        }
      );

      // clean biography
      const cleanBiography = (bio: string) => {
        // remove references [aXXXXXX]
        return (
          bio
            // remove references with text between [a=...] or [l=...]
            .replace(/\[(a|l)=[^\]]+\]/g, "")
            // replaces multiple newlines with a single line break
            .replace(/\r\n\r\n/g, "\n")
            // replaces single newlines with spaces
            .replace(/\r\n/g, " ")
            // replace multiple spaces with one
            .replace(/\s+/g, " ")
            .trim()
        );
      };

      return artistResponse.data.profile // key containing the artist's biography
        ? cleanBiography(artistResponse.data.profile) // return cleaned artist biography
        : null;
    } catch (error) {
      console.error("Error finding artist on Discogs :", error);
      return null;
    }
  },

  // simple song search
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
      // search for songs via Deezer API
      const deezerResponse = await axios.get(
        `https://api.deezer.com/search/track?q=${encodeURIComponent(
          query
        )}&limit=${limit}&index=${index}`
      );

      // returns an object structured according to the GraphQL schema
      return {
        data: deezerResponse.data.data.map((track: any) => ({
          // song information
          id: track.id,
          title: track.title,
          duration: track.duration,
          explicit: track.explicit_lyrics,
          // artist information
          artist: {
            id: track.artist.id,
            name: track.artist.name,
            picture: track.artist.picture_medium,
          },
          // album information
          album: {
            id: track.album.id,
            title: track.album.title,
            coverSmall: track.album.cover_small,
            coverBig: track.album.cover_big,
          },
        })),
        // total number of results found
        total: deezerResponse.data.total,
        prev: deezerResponse.data.prev,
        next: deezerResponse.data.next,
      };
    } catch (error) {
      console.error("Error searching tracks:", error);
      throw new Error("Unable to search tracks");
    }
  },

  // detailed recovery of a specific song
  getTrackDetails: async ({ trackId }: { trackId: string }) => {
    try {
      // retrieve song details from Deezer API via its 'id'
      const trackResponse = await axios.get(
        `https://api.deezer.com/track/${trackId}`
      );

      const track = trackResponse.data;

      // retrieve the artist biography from the Discogs API via the utility function created upstream
      const biography = await root.getArtistBiography(track.artist.name);

      // returns a structured and complete object according to the GraphQL schema
      return {
        // song information
        id: track.id,
        title: track.title,
        duration: track.duration,
        explicit: track.explicit_lyrics,
        // artist information
        artist: {
          id: track.artist.id,
          name: track.artist.name,
          picture: track.artist.picture_medium,
          biography: biography,
        },
        // album information
        album: {
          id: track.album.id,
          title: track.album.title,
          coverSmall: track.album.cover_small,
          coverBig: track.album.cover_big,
        },
      };
    } catch (error) {
      console.error("Error fetching track details:", error);
      throw new Error("Unable to fetch track details");
    }
  },
};

export default root;
