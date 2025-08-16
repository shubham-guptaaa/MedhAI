import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/ai.routes.js'
import {connectCloudinary} from './utils/cloudinary.js'

dotenv.config()

const app = express()

// connect cloudinary
connectCloudinary()

app.use(clerkMiddleware())

app.use(cors())
app.use(express.json())

app.get('/', (req,res)=>res.send("Server is Live!"))

app.use(requireAuth())

//Route Logic
app.use('/api/ai', aiRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
