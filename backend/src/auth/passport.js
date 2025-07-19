// backend/src/auth/passport.js
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = function(passport) {
  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          include: { modelHasRoles: { include: { role: true } } }
        });
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
