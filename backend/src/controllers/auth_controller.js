import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

export const signup = async (req,res) => {
const {fullName, email, password} = req.body;

try{
    //validate if user has filled all fields
    if(!fullName || !email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    if(password.length < 6){
        return res.status(400).json({message:"password must be atleast 6 characters"});
    }

    // check if valid email: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
    return res.status(400).json({message: "invalid email format"});
    }
  
    const user = await User.findOne({email});
    if(user){
        return res.status(400).json({message:"Email already exists"})
    }

    // password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = new User({
        fullName,
        email,
        password:hashedPassword
    });

    if(newUser){
        // persist user then generate taken
        const savedUser = await newUser.save();
        generateToken(newUser._id,res);
    
        res.status(201).json({
            _id: savedUser._id,
            fullName: savedUser.fullName,
            email: savedUser.email,
            profilePic: savedUser.profilePic,
        });

        // send welcome email to user
    }
} catch(error){
    console.error("Error in signup controller", error.message);
    res.status(500).json({message: "Internal server error"});
}

};
