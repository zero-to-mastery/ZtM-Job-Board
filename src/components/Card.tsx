import React from 'react'
import Person from '../interfaces/person'
import { normalizeSkills } from '../util/skills'
import Avatar from './Avatar'
import ContactLinks from './ContactLinks'

interface CardProps {
    user: Person
    selectedSkills?: string[]
}

const Card = ({ user, selectedSkills = [] }: CardProps) => {
    let { id, img, name, jobTitle, location } = user
    const skills = normalizeSkills(user.skills)
    const requiredSkills = new Set(
        selectedSkills.map((skill) => skill.trim().toLowerCase())
    )

    if (id) {
        return (
            <div
                id={`person-${id}`}
                className="card ma3 w5 tc br3 custom--shadow-2 custom--shadow-hover-8 custom--o-95 z-1"
            >
                <div className="header relative pt3 br2 br--top z-0">
                    <Avatar
                        src={img}
                        alt={name}
                        size={128}
                        className="photo relative br-100 bw2 b--solid custom--b--primary bg-center object-fit-cover"
                        fallbackClassName="photo--fallback"
                    />
                    <h2 className="name mt3 mb1 ph3 w-100 flex items-center justify-center">
                        {name}
                    </h2>
                    <p className="title text-center">{jobTitle}</p>
                </div>
                {skills.length > 0 && (
                    <section
                        className="profile-skills"
                        aria-label={`${name}'s self-reported skills`}
                    >
                        <p className="profile-skills__label">
                            Self-reported skills (not verified)
                        </p>
                        <ul
                            className="skill-chips"
                            aria-label="Declared skills"
                        >
                            {skills.map((skill) => {
                                const matched = requiredSkills.has(
                                    skill.toLowerCase()
                                )
                                return (
                                    <li
                                        key={skill}
                                        className={`skill-chip${matched ? ' skill-chip--matched' : ''}`}
                                    >
                                        {skill}
                                        {matched && (
                                            <span className="skill-chip__match">
                                                Matches
                                            </span>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                )}
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
