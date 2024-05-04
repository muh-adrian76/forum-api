const CommentLikeUseCase = require('../../../../Applications/use_case/CommentLikeUseCase');

class CommentLikesHandler {
  constructor(container) {
    this._container = container;
  }

  async putLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const commentLikeUseCase = this._container.getInstance(CommentLikeUseCase.name);
    await commentLikeUseCase.execute(userId, request.params);

    return h.response({
      status: 'success',
    });
  }
}

module.exports = CommentLikesHandler;
