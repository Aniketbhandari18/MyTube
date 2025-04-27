import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const handleSubscription = async (req, res) =>{
  try {
    const userId = req.user._id;
    const { channelId } = req.params;

    // Check if the channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }


    // Prevent subscribing own channel
    if (channelId.toString() === userId.toString()){
      throw new ApiError(400, "Cannot susbscribe to your own channel");
    }
    
    // Check if user has already subscribed
    const existingSubscription = await Subscription.findOne({ subscriber: userId, channel: channelId });
  
    if (existingSubscription){
      // Unsubscribe
      await existingSubscription.deleteOne();
  
      return res.status(200).json({
        message: "Unsubscribed successfully"
      })
    }
    else{
      // Subscribe
      const newSubscription = await Subscription.create({
        subscriber: userId,
        channel: channelId
      })
  
      return res.status(201).json({
        message: "Subscribed successfully",
        Subscription: newSubscription
      })
    }
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

const getSubscribedChannels = async (req, res) =>{
  try {
    const userId = req.user._id;

    const subscribedChannels = await Subscription.aggregate([
      {
        $match: {
          subscriber: userId
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      // get channel details (_id, username, avatar)
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channel",
          pipeline: [
            {
              $project: {
                "_id": 1,
                "username": 1,
                "avatar": 1,
                "description": 1,
              }
            },
          ]
        },
      },
      {
        $unwind: "$channel"
      },
      // get subscriptions for that channel _id
      {
        $lookup: {
          from: "subscriptions",
          localField: "channel._id",
          foreignField: "channel",
          as: "channel.subscriptions"
        }
      },
      // count subscribers
      {
        $addFields: {
          "channel.subscriberCount": { $size: "$channel.subscriptions" }
        }
      },
      {
        $project: {
          "_id": 0,
          "channel._id": 1,
          "channel.username": 1,
          "channel.avatar": 1,
          "channel.description": 1,
          "channel.subscriberCount": 1
        }
      },
      {
        $replaceRoot: {
          newRoot: "$channel" // Replace the root with the "channel" object, flattening the structure
        }
      }
    ]);
  
    return res.status(200).json({
      message: "Subscribed channels fetched successfully",
      totalSubscribedChannels: subscribedChannels.length,
      subscribedChannels: subscribedChannels
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error fetching subscribed channels"
    });
  }
};

// Helper functions
const countSubscribers = (channelId) =>{
  return Subscription.countDocuments({ channel: channelId });
}

const isSubscribed = (channelId, userId) =>{
  return Subscription.exists({ subscriber: userId, channel: channelId });
}

export { handleSubscription, getSubscribedChannels, countSubscribers, isSubscribed };