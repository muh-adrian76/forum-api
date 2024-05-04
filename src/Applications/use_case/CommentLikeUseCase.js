const CommentLike = require('../../Domains/likes/entities/CommentLike');

class CommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = commentLikesRepository;
  }

  async execute(userId, useCaseParams) {
    const { threadId, commentId } = useCaseParams;
    await this._threadRepository.checkThreadAvailability(threadId);
    await this._commentRepository.checkCommentAvailability(commentId);

    const like = new CommentLike({
      commentId,
      owner: userId,
    });

    const isCommentLiked = await this._likeRepository.verifyUserCommentLike(like);

    return await isCommentLiked
      ? this._likeRepository.deleteLike(like) : this._likeRepository.addLike(like);
  }
}

module.exports = CommentLikeUseCase;
