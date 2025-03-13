'use client'

import { IPost, IUser } from '@/types'
import React, { MouseEvent, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { sliceText } from '@/lib/utils'
import { formatDistanceToNowStrict } from 'date-fns'
import { AiFillDelete, AiOutlineMessage } from 'react-icons/ai'
import { FaHeart } from 'react-icons/fa'
import { toast } from '../ui/use-toast'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useAction from '@/hooks/use-action'
import { deleteLike, deletePost, likePost } from '@/actions/post.action'

interface Props {
  post: IPost
  user: IUser
}

const PostItem = ({ post, user }: Props) => {
  const { isLoading, setIsLoading, onError } = useAction()

  const router = useRouter()

  const onDelete = async (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsLoading(true)
    const res = await deletePost({ id: post._id })
    if (res?.serverError || res?.validationErrors || !res?.data) {
      return onError('Something went wrong')
    }
    if (res.data.failure) {
      return onError(res.data.failure)
    }
    if (res.data.status === 200) {
      toast({ title: 'Success', description: 'Tweet supprimé avec succès' })
      setIsLoading(false)
    }
  }

  const onLike = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsLoading(true)
    let res
    if (post.hasLiked) {
      res = await deleteLike({ id: post._id })
    } else {
      res = await likePost({ id: post._id })
    }
    if (res?.serverError || res?.validationErrors || !res?.data) {
      return onError('Something went wrong')
    }
    if (res.data.failure) {
      return onError(res.data.failure)
    }
    if (res.data.status === 200) {
      setIsLoading(false)
    }
  }

  const goToPost = () => {
    router.push(`/posts/${post._id}`)
  }

  const goToProfile = (evt: any) => {
    evt.stopPropagation()
    router.push(`/profile/${post.user._id}`)
  }

const parseMentions = (text: string) => {
	const regex = /@([a-zA-Z0-9_]+)/g
	return text.split(regex).map((part, index) => {
	  if (index % 2 === 1) {
		return (
		  <span
			key={index}
			className="text-blue-500 cursor-pointer hover:underline"
			onClick={(e) => goToProfileFromMention(e, part)} 
		  >
			@{part}
		  </span>
		)
	  } else {
		return part
	  }
	})
  }
  
  
  const goToProfileFromMention = async (evt: any, username: string) => {
	evt.stopPropagation()
  
	const res = await fetch(`/api/users?searchQuery=${username}&page=1&pageSize=1`)
	const data = await res.json()
  
	if (data && data.length > 0) {
	  let user: any = null  
	  
	  data.forEach((element:IUser) => {
		if (element.username === username) {
		  user = element
		}
	  });
  
	  if (user) {
		router.push(`/profile/${user._id}`)  
	  } else {
		toast({ title: 'Erreur', description: 'Utilisateur non trouvé' }) 
	  }
	} else {
	  toast({ title: 'Erreur', description: 'Utilisateur non trouvé' }) 
	}
  }

  return (
    <div className='border-b-[1px] border-neutral-800 p-5 cursor-pointer hover:bg-neutral-900 transition relative'>
      {isLoading && (
        <div className='absolute inset-0 w-full h-full bg-black opacity-50'>
          <div className='flex justify-center items-center h-full'>
            <Loader2 className='animate-spin text-orange-500' />
          </div>
        </div>
      )}
      <div className='flex flex-row items-center gap-3 cursor-pointer' onClick={goToPost}>
        <Avatar onClick={goToProfile}>
          <AvatarImage src={post.user.profileImage} />
          <AvatarFallback>{post.user.name[0]}</AvatarFallback>
        </Avatar>

        <div>
          <div className='flex flex-row items-center gap-2' onClick={goToProfile}>
            <p className='text-white font-semibold cursor-pointer hover:underline'>{post.user.name}</p>
            <span className='text-neutral-500 cursor-pointer hover:underline hidden md:block'>
              {post.user.username ? `@${sliceText(post.user.username, 16)}` : sliceText(post.user.email, 16)}
            </span>
            <span className='text-neutral-500 text-sm'>{formatDistanceToNowStrict(new Date(post.createdAt))}</span>
          </div>

          <div className='text-white mt-1'>
            {parseMentions(post.body)}
          </div>

          <div className='flex flex-row items-center mt-3 gap-10'>
            <div className='flex flex-row items-center text-neutral-500 gap-2 cursor-pointer transition hover:text-orange-500'>
              <AiOutlineMessage size={20} />
              <p>{post.comments || 0}</p>
            </div>

            <div
              className={`flex flex-row items-center text-neutral-500 gap-2 cursor-pointer transition hover:text-red-500`}
              onClick={onLike}
              role='button'
            >
              <FaHeart size={20} color={post.hasLiked ? 'red' : ''} />
              <p>{post.likes || 0}</p>
            </div>

            {post.user._id === user._id && (
              <div
                className={`flex flex-row items-center text-neutral-500 gap-2 cursor-pointer transition hover:text-red-500`}
                onClick={onDelete}
                role='button'
              >
                <AiFillDelete size={20} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostItem
