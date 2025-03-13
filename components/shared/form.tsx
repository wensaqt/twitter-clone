'use client'

import { IUser } from '@/types'
import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Button from '../ui/button'
import { toast } from '../ui/use-toast'
import { createPost } from '@/actions/post.action'
import useAction from '@/hooks/use-action'
import { createComment } from '@/actions/comment.action'
import { useParams } from 'next/navigation'
import { Film, Image as ImageIcon, X } from 'lucide-react'
import GifSelector from './gif-selector'

interface Props {
	placeholder: string
	user: IUser
	postId?: string
	isComment?: boolean
}

const Form = ({ placeholder, user, isComment }: Props) => {
	const { isLoading, setIsLoading, onError } = useAction()
	const [body, setBody] = useState('')
	const [mediaUrl, setMediaUrl] = useState<string | null>(null)
	const [mediaType, setMediaType] = useState<'image' | 'gif' | 'video' | null>(null)
	const [showGifSelector, setShowGifSelector] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const { postId } = useParams<{ postId: string }>()
	const regexHashtag = new RegExp(".*#[a-z0-9_]+", "g")

	const handleSelectGif = (gifUrl: string) => {
		setMediaUrl(gifUrl)
		setMediaType('gif')
		setShowGifSelector(false)
	}

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (file.size > 5 * 1024 * 1024) {
			toast({ 
				title: 'Erreur', 
				description: 'L\'image ne doit pas dépasser 5MB', 
				variant: 'destructive' 
			})
			return
		}
		
		const reader = new FileReader()
		reader.onloadend = () => {
			setMediaUrl(reader.result as string)
			setMediaType('image')
		}
		reader.readAsDataURL(file)
	}

	const clearMedia = () => {
		setMediaUrl(null)
		setMediaType(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const onSubmit = async () => {
		setIsLoading(true)
		let res
		
		if (isComment) {
			res = await createComment({ 
				body, 
				id: postId,
				mediaUrl,
				mediaType
			})
		} else {
			res = await createPost({ 
				body,
				mediaUrl,
				mediaType
			})
		}
		
		if (res?.serverError || res?.validationErrors || !res?.data) {
			setIsLoading(false)
			return onError('Something went wrong')
		}
		
		if (res.data.failure) {
			setIsLoading(false)
			return onError(res.data.failure)
		}
		
		if (res.data.status === 200) {
			toast({ title: 'Success', description: isComment ? 'Réponse ajoutée avec succès' : 'Tweet créé avec succès' })
			setBody('')
			setMediaUrl(null)
			setMediaType(null)
			if (showGifSelector) setShowGifSelector(false)
		}
		
		setIsLoading(false)
	}

	const validatePost = () => {
		if (isComment) {
			return onSubmit();
		}
		
		if (regexHashtag.test(body) || mediaUrl) {
			return onSubmit();
		} else {
			toast({ 
				title: 'Error', 
				description: 'Votre tweet doit contenir un hashtag ou un média', 
				variant: 'destructive' 
			});
		}
	};

	return (
		<div className='border-b-[1px] border-neutral-800 px-5 py-2'>
			<div className='flex flex-row gap-4'>
				<Avatar>
					<AvatarImage src={user.profileImage} />
					<AvatarFallback>{user.name[0]}</AvatarFallback>
				</Avatar>

				<div className='w-full'>
					<textarea
						className='disabled:opacity-80 peer resize-none mt-3 w-full bg-black ring-0 outline-none text-[20px] placeholder-neutral-500 text-white h-[50px]'
						placeholder={placeholder}
						disabled={isLoading}
						value={body}
						onChange={e => setBody(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && !e.shiftKey && validatePost()}
					></textarea>
					<hr className='opacity-0 peer-focus:opacity-100 h-[1px] w-full border-neutral-800 transition' />

					{mediaUrl && (
						<div className="relative mt-2 mb-4 bg-neutral-800/30 p-2 rounded-md">
							<button
								onClick={clearMedia}
								className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1 text-white hover:bg-opacity-90 transition"
								type="button"
							>
								<X size={16} />
							</button>
							{mediaType === 'gif' ? (
								<img src={mediaUrl} alt="GIF" className="max-h-60 rounded-md mx-auto" />
							) : (
								<img src={mediaUrl} alt="Image" className="max-h-60 rounded-md mx-auto" />
							)}
						</div>
					)}

					{showGifSelector && (
						<div className="mt-2 mb-4">
							<GifSelector 
								onSelect={handleSelectGif} 
								onClose={() => setShowGifSelector(false)} 
							/>
						</div>
					)}

					<div className='mt-2 flex flex-row justify-between items-center'>
						<div className="flex items-center gap-4">
							<label className="cursor-pointer text-orange-500 hover:text-orange-600 transition">
								<ImageIcon size={20} />
								<input
									type="file"
									accept="image/*"
									className="hidden"
									ref={fileInputRef}
									onChange={handleImageUpload}
									disabled={isLoading}
								/>
							</label>
							
							<button
								onClick={() => setShowGifSelector(!showGifSelector)}
								className="text-orange-500 hover:text-orange-600 transition"
								disabled={isLoading}
								type="button"
							>
								<Film size={20} />
							</button>
						</div>

						<Button
							label={isComment ? 'Répondre' : 'Poster'}
							classNames='px-8'
							disabled={isLoading || (!body && !mediaUrl)}
							onClick={validatePost}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Form