const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentLikesRepository = require('../../../Domains/likes/CommentLikesRepository');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const mockThreadDetail = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah isi thread',
      date: '2023-09-07T00:00:00.000Z',
      username: 'adrian',
    };

    const mockComments = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2023-09-07T00:00:00.000Z',
        content: 'sebuah komentar',
      },
      {
        id: 'comment-2',
        username: 'adrian',
        date: '2023-09-08T00:00:00.000Z',
        content: 'sebuah komentar',
        deleted_at: new Date().toISOString(),
      },
    ];

    const mockReplies = [
      {
        id: 'reply-1',
        username: 'johndoe',
        date: '2023-09-08T00:00:00.000Z',
        content: 'sebuah balasan',
        comment: 'comment-1',
      },
      {
        id: 'reply-2',
        username: 'adrian',
        date: '2023-09-09T00:00:00.000Z',
        content: 'sebuah balasan',
        comment: 'comment-1',
        deleted_at: new Date().toISOString(),
      },
      {
        id: 'reply-3',
        username: 'adrian',
        date: '2023-09-09T00:00:00.000Z',
        content: 'sebuah balasan',
        comment: 'comment-2',
      },
    ];

    const mockCommentsLikes = [
      {
        id: 'like-1',
        comment: 'comment-1',
        owner: 'johndoe',
      },
      {
        id: 'like-2',
        comment: 'comment-1',
        owner: 'adrian',
      },
      {
        id: 'like-3',
        comment: 'comment-2',
        owner: 'johndoe',
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikesRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThreadDetail));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));
    mockCommentLikeRepository.getLikesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCommentsLikes));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikesRepository: mockCommentLikeRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute('thread-123');
    // Assert
    expect(threadDetail).toStrictEqual(new ThreadDetail({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah isi thread',
      date: '2023-09-07T00:00:00.000Z',
      username: 'adrian',
      comments: [
        new CommentDetail({
          id: 'comment-1',
          username: 'johndoe',
          date: '2023-09-07T00:00:00.000Z',
          content: 'sebuah komentar',
          replies: [
            new ReplyDetail({
              id: 'reply-1',
              username: 'johndoe',
              content: 'sebuah balasan',
              date: '2023-09-08T00:00:00.000Z',
            }),
            new ReplyDetail({
              id: 'reply-2',
              username: 'adrian',
              date: '2023-09-09T00:00:00.000Z',
              content: '**balasan telah dihapus**',
            }),
          ],
          likeCount: 2,
        }),
        new CommentDetail({
          id: 'comment-2',
          username: 'adrian',
          date: '2023-09-08T00:00:00.000Z',
          content: '**komentar telah dihapus**',
          replies: [],
          likeCount: 1,
        }),
      ],
    }));
    expect(threadDetail.comments
      .filter((comment) => comment.id === mockComments[1].id)[0].content).toEqual('**komentar telah dihapus**');
    expect(threadDetail.comments
      .filter((comment) => comment.id === mockComments[0].id)[0].replies[1].content).toEqual('**balasan telah dihapus**');
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledTimes(1);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith('thread-123');
    expect(mockCommentLikeRepository.getLikesByThreadId).toBeCalledTimes(1);
    expect(mockCommentLikeRepository.getLikesByThreadId).toBeCalledWith('thread-123');
  });
});
