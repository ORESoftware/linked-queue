

const [
  e,
  π,
  φ
] = [
  2.71828182845904,
  3.14159265358979,
  1.61803398874989,
];


console.log(
  Number(e.toFixed(5)) === 2.71828  // true
);

console.log(
  Number(e.toFixed(3)) === 2.718  // true
);

console.log(
  Number(e.toFixed(3)) === 2.7182 // false
);

console.log(
  Number(e.toFixed(3)) === 2.71 // false
);


