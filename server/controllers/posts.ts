import { Request, Response } from "express";

import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
/**
 * It creates a new post, saves it to the database, and then returns all posts
 * @param {Request} req - Request - this is the request object that contains the data sent from the
 * client.
 * @param {Response} res - Response - this is the response object that we will send back to the client.
 */
export async function createPost(req: Request, res: Response) {
  try {
    const { userId, description, picturePath } = req.body;

    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });

    await newPost.save();

    const posts = await Post.find();

    res.status(201).json(posts);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
}

/* READ */
/**
 * It fetches all the posts from the database and sends them back to the client
 * @param {Request} req - Request - This is the request object that contains the data sent from the
 * client.
 * @param {Response} res - Response - This is the response object that we will use to send back a
 * response to the client.
 */
export async function getFeedPosts(req: Request, res: Response) {
  try {
    const posts = await Post.find();

    res.status(201).json(posts);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

/**
 * It finds all posts from a specific user
 * @param {Request} req - Request - this is the request object that contains the request information.
 * @param {Response} res - Response - This is the response object that we will use to send back a
 * response to the client.
 */
export async function getUserPosts(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ userId });

    res.status(201).json(posts);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

/* UPDATE */
/**
 * It finds a post by id, checks if the user has already liked the post, and if not, likes the post
 * @param {Request} req - Request - this is the request object that contains the request data
 * @param {Response} res - Response - this is the response object that we will send back to the client.
 */
export async function likePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(201).json(updatedPost);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
