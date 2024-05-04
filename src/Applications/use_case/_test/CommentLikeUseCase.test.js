const CommentLikeUseCase = require('../CommentLikeUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikesRepository = require('../../../Domains/likes/CommentLikesRepository');
const CommentLike = require('../../../Domains/likes/entities/CommentLike');

describe('CommentLikeUseCase', () => {
  it('should orchestrating the like comment acction correctly if comment is not liked', async () => {
    // Arrange
    const like = new CommentLike({
      commentId: 'comment-123',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.verifyUserCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const commentLikeUseCase = new CommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikesRepository: mockCommentLikeRepository,
    });

    // Action
    await commentLikeUseCase.execute('user-123', { threadId: 'thread-123', commentId: 'comment-123' });

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123');
    expect(mockCommentLikeRepository.verifyUserCommentLike).toBeCalledWith(like);
    expect(mockCommentLikeRepository.addLike).toBeCalledWith(like);
  });

  it('should orchestrating the like comment acction correctly if comment is not liked', async () => {
    // Arrange
    const like = new CommentLike({
      commentId: 'comment-123',
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikeRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.checkCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikeRepository.verifyUserCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const commentLikeUseCase = new CommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikesRepository: mockCommentLikeRepository,
    });

    // Action
    await commentLikeUseCase.execute('user-123', { threadId: 'thread-123', commentId: 'comment-123' });

    // Assert
    expect(mockThreadRepository.checkThreadAvailability).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123');
    expect(mockCommentLikeRepository.verifyUserCommentLike).toBeCalledWith(like);
    expect(mockCommentLikeRepository.deleteLike).toBeCalledWith(like);
  });
});
