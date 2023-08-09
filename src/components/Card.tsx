import React from 'react'
import LazyLoad from 'react-lazyload'

const defaultImageDataURI =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='000000' fill-opacity='0.25' viewBox='0 0 24 24'%3E %3Cpath d='M9,11.75A1.25,1.25 0 0,0 7.75,13A1.25,1.25 0 0,0 9,14.25A1.25,1.25 0 0,0 10.25,13A1.25,1.25 0 0,0 9,11.75M15,11.75A1.25,1.25 0 0,0 13.75,13A1.25,1.25 0 0,0 15,14.25A1.25,1.25 0 0,0 16.25,13A1.25,1.25 0 0,0 15,11.75M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,11.71 4,11.42 4.05,11.14C6.41,10.09 8.28,8.16 9.26,5.77C11.07,8.33 14.05,10 17.42,10C18.2,10 18.95,9.91 19.67,9.74C19.88,10.45 20,11.21 20,12C20,16.41 16.41,20 12,20Z' /%3E %3C/svg%3E"

const addDefaultImg = (e: any) => {
    // prevent infinite callbacks if 404 image fails
    e.target.onError = null
    e.target.src = defaultImageDataURI
}
const Card = ({ user }: any) => {
    let { id, img, name, email, jobTitle, location, links } = user

    if (id) {
        return (
            <div
                id={`person-${id}`}
                className="card ma4 w5 tc bg-white br2 custom--shadow-2 custom--shadow-hover-8 custom--o-95 z-1"
            >
                <div className="header relative pt3 br2 br--top z-0">
                    <LazyLoad
                        throttle={200}
                        height={128}
                        offset={100}
                        once={true}
                    >
                        <img
                            className="photo relative br-100 bw2 b--solid custom--b--primary bg-center object-fit-cover"
                            height="128px"
                            width="128px"
                            src={img || defaultImageDataURI}
                            alt={name}
                            loading="lazy"
                            onError={(e) => addDefaultImg(e)}
                        />
                    </LazyLoad>
                    <h2 className="name mt3 mb1 ph3 w-100 flex items-center justify-center">
                        {name}
                    </h2>
                    <p className="title text-center">{jobTitle}</p>
                </div>
                <div className="main pv2 ph3 flex items-center justify-center">
                    {/* adding email button  */}
                    {email === '' ? (
                        ''
                    ) : (
                        <a
                            href={'mailto:' + email}
                            className="w2 h2 ma2"
                            title="email"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                            </svg>
                        </a>
                    )}
                    {links.website === '' ? (
                        ''
                    ) : (
                        <a
                            href={links.website}
                            className="w2 h2 ma2"
                            title="Website/Portfolio"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg className="w2 h2" viewBox="0 0 24 24">
                                <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                            </svg>
                        </a>
                    )}
                    {links.github === '' ? (
                        ''
                    ) : (
                        <a
                            href={links.github}
                            className="w2 h2 ma2"
                            title="GitHub profile"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg className="w2 h2" viewBox="0 0 24 24">
                                <path d="M20.38,8.53C20.54,8.13 21.06,6.54 20.21,4.39C20.21,4.39 18.9,4 15.91,6C14.66,5.67 13.33,5.62 12,5.62C10.68,5.62 9.34,5.67 8.09,6C5.1,3.97 3.79,4.39 3.79,4.39C2.94,6.54 3.46,8.13 3.63,8.53C2.61,9.62 2,11 2,12.72C2,19.16 6.16,20.61 12,20.61C17.79,20.61 22,19.16 22,12.72C22,11 21.39,9.62 20.38,8.53M12,19.38C7.88,19.38 4.53,19.19 4.53,15.19C4.53,14.24 5,13.34 5.8,12.61C7.14,11.38 9.43,12.03 12,12.03C14.59,12.03 16.85,11.38 18.2,12.61C19,13.34 19.5,14.23 19.5,15.19C19.5,19.18 16.13,19.38 12,19.38M8.86,13.12C8.04,13.12 7.36,14.12 7.36,15.34C7.36,16.57 8.04,17.58 8.86,17.58C9.69,17.58 10.36,16.58 10.36,15.34C10.36,14.11 9.69,13.12 8.86,13.12M15.14,13.12C14.31,13.12 13.64,14.11 13.64,15.34C13.64,16.58 14.31,17.58 15.14,17.58C15.96,17.58 16.64,16.58 16.64,15.34C16.64,14.11 16,13.12 15.14,13.12Z" />
                            </svg>
                        </a>
                    )}
                    {links.linkedin === '' ? (
                        ''
                    ) : (
                        <a
                            href={links.linkedin}
                            className="w2 h2 ma2"
                            title="LinkedIn profile"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <svg className="w2 h2" viewBox="0 0 24 24">
                                <path d="M21,21H17V14.25C17,13.19 15.81,12.31 14.75,12.31C13.69,12.31 13,13.19 13,14.25V21H9V9H13V11C13.66,9.93 15.36,9.24 16.5,9.24C19,9.24 21,11.28 21,13.75V21M7,21H3V9H7V21M5,3A2,2 0 0,1 7,5A2,2 0 0,1 5,7A2,2 0 0,1 3,5A2,2 0 0,1 5,3Z" />
                            </svg>
                        </a>
                    )}
                </div>
                <div style={{ margin: 0, padding: 0 }}>
                    <p className="footer items-center justify-center br2 br--bottom">
                        {location.city === '' ? '' : location.city}
                        {(location.city !== '' && location.state !== '') ||
                        (location.city !== '' && location.country !== '')
                            ? ', '
                            : ''}
                        {location.state === '' ? '' : location.state}
                        {(location.city !== '' && location.state !== '') ||
                        (location.state !== '' && location.country !== '')
                            ? ', '
                            : ''}
                        {location.country === '' ? '' : location.country}
                    </p>
                </div>
            </div>
        )
    } else {
        return <div></div>
    }
}

export default Card
