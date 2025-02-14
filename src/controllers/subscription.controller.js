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


// Helper functions
const countSubscribers = (channelId) =>{
  return Subscription.countDocuments({ channel: channelId });
}

const isSubscribed = (channelId, userId) =>{
  return Subscription.exists({ subscriber: userId, channel: channelId });
}

export { handleSubscription };