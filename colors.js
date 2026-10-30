// Shared section colors keep click-driven and scroll-driven service changes aligned.
export const serviceColors=['#164b43','#69375a','#8b3c24','#203d72','#54346e'];
export function colorAt(stops,progress){
  const position=Math.max(0,Math.min(1,progress))*(stops.length-1);
  const index=Math.min(stops.length-2,Math.floor(position));
  const mix=position-index;
  const rgb=hex=>hex.slice(1).match(/../g).map(channel=>parseInt(channel,16));
  const a=rgb(stops[index]),b=rgb(stops[index+1]);
  return `rgb(${a.map((channel,i)=>Math.round(channel+(b[i]-channel)*mix)).join(', ')})`;
}
