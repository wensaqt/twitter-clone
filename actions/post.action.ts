'use server'

import Post from '@/database/post.model'
import User from '@/database/user.model'
import { authOptions } from '@/lib/auth-options'
import { connectToDatabase } from '@/lib/mognoose'
import { actionClient } from '@/lib/safe-action'
import { createPostSchema, idSchema, paramsSchema } from '@/lib/validation'
import { ReturnActionType } from '@/types'
import { FilterQuery } from 'mongoose'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import Notification from '@/database/notification.model'

export const getPosts = actionClient.schema(paramsSchema).action<ReturnActionType>(async ({ parsedInput }) => {
	const { page, pageSize } = parsedInput
	await connectToDatabase()

	const query: FilterQuery<typeof Post> = {}
	const skipAmount = (+page - 1) * +pageSize

	const posts = await Post.find(query)
		.populate({
			path: 'user',
			model: User,
			select: 'name email profileImage _id username',
		})
		.sort({ createdAt: -1 })
		.skip(skipAmount)
		.limit(+pageSize)

	const totalProducts = await Post.countDocuments(query)
	const isNext = totalProducts > skipAmount + +posts.length

	const session = await getServerSession(authOptions)

	const filteredPosts = posts.map(post => ({
		body: post.body,
		createdAt: post.createdAt,
		user: {
			_id: post.user._id,
			name: post.user.name,
			username: post.user.username,
			profileImage: post.user.profileImage,
			email: post.user.email,
		},
		likes: post.likes.length,
		comments: post.comments.length,
		hasLiked: post.likes.includes(session?.currentUser?._id),
		_id: post._id,
	}))

	return JSON.parse(JSON.stringify({ posts: filteredPosts, isNext }))
})

export const getPost = actionClient.schema(idSchema).action<ReturnActionType>(async ({ parsedInput }) => {
	const { id } = parsedInput
	await connectToDatabase()
	const post = await Post.findById(id).populate({ path: 'user', model: User, select: 'name email profileImage _id username' })
	if (!post) return { failure: 'Post non trouvé.' }
	return JSON.parse(JSON.stringify({ post }))
})

export const createPost = actionClient.schema(createPostSchema).action<ReturnActionType>(async ({ parsedInput }) => {
	const { body } = parsedInput
	const session = await getServerSession(authOptions)
	if (!session) return { failure: 'Vous devez être connecté pour créer un post.' }
	await Post.create({ body, user: session.currentUser?._id })
	revalidatePath('/')
	return { status: 200 }
})

export const likePost = actionClient.schema(idSchema).action<ReturnActionType>(async ({ parsedInput }) => {
	const { id } = parsedInput
	const session = await getServerSession(authOptions)
	if (!session) return { failure: 'Vous devez être connecté pour liker un post.' }
	await connectToDatabase()
	const currentPost = await Post.findById(id)
	if (!currentPost) return { failure: 'Post non trouvé.' }
	if (currentPost.likes.includes(session.currentUser?._id)) return { failure: 'Vous avez déjà aimé ce post.' }
	await Post.findByIdAndUpdate(id, { $push: { likes: session.currentUser?._id } })
	const userFollowed = await User.findById(session.currentUser?._id).select('username')
	await Notification.create({ user: currentPost.user, body: `@${userFollowed.username} a liké votre post !`, link: id, type:'posts' })
	await User.findOneAndUpdate({ _id: currentPost.user }, { $set: { hasNewNotifications: true } })
	revalidatePath('/')
	return { status: 200 }
})

export const deletePost = actionClient.schema(idSchema).action<ReturnActionType>(async ({ parsedInput }) => {
	const { id } = parsedInput
	const session = await getServerSession(authOptions)
	if (!session) return { failure: 'Vous devez être connecté pour supprimer un post.' }
	await connectToDatabase()
	const currentPost = await Post.findById(id)
	if (!currentPost) return { failure: 'Post not found.' }
	if (currentPost.user.toString() !== session.currentUser?._id.toString())
		return { failure: "Vous n'avez pas la permission de supprimer ce post." }
	await Post.findByIdAndDelete(id)
	revalidatePath('/')
	return { status: 200 }
})

export const deleteLike = actionClient.schema(idSchema).action<ReturnActionType>(async ({ parsedInput }) => {
	const { id } = parsedInput
	const session = await getServerSession(authOptions)
	if (!session) return { failure: 'Vous devez être connecté pour supprimer un like.' }
	await connectToDatabase()
	const currentPost = await Post.findById(id)
	if (!currentPost) return { failure: 'Post not found.' }
	if (!currentPost.likes.includes(session.currentUser?._id)) return { failure: "Vous n'avez pas like ce post." }
	await Post.findByIdAndUpdate(id, { $pull: { likes: session.currentUser?._id } })
	revalidatePath('/')
	return { status: 200 }
})
