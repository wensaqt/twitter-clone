import Header from '@/components/shared/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { sliceText } from '@/lib/utils'
import { SearchParams } from '@/types'
import Link from 'next/link'
import { FC } from 'react'
import SearchInput from '@/components/shared/search-input'
import { getUsers } from '@/actions/user.action'
import Pagination from '@/components/shared/pagination'
import dynamic from 'next/dynamic'

// Import dynamique du composant d'animation
const ExploreAnimation = dynamic(() => import('./explore-animation'), { ssr: false })

interface Props {
	searchParams: SearchParams
}

const Page: FC<Props> = async ({ searchParams }) => {
	const res = await getUsers({
		page: parseInt(`${searchParams.page}`) || 1,
		pageSize: parseInt(`${searchParams.pageSize}`) || 0,
		searchQuery: `${searchParams.q || ''}`,
	})

	const users = res?.data?.users
	const isNext = res?.data?.isNext || false
	const hasSearchQuery = searchParams.q && searchParams.q.length > 0

	return (
		<div className="pb-10">
			<Header label='Explorer' />
			
			<div className="px-2 mb-6">
				<SearchInput />
			</div>

			{users && users.length === 0 ? (
				<ExploreAnimation 
					message={hasSearchQuery ? "Aucun utilisateur trouvé" : "Recherchez des utilisateurs"} 
				/>
			) : (
				<>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-1'>
						{users &&
							users.map(user => (
								<Link key={user._id} href={`/profile/${user._id}`}>
									<div className='border-[1px] border-neutral-800 rounded-lg p-5 m-2 cursor-pointer hover:bg-neutral-900/50 transition-all duration-200 hover:border-orange-500/30 hover:shadow-md'>
										<div className='flex flex-row gap-4 items-center'>
											<Avatar className="border border-neutral-700 h-12 w-12">
												<AvatarImage src={user.profileImage} />
												<AvatarFallback className="bg-orange-500/10 text-orange-500">{user.name[0]}</AvatarFallback>
											</Avatar>

											<div className='flex flex-col'>
												<p className='text-white font-semibold cursor-pointer capitalize'>{user.name}</p>

												<span className='text-neutral-400 cursor-pointer md:block text-sm'>
													{user.username ? `@${sliceText(user.username, 16)}` : sliceText(user.email, 16)}
												</span>
											</div>
											
											<div className="ml-auto">
												<div className="rounded-full py-1 px-3 text-xs border border-orange-500/30 text-orange-500 hover:bg-orange-500/10 transition-colors">
													Voir
												</div>
											</div>
										</div>
									</div>
								</Link>
							))}
					</div>
					<div className="mt-6">
						<Pagination isNext={isNext} pageNumber={searchParams?.page ? +searchParams.page : 1} />
					</div>
				</>
			)}
		</div>
	)
}

export default Page