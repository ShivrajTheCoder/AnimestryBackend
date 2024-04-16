const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../Utilities/sendMail");
const generateVerificationCode = require("../Utilities/generateCode");
const Code = require("../Models/Code");
const User = require("../Models/UserModel");
const { validationResult } = require("express-validator");
const { NotFoundError } = require("../Utilities/CustomErrors");
dotenv.config();
const exp = module.exports;
const USER_KEY = process.env.JWT_SECRET_KEY;

const saltRounds = 10;
// const sender=process.env.EMAIL;
exp.SendCode = async (req, res, next) => {
    const { email, recovery = false } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const existingUser = await User.findOne({ email });
        await Code.findOneAndDelete({ email });
        const code = generateVerificationCode();
        let savedCode;
        if (existingUser && !recovery) {
            return res.status(402).json({
                message: "user already exists"
            })
        }
        if (!existingUser && recovery) {
            return res.status(404).json({
                message: "User doens't exist"
            })
        }
        const newCode = new Code({
            code,
            email,
        })
        savedCode = await newCode.save();
        const sender = process.env.EMAIL;
        const subject = 'Your Verification Code';
        let text;
        if (recovery) {
            text = `Your recovery code is: ${code}`
        }
        else {
            text = `Your verification code is: ${code}`
        }

        const result = await sendMail(sender, email, subject, text);
        if (!result) {
            return res.status(500).json({ message: 'Error sending verification code.' });
        }
        // console.log(savedCode);
        res.status(201).json({ message: 'Verification code sent. with code', });// remove code 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending verification code.' });
    }
}

exp.Signup = async (req, res, next) => {
    const { username, email, password, code } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        if (!username || !email || !password || !code) {
            return res.status(400).json({ message: 'Missing required fields: username, email, password, and verification code.' });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User Already Exists' });
        }
        const foundCode = await Code.findOne({ email, code });
        if (!foundCode) {
            return res.status(400).json({
                message: "No code found!",
            })
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save();
        if (savedUser) {
            await Code.findOneAndDelete({ email });
        }
        res.status(201).json({ message: 'User created successfully.', user: savedUser.email });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating user.' });
    }
};
exp.Login = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Incorrect email or password." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect email or password." });
        }
        const token = jwt.sign({ _id: user._id }, USER_KEY);

        res.status(200).json({ message: "Login successful", token, userId: user._id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error logging in." });
    }
};

exp.ForgotPassword = async (req, res, next) => {
    const { email, code } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const fcode = await Code.findOneAndDelete({ email, code });
        if (!fcode) {
            return res.status(404).json({
                message: "Invalid code",
            })
        }
        const genCode = generateVerificationCode();
        const hashedPassword = await bcrypt.hash(genCode, saltRounds);
        const user = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
        const sender = process.env.EMAIL;
        const subject = 'Your new password';
        text = `Your new password is: ${genCode}`
        const result = await sendMail(sender, user.email, subject, text);
        if (!result) {
            return res.status(500).json({ message: 'Error sending verification code.' });
        }
        return res.status(201).json({
            message: "New password sent on mail"
        })
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong!",
            error
        })
    }
}

exp.GetUserInfor = async (req, res, next) => {
    const { userId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found!");
        }
        return res.status(200).json({ user });
    }
    catch (error) {
        next(error);
    }

}

exp.UpdatePassword = async (req, res, next) => {
    const { userId } = req.params;
    const { password, newpassword } = req.body;
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found!");
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        // console.log(passwordMatch);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Incorrect password." });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newpassword, saltRounds);

        // Update the user's password
        const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedNewPassword }, { new: true });

        return res.status(200).json({ user: updatedUser });
    } catch (error) {
        next(error);
    }
}

