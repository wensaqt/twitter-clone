import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema(
	{
		body: String,
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
		likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

		imageData: {
			type: String,
			default: null
		},
		emotion: {
			type: String,
			default: null
		},
		isEmotionReaction: {
			type: Boolean,
            default: false
		}
	},
	{ timestamps: true }
)

const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema)
export default Comment
