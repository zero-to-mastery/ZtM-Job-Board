import React from 'react';
import Card from './Card';


const CardList = ({ robots }) => {
	const cardCom = robots.map((user, i) =>{
		return (<Card 
			
				 key={i}
				 id={robots[i].id}
				  name={robots[i].name} 
				  website={robots[i].website}
				  jobTitle={robots[i].jobTitle}
				   location={robots[i].location}

				   />
				   );
	})
	return(
		<div className="flex flex-wrap justify-around">
					
					{cardCom}
					</div>
		);
}
export default CardList;