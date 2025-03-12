'use client';

import { IUser } from '@/types'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useInView } from 'react-intersection-observer';

const ProfileHero = ({ user }: { user: IUser }) => {
	const [isRiveLoaded, setIsRiveLoaded] = useState(false);
	
	const { ref: avatarRef, inView } = useInView({
		threshold: 0.1,
		triggerOnce: false
	});
	
	
	const { RiveComponent, rive } = useRive({
		src: '/avatar.riv', 
		stateMachines: 'avatar', 
		autoplay: true,
		onLoad: () => setIsRiveLoaded(true)
	});
	
	const isHappyInput = useStateMachineInput(rive, 'avatar', 'isHappy');
	const isSadInput = useStateMachineInput(rive, 'avatar', 'isSad');
	
	useEffect(() => {
		if (rive) {
			if (inView) {
				rive.play();
			} else {
				rive.pause();
			}
		}
	}, [inView, rive]);
	
	useEffect(() => {
		if (!inView || !isRiveLoaded || !isHappyInput || !isSadInput) return;
		
		const interval = setInterval(() => {
			const random = Math.random();
			if (random > 0.7) {
				isHappyInput.value = true;
				isSadInput.value = false;
			} else if (random > 0.4) {
				isHappyInput.value = false;
				isSadInput.value = true;
			} else {
				isHappyInput.value = false;
				isSadInput.value = false;
			}
		}, 3000);
		
		return () => clearInterval(interval);
	}, [inView, isRiveLoaded, isHappyInput, isSadInput]);

	return (
		<div className='h-44 relative bg-neutral-800'>
			{user.coverImage ? (
				<Image fill src={user.coverImage} alt={user.name} style={{ objectFit: 'cover' }} priority />
			) : (
				<Image fill src={'/images/cover-placeholder.png'} alt={user.name} style={{ objectFit: 'cover' }} priority />
			)}

			<div className='absolute -bottom-16 left-4' ref={avatarRef}>
				<div className='w-32 h-32 rounded-full bg-neutral-900 border-4 border-neutral-900 shadow-lg overflow-hidden relative'>
					{user.profileImage ? (
						<Avatar className='w-32 h-32'>
							<AvatarImage src={user.profileImage} />
							<AvatarFallback className='text-7xl'>{user.name[0]}</AvatarFallback>
						</Avatar>
					) : (
						<RiveComponent
							 className='w-full h-full'
						/>
					)}
				</div>
			</div>
		</div>
	)
}

export default ProfileHero