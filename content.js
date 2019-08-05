(function(chrome) {

  // TODO/Improvements
  // 1. Figure out when we should start tracking and what keys to include. If we have :co, but
  //    then we hit a backspace, there should be graceful handling for that.
  // 2. Add a popup that shows up when the user starts typing where they can select the emoji.
  //    I should keep this in mind for any changes that I'm making now to make my life easier
  //    in the future.
  // 3. Construct entire list of emojis that we can read from with codes mapped to them.
  // 4. Have some sort of packaging so that I don't have to do this all in a single file.
  //    Because one-file programs are gross and I don't like looking at them.
  // 5. Figure out how to put cursor at the end after a selection.

  // Key constants
  const COLON_KEY = ':';
  const SHIFT_KEY = 'Shift';
  const BACKSPACE_KEY = 'Backspace';

  let prevMessageText;
  let lastKeyPressed;
  let shouldInsertLastTypedKey = false;

  document.onkeyup = handleKeyEvent;
  document.onkeydown = updatePrevStoredValues;

  function handleKeyEvent(event) {
    let messageText = document.activeElement.textContent;

    // Sometimes a delete will cause the next key pressed to not be rendered to the
    // screen. On the keyup, check to see if the key pressed is correctly rendered. 
    // If not, insert it.
    checkForUnrenderedChars(event, messageText);

    if (emojiCodeStartKeyPressed(event) || messagePasted(event)) {
      showEmojiSuggestions();
      searchInputForEmojiCode(messageText);
    } else if (event.key === BACKSPACE_KEY) {
      verifyDeletionSuccess(messageText);
    }
  }

  function createEmojiSuggestions(emojiSelectionWrapper) {
    let counter = 5;

    for (let alias in emojiList) {
      if (counter > 0) {
        const emojiSuggestion = document.createElement('div'),
              emojiValueWrapper = document.createElement('div'),
              emojiAliasWrapper = document.createElement('div'),
              emojiValue = document.createElement('p'),
              emojiAlias = document.createElement('p');

        emojiSuggestion.setAttribute('class', 'emoji-suggestion');

        emojiValueWrapper.setAttribute('class', 'emoji-value-wrapper');
        emojiValue.setAttribute('class', 'emoji-value');

        emojiAliasWrapper.setAttribute('class', 'emoji-alias-wrapper');
        emojiAlias.setAttribute('class', 'emoji-alias');

        emojiValue.appendChild(document.createTextNode(emojiList[alias]));
        emojiAlias.appendChild(document.createTextNode(`:${alias}:`));

        emojiValueWrapper.appendChild(emojiValue);
        emojiAliasWrapper.appendChild(emojiAlias);

        emojiSuggestion.appendChild(emojiValueWrapper);
        emojiSuggestion.appendChild(emojiAliasWrapper);

        emojiSelectionWrapper.appendChild(emojiSuggestion);
      }

      counter --;
    }
  }

  function createEmojiSelectionWrapper() {
    const messageBoxes = document.getElementsByClassName('_7kpk');
    const messageBoundDiv = messageBoxes[0];
    const messageBounds = messageBoundDiv.getBoundingClientRect();
    const bottom = messageBounds.height + 10;

    // alert('bottom: ' + messageBounds.bottom);
    // alert('y: ' + messageBounds.y);
    // alert('height: ' + messageBounds.height);

    const emojiSelectionWrapper = document.createElement('div');
    emojiSelectionWrapper.setAttribute('class', 'emoji-selection-wrapper');
    emojiSelectionWrapper.setAttribute('style', `bottom: ${bottom}px; left: ${messageBounds.left}px;`);

    createEmojiSuggestions(emojiSelectionWrapper);

    return emojiSelectionWrapper;
  }

  function showEmojiSuggestions() {
    const wrapper = createEmojiSelectionWrapper();
    document.body.appendChild(wrapper);
  }

  function searchInputForEmojiCode(inputText) {
    let updatedInputText = inputText;

    for (let alias in emojiList) {
      if (inputText.toUpperCase().includes(alias.toUpperCase())) {
        updatedInputText = replaceCodeWithEmoji(updatedInputText, alias);
      }
    }
  }

  function replaceCodeWithEmoji(inputText, alias) {
    const updatedMessage = inputText.replace(`:${alias}:`, emojiList[alias]);
    
    document.execCommand('selectAll');
    document.execCommand('insertText', true, updatedMessage);

    return updatedMessage;
  }

  function emojiCodeStartKeyPressed(event) {
    return (event.shiftKey && event.key === COLON_KEY);
  }

  function messagePasted(event) {
    // This will not work on mac because a meta key is used.
    return (event.ctrlKey && event.key.toUpperCase() === 'V');
  }

  function verifyDeletionSuccess(messageText) {
    // If the previous message is the same as the new, clearly a conventional delete
    // didn't work. Resort to a forced delete by means of selecting all text and inserting
    // with a new string that matches what should've been deleted.
    if ((prevMessageText.length === messageText.length) && prevMessageText.length > 0) {
      handleDeleteText(messageText);
    }
  }

  function updatePrevStoredValues(event) {
    if (event.key === BACKSPACE_KEY) {
      prevMessageText = document.activeElement.textContent;
    }

    // This is part of a crazy hack for handling deleting when text has been inserted,
    // which Facebook messenger doesn't seem to handle on its own. This makes a risky
    // assumption that a meta key (Shift, Backspace, Return, etc.) is longer than a single 
    // character. Something weird happens when all text in the input is selected and
    // replaced where the first character typed after the replacement isn't shown on the
    // screen. The `lastPressedKey` is re-inserted after replacement so that it shows up.
    if (event.key.length === 1) {
      lastKeyPressed = event.key;
    }
  }

  function checkForUnrenderedChars(event, messageText) {
    if (event.key !== BACKSPACE_KEY
        && messageText.length === 0
        && shouldInsertLastTypedKey === true) {
      document.execCommand('insertText', true, lastKeyPressed);
      shouldInsertLastTypedKey = false;
    }
  }

  function handleDeleteText(text) {
    const textSelection = document.getSelection().toString();

    // Case when one or multiple parts of the message are selected.
    if (textSelection.length > 0
        && prevMessageText.length > 1
        && textSelection.length < prevMessageText.length) {
      const splitMessage = prevMessageText.split(textSelection);
      let newMessage = '';

      for (let i = 0; i < splitMessage.length; i++) {
        newMessage += splitMessage[i];
      }

      document.execCommand('selectAll');
      document.execCommand('insertText', true, newMessage);
    } else if (prevMessageText.length === 1 || textSelection.length === prevMessageText.length) {
      // Case when entire string is selected or there's a single character
      document.execCommand('delete');
      shouldInsertLastTypedKey = true;
    } else {
      // Case when we're only deleting a single character
      let newMessage = prevMessageText.substring(0, prevMessageText.length - 1);
      document.execCommand('selectAll');
      document.execCommand('insertText', true, newMessage);
    }
  }


   // Emoji constants
  const emojiList = {
    // face-smiling
    'grinning': '😃',
    'smiley': '😃',
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
    'smiling_face_with_hearts': '🥰',
    'heart_eyes': '😍',
    'star_struck': '🤩',
    'blowing_kiss': '😘',
    'kissing': '😗',
    'smiling_face_blush': '☺',
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
    'sleeping': '😴',
    // face-unwell
    'face_with_mask': '😷',
    'face_with_thermometer': '🤒',
    'face_with_head_bandage': '🤕',
    'nauseated': '🤢',
    'vomiting': '🤮',
    'sneezing': '🤧',
    'hot_face': '🥵',
    'cold_face': '🥶',
    'woozy': '🥴',
    'dizzy': '😵',
    'exploding_head': '🤯',
    // face-hat
    'cowboy_hat_face': '🤠',
    // face-glasses
    'face_with_sunglasses': '😎',
    'nerd': '🤓',
    'monocle': '🧐',
    // face-concerned
    'confused': '😕',
    'worried': '😟',
    'slightly_frowining': '🙁',
    'frowning': '☹',
    'open_mouth': '😮',
    'hushed': '😯',
    'astonished': '😲',
    'flushed': '😳',
    'pleading': '🥺',
    'frowning_with_open_mouth': '😦',
    'anguished': '😧',
    'fearful': '😨',
    'anxious_sweat': '😰',
    'sad': '😥',
    'crying': '😢',
    'loudly_crying': '😭',
    'screaming': '😱',
    'confounded': '😖',
    'persevering': '😣',
    'disapointed': '😞',
    'downcast_face_with_sweat': '😓',
    'weary': '😩',
    'tired': '😫',
    'yawning': '🥱',
    // face-negative
    'steaming': '😤',
    'very_angry': '😡',
    'angry': '😠',
    'cursing': '🤬',
    'smirking_devil': '😈',
    'angry_devil': '👿',
    'skull': '💀',
    'skull_and_crossbones': '☠',
    // face-costume
    'poo': '💩',
    'ghost': '👻',
    'alien': '👽',
    'alien_monster': '👾',
    // monkey-face
    'see_no_evil': '🙈',
    'hear_no_evil': '🙉',
    'speak_no_evil': '🙊',
    // emotion
    'kiss_mark': '💋',
    'heart_with_arrow': '💘',
    'heart_with_ribbon': '💝',
    'sparkling_heart': '💖',
    'growing_heart': '💗',
    'beating_heart': '💓',
    'revolving_hearts': '💞',
    'two_hearts': '💕',
    'heart_exclamation': '❣',
    'broken_heart': '💔',
    'red_heart': '❤',
    'orange_heart': '🧡',
    'yellow_heart': '💛',
    'green_heart': '💚',
    'blue_heart': '💙',
    'purple_heart': '💜',
    'black_heart': '🖤',
    'hundred_points': '💯',
    'collision': '💥',
    'splashing': '💦',
    'dash': '💨',
    'bomb': '💣',
    'thought_bubble': '💭',
    'zzz': '💤',
    // hand-fingers-open
    'waving_hand': '👋',
    'raised_back_hand': '🤚',
    'hand': '✋',
    'vulcan_salute': '🖖',
    'ok': '👌',
    'fingers_crossed': '🤞',
    'thumbs_up': '👍',
    'thumbs_down': '👎',
    // hands
    'clapping': '👏',
    'raised_hands': '🙌',
    'handshake': '🤝',
    'folded_hands': '🙏',
    // hand-prop
    'nail_polish': '💅',
    // body-parts
    'flexed_bicep': '💪',
    'eyes': '👀',
    // person-gesture
    // 'woman_gesture_no': '🙅',
    // 'man_gesture_no': '🙅‍♂️',
    // 'woman_raised_arms': '🙆',
    // 'man_raised_arms': '🙆‍♂️',
    // 'woman_tipping_hand': '💁‍♀️',
    // 'man_tipping_hand': '💁‍♂️',
    // 'woman_raising_hand': '🙋‍♀️',
    // 'man_raising_hand': '🙋‍♂️',
    // 'woman_facepalm': '🤦‍♀️',
    // 'man_facepalm': '🤦‍♂️',
    // 'woman_shrug': '🤷',
    // 'man_shrug': '🤷‍♂️',
    // 'woman_technologist': '👩‍💻',
    // 'man_technologist': '👨‍💻',
    // 'pregnant': '🤰',
    // 'woman_dancing': '💃',
    // 'person_climbing': '🧗'
  }

})(chrome);