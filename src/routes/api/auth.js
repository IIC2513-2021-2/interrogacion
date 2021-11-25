require('dotenv').config();

const KoaRouter = require('koa-router');
const jwtgenerator = require('jsonwebtoken');

const router = new KoaRouter();

function generateToken(user) {
  return new Promise((resolve, reject) => {
    const { id: sub } = user;
    jwtgenerator.sign(
      { sub },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, tokenResult) => (err ? reject(err) : resolve(tokenResult)),
    );
  });
}

router.post('api.auth.login', '/', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await ctx.orm.user.findOne({ where: { email } });

  if (!user) ctx.throw(404, `No user found with email ${email}`);

  const authenticated = await user.checkPassword(password);
  if (!authenticated) ctx.throw(401, 'Invalid password');

  const token = await generateToken(user);
  ctx.status = 201;
  ctx.body = {
    access_token: token,
    token_type: 'Bearer',
  };
});

module.exports = router;
