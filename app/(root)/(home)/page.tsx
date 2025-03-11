import { getPosts } from '@/actions/post.action'
import Form from '@/components/shared/form'
import Header from '@/components/shared/header'
import Pagination from '@/components/shared/pagination'
import PostItem from '@/components/shared/post-item'
import { authOptions } from '@/lib/auth-options'
import { IPost, SearchParams } from '@/types'
import { getServerSession } from 'next-auth'
import dynamic from 'next/dynamic'

const NoPostsAnimation = dynamic(() => import('../../../components/shared/no-posts-animation'), { ssr: false })

interface Props {
	searchParams: SearchParams
}
export default async function Page({ searchParams }: Props) {
	const session = await getServerSession(authOptions)

	const res = await getPosts({
		page: parseInt(`${searchParams.page}`) || 1,
	})

	const posts = res?.data?.posts
	const isNext = res?.data?.isNext || false
	const user = JSON.parse(JSON.stringify(session?.currentUser))

	return (
		<div className="max-w-screen-md mx-auto">
			<Header label='Accueil' />
			
			<div className="bg-neutral-900/50 rounded-xl mb-4 p-4 shadow-sm border border-neutral-800 hover:border-neutral-700 transition-colors">
				<Form placeholder="A quoi pensez-vous ?" user={user} />
			</div>
			
			<div className="space-y-4 mb-6">
				{posts && posts.length > 0 ? (
					<>
						{posts.map(post => (
							<div key={post._id} className="bg-neutral-900/30 rounded-xl shadow-sm border border-neutral-800 hover:border-neutral-700 transition-all duration-200 hover:shadow-md">
								<PostItem post={post} user={user} />
							</div>
						))}
					</>
				) : (
					<div className="bg-neutral-900/30 rounded-xl p-8 text-center border border-neutral-800">
						<p className="text-neutral-400 text-lg mb-4">Aucun post pour le moment</p>
						<p className="text-sm text-neutral-500">Soyez le premier à partager quelque chose !</p>
					</div>
				)}
			</div>
			
			<div className="py-4">
				<Pagination isNext={isNext} pageNumber={searchParams?.page ? +searchParams.page : 1} />
			</div>
		</div>
	)
}