const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../../api/users/user.model");
const { emailValidator, passwordValidator } = require("../helpers/validations");

const saltRounds = 10;

const registerStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  async (req, email, password, done) => {
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });

      if (existingUser) {
        const error = new Error(
          "Los datos introducidos, email o contraseña no son correctos"
        );
        error.status = 400;
        return done(error, null);
      }

      const validEmail = emailValidator(email);
      if (!validEmail) {
        const error = new Error("El correo no es valido");
        error.status = 400;
        return done(error, null);
      }

      const validPassword = passwordValidator(password);
      if (!validPassword) {
        const error = new Error("La contraseña no es valida");
        error.status = 400;
        return done(error, null);
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const user = new User({ ...req.body, email, password: hashedPassword });
      const userSaved = await user.save();
      userSaved.password = "";
      return done(null, userSaved);
    } catch (error) {
      return done(error, null);
    }
  }
);

module.exports = registerStrategy;
