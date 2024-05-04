const pool = require('../../database/postgres/pool');
const CommentLikesRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const CommentLike = require('../../../Domains/likes/entities/CommentLike');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');

describe('CommentLikeRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const userId = 'user-123';
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
    deleted_at: null,
  };

  describe('addLike function', () => {
    it('should return added likes correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });

      const newLike = new CommentLike({ commentId: comment.id, owner: userId });
      const fakeIdGenerator = () => '123';
      // eslint-disable-next-line max-len
      const commentLikeRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentLikeRepositoryPostgres.addLike(newLike);

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikeByCommentOwner(comment.id, userId);
      expect(likes[0]).toStrictEqual({
        id: 'like-123',
        comment: 'comment-123',
        owner: 'user-123',
      });
    });
  });

  describe('getLikesByCommentId function', () => {
    it('should return the likes for a thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, id: 'comment-456', owner: userId });
      await CommentLikesTableTestHelper.addLike({
        id: 'like-1',
        commentId: comment.id,
        owner: userId,
      });
      await CommentLikesTableTestHelper.addLike({
        id: 'like-2',
        commentId: 'comment-456',
        owner: userId,
      });

      const commentLikeRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action
      const threadCommentLikes = await commentLikeRepositoryPostgres.getLikesByThreadId(thread.id);

      // Assert
      expect(threadCommentLikes).toHaveLength(2);
      expect(threadCommentLikes[0].id).toEqual('like-1');
      expect(threadCommentLikes[0].comment).toEqual(comment.id);
      expect(threadCommentLikes[1].id).toEqual('like-2');
      expect(threadCommentLikes[1].comment).toEqual('comment-456');
    });
  });

  describe('deleteLike function', () => {
    it('should delete a like from the thread comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      const like = new CommentLike({
        commentId: comment.id,
        owner: userId,
      });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123 ', ...like });

      const commentLikeRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action
      await commentLikeRepositoryPostgres.deleteLike(like);

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('verifyUserCommentLike function', () => {
    it('should return true if a user has liked a comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      const like = new CommentLike({
        commentId: comment.id,
        owner: userId,
      });
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', ...like });
      const commentLikeRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action
      const isCommentLiked = await commentLikeRepositoryPostgres.verifyUserCommentLike(like);

      // Assert
      expect(isCommentLiked).toBe(true);
    });

    it('should return false if a user has not liked a comment', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...comment, owner: userId });
      const like = new CommentLike({
        commentId: comment.id,
        owner: userId,
      });
      const commentLikeRepositoryPostgres = new CommentLikesRepositoryPostgres(pool, {});

      // Action
      const isCommentLiked = await commentLikeRepositoryPostgres.verifyUserCommentLike(like);
      expect(isCommentLiked).toBe(false);
    });
  });
});
