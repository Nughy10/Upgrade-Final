const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../../api/users/user.model");
const { emailValidator, passwordValidator } = require("../helpers/validations");

const loginStrategy = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
    },
    async (req, email, password, done) => {
        const validEmail = emailValidator(email);
        const validPassword = passwordValidator(password);

        if(!validEmail || !validPassword) {
            const error = new Error('Datos incorrectos. Revisa los requisitos de email y contraseña');
            error.status = 400;
            return done(error);
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if(!user) {
            const error = new Error('Este usuario no existe');
            error.status = 401;
            return done(error);
        }

        const isValidUserPassword = await bcrypt.compare(password, user.password);

        if(!isValidUserPassword) {
            const error = new Error('El correo o la contraseña son incorrectos');
            error.status = 401;
            return done(error);
        }
        
        user.password = null;
        return done(null, user);
    }
);

module.exports = loginStrategy;
