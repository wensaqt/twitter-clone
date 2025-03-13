'use client'

import { IUser } from '@/types'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import Button from '../ui/button'
import { toast } from '../ui/use-toast'
import { createPost } from '@/actions/post.action'
import useAction from '@/hooks/use-action'
import { createComment } from '@/actions/comment.action'
import { useParams } from 'next/navigation'
import { getUsers } from '@/actions/user.action'  

interface Props {
  placeholder: string
  user: IUser
  postId?: string
  isComment?: boolean
}

const Form = ({ placeholder, user, isComment }: Props) => {
  const { isLoading, setIsLoading, onError } = useAction()
  const [body, setBody] = useState('')
  const [suggestions, setSuggestions] = useState<IUser[]>([])
  const [isMentioning, setIsMentioning] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const { postId } = useParams<{ postId: string }>()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers({ page: 1, pageSize: 10, searchQuery: mentionQuery })
        setSuggestions(res?.data?.users || [])
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error)
      }
    }

    if (mentionQuery) {
      fetchUsers()
    }
  }, [mentionQuery])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setBody(value)

    const atIndex = value.lastIndexOf('@')
    if (atIndex !== -1) {
      setIsMentioning(true)
      const query = value.slice(atIndex + 1) 
      setMentionQuery(query)
    } else {
      setIsMentioning(false)
      setMentionQuery('')
    }
  }

  const onSubmit = async () => {
    setIsLoading(true)
    let res
    if (isComment) {
      res = await createComment({ body, id: postId })
    } else {
      res = await createPost({ body })
    }
    if (res?.serverError || res?.validationErrors || !res?.data) {
      return onError('Something went wrong')
    }
    if (res.data.failure) {
      return onError(res.data.failure)
    }
    if (res.data.status === 200) {
      toast({ title: 'Success', description: 'Tweet créé avec succèes' })
      setBody('')
    }
    setIsLoading(false)
  }

  const handleMentionSelect = (user: IUser) => {
    const atIndex = body.lastIndexOf('@')
    const newBody = body.slice(0, atIndex) + '@' + user.username + ' '  
    setBody(newBody)
    setIsMentioning(false)
    setMentionQuery('')
  }

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
            onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
          ></textarea>
          <hr className='opacity-0 peer-focus:opacity-100 h-[1px] w-full border-neutral-800 transition' />

          {isMentioning && mentionQuery && suggestions.length > 0 && (
            <div className='absolute mt-2 w-full bg-black rounded-lg shadow-lg'>
              {suggestions.map(user => (
                <div
                  key={user._id}
                  className='p-2 cursor-pointer hover:bg-neutral-800'
                  onClick={() => handleMentionSelect(user)}
                >
                  <div className='flex items-center gap-2'>
                    <Avatar>
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className='text-white'>{user.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className='mt-4 flex flex-row justify-end'>
            <Button
              label={isComment ? 'Répondre' : 'Poster'}
              classNames='px-8'
              disabled={isLoading || !body}
              onClick={onSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Form
