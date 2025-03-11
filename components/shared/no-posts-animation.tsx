'use client'

import React from 'react'
import Lottie from 'lottie-react'
import noPostsAnimation from '../../public/lotties/no_tweets.json'

interface NoPostsAnimationProps {
  message?: string;
  size?: string;
}

const NoPostsAnimation = ({ 
  message = "Aucun post pour le moment", 
  size = "w-48 h-48" 
}: NoPostsAnimationProps) => {
  return (
    <div className='flex flex-col items-center justify-center py-6 space-y-2'>
      <div className={size}>
        <Lottie 
          animationData={noPostsAnimation} 
          loop={true}
          autoplay={true}
        />
      </div>
      <p className='text-neutral-400 text-center text-lg font-medium'>{message}</p>
      <p className='text-neutral-500 text-center text-sm'>Soyez le premier à partager quelque chose !</p>
    </div>
  )
}

export default NoPostsAnimation