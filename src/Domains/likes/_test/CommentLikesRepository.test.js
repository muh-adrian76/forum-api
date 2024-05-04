const CommentLikesRepository = require('../CommentLikesRepository');

describe('CommentLikesRepository interface', () => {
  it('should throw error when invoke abstract behaviour', async () => {
    // Arrange
    const likeRepository = new CommentLikesRepository();

    // Action & Assert
    await expect(likeRepository.addLike({})).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.getLikesByThreadId('')).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.deleteLike({})).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.verifyUserCommentLike({})).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
