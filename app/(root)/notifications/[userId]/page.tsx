import { getNotifications } from '@/actions/user.action'
import ClearBtn from '@/components/shared/clear-btn'
import Header from '@/components/shared/header'
import { IPost } from '@/types'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Import dynamique des composants client avec les animations Lottie
const NoNotifications = dynamic(() => import('./no-notifications'), { ssr: false })
const HasNotifications = dynamic(() => import('./has-notifications'), { ssr: false })

const Page = async ({ params }: { params: { userId: string } }) => {
	const res = await getNotifications({ postId: params.userId })
	const notifications = res?.data?.notifications

	return (
		<div className="max-w-screen-md mx-auto">
			<div className='flex items-center justify-between mb-4'>
				<Header isBack label='Notifications' />
				{notifications && notifications?.length > 0 && (
					<div className='w-1/4'>
						<ClearBtn />
					</div>
				)}
			</div>
			
			<div className='flex flex-col'>
				{notifications && notifications.length > 0 ? (
					<HasNotifications notifications={notifications} />
				) : (
					<NoNotifications />
				)}
			</div>
		</div>
	)
}

export default Page