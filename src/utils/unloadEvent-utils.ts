export const unregisterUnloadEvent = (
  setOnLogout: React.Dispatch<React.SetStateAction<(() => void) | null | undefined>>
) => {
  window.removeEventListener('beforeunload', keepOnPage);
  setOnLogout(undefined);
};

export const registerUnloadEvent = (
  setOnLogout: React.Dispatch<React.SetStateAction<(() => void) | null | undefined>>,
  setOpenExitModal: React.Dispatch<React.SetStateAction<boolean>>
) => {
  window.addEventListener('beforeunload', keepOnPage);
  // react dispatch consider a function input as a metod to be called with the previuos state to caluclate the next state: those we are defining a function that return the next function
  setOnLogout(() => () => setOpenExitModal(true));
};

const keepOnPage = (e: BeforeUnloadEvent) => {
  const message =
    "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it.";

  e.preventDefault();
  // eslint-disable-next-line functional/immutable-data
  e.returnValue = message;
  return message;
};
