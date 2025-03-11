'use client'

import { IUser } from '@/types'
import React, { useState } from 'react'
import Button from '../ui/button'
import { IoLocationSharp } from 'react-icons/io5'
import { BiCalendar } from 'react-icons/bi'
import { formatDistanceToNowStrict } from 'date-fns'
import EditModal from '../modals/edit-modal'
import useEditModal from '@/hooks/useEditModal'
import Modal from '../ui/modal'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import FollowUser from '../shared/follow-user'
import useAction from '@/hooks/use-action'
import { follow, getFollowUser, unfollow } from '@/actions/user.action'
import { useSession } from 'next-auth/react'

const ProfileBio = ({ user, userId }: { user: IUser; userId: string }) => {
	const { isLoading, setIsLoading, onError } = useAction()
	const [open, setOpen] = useState(false)
	const [following, setFollowing] = useState<IUser[]>([])
	const [followers, setFollowers] = useState<IUser[]>([])
	const [isFetching, setIsFetching] = useState(false)
	const [state, setState] = useState<'following' | 'followers'>('following')
	const editModal = useEditModal()

	const onFollow = async () => {
		setIsLoading(true)
		const res = await follow({ userId: user._id, currentUserId: userId })
		if (res?.serverError || res?.validationErrors || !res?.data) {
			return onError('Something went wrong')
		}
		if (res.data.failure) {
			return onError(res.data.failure)
		}
		if (res.data.status === 200) {
			setIsLoading(false)
		}
	}

	const onUnfollow = async () => {
		setIsLoading(true)
		const res = await unfollow({ userId: user._id, currentUserId: userId })
		if (res?.serverError || res?.validationErrors || !res?.data) {
			return onError('Something went wrong')
		}
		if (res.data.failure) {
			return onError(res.data.failure)
		}
		if (res.data.status === 200) {
			setIsLoading(false)
		}
	}

	const onFollowUser = async (userId: string, type: string) => {
		setIsFetching(true)
		const res = await getFollowUser({ userId, state: type })
		if (res?.serverError || res?.validationErrors || !res?.data) {
			return onError('Something went wrong')
		}
		if (res.data.failure) {
			return onError(res.data.failure)
		}
		if (res.data.status === 200) {
			setIsFetching(false)
			return res.data.users
		}
	}

	const openFollowModal = async () => {
		setOpen(true)
		const data = await onFollowUser(user._id, 'following')
		data && setFollowing(data)
	}

	const onFollowing = async () => {
		setState('following')

		if (following.length === 0) {
			const data = await onFollowUser(user._id, 'following')
			data && setFollowing(data)
		}
	}

	const onFollowers = async () => {
		setState('followers')

		if (followers.length === 0) {
			const data = await onFollowUser(user._id, 'followers')
			data && setFollowers(data)
		}
	}

	return (
		<>
			<EditModal user={user} />
			<div className='border-b-[1px] border-neutral-800 pb-6'>
				<div className='flex justify-end p-3'>
					{userId === user._id ? (
						<Button 
							label={'Editer profil'} 
							secondary 
							onClick={() => editModal.onOpen()} 
							classNames="hover:bg-orange-600 transition duration-300"
						/>
					) : user.isFollowing ? (
						<Button 
							label={'Ne plus suivre'} 
							outline 
							onClick={onUnfollow} 
							disabled={isLoading} 
							isLoading={isLoading}
							classNames="hover:border-orange-600 hover:text-orange-600 transition-colors duration-300" 
						/>
					) : (
						<Button 
							label={'Suivre'} 
							onClick={onFollow} 
							disabled={isLoading} 
							isLoading={isLoading}
							classNames="bg-orange-500 hover:bg-orange-600 transition duration-300" 
						/>
					)}
				</div>

				<div className='mt-8 px-6'>
					<div className='flex flex-col'>
						<p className='text-white text-2xl font-semibold tracking-tight'>{user.name}</p>
					</div>

					<p className='text-md text-neutral-400 mt-1'>{user.username ? `@${user.username}` : user.email}</p>

					<div className='flex flex-col mt-5'>
						<p className='text-white leading-relaxed'>{user.bio}</p>
						<div className='flex gap-5 items-center flex-wrap'>
							{user.location && (
								<div className='flex flex-row items-center gap-2 mt-4 text-orange-500'>
									<IoLocationSharp size={20} />
									<p className="font-medium">{user.location}</p>
								</div>
							)}
							<div className='flex flex-row items-center gap-2 mt-4 text-neutral-400'>
								<BiCalendar size={20} />
								<p>Inscrit il y a {formatDistanceToNowStrict(new Date(user.createdAt))}</p>
							</div>
						</div>

						<div className='flex flex-row items-center mt-6 gap-8'>
							<div 
								className='flex flex-row items-center gap-1 hover:underline cursor-pointer group' 
								onClick={openFollowModal}
							>
								<p className='text-white font-semibold'>{user.following}</p>
								<p className='text-neutral-400 group-hover:text-orange-500 transition-colors'>Abonnements</p>
							</div>

							<div 
								className='flex flex-row items-center gap-1 hover:underline cursor-pointer group' 
								onClick={openFollowModal}
							>
								<p className='text-white font-semibold'>{user.followers}</p>
								<p className='text-neutral-400 group-hover:text-orange-500 transition-colors'>Abonnés</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* FOLLOWING AND FOLLOWERS MODAL */}
			<Modal
				isOpen={open}
				onClose={() => setOpen(false)}
				body={
					<>
						<div className='flex flex-row w-full py-3 px-4 border-b border-neutral-800'>
							<div
								className={cn(
									'w-[50%] h-full flex justify-center items-center cursor-pointer font-semibold py-3 transition-all duration-200',
									state === 'following' 
										? 'border-b-[2px] border-orange-500 text-orange-500' 
										: 'hover:text-orange-400'
								)}
								onClick={onFollowing}
								role='button'
							>
								Abonnement
							</div>
							<div
								className={cn(
									'w-[50%] h-full flex justify-center items-center cursor-pointer font-semibold py-3 transition-all duration-200',
									state === 'followers' 
										? 'border-b-[2px] border-orange-500 text-orange-500' 
										: 'hover:text-orange-400'
								)}
								onClick={onFollowers}
								role='button'
							>
								Abonnés
							</div>
						</div>

						{isFetching ? (
							<div className='flex justify-center items-center h-24'>
								<Loader2 className='animate-spin text-orange-500' size={24} />
							</div>
						) : (
							<div className='flex flex-col space-y-4 p-2 max-h-96 overflow-y-auto'>
								{state === 'following' ? (
									following.length === 0 ? (
										<div className='text-neutral-500 text-center p-8 text-lg'>Aucun abonnement</div>
									) : (
										following.map(user => <FollowUser key={user._id} user={user} setFollowing={setFollowing} />)
									)
								) : followers.length === 0 ? (
									// eslint-disable-next-line react/no-unescaped-entities
									<div className='text-neutral-500 text-center p-8 text-lg'>Pas d'abonné</div>
								) : (
									followers.map(user => <FollowUser key={user._id} user={user} setFollowing={setFollowing} />)
								)}
							</div>
						)}
					</>
				}
			/>
		</>
	)
}

export default ProfileBio