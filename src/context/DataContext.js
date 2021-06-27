import React from 'react';
import { test } from '../util/paginator';

export const DataContext = React.createContext();

export const DataProvider = props => {
  const { dataSource } = props;
  const [data, setData] = React.useState(dataSource);

  const filterData = filters => {
    console.log(filters);
    const filtersName = Object.keys(filters);
    filtersName.forEach(name => {
      const value = filters[name];
      if (value == '') {
        setData(dataSource);
      } else {
        const aux = data.filter(item => test(item[name], value));
        setData(aux);
      }
    });
  };

  const value = React.useMemo(() => {
    return {
      data,
      filterData,
    };
  }, [data]);

  return <DataContext.Provider value={value} {...props} />;
};
