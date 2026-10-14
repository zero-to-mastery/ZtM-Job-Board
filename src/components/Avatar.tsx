import React, { useState } from 'react'

const defaultAvatarPath =
    'M9,11.75A1.25,1.25 0 0,0 7.75,13A1.25,1.25 0 0,0 9,14.25A1.25,1.25 0 0,0 10.25,13A1.25,1.25 0 0,0 9,11.75M15,11.75A1.25,1.25 0 0,0 13.75,13A1.25,1.25 0 0,0 15,14.25A1.25,1.25 0 0,0 16.25,13A1.25,1.25 0 0,0 15,11.75M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,11.71 4,11.42 4.05,11.14C6.41,10.09 8.28,8.16 9.26,5.77C11.07,8.33 14.05,10 17.42,10C18.2,10 18.95,9.91 19.67,9.74C19.88,10.45 20,11.21 20,12C20,16.41 16.41,20 12,20Z'

interface AvatarProps {
    src?: string | null
    alt: string
    size: number
    className: string
    // Added to className when the placeholder is shown
    fallbackClassName: string
}

// Profile photo, or a theme-aware placeholder when there is none or it fails to load
const Avatar = ({
    src,
    alt,
    size,
    className,
    fallbackClassName,
}: AvatarProps) => {
    const [failedImage, setFailedImage] = useState<string | null>(null)

    if (!src || failedImage === src) {
        return (
            <svg
                className={`${className} ${fallbackClassName}`}
                height={size}
                width={size}
                viewBox="0 0 24 24"
                // The name is always shown next to the avatar
                aria-hidden="true"
                focusable="false"
            >
                <path d={defaultAvatarPath} />
            </svg>
        )
    }

    return (
        <img
            className={className}
            height={size}
            width={size}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailedImage(src)}
        />
    )
}

export default Avatar
