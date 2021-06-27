import React, { useState, lazy } from 'react';
import { createFilter } from 'react-search-input';
import { shuffle } from './util/shuffle';
import persons from './assets/persons.json';
import { pageNames } from './util/pageNames';
import {
  Card,
  ThemeProvider,
  light,
  useTheme,
  Searcher,
  Navbar as SNavbar,
} from './components/super-components/core';
import Banner from './assets/002.png';
import R from './assets/003.png';
import { Logo } from './components/Brand/Logo';
import { UsersGridContainer } from './components/UsersGrid/index';

import './styles/SearchBarMobileView.scss';

const SimpleMap = lazy(() => import('./components/Map'));

const people: any = persons;

const style: React.CSSProperties = {
  background: '#fff',
  padding: '1rem',
  width: '100%',
  margin: '0 0 2rem 0',
  zIndex: 1,
  borderRadius: '5px',
};
const responsiveSearch = {
  width: '100%',
  marginBottom: '0.5rem',
  padding: '0.5rem',
};
const KEYS_TO_FILTERS = [
  'name',
  'jobTitle',
  'location.city',
  'location.state',
  'location.country',
];

const AppWrapper = (props: any) => {
  const { children } = props;
  return <ThemeProvider theme={light}>{children}</ThemeProvider>;
};

function App() {
  const { theme } = useTheme();
  const [searchfield, setSearchfield] = useState('');

  const [map, setMap] = useState(false);
  const [mapOrHomeTitle, setMapOrHomeTitle] = useState(pageNames.map); // pageNames.map is default

  const filteredPersons = (searchFilter: any) =>
    people.filter(createFilter(searchFilter, KEYS_TO_FILTERS));

  //note: shuffle function is not pure function, it mutates original array
  //in order to avoid memory duplication
  shuffle(people);

  return (
    <AppWrapper>
      <div style={{ height: '100vh' }}>
        <Card style={{ height: '100%', borderRadius: 0, overflowY: 'auto' }}>
          <SNavbar>
            <Logo style={{ width: '7rem' }} />
            Home
          </SNavbar>

          <div
            style={{
              width: '100%',
              position: 'relative',
              backgroundColor: '#D8F1FD',
              height: '16rem',
            }}
          >
            <img src={Banner} alt="" />

            <div
              style={{
                padding: '1rem',
                width: '50rem',
                position: 'absolute',
                bottom: '2rem',

                textAlign: 'center',
                left: '50%',
                transform: 'translate(-50%)',
              }}
            >
              <h1
                style={{
                  fontFamily: `'Roboto', sans-serif`,

                  margin: 0,
                  fontSize: '4rem',
                  color: '#1D2346',
                  fontWeight: 'bold',
                }}
              >
                A free code project
              </h1>
              <h1>Let's create a better web!</h1>
            </div>
            <Searcher
              style={{
                padding: '1rem',
                width: '50rem',
                position: 'absolute',
                bottom: '-1rem',
                left: '50%',
                transform: 'translate(-50%)',
              }}
            >
              Search
            </Searcher>

            <img src={R} alt="" />
          </div>

          <br />
          <br />

          <div style={{ padding: '2rem' }}>
            <UsersGridContainer people={people} />
          </div>
        </Card>
      </div>
    </AppWrapper>
  );
}

export default App;
