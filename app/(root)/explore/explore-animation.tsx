'use client'

import React from 'react'
import Lottie from 'lottie-react'
import exploreAnimation from '../../../public/lotties/explore_search.json'

interface ExploreAnimationProps {
  message?: string;
  size?: string;
}

const ExploreAnimation = ({ 
  message = "Recherchez des utilisateurs", 
  size = "w-64 h-64" 
}: ExploreAnimationProps) => {
  return (
    <div className='flex flex-col items-center justify-center py-10 space-y-4'>
      <div className={size}>
        <Lottie 
          animationData={exploreAnimation} 
          loop={true}
          autoplay={true}
        />
      </div>
      <p className='text-neutral-400 text-center text-lg font-medium'>{message}</p>
    </div>
  )
}

export default ExploreAnimation