import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export const searchYouTube = async (query) => {
  const response = await axios.get(
    "https://www.googleapis.com/youtube/v3/search",
    {
      params: {
        part: "snippet",
        maxResults: 12,
        q: query,
        key: API_KEY,
        type: "video",
      },
    }
  );

  return response.data.items;
};
