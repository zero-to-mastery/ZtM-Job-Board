import React from 'react';
import Card from './Card';

const CardList = ({persons}) => {
  const cardCom = persons.map((user, i) => {
    return (<Card key={i} user={user}/>);
  });

  return (
      <React.Fragment>
        {cardCom}
      </React.Fragment>
    );
}

export default CardList;
