const formatTime = (duration) =>{
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(duration / 60 % 60);
  const seconds = Math.floor(duration % 60);

  let formattedDuration = "";

  if (hours) formattedDuration += hours + ":";

  formattedDuration += `${hours ? minutes.toString().padStart(2, "0"): minutes}:`;
  formattedDuration += `${seconds.toString().padStart(2, "0")}`;

  return formattedDuration;
}

const timeAgo = (date) =>{
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years) return `${years} years ago`;
  if (months) return `${months} months ago`;
  if (days) return `${days} days ago`;
  if (hours) return `${hours} hours ago`;
  if (minutes) return `${minutes} minutes ago`;
  if (seconds) return `${seconds} seconds ago`;
}

export { formatTime, timeAgo };