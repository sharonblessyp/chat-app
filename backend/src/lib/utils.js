import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET)
        throw new Error("JWT_SECRET is not configured");
   
    // create token for user
    const token = jwt.sign({userId:userId}, JWT_SECRET,{
        expiresIn: "7d",
        header: {
         algo: "RS256",
         typ: "JWT"
        }
    })

    res.cookie("jwt", token, {
        maxAge: 7*24*60*60*1000, // 7 days in millisecond
        // prevent xss attacks: cross site scripting
        httpOnly: true,
        // CSRF attacks
        sameSite: "strict",
        // http://localhost
        secure: process.env.NODE_ENV == "development" ? false : true,
    });

    return token;
}