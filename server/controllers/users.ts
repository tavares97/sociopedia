import { Request, Response } from "express";
import User from "../models/User.js";

/* READ */
/**
 * It takes in a request and a response object, and then it tries to find a user by id, and if it finds
 * one, it sends it back in the response
 * @param {Request} req - Request - This is the request object that contains all the information about
 * the request.
 * @param {Response} res - Response - This is the response object that we will use to send back a
 * response to the client.
 */
export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * It finds a user by id, then finds all of that user's friends by id, and then returns the friends'
 * information
 * @param {Request} req - Request - this is the request object that is passed to the route handler. It
 * contains information about the request, such as the request body, query parameters, and the request
 * headers.
 * @param {Response} res - Response - this is the response object that we will use to send back a
 * response to the client.
 */
export async function getUserFriends(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id: string) => User.findById(id))
    );

    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/* UPDATE */
/**
 * It adds or removes a friend from a user's friends list
 * @param {Request} req - Request - this is the request object that is passed in from the client.
 * @param {Response} res - Response - this is the response object that we will send back to the client.
 */
export async function addRemoveFriend(req: Request, res: Response) {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();

    res.status(200).json({ msg: "added/removed friend" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
