export const spotifyGetRequest = (spotifyURL, access_token, callback) => {
  fetch(spotifyURL, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": 'Bearer ' + access_token
    }
  }).then((response) => {
    return response.json();
  }).then((myJson) => {
    callback(myJson);
  });
}