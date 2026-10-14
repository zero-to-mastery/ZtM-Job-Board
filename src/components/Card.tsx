import React from 'react'
import ContactLinks from './ContactLinks'
import { addDefaultImg, defaultImageDataURI } from '../util/avatar'

const Card = ({ user }: any) => {
    let { id, img, name, jobTitle, location } = user

    if (id) {
        return (
            <div
                id={`person-${id}`}
                className="card ma3 w5 tc bg-white br3 custom--shadow-2 custom--shadow-hover-8 custom--o-95 z-1"
            >
                <div className="header relative pt3 br2 br--top z-0">
                    <img
                        className="photo relative br-100 bw2 b--solid custom--b--primary bg-center object-fit-cover"
                        height="128px"
                        width="128px"
                        src={img || defaultImageDataURI}
                        alt={name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => addDefaultImg(e)}
                    />
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
