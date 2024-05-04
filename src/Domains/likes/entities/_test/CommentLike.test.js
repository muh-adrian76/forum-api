const CommentLike = require('../CommentLike');

describe('Comment Like entity', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
    };

    // Action & Assert
    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type requirements', () => {
    // Arrange
    const payload = {
      commentId: true,
      owner: 76,
    };

    // Action & Assert
    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentLike entities correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action
    const newLike = new CommentLike(payload);

    // Assert
    expect(newLike.commentId).toEqual(payload.commentId);
    expect(newLike.owner).toEqual(payload.owner);
  });
});
