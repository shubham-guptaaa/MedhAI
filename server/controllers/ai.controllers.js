import OpenAI from "openai";
import sql from "../db/db.index.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { upload } from "../utils/multer.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

//Generete Article

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan != "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql` 
    INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error to generate Article" });
  }
};

// Generate Blog title

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan != "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql` 
    INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error to generate Blog-Title" });
  }
};

// Genereate Image

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium user",
      });
    }

    //To generate the image we use Clipdrop API

    const formData = new FormData();
    formData.append("prompt", prompt);

    const response = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: { "x-api-key": process.env.CLIPDROP_API_KEY,},
        responseType: "arraybuffer",
      }
    );

    // Convert to base64
    const base64Image = `data:image/png;base64,${Buffer.from(
      response.data,
      "binary"
    ).toString("base64")}`;

    // Upload to Cloudinary
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql` 
    INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${
      publish ?? false
    })
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error to generate Image" });
  }
};

// Remove Background

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium user",
      });
    }

    // Upload to Cloudinary
    const { secure_url } = await cloudinary.uploader.upload(image.path,{
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background'
        }
      ]
    });

    await sql` 
    INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image'
    )
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error to generate Image" });
  }
};

//Remove image object

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;
    const { object } = req.body;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium user",
      });
    }

    // Upload to Cloudinary
    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl =  cloudinary.url(public_id,{
      transformation: [{effect: `gen_remove:${object}`}],
      resource_type: 'image'
    })

    await sql` 
    INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image'
    )
    `;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error to generate Image" });
  }
};

//Review Resume

export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume  = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium user",
      });
    }

    if(resume.size>5*1024*1024){
      return res.json({success: false, message: "Resume file size exceeds allowed size (5MB)."})
    }

    const dataBuffer = fs.readFileSync(resume.path)

    const pdfData = await pdf(dataBuffer)

    const prompt = `Review the following resume and provide constructive feedbackon its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content
    

    await sql` 
    INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review'
    )
    `;

    res.json({ success: true, content});
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Error to generate Image" });
  }
};
