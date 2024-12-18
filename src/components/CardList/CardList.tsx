import React from 'react'
import Card from '../Card/Card'
import styles from './CardList.module.scss'

import Person from '../../interfaces/person'

const CardList = ({ persons }: any) => {
    return (
        <div className={styles.CardList}>
            {persons.map((user: Person) => (
                <Card key={user.id} user={user} />
            ))}
        </div>
    )
}

export default CardList
