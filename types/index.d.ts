export type SearchParams = { [key: string]: string | string[] | undefined }

export interface QueryProps {
	params: string
	key: string
	value?: string | null
}

export interface IUser {
	createdAt: Date
	username: string
	email: string
	name: string
	profileImage: string
	coverImage: string
	updatedAt: Date
	_id: string
	bio: string
	location: string
	followers: string[]
	following: string[]
	savedPosts: string[]
	hasNewNotifications: boolean
	notifications: string[]
	isFollowing: boolean
}

export interface IPost {
	mediaType: string
	mediaType: string
	mediaType: string
	mediaUrl: any
	body: string
	comments: number
	createdAt: string
	likes: number
	updatedAt: string
	user: IUser
	_id: string
	hasLiked: boolean
	hasSaved: boolean
	imageData?: string
	emotion?: string
	isEmotionReaction?: boolean
	mediaUrl?: string
	mediaType?: 'image' | 'gif' | 'video' | null
}

export interface ReturnActionType {
	posts?: IPost[]
	comments?: IPost[]
	isNext?: boolean
	failure?: string
	status?: number
	post?: IPost
	users?: IUser[]
	notifications?: IPost[]
	user?: IUser
}
