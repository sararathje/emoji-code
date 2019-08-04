(function(chrome) {

  // TODO
  // 1. Fix weird thing when pressing delete
  // 2. On page reload, we should have a messenger that triggers the replacing text since
  //    messenger stores what you had previously. So we should look at the active element,
  //    and if it's not empty, we should check for the :emoji-code: string and replace it
  //    with the corresponding emoji.
  // 3. Construct entire list of emojis that we can read from with codes mapped to them.
  // 4. Figure out when we should start tracking and what keys to include. If we have :co, but
  //    then we hit a backspace, there should be graceful handling for that.
  // 5. Add a popup that shows up when the user starts typing where they can select the emoji.
  //    I should keep this in mind for any changes that I'm making now to make my life easier
  //    in the future.
  // 6. Have some sort of packaging so that I don't have to do this all in a single file.
  //    Because one-file programs are gross and I don't like looking at them.

  // Key constants
  const COLON_KEY = ':';
  const SHIFT_KEY = 'Shift';
  const BACKSPACE_KEY = 'Backspace';
  const UNDERSCORE_KEY = '_';

  // Logic constants
  let emojiCodeStartKeyCount = 0;
  let keyString = '';

  // So there's an interesting bug that's happening right now becuase of my counting
  // mechanism where if I perform a search and then delete to correct, it will not search
  // again because the colon count is reset.
  // I should check the colon count in the actual text on the active element lol. 
  // This probably isn't a huge deal since this will change when I put in the popup with
  // the options. but that's fun.

  // There is also a weird bug that when the emoji is the first thing in the chat,
  // it doesn't delete it when you press delete.

  document.onkeyup = function(event) {
    if (event.shiftKey && event.key === COLON_KEY) {
      emojiCodeStartKeyCount++;

      if (shouldSearchForEmoji() === true) {
        searchInputForEmojiCode(keyString);
        resetKeyTracker();
      }
    } else if (shouldTrackKeys()) {
      updateKeyString(event.key);
    }
  };

  function shouldTrackKeys() {
    return emojiCodeStartKeyCount == 1
  }

  function shouldSearchForEmoji() {
    return emojiCodeStartKeyCount == 2;
  }

  function updateKeyString(key) {
    if (key === BACKSPACE_KEY) {
      keyString.length = keyString.length - 1;
    } else if (keyIsAlphanumeric(key) === true || key === UNDERSCORE_KEY) {
      keyString += key;
    }
  }

  function keyIsAlphanumeric(key) {
    if (key.length == 1 && /[a-zA-Z0-9-_ ]/.test(key)) {
      return true;
    }

    return false;
  }

  function resetKeyTracker() {
    keyString = '';
    emojiCodeStartKeyCount = 0;
  }

  function searchInputForEmojiCode(inputText) {
    for (let alias in emojiList) {
      if (inputText.toUpperCase() == alias.toUpperCase()) {
        replaceCodeWithEmoji(alias);
      }
    }
  }

  function replaceCodeWithEmoji(alias) {
    removeAlias(alias);
    insertEmoji(emojiList[alias]);
  }

  function removeAlias(alias) {
    // Remove the alias (ie., :joy:) including the semicolons
    for (let i = 0; i < alias.length + 2; i++) {
      document.execCommand('delete');
    }
  }

  function insertEmoji(emoji) {
    document.execCommand('insertText', true, emoji);
  }

   // Emoji constants
  const emojiList = {
    // face-smiling
    'grinning': '😃',
    'grinning_smile': '😄',
    'beaming': '😁',
    'grinning_squint': '😆',
    'sweat_smile': '😅',
    'rolling_on_the_floor_laughing': '🤣',
    'joy':  '😂',
    'slightly_smiling': '🙂',
    'upside_down_face': '🙃',
    'winking_face': '😉',
    'blush': '😊',
    'smiling_face_with_halo': '😇',
    // face-affection
    'heart_eyes': '😍',
    'star_struck': '🤩',
    'blowing_kiss': '😘',
    'kissing': '😗',
    'kissing_closed_eyes': '😚',
    'kissing_smiling_eyes': '😙',
    // face-tongue
    'delicious': '😋',
    'stuck_out_tongue': '😛',
    'stuck_out_tongue_winking': '😜',
    'zany_face': '🤪',
    'stuck_out_tongue_squinting': '😝',
    'money_face': '🤑',
    // face-hand
    'hugging': '🤗',
    'shock': '🤭',
    'shushing': '🤫',
    'thinking': '🤔',
    // face-neutral-skeptical
    'zipper_mouth': '🤐',
    'raised_eyebrow': '🤨',
    'neutral': '😐',
    'expressionless': '😑',
    'no_mouth': '😶',
    'smirking': '😏',
    'unamused': '😒',
    'rolling_eyes': '🙄',
    'grimace': '😬',
    'lying': '🤥',
    // face-sleepy
    'relived': '😌',
    'pensive': '😔',
    'sleepy': '😪',
    'drooling': '🤤',
    'sleeping': '😴'
    // face-unwell
  }

})(chrome);