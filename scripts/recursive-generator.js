

const r = function* (n){
  if(n > 50){
    return n;
  }
  yield n;
  yield * r(n+1);
};


for(const v of r(20)){
  console.log(v);
}
