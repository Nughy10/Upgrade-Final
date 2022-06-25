const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyparser = require('body-parser');

require("./src/utils/auth/index");
dotenv.config();

const UserRoutes = require("./src/api/users/user.routes");

const { connectDb } = require("./src/utils/database/database");


const PORT = process.env.PORT || 8080;

const app = express();
connectDb();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

app.use(
  session({
    secret: process.env.SESSION_SECRET, // ¡Este secreto tendremos que cambiarlo en producción!
    resave: false, // Solo guardará la sesión si hay cambios en ella.
    saveUninitialized: false, // Lo usaremos como false debido a que gestionamos nuestra sesión con Passport
    cookie: {
      maxAge: 60 * 60 * 1000, // Milisegundos de duración de nuestra cookie, en este caso será una hora.
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/users", UserRoutes);

app.use("*", (req, res, next) => {
  return res.status(404).json("Route not found");
});

app.use((error, req, res, next) => {
  return res
    .status(error.status || 500)
    .json(error.message || "Unexpected error");
});

app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
});
