'use client'

import { IUser } from '@/types'
import { signOut, useSession } from 'next-auth/react'
import React from 'react'
import { RiLogoutCircleLine } from 'react-icons/ri'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Loader2, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface Props {
	user: IUser
}

const SidebarAccount = ({ user }: Props) => {
	const { data, status } = useSession()

	if (status == 'loading')
		return (
			<div className='flex items-center justify-center'>
				<Loader2 className='animate-spin text-orange-500' />
			</div>
		)

	return (
		<>
			{/* MOBIE SIDEBAR ACCOUNT */}
			<div className='lg:hidden block'>
			<div
				className="
					mt-6 lg:hidden 
					rounded-full 
					h-12 w-12 
					flex items-center justify-center
					bg-orange-500
					hover:bg-orange-600
					transition
					cursor-pointer
					focus:outline-none focus:ring-2 focus:ring-orange-600
					active:scale-95
				"
				onClick={() => signOut()}
				>
				<RiLogoutCircleLine size={20} color="white" />
				</div>

			</div>

			{/* DESKTOP SIDEBAR ACCOUNT */}
			<Popover>
				<PopoverTrigger className='w-full rounded-full hover:bg-slate-300 hidden lg:block cursor-pointer hover:bg-opacity-10 px-4 py-2 transition'>
					<div className='flex justify-between items-center gap-2'>
						<div className='flex gap-2 items-center'>
							<Avatar>
								<AvatarImage src={data?.currentUser?.profileImage} />
								<AvatarFallback>{data?.currentUser?.name[0]}</AvatarFallback>
							</Avatar>
							<div className='flex flex-col items-start text-white'>
								<p>{data?.currentUser?.name}</p>
								{data?.currentUser?.username ? (
									<p className='opacity-40'>@{data?.currentUser?.username}</p>
								) : (
									<p className='opacity-40'>Manage account</p>
								)}
							</div>
						</div>
						<MoreHorizontal size={24} color='white' />
					</div>
				</PopoverTrigger>
				<PopoverContent
				className="
					bg-[#1c1c1c]
					border border-slate-700
					rounded-lg
					shadow-md shadow-black
					p-2
					animate-in data-[side=top]:slide-in-from-top-2
					data-[side=bottom]:slide-in-from-bottom-2
				"
				>
				<div
					className="
					flex items-center gap-2
					p-2
					text-sm font-medium 
					text-white
					cursor-pointer
					hover:bg-slate-300 hover:bg-opacity-10 
					rounded-md
					transition
					"
					onClick={() => signOut()}
				>
					<RiLogoutCircleLine size={16} />
					<span>
					Déconnecter&nbsp;
					{data?.currentUser?.username
						? `@${data?.currentUser?.username}`
						: data?.currentUser?.name}
					</span>
				</div>
			</PopoverContent>

			</Popover>
		</>
	)
}

export default SidebarAccount
