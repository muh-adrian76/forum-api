/* eslint-disable no-unused-expressions */
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('checkReplyAvailability function', () => {
    it('should throw NotFoundError when reply not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.checkReplyAvailability('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is deleted', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
        deleted_at: new Date().toISOString(), // reply is soft deleted
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.checkReplyAvailability(replyId))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.checkReplyAvailability(replyId))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply owner not authorized', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId, 'user-other'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply owner authorized', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(replyId, userId))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('addReply function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread: 'thread-123',
        owner: 'user-123',
      });
    });

    it('should persist new reply', async () => {
      // Arrange
      const newReply = new NewReply({ content: 'sebuah balasan' });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(
        'user-123',
        'comment-123',
        newReply,
      );

      // Assert
      const replys = await RepliesTableTestHelper.findRepliesById('reply-123');
      expect(replys).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({ content: 'sebuah balasan' });

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(
        'user-123',
        'comment-123',
        newReply,
      );

      // Assert
      expect(addedReply).toStrictEqual({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      });
    });
  });

  describe('getRepliesByCommentId function', () => {
    it('should return comment replies correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId, username: 'adrian' });
      await UsersTableTestHelper.addUser({ id: otherUserId, username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'sebuah komentar',
        date: '2023-09-09',
        thread: threadId,
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-baru',
        content: 'balasan terbaru',
        date: '2023-09-11',
        comment: commentId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-lama',
        content: 'balasan sebelumnya',
        date: '2023-09-10',
        comment: commentId,
        owner: otherUserId,
        deleted_at: new Date().toISOString(),
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId(commentId);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-lama');
      expect(replies[1].id).toBe('reply-baru');
      expect(replies[0].username).toBe('johndoe');
      expect(replies[1].username).toBe('adrian');
      expect(replies[0].content).toBe('balasan sebelumnya');
      expect(replies[1].content).toBe('balasan terbaru');
      expect(replies[0].date).toBeTruthy();
      expect(replies[1].date).toBeTruthy();
      expect(replies[0].deleted_at).toBeTruthy();
      expect(replies[1].deleted_at).not.toBeTruthy();
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return comment replies correctly', async () => {
      // Arrange
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: userId, username: 'adrian' });
      await UsersTableTestHelper.addUser({ id: otherUserId, username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: 'sebuah komentar',
        date: '2023-09-09',
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-1',
        content: 'balasan sebelumnya',
        date: '2023-09-10',
        comment: commentId,
        owner: otherUserId,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-2',
        content: 'balasan terbaru',
        date: '2023-09-11',
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(threadId);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0].id).toBe('reply-1');
      expect(replies[1].id).toBe('reply-2');
      expect(replies[0].username).toBe('johndoe');
      expect(replies[1].username).toBe('adrian');
      expect(replies[0].content).toBe('balasan sebelumnya');
      expect(replies[1].content).toBe('balasan terbaru');
      expect(replies[0].date).toBeTruthy();
      expect(replies[1].date).toBeTruthy();
      expect(replies[0].deleted_at).not.toBeTruthy();
      expect(replies[1].deleted_at).not.toBeTruthy();
    });
  });

  describe('deleteReplyById function', () => {
    it('should soft delete reply and update deleted_at field', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        thread: 'thread-123',
        owner: 'user-123',
      });

      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: 'comment-123',
        owner: 'user-123',
      });

      // Action
      await replyRepositoryPostgres.deleteReplyById(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].deleted_at).toBeTruthy();
    });
  });
});
