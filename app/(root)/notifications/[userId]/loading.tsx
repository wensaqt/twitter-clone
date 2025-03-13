import Header from '@/components/shared/header'
import { Loader2 } from 'lucide-react'

const Loading = () => {
	return (
		<div className="max-w-screen-md mx-auto">
			<Header isBack label='Notifications' />
			<div className='flex flex-col justify-center items-center h-60 space-y-4'>
				<div className="relative">
					<div className="absolute -inset-4 rounded-full bg-orange-500/20 blur-lg animate-pulse"></div>
					<Loader2 className='animate-spin text-orange-500 h-10 w-10 relative' />
				</div>
				<p className='text-neutral-400 font-medium mt-2'>Chargement des notifications...</p>
			</div>
		</div>
	)
}

export default Loading