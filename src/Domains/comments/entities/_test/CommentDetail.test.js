const CommentDetail = require('../CommentDetail');

describe('CommentDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: '123',
      username: 'adrian',
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      id: '123',
      username: 'adrian',
      content: 'sebuah komentar',
      replies: 'sebuah balasan',
      date: 321,
      likeCount: 0,
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrowError('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: '123',
      username: 'adrian',
      content: 'sebuah komentar',
      replies: [
        {
          id: 'replies-1',
          username: 'johndoe',
          content: 'sebuah balasan',
          date: '2023-09-21T23:59:59.555Z',
        },
      ],
      date: '2023-09-22T07:19:09.775Z',
      likeCount: 0,
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.likeCount).toEqual(payload.likeCount);
  });

  it('should create deleted CommentDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: '123',
      username: 'adrian',
      content: 'sebuah komentar',
      replies: [
        {
          id: 'replies-1',
          username: 'johndoe',
          content: 'sebuah balasan',
          date: '2023-09-21T23:59:59.555Z',
        },
      ],
      date: '2023-09-22T07:19:09.775Z',
      likeCount: 0,
      deleted_at: new Date().toISOString(),
    };

    // Action
    const commentDetail = new CommentDetail(payload);

    // Assert
    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.content).toEqual('**komentar telah dihapus**');
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.likeCount).toEqual(payload.likeCount);
  });
});
