const exp = module.exports;
const { RouterAsncErrorHandler } = require("../Middlewares/ErrorHandlerMiddleware");
const User = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const { CredentialError } = require("../Utilities/CustomErrors");
const jwt=require("jsonwebtoken");
exp.Signup = RouterAsncErrorHandler(async (req, res, next) => {
    const { username, email, password } = req.body;

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    try {
        // Create a new user with hashed password
        const user = new User({
            username: username,
            email: email,
            password: hashedPassword,
        });

        // Save the user to the database
        await user.save();

        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        // Handle errors such as duplicate emails or database issues
        next(error);
    }
});

exp.Login = RouterAsncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const JWT_SECRET_KEY=process.env.JWT_SECRET_KEY;
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });

        // If the user does not exist
        if (!user) {
            throw new CredentialError();
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If the password is invalid
        if (!isPasswordValid) {
            throw new CredentialError();
        }

        // Password is valid, generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, { expiresIn: "1h" }); // Token expires in 1 hour

        return res.status(200).json({ message: "Login successful", token: token,user });
    } catch (error) {
        next(error);
    }
})