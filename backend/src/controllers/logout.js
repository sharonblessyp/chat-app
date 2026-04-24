export const logout = (_req, res) => {
    try {
        res.clearCookie("jwt","", {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 0,
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
