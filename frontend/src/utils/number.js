const formattedCount = (views) =>{
  if (views < 1000) return views;
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  if (views < 1000000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views <= 100000000000) return `${(views / 1000000000).toFixed(1)}B`;
  
  return "100B+"
}

export { formattedCount };