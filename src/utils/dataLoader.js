export const loadJsonData = (filename) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `/data/${filename}`, false); // false makes it synchronous
  xhr.send();

  if (xhr.status === 200) {
    return JSON.parse(xhr.responseText);
  } else {
    throw new Error(`Failed to load ${filename}: ${xhr.status}`);
  }
};
