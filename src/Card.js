import React from 'react';

const Card = ({key, user}) => {

    let {id, img, name, jobTitle, location, links, deprecated_id, deprecated_website, deprecated_location} = user;
    let cardClassNames = 'tc bg-white grow w5  br3 pa3 ma4  bw2 shadow-5';
    let imgClassNames = 'br-100 pa1 ba b--black h4 w4';
    let socialClassNames = 'h2 ma2';


    // Using the new id var to filter the new developer submissions
    if (id != undefined) {
        return (
            <div id='{id}' className={cardClassNames}>
                <img className={imgClassNames} alt={`${name}'s profile`}
                     src={img !== "" ? img : 'https://cdn3.iconfinder.com/data/icons/pictofoundry-pro-vector-set/512/Avatar-128.png'}/>
                <div>
                    <h2>{name}</h2>
                    <div>
                        <a href={links.website} title="Website/Portfolio"><img className={socialClassNames}
                                                                               src="assets/images/website.svg"/></a>
                        <a href={links.github} title="Github page"><img className={socialClassNames}
                                                                        src="assets/images/github.svg"/></a>
                        <a href={links.linkedin} title="LinkedIn page"><img className={socialClassNames}
                                                                            src="assets/images/linkedin.svg"/></a>
                    </div>
                    <div>{jobTitle}</div>
                    <p>{location.city}, {location.state}, {location.country}</p>
                </div>
            </div>
        );
    }

    return (

        <div className={cardClassNames}>
            {deprecated_id ? deprecated_id : <img className='{imgClassNames}' alt='robots'
                                                  src={`https://cdn3.iconfinder.com/data/icons/pictofoundry-pro-vector-set/512/Avatar-128.png`}/>}
            <div>
                <h2>{name}</h2>
                <div className="grow">{deprecated_website}</div>
                <div>{jobTitle}</div>
                <p>{deprecated_location}</p>
            </div>
        </div>

    );
}

export default Card;