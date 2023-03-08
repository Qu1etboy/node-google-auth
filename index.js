const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

require("dotenv").config();

app.use(cookieParser());

const { OAuth2Client } = require("google-auth-library");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/auth/google/callback";

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// callback from google
app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await client.getToken(code);

    client.setCredentials(tokens);

    // get user informations
    const { data } = await client.request({
      url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      method: "GET",
    });

    // console.log("google data : ", data);

    // use JWT to create token and store it in session or cookies
    const token = jwt.sign(
      {
        ...data,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.get("/auth/google", (req, res) => {
  // Generate the url that will be used for the consent dialog.
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["email", "profile"],
  });

  res.redirect(authUrl);
});

const jwtAuthMiddleware = (req, res, next) => {
  const cookies = req.cookies;
  // console.log("Cookies:", cookies);

  // no cookies or no token provide send status 401 unauthorized
  if (!cookies || !cookies.token) {
    return res.status(401).send("Unauthorized");
  }

  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // sent user data through request
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error verifying JWT token:", err);
    return res.status(401).json({ message: "Unauthorized", err });
  }
};

app.get("/", jwtAuthMiddleware, (req, res) => {
  // console.log(req.user);

  res.send(`Hello ${req.user.name}!`);
});

app.get("/logout", (req, res) => {
  // clear token in cookie to make user logout
  res.clearCookie("token");
  // redirects the request back to the referrer, "/" by default
  res.redirect("back");
  // avoid web request hanging
  res.end();
});

app.listen(3000, () => console.log("Listening at port 3000"));
