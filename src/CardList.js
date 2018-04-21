import React from 'react';
import Card from './Card';


const CardList = ({robots}) => {
    const cardCom = robots.map((user, i) => {
        return (<Card key={i} user={user}/>);
    });

    return (
        <div className="flex flex-wrap justify-around">
            {cardCom}
        </div>
    );
}
export default CardList;