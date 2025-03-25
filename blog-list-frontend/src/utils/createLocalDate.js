//returns properly formmatted Local date strings for use in your component UIs
const createLocalDate = (dateString) => {
  const newDate = new Date(dateString);

  return newDate.toLocaleString();
};

export default createLocalDate;
