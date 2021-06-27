import React from 'react';
import { paginate, getPagesFromSize } from '../util/paginator';

export const PaginationContext = React.createContext();

export const PaginationContextProvider = props => {
  const { dataSource } = props;
  const [data, setData] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [currentPage, setPagination] = React.useState(1);

  React.useEffect(() => {
    // const a = getPagesFromSize(dataSource.length)

    const pageAux = paginate(dataSource, page, perPage);
    setData(pageAux);
  }, []);

  React.useEffect(() => {
    // const a = getPagesFromSize(dataSource.length)

    const pageAux = paginate(dataSource, page, perPage);
    setData(pageAux);
  }, [dataSource]);

  React.useEffect(() => {
    // const a = getPagesFromSize(dataSource.length)

    const pageAux = paginate(dataSource, page, perPage);
    setData(pageAux);
  }, [page, perPage]);

  React.useEffect(() => setPagination(page), [page]);

  const value = React.useMemo(() => {
    return {
      currentPage,
      data,
      setPage,
      setPerPage,
    };
  }, [data, page, perPage]);

  return <PaginationContext.Provider value={value} {...props} />;
};
