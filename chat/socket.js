const socketIO = require('socket.io');

const Session = require('./models/Session');
const Message = require('./models/Message');

function socket(server) {
  const io = socketIO(server);

  io.use(async function(socket, next) {
    const {token} = socket.handshake.query;

    if (!token) {
      return next(new Error('anonymous sessions are not allowed'));
    }

    // const session = await Session.findOne({Session}).populate('user');
    const session = await Session.findOne({token}).populate('user');

    if (!session) {
      return next(new Error('wrong or expired session token'));
    }
    session.lastVisit = new Date();
    await session.save();
    socket.user = session.user;
    next();
  });

  io.on('connection', function(socket) {
    socket.on('message', async (msg) => {
      const user = socket.user;
      try {
        await Message.create({
          user: user.displayName,
          chat: user.id,
          text: msg,
          date: new Date(),
        });
      } catch (err) {
        return next(new Error('validation error'));
      };
    });
  });

  return io;
}

module.exports = socket;

