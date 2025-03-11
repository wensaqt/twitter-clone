import { IUser } from '@/types'
import Image from 'next/image'
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const ProfileHero = ({ user }: { user: IUser }) => {
	return (
		<div className='h-48 relative bg-neutral-800 rounded-b-md overflow-hidden'>
			{user.coverImage ? (
				<Image 
					fill 
					src={user.coverImage} 
					alt={user.name} 
					style={{ objectFit: 'cover' }} 
					className="transition duration-200 hover:opacity-95"
				/>
			) : (
				<Image 
					fill 
					src={'/images/cover-placeholder.png'} 
					alt={user.name} 
					style={{ objectFit: 'cover' }} 
					className="transition duration-200 hover:opacity-95"
				/>
			)}

			<div className='absolute -bottom-16 left-6'>
				<Avatar className='w-32 h-32 border-4 border-neutral-900 shadow-md'>
					<AvatarImage 
						src={user.profileImage} 
						className="hover:opacity-95 transition duration-200"
					/>
					<AvatarFallback className='text-7xl bg-orange-500/10 text-orange-500'>
						{user.name[0]}
					</AvatarFallback>
				</Avatar>
			</div>
		</div>
	)
}

export default ProfileHero