export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    alert(`Something went wrong:\n${error.message}`);
  } else {
    console.error("An unknown error occurred");
  }
};
