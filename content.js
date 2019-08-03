(function(chrome) {
  const COLON_KEY = ':';
  const SHIFT_KEY = 'Shift';
  const BACKSPACE_KEY = 'Backspace';

  let colonKeyCount = 0;
  let trackingKeys = false;
  let keyString = '';

  let prevKey = '';
  // We'll need this later for showing the popup, but for now we're just going to match
  // as a starting point.
  // let trackedKeyCount = 0;

  // SO what we want is to listen for Shift + colon, and continue to listen
  // to keypresses until we get another Shift + colon
  document.onkeyup = function(event) {
    event.stopPropagation();
    // if (trackingKeys == true) {
    //   alert('Tracking keys!');
    // }

    // Everything in here is fucckeeedd
    if (event.key == 'Enter') {
      keyString = '';
      document.activeElement.textContent = '';
    }

    if (event.key == BACKSPACE_KEY && keyString > 0) {
      let newLength = keyString.length - 1;

      keyString.length = newLength;
    }

    if (event.shiftKey && event.key == COLON_KEY && event.key !== BACKSPACE_KEY) {
      colonKeyCount++;

      if (colonKeyCount == 1) {
        trackingKeys = true;
      } else if (colonKeyCount == 2) {
        trackingKeys = false;
        colonKeyCount = 0;
        checkForEmojiReplacements(event.currentTarget);
      }
    } else if (trackingKeys == true && event.key !== SHIFT_KEY && event.key !== BACKSPACE_KEY) {
      keyString += event.key;
    }
  };

  // We could even check for emoji replacemenets on the active element! That would make a lot
  // of sense, especially for facebook when you refresh the page.
  function checkForEmojiReplacements(target) {
    if (keyString.toUpperCase() == 'JOY') {
      let element = document.activeElement;

      // let newThing = element.innerText.replace(':joy:', '\U+1F605');

      for (let i = 0; i < keyString.length + 2; i++) {
        document.execCommand('delete');
      }

      document.execCommand('insertText', true, '😂');

      keyString = '';
    }
  }

})(chrome);