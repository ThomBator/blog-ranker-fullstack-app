//provide a full url and recieve a shortened version for use in the UI of your component

const shortURL = (url) => {
  try {
    const fullURL = new URL(url);
    return fullURL.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default shortURL;
