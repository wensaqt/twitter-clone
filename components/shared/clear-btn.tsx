'use client'

import useAction from '@/hooks/use-action'
import Button from '../ui/button'
import { deleteNotifications } from '@/actions/user.action'
import { useSession } from 'next-auth/react'
import { toast } from '../ui/use-toast'
import { Trash2 } from 'lucide-react'

const ClearBtn = () => {
	const { isLoading, onError, setIsLoading } = useAction()
	const { data } = useSession()

	const onClear = async () => {
		setIsLoading(true)
		const res = await deleteNotifications({ id: data?.currentUser?._id! })
		if (res?.serverError || res?.validationErrors || !res?.data) {
			return onError('Quelque chose s\'est mal passé')
		}
		if (res.data.failure) {
			return onError(res.data.failure)
		}
		if (res.data.status === 200) {
			toast({ title: 'Success', description: 'Notifications nettoyées' })
			setIsLoading(false)
		}
	}

	return (
		<button
		onClick={onClear}
		disabled={isLoading}
		className={`
			relative flex items-center gap-1 
			px-2 py-1 
			rounded-md
			text-xs font-medium
			bg-transparent
			border border-orange-500
			text-orange-500
			hover:bg-orange-500 hover:text-white
			focus:outline-none 
			focus:ring-2 focus:ring-orange-500
			active:scale-95
			transition-all duration-200
			disabled:opacity-50 
			disabled:cursor-not-allowed
		`}
		>
		{isLoading ? (
			<div
			className="
				h-3 w-3 
				border border-orange-500 border-t-transparent
				rounded-full animate-spin
			"
			/>
		) : (
			<Trash2 size={14} />
		)}
		<span>{isLoading ? 'Suppression...' : 'Tout supprimer'}</span>
</button>

	  
	)
}

export default ClearBtn