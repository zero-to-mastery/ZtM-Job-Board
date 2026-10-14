import React, { useState } from 'react'
import ContactLinks from './ContactLinks'
import { defaultAvatarPath } from '../util/avatar'

const Card = ({ user }: any) => {
    let { id, img, name, jobTitle, location } = user
    const [failedImage, setFailedImage] = useState<string | null>(null)
    const photoClassName =
        'photo relative br-100 bw2 b--solid custom--b--primary bg-center object-fit-cover'

    if (id) {
        return (
            <div
                id={`person-${id}`}
                className="card ma3 w5 tc br3 custom--shadow-2 custom--shadow-hover-8 custom--o-95 z-1"
            >
                <div className="header relative pt3 br2 br--top z-0">
                    {!img || failedImage === img ? (
                        <svg
                            className={`${photoClassName} photo--fallback`}
                            height="128px"
                            width="128px"
                            viewBox="0 0 24 24"
                            // The name is already in the heading below
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d={defaultAvatarPath} />
                        </svg>
                    ) : (
                        <img
                            className={photoClassName}
                            height="128px"
                            width="128px"
                            src={img}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            onError={() => setFailedImage(img)}
                        />
                    )}
                    <h2 className="name mt3 mb1 ph3 w-100 flex items-center justify-center">
                        {name}
                    </h2>
                    <p className="title text-center">{jobTitle}</p>
                </div>
                <div className="main pv2 ph3 flex items-center justify-center">
                    <ContactLinks person={user} />
                </div>
                <div style={{ margin: 0, padding: 0 }}>
                    <p className="footer items-center justify-center br2 br--bottom">
                        {[location.city, location.state, location.country]
                            .filter((info) => info && info.trim() !== '')
                            .join(', ')}
                    </p>
                </div>
            </div>
        )
    } else {
        return <div></div>
    }
}

export default Card
