import React from 'react';
import Card from './components/Card';


const CardList = ({persons}) => {
  const cardCom = persons.map((user, i) => {
    return (<Card key={i} user={user}/>);
  });

  return (
    <div id="sketch-particles" className="flex flex-wrap justify-center">
      {cardCom}
    </div>
  );
}

export default CardList;
