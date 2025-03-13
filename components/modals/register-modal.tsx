'use client'

import useRegisterModal from '@/hooks/useRegisterModal'
import Modal from '../ui/modal'
import { Dispatch, SetStateAction, useCallback, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerStep1Schema, registerStep2Schema } from '@/lib/validation'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import Button from '../ui/button'
import useLoginModal from '@/hooks/useLoginModal'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, User, Mail, AtSign, Lock } from 'lucide-react'
import { signIn } from 'next-auth/react'
import useAction from '@/hooks/use-action'
import { register } from '@/actions/auth.action'
import dynamic from 'next/dynamic'

const LottieAnimation = dynamic(() => import('lottie-react'), { ssr: false });

export default function RegisterModal() {
	const [step, setStep] = useState(1)
	const [data, setData] = useState({ name: '', email: '' })
	const [animationData, setAnimationData] = useState<any>(null)

	const registerModal = useRegisterModal()
	const loginModal = useLoginModal()

	useEffect(() => {
		import('../../public/lotties/register_lottie.json')
			.then(data => setAnimationData(data.default))
			.catch(err => console.error("Erreur de chargement de l'animation:", err))
	}, [])

	const onToggle = useCallback(() => {
		registerModal.onClose()
		loginModal.onOpen()
	}, [loginModal, registerModal])

	const bodyContent = (
		<div className="flex flex-col md:flex-row w-full">
			<div className="w-full md:w-1/2 md:border-r md:border-neutral-800/30 px-6 py-4">
				<h2 className="text-xl font-medium text-white mb-6">
					{step === 1 ? 'Créer un compte' : 'Finaliser l\'inscription'}
				</h2>
				
				{step === 1 ? 
					<RegisterStep1 setData={setData} setStep={setStep} /> : 
					<RegisterStep2 data={data} />
				}
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
				Déjà inscrit ?{' '}
				<span className='text-orange-500 cursor-pointer hover:underline' onClick={onToggle}>
					Se connecter
				</span>
			</p>
		</div>
	)

	return (
		<div className="max-w-3xl border border-neutral-800/30 bg-neutral-900 rounded-lg shadow-xl"
		>
			<Modal
				body={bodyContent}
				footer={footer}
				isOpen={registerModal.isOpen}
				onClose={registerModal.onClose}
				step={step}
				totalSteps={2}
			/>
		</div>
	)
}

function RegisterStep1({
	setData,
	setStep,
}: {
	setData: Dispatch<SetStateAction<{ name: string; email: string }>>
	setStep: Dispatch<SetStateAction<number>>
}) {
	const { isLoading, onError, setIsLoading } = useAction()
	const [error, setError] = useState('')

	const form = useForm<z.infer<typeof registerStep1Schema>>({
		resolver: zodResolver(registerStep1Schema),
		defaultValues: { email: '', name: '' },
	})

	async function onSubmit(values: z.infer<typeof registerStep1Schema>) {
		setIsLoading(true)
		const res = await register({ email: values.email, name: values.name, step: 1 })
		if (res?.serverError || res?.validationErrors || !res?.data) {
			setError('Quelque chose s\'est mal passé')
			return onError('Quelque chose s\'est mal passé')
		}
		if (res.data.failure) {
			setError(res.data.failure)
			return onError(res.data.failure)
		}
		if (res.data.status === 200) {
			setData(values)
			setStep(2)
			setIsLoading(false)
		}
	}

	return (
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
					name='name'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="relative">
									<User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
									<Input 
										placeholder='Nom' 
										disabled={isLoading} 
										{...field} 
										className="border-neutral-800/50 focus:border-orange-500/50 h-10 text-sm bg-transparent rounded-md pl-10" 
									/>
								</div>
							</FormControl>
							<FormMessage className="text-red-400 text-xs mt-1" />
						</FormItem>
					)}
				/>
				
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="relative">
									<Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
									<Input 
										placeholder='Email' 
										disabled={isLoading} 
										type='email' 
										{...field} 
										className="border-neutral-800/50 focus:border-orange-500/50 h-10 text-sm bg-transparent rounded-md pl-10" 
									/>
								</div>
							</FormControl>
							<FormMessage className="text-red-400 text-xs mt-1" />
						</FormItem>
					)}
				/>
				
				<Button 
					label={'Suivant'} 
					type='submit' 
					fullWidth 
					disabled={isLoading} 
					isLoading={isLoading} 
					classNames="bg-orange-500 hover:bg-orange-600 text-white font-normal text-sm rounded-md h-10 mt-2"
				/>
			</form>
		</Form>
	)
}

function RegisterStep2({ data }: { data: { name: string; email: string } }) {
	const { isLoading, onError, setIsLoading } = useAction()
	const [error, setError] = useState('')
	const registerModal = useRegisterModal()

	const form = useForm<z.infer<typeof registerStep2Schema>>({
		resolver: zodResolver(registerStep2Schema),
		defaultValues: { password: '', username: '' },
	})

	async function onSubmit(values: z.infer<typeof registerStep2Schema>) {
		setIsLoading(true)
		const res = await register({
			email: data.email,
			name: data.name,
			step: 2,
			username: values.username,
			password: values.password,
		})
		if (res?.serverError || res?.validationErrors || !res?.data) {
			setError('Quelque chose s\'est mal passé')
			return onError('Quelque chose s\'est mal passé')
		}
		if (res.data.failure) {
			setError(res.data.failure)
			return onError(res.data.failure)
		}
		if (res.data.status === 200) {
			signIn('credentials', {
				email: data.email,
				password: values.password,
			})
			registerModal.onClose()
			setIsLoading(false)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				{error && (
					<Alert variant='destructive' className="border border-red-500/20 bg-transparent text-red-400 text-sm p-3">
						<AlertCircle className='h-4 w-4' />
						<AlertDescription className="ml-2">{error}</AlertDescription>
					</Alert>
				)}
				
				<div className="bg-neutral-800/20 rounded-md p-3 mb-2">
					<p className="text-sm text-neutral-400">
						Compte pour <span className="text-white">{data.name}</span>
					</p>
					<p className="text-xs text-neutral-500 mt-1">{data.email}</p>
				</div>
				
				<FormField
					control={form.control}
					name='username'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<div className="relative">
									<AtSign className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
									<Input 
										placeholder="Nom d'utilisateur" 
										disabled={isLoading} 
										{...field} 
										className="border-neutral-800/50 focus:border-orange-500/50 h-10 text-sm bg-transparent rounded-md pl-10" 
									/>
								</div>
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
								<div className="relative">
									<Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
									<Input 
										placeholder='Mot de passe' 
										type='password' 
										disabled={isLoading} 
										{...field} 
										className="border-neutral-800/50 focus:border-orange-500/50 h-10 text-sm bg-transparent rounded-md pl-10" 
									/>
								</div>
							</FormControl>
							<FormMessage className="text-red-400 text-xs mt-1" />
						</FormItem>
					)}
				/>
				
				<Button 
					label={'Terminer l\'inscription'} 
					type='submit' 
					fullWidth 
					disabled={isLoading} 
					isLoading={isLoading} 
					classNames="bg-orange-500 hover:bg-orange-600 text-white font-normal text-sm rounded-md h-10 mt-2"
				/>
			</form>
		</Form>
	)
}