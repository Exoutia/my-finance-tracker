function capitalize(word: string, split_key: string = " ") {
  const titleCase = word
    .split(split_key)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  return titleCase;
}

export { capitalize };
