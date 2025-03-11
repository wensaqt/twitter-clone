'use client'

import React from 'react'
import Lottie from 'lottie-react'
import noNotifAnimation from '../../../../public/lotties/no_notif.json'

const NoNotifications = () => {
  return (
    <div className='flex flex-col items-center justify-center p-10 space-y-4'>
      <div className='w-64 h-64'>
        <Lottie 
          animationData={noNotifAnimation} 
          loop={true}
          autoplay={true}
        />
      </div>
      <p className='text-neutral-500 text-center text-lg'>Pas de notification</p>
    </div>
  )
}

export default NoNotifications