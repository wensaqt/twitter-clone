'use client';

import React, { useCallback, useState, useEffect } from 'react'
import Modal from '../ui/modal'
import useLoginModal from '@/hooks/useLoginModal'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import Button from '../ui/button'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validation'
import useRegisterModal from '@/hooks/useRegisterModal'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { signIn } from 'next-auth/react'
import useAction from '@/hooks/use-action'
import { login } from '@/actions/auth.action'
import dynamic from 'next/dynamic'

const LottieAnimation = dynamic(() => import('lottie-react'), { ssr: false });

export default function LoginModal() {
	const { isLoading, onError, setIsLoading } = useAction()
	const [error, setError] = useState('')
	const [animationData, setAnimationData] = useState(null)

	const loginModal = useLoginModal()
	const registerModal = useRegisterModal()

	useEffect(() => {
		import('../../public/lotties/register_lottie.json')
			.then(data => setAnimationData(data.default))
			.catch(err => console.error("Erreur de chargement de l'animation:", err))
	}, [])

	const onToggle = useCallback(() => {
		loginModal.onClose()
		registerModal.onOpen()
	}, [loginModal, registerModal])

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: { password: '', email: '' },
	})

	async function onSubmit(values: z.infer<typeof loginSchema>) {
		setIsLoading(true)
		const res = await login(values)
		if (res?.serverError || res?.validationErrors || !res?.data) {
			setError('Quelque chose s\'est mal passé')
			return onError('Quelque chose s\'est mal passé')
		}
		if (res.data.failure) {
			setError(res.data.failure)
			return onError(res.data.failure)
		}
		if (res.data.status === 200) {
			signIn('credentials', values)
			loginModal.onClose()
			setIsLoading(false)
		}
	}

	const bodyContent = (
		<div className="flex flex-col md:flex-row w-full">
			
			<div className="w-full md:w-1/2 md:border-r md:border-neutral-800/30 px-6 py-4">
				<h2 className="text-xl font-medium text-white mb-6">Connexion</h2>
				
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
						{error && (
							<Alert variant='destructive' className="border border-red-500/20 bg-transparent text-red-400 text-sm p-3">
								<AlertCircle className='h-4 w-4' />
								<AlertDescription className="ml-2">{error}</AlertDescription>
							</Alert>
						)}
						
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input 
											placeholder='Email' 
											disabled={isLoading} 
											{...field} 
											className="border-neutral-800/50 focus:border-orange-500/50 h-10 text-sm bg-transparent rounded-md px-3" 
										/>
									</FormControl>
									<FormMessage className="text-red-400 text-xs mt-1" />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input 
											placeholder='Mot de passe' 
											disabled={isLoading} 
											type='password' 
											{...field} 
											className="border-neutral-800/50 focus:border-orange-500/50 h-10 text-sm bg-transparent rounded-md px-3" 
										/>
									</FormControl>
									<FormMessage className="text-red-400 text-xs mt-1" />
								</FormItem>
							)}
						/>
						
						<Button 
							label={'Se connecter'} 
							type='submit' 
							fullWidth 
							disabled={isLoading} 
							isLoading={isLoading} 
							className="bg-orange-500 hover:bg-orange-600 text-white font-normal text-sm rounded-md h-10 mt-2"
						/>
					</form>
				</Form>
			</div>
			
			
			<div className="hidden md:flex md:w-1/2 items-center justify-center">
				{animationData && (
					<LottieAnimation 
						animationData={animationData} 
						loop={true} 
						autoplay={true}
						style={{ width: '100%', height: '100%' }}
					/>
				)}
			</div>
		</div>
	)

	const footer = (
		<div className='text-neutral-500 text-center text-sm border-t border-neutral-800/30 pt-4 pb-2'>
			<p>
				Première fois sur Y ?
				<span className='text-orange-500 cursor-pointer hover:underline ml-2' onClick={onToggle}>
					Créer un compte
				</span>
			</p>
		</div>
	)

	return (
		<Modal 
			isOpen={loginModal.isOpen} 
			onClose={loginModal.onClose} 
			body={bodyContent} 
			footer={footer}
			className="max-w-3xl border border-neutral-800/30 bg-neutral-900 rounded-lg shadow-xl"
		/>
	)
}