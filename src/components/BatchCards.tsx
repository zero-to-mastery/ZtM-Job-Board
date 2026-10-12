import React, { useState } from 'react'
import CountUp from 'react-countup'

import CardList from './CardList'
import BasicButton from './BasicButton'
import { countriesWithNumOfDevsObj } from '../util/UsersDataCleanup'
const countryNamesAndNumOfDevsArr = Object.entries(countriesWithNumOfDevsObj)

const BatchCards = ({ persons, numberPerBatch = 16 }: any) => {
    const [batch, setBatch] = useState(1)

    const addToBatch = () => {
        if (persons.length > batch * numberPerBatch) {
            setBatch(batch + 1)
        }
    }

    return (
        <div>
            <div style={{ flex: 1 }}>
                <div className="profile-stats">
                    <div className="profile-stats__tile">
                        <p className="profile-stats__label">Total Profiles</p>
                        <p className="profile-stats__value">
                            <CountUp end={persons.length} delay={1} />
                        </p>
                    </div>
                    <div className="profile-stats__tile">
                        <p className="profile-stats__label">Total Countries</p>
                        <p className="profile-stats__value">
                            <CountUp
                                end={countryNamesAndNumOfDevsArr.length}
                                delay={1}
                            />
                        </p>
                    </div>
                </div>
            </div>

            {persons.length === 0 ? (
                <div className="empty-state" role="status">
                    <p className="empty-state__title">No profiles found</p>
                    <p>Try a different search or clear your filters.</p>
                </div>
            ) : (
                <div className="flex flex-wrap justify-center">
                    <CardList
                        persons={persons.slice(0, batch * numberPerBatch)}
                    />
                </div>
            )}
            {persons.length >= batch * numberPerBatch && (
                <BasicButton action={addToBatch}>Show More</BasicButton>
            )}
        </div>
    )
}

export default BatchCards
