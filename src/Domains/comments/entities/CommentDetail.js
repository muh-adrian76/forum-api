class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.username = payload.username;
    this.content = payload.deleted_at ? '**komentar telah dihapus**' : payload.content;
    this.date = payload.date;
    this.replies = payload.replies;
    this.likeCount = payload.likeCount;
  }

  _verifyPayload(payload) {
    const {
      id,
      username,
      content,
      date,
      replies,
      likeCount,
    } = payload;

    if (!id || !username || !content || !date || likeCount === undefined) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || (typeof date !== 'string' && typeof date !== 'object')
      || !Array.isArray(replies)
      || typeof likeCount !== 'number'
    ) {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentDetail;
