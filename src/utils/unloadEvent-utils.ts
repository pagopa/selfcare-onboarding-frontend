export const unregisterUnloadEvent = (
  setOnExit: React.Dispatch<React.SetStateAction<((exitAction: () => void) => void) | undefined>>
) => {
  window.removeEventListener('beforeunload', keepOnPage);
  setOnExit(undefined);
};

export const registerUnloadEvent = (
  setOnExit: React.Dispatch<React.SetStateAction<((exitAction: () => void) => void) | undefined>>,
  setOpenExitModal: React.Dispatch<React.SetStateAction<boolean>>,
  setOnExitAction: React.Dispatch<React.SetStateAction<(() => void) | undefined>>
) => {
  window.addEventListener('beforeunload', keepOnPage);
  // react dispatch consider a function input as a metod to be called with the previuos state to caluclate the next state: those we are defining a function that return the next function
  setOnExit(() => (exitAction: (() => void) | undefined) => {
    setOpenExitModal(true);
    setOnExitAction(exitAction);
  });
};

const keepOnPage = (e: BeforeUnloadEvent) => {
  const message =
    "Warning!\n\nNavigating away from this page will delete your text if you haven't already saved it.";

  e.preventDefault();
  // eslint-disable-next-line functional/immutable-data
  e.returnValue = message;
  return message;
};
