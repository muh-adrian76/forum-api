const CommentLikesRepository = require('../../Domains/likes/CommentLikesRepository');

class CommentLikesRepositoryPostgres extends CommentLikesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(like) {
    const id = `like-${this._idGenerator()}`;
    const { commentId, owner } = like;

    const query = {
      text: 'INSERT INTO likes(id, comment, owner) VALUES($1, $2, $3)',
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async getLikesByThreadId(threadId) {
    const query = {
      text: `SELECT likes.* FROM likes LEFT JOIN comments
        ON comments.id = likes.comment WHERE comments.thread = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteLike(like) {
    const { commentId, owner } = like;

    const query = {
      text: 'DELETE FROM likes WHERE comment = $1 AND owner = $2',
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }

  async verifyUserCommentLike(like) {
    const { commentId, owner } = like;

    const query = {
      text: 'SELECT 1 FROM likes WHERE comment = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      return false;
    }
    return true;
  }
}

module.exports = CommentLikesRepositoryPostgres;
