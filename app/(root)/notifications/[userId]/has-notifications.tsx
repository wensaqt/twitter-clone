'use client'

import React, { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import Image from 'next/image'
import hasNotifAnimation from '../../../../public/lotties/has_notif.json'

interface HasNotificationsProps {
  notifications: any[]
}

const HasNotifications = ({ notifications }: HasNotificationsProps) => {
  const [showAnimation, setShowAnimation] = useState(true)
  
  // Afficher l'animation pendant 3 secondes, puis montrer les notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (showAnimation) {
    return (
      <div className='flex flex-col items-center justify-center p-6 space-y-4'>
        <div className='w-64 h-64'>
          <Lottie 
            animationData={hasNotifAnimation} 
            loop={false}
            autoplay={true}
          />
        </div>
        <p className='text-orange-500 text-center text-lg font-medium'>
          Vous avez {notifications.length} notification{notifications.length > 1 ? 's' : ''}
        </p>
      </div>
    )
  }
  
  // Après l'animation, afficher les notifications normalement
  return (
    <>
      {notifications.map((notification: any) => (
        <div 
          className='flex flex-row items-center p-6 gap-4 border-b-[1px] border-neutral-800 hover:bg-neutral-900/30 transition-colors' 
          key={notification._id}
        >
          <div className="relative">
            <Image alt='logo' src={'/images/y.svg'} width={32} height={32} />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <p className='text-white'>{notification.body}</p>
        </div>
      ))}
    </>
  )
}

export default HasNotifications