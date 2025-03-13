import Header from '@/components/shared/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { sliceText } from '@/lib/utils'
import { SearchParams } from '@/types'
import Link from 'next/link'
import { FC } from 'react'
import SearchInput from '@/components/shared/search-input'
import { getUsers } from '@/actions/user.action'
import { getPosts } from '@/actions/post.action'
import Pagination from '@/components/shared/pagination'
import dynamic from 'next/dynamic'

// Import dynamique du composant d'animation
const ExploreAnimation = dynamic(() => import('./explore-animation'), { ssr: false })

interface Props {
  searchParams: SearchParams
}

const Page: FC<Props> = async ({ searchParams }) => {
  const searchQuery = `${searchParams.q || ''}`
  const page = parseInt(`${searchParams.page}`) || 1
  const pageSize = parseInt(`${searchParams.pageSize}`) || 10

  const [userRes, postRes] = await Promise.all([
    getUsers({ page, pageSize, searchQuery }),
    getPosts({ page, pageSize, searchQuery }),
  ])

  const users = userRes?.data?.users
  const posts = postRes?.data?.posts
  const isNext = userRes?.data?.isNext || false

  return (
    <>
      <Header label='Explorer' />
      <SearchInput />

      <>
        {users && users.length === 0 && posts && posts.length === 0 && (
          <div className='text-neutral-600 text-center p-6 text-xl'>Aucun résultat trouvé</div>
        )}

        {users && users.length > 0 && (
          <div className='grid grid-cols-1 lg:grid-cols-2 mt-6'>
            {users.map((user) => (
              <Link key={user._id} href={`/profile/${user._id}`}>
                <div className='border-b-[1px] border-neutral-800 p-5 cursor-pointer hover:bg-neutral-900 transition relative mr-4'>
                  <div className='flex flex-row gap-4'>
                    <Avatar>
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className='flex flex-col'>
                      <p className='text-white font-semibold cursor-pointer capitalize'>{user.name}</p>

                      <span className='text-neutral-500 cursor-pointer md:block'>
                        {user.username ? `@${sliceText(user.username, 16)}` : sliceText(user.email, 16)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className='grid grid-cols-1 mt-6'>
            {posts.map((post) => (
              <Link key={post._id} href={`/post/${post._id}`}>
                <div className='border-b-[1px] border-neutral-800 p-5 cursor-pointer hover:bg-neutral-900 transition relative'>
                  <div className='flex flex-row gap-4'>
                    <Avatar>
                      <AvatarImage src={post.user.profileImage} />
                      <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className='flex flex-col'>
                      <p className='text-white font-semibold cursor-pointer capitalize'>{post.user.name}</p>

                      <span className='text-neutral-500 cursor-pointer md:block'>
                        {sliceText(post.body, 50)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination isNext={isNext} pageNumber={page} />
      </>
    </>
  )
}

export default Page