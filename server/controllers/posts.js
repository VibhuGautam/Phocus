import express from 'express';
import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

const router = express.Router();

export const getPosts = async (req, res) => {
    const { page } = req.query;
    
    try {
        const LIMIT = 8;  // No of posts per page 
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await PostMessage.countDocuments({});
        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        res.json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
} 

export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, "i"); // test TEST Test all  will be the same

        const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});

        res.json({ data: posts });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const getPostsByCreator = async (req, res) => {
    const { name } = req.query;

    try {
        const posts = await PostMessage.find({ name });

        res.json({ data: posts });
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const getPost = async (req, res) => { 
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);
        
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req , res) => {
    const post = req.body;

    const newPost = new PostMessage({ ...post , creator: req.userId , createdAt: new Date().toISOString() });
    

    // res.send('Post Creation');
    try {
        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({message: error.message});
    }
}



export const updatePost = async (req , res) => {
    const { id: _id } = req.params;
    const post = req.body;  // sent it by frontEnd

    if(!mongoose.Types.ObjectId.isValid(_id))
        return res.status(404).send('No post with that id');    
        
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, {...post , _id} , {new: true});

    res.json(updatedPost);
}


export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) 
        return res.status(404).send(`No post with id: ${id}`);

    await PostMessage.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully." });
}

export const likePost = async (req, res) => {
    const { id } = req.params;

    if( !req.userId )
        return res.json({message: 'Unauthenticated'});

    if (!mongoose.Types.ObjectId.isValid(id)) 
        return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if(index === -1)
    {
        // Like the Post
        post.likes.push(req.userId);
    }
    else 
    {
        post.likes = post.likes.filter((id) => id  !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post , { new: true });
    
    res.json(updatedPost);
}

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    const post = await PostMessage.findById(id);

    post.comments.push(value);

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
};


export default router;