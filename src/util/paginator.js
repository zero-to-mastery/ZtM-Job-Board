import _ from 'lodash';

export const paginate = (arr = [], page, perPage) => {
  return arr.slice((page - 1) * perPage, page * perPage);
};

export const getPagesFromSize = (size, perPage = 10) => {
  const slices = _.range(perPage, size, perPage),
    diff = size - slices[slices.length - 1] || size;
  slices.push(diff);
  return slices;
};

export const like = input => {
  return new RegExp(input, 'i');
};

export const test = (a, b) => {
  const res = like(b).test(a);
  return res;
};
