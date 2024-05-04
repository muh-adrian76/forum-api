const ThreadDetail = require('../ThreadDetail');

describe('ThreadDetail entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah isi thread',
      username: 'adrian',
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type requirements', () => {
    // Arrange
    const payload = {
      id: true,
      title: 'sebuah thread',
      body: 'sebuah isi thread',
      date: '2023-09-22T07:19:09.775Z',
      username: 'dicoding',
      comments: 'sebuah komentar',
    };

    // Action & Assert
    expect(() => new ThreadDetail(payload)).toThrowError('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create ThreadDetail entities correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah isi thread',
      date: '2023-09-22T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          replies: [],
          content: 'sebuah komentar',
          date: '2023-09-21T23:59:59.555Z',
        },
        {
          id: 'comment-2',
          username: 'adrian',
          replies: [
            {
              id: 'reply-1',
              username: 'johndoe',
              content: 'sebuah balasan',
              date: '2023-09-21T23:59:59.555Z',
            },
          ],
          content: 'sebuah komentar',
          date: '2023-09-21T23:59:59.555Z',
        },
      ],
    };

    // Action
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toHaveLength(payload.comments.length);
    expect(threadDetail.comments[0]).toEqual(payload.comments[0]);
    expect(threadDetail.comments[1]).toEqual(payload.comments[1]);
  });
});
