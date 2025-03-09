const formattedCount = (views) =>{
  if (views < 1000) return views;
  if (views < 1000000) return `${Math.floor(views / 1000)}K`;
  if (views < 1000000000) return `${Math.floor(views / 1000000)}M`;
  if (views <= 100000000000) return `${Math.floor(views / 1000000000)}B`;
  
  return "100B+"
}

export { formattedCount };