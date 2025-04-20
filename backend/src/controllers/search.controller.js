import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

const getSearchSuggestions = async (req, res) =>{
  try {
    const searchQuery = req.query.search_query?.trim();
  
    if (!searchQuery) {
      throw new ApiError(400, "Search query is required");
    }
  
    const videoSuggestions = await Video.aggregate([
      {
        $search: {
          "index": "default",
          "autocomplete": {
            "query": searchQuery,
            "path": "title",
            ...(searchQuery.length > 3 && {
              "fuzzy": {
                "maxEdits": 1,
              },
            })
          }
        }
      },
      {
        $project: {
          "_id": 1,
          "title": 1,
          "score": { "$meta": "searchScore" },
          "type": "video"
        }
      },
      {
        $sort: { "score": -1 }
      },
      {
        $limit: 6
      }
    ]);

    const usernameSuggestions = await User.aggregate([
      {
        $search: {
          "index": "autocomplete",
          "autocomplete": {
            "query": searchQuery,
            "path": "username",
            ...(searchQuery.length > 3 && {
              "fuzzy": {
                "maxEdits": 1,
              },
            })
          }
        }
      },
      {
        $project: {
          "_id": 1,
          "username": 1,
          "avatar": 1,
          "score": { "$meta": "searchScore" },
          "type": "user"
        }
      },
      {
        $sort: { "score": -1 }
      },
      {
        $limit: 5
      }
    ]);

    const combinedSuggestions = [...usernameSuggestions, ...videoSuggestions];
  
    return res.status(200).json({
      message: "successfull",
      suggestions: combinedSuggestions,
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
}

export { getSearchSuggestions };