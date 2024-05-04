const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  const getAccessTokenAndUser = async (server, payload = {
    username: 'adrian',
    password: 'secret',
    fullname: 'Muhammad Adriano',
  }) => {
    // add user
    const registerResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload,
    });

    // get access token
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: payload.username,
        password: payload.password,
      },
    });

    return {
      userId: JSON.parse(registerResponse.payload).data.addedUser.id,
      accessToken: JSON.parse(loginResponse.payload).data.accessToken,
    };
  };

  const thread = {
    id: 'thread-123',
    title: 'sebuah thread',
    body: 'sebuah isi thread',
    date: new Date().toISOString(),
  };

  const comment = {
    id: 'comment-123',
    content: 'sebuah komentar',
    date: new Date().toISOString(),
    thread: thread.id,
  };

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and like comment if is not liked yet', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId, accessToken } = await getAccessTokenAndUser(server);

      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await CommentLikesTableTestHelper.findLikeByCommentOwner(comment.id, userId);
      expect(likes).toHaveLength(1);
    });

    it('should response 200 and unlike comment if comment is liked', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId, accessToken } = await getAccessTokenAndUser(server);

      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      await CommentLikesTableTestHelper.addLike({ commentId: comment.id, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const likes = await CommentLikesTableTestHelper.findLikeByCommentOwner(comment.id, userId);
      expect(likes).toHaveLength(0);
    });

    it('should response 404 if comment is not exist', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId, accessToken } = await getAccessTokenAndUser(server);

      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/comment-456/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 if comment is not valid or deleted', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId, accessToken } = await getAccessTokenAndUser(server);

      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      await server.inject({
        method: 'DELETE',
        url: `/threads/${thread.id}/comments/${comment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak valid');
    });

    it('should response 404 if thread is not exist', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await getAccessTokenAndUser(server);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/thread-456/comments/${comment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 401 if headers not contain access token', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId } = await getAccessTokenAndUser(server);

      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${thread.id}/comments/${comment.id}/likes`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
});
