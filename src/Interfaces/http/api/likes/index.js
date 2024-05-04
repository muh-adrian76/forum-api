const CommentLikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  register: async (server, { container }) => {
    const likesHandler = new CommentLikesHandler(container);
    server.route(routes(likesHandler));
  },
};
