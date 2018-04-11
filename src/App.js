import React, {Component} from 'react';
import CardList from './CardList';
import SearchBox from './SearchBox';
import { robots } from './robots';
import Scroll from './Scroll';


class App extends Component {
	constructor() {
		super()
		this.state = {
	robots: robots,
	searchfield: ""
			}
		}
	
	onSearchChange = (event) => {
this.setState({searchfield:event.target.value})
	
}
	render() {
		const filteredRobots = this.state.robots.filter(robots => {
		return robots.location.toLowerCase().includes(this.state.searchfield.toLowerCase())
	})
		return (
	<div className='tc'>
		<h1 className ="baskerville i fw9 f1 underline ">Job Board </h1>
		<SearchBox searchChange={this.onSearchChange} />
		<Scroll>
				<CardList robots={filteredRobots} />
		</Scroll>
	</div>

	);
   }
}

export default App;