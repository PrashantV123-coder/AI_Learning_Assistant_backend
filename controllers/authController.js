const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({id : userId}, process.env.JWT_SECRET, {expiresIn: "7d"});
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @acess   Public
const registerUser = async(req, res) => {
    try{
        if (!req.file) {
            return res.status(400).json({ message: "image is required" });
        }   

        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }


        //Check if user already exists
        const userExists = await User.findOne({ email });
        if(userExists){
            return res.status(400).json({message: "user already exists"});
        }

        //Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const result = await uploadToCloudinary(req.file.buffer);

        const profileImageUrl = result.secure_url;


        //Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl
        });
        // Return user data with JWT
        return res.status(201).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch(error){
        res.status(500).json({
            success: false,
            message: "Server error", error: error.message});
    }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
const loginUser = async(req, res) => {
    try{
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(401).json({message: "Invalid email or password"});
        }

        //Return user data with JWT
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch(error){
        res.status(401).json({message: "Server error", error: error.message});
    }
};

// @desc    Get User Profile
// @route   POST /api/auth/profile
// @access  Public
const getUserProfile = async(req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.json(user);
    } catch(error){
        res.status(500).json({message: "Server error", error: error.message});
    }
};

module.exports = {registerUser, loginUser, getUserProfile};
