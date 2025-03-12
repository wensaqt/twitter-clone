'use client'

import { Bell, Home, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import SidebarItem from './sidebar-item'
import SidebarPostButton from './sidebar-post-button'
import SidebarAccount from './sidebar-account'
import { IUser } from '@/types'
import { Search } from 'lucide-react'

const Sidebar = ({ user }: { user: IUser }) => {
	const sidebarItems = [
		{ label: 'Accueil', path: '/', icon: Home },
		{ label: 'Notifications', path: `/notifications/${user?._id}`, icon: Bell, notification: user?.hasNewNotifications },
		{ label: 'Profil', path: `/profile/${user?._id}`, icon: User },
		{ label: 'Explorer', path: '/explore', icon: Search },
	]

	return (
		<section className='sticky left-0 top-0 h-screen lg:w-[266px] w-fit flex flex-col justify-between py-4 pl-2'>
			<div className='flex flex-col space-y-2'>
				<div className='rounded-full h-14 w-40 p-4 flex items-center justify-center hover:bg-orange-300 hover:bg-opacity-10 cursor-pointer transition'>
					<Link href={'/'}>
						<Image width={56} height={56} src={'/images/y.svg'} alt='logo' />
					</Link>
				</div>

				{sidebarItems.map(item => (
					<Link key={item.path} href={item.path}>
						<SidebarItem {...item} />
					</Link>
				))}

				<SidebarPostButton />
			</div>

			<SidebarAccount user={user} />
		</section>
	)
}

export default Sidebar
