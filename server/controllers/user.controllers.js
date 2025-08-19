import sql from "../db/db.index.js"


export const getUserCreations = async (req,res)=>{
    try {
        const { userId } = req.auth()

        const creations = await sql`
        SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC
        `;

        res.json({success:true, creations})



    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

export const getPublishedCreations = async (req,res)=>{
    try {

        const creations = await sql`
        SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC
        `;

        res.json({success:true, creations})
        
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}


export const toggleLikeCreation = async (req,res)=>{
    try {
        const {userId} = req.auth()
        const {id} = req.body

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`

        if(!creation){
            return res.json({success:false, message:"Creations not found!"})
        }

        const currentLikes = creation.likes;
        const userIdstr = userId.toString();
        let updateLikes
        let message

        if(currentLikes.includes(userIdstr)){
            updateLikes = currentLikes.filter((user)=> user!== userIdstr);
            message = 'Creation Unliked'
        }
        else{
           updateLikes = [...currentLikes,userIdstr]
           message = 'Creation Liked' 
        }

        const formattedArray = `{${updateLikes.join(',')}}`



        await sql`
        UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}
        `;

        res.json({success:true, message})
        
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}