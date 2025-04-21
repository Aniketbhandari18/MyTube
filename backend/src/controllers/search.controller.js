import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

const getSearchResults = async (req, res) =>{
  try {
    const searchQuery = req.query.search_query?.trim();
    const userId = req.user?._id;
  
    const page = parseInt(req.query.page, 10) || 0;
    const videosPerPage = 30;
  
    const videoResults = await Video.aggregate([
      {
        $search: {
          index: "default",
          text: {
            query: searchQuery,
            path: ["title", "description"],
            fuzzy: { maxEdits: 2 }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "channel",
        }
      },
      {
        $unwind: "$channel"
      },
      {
        $project: {
          "_id": 1,
          "title": 1,
          "description": 1,
          "thumbnail": 1,
          "duration": 1,
          "views": 1,
          "channel._id": 1,
          "channel.username": 1,
          "channel.avatar": 1,
          "createdAt": 1,
          "score": { $meta: "searchScore" },
        }
      },
      {
        $sort: { "score": -1 }
      },
      {
        $skip: page * videosPerPage
      },
      {
        $limit: videosPerPage + 1
      }
    ]);

    const channelResults = await User.aggregate([
      {
        $match: {
          $text: {$search: searchQuery}
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          avatar: 1,
          subscribers: 1,
          createdAt: 1,
          score: { $meta: "textScore" },
        },
      },
      {
        $sort: { "score": -1 }
      },
      {
        $limit: 2
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        }
      },
      {
        $addFields: {
          isSubscribed: {
            $cond: {
              if: {$in: [userId, "$subscribers.subscriber"]},
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: {
          subscribers: 0
        }
      }
    ]);

    const hasMore = videoResults.length > videosPerPage;
    if (hasMore) videoResults.pop();
  
    return res.status(200).json({
      message: "Videos fetched successfully",
      channelResults,
      videoResults,
      hasMore
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

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

export { getSearchResults, getSearchSuggestions };