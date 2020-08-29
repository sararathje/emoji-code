(function(chrome) {
  /* Constants */
  const KEYS = {
    ENTER: 13
  };

  // If this classname ever changes, we'll have to get the elemetn another way (i.e., by 
  // targetting the label, for example 'Type a message...')
  const messageInput = document.getElementsByClassName('notranslate _5rpu')[0];
  // const nativeEmojiSelector = document.getElementsByClassName('uiContextualLayer uiContextualLayerAboveRight')[0];
  let currentMessage = messageInput.textContent;
  let customOverlay;

  /* Functionality */
  const appendCustomMessageOverlay = () => {
    customOverlay = document.createElement('div');
    customOverlay.id = 'custom-message-overlay';
    customOverlay.textContent = currentMessage;

    document.body.appendChild(customOverlay);
  };

  watchMutationsOnMessageInput = () => {
    const config = {attributes: true, childList: true, subtree: true};
    
    const observer = new MutationObserver(updateCurrentMessage);
    observer.observe(messageInput, config);
  };

  const interceptSend = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const sendMessage = () => {
    const sendButton = document.getElementsByClassName('_30yy _38lh _7kpi')[0];

    sendButton.click();
  };

  const updateCurrentMessage = () => {
    const unformattedMessage = messageInput.textContent;
    let formattedMessage = unformattedMessage;

    for (let alias in EMOJI_LIST) {
      const emojiCode = `:${alias}:`;
      formattedMessage = formattedMessage.replace(emojiCode, EMOJI_LIST[alias]);
    }

    currentMessage = formattedMessage;
    customOverlay.textContent = currentMessage;

    console.log('The current message is: ' + currentMessage);
  };

  sendCurrentMessage = () => {
    if (currentMessage) {
      document.execCommand('selectAll');
      document.execCommand('insertText', true, currentMessage);

      sendMessage();
    }
  };

  const listenToKeyEventsOnMessageInput = () => {
    watchMutationsOnMessageInput();

    // Listen to keydown because messages are sent on a keydown event
    messageInput.addEventListener('keydown', (e) => {
      if (e.keyCode === KEYS.ENTER && !e.shiftKey) {
        interceptSend(e);
        sendCurrentMessage();
        
        return false;
      }
    });

    // Listen to 'keyup' events so that the message input's textContent gets updated properly
    messageInput.addEventListener('keyup', (e) => {
      updateCurrentMessage();
    });
  };

  /* Initial Load Implementations */
  appendCustomMessageOverlay();
  listenToKeyEventsOnMessageInput();

  /* Emoji Constants */
  const EMOJI_LIST = {
    // face-smiling
    'grinning': '😃',
    'smiley': '😃',
    'grinning_smile': '😄',
    'beaming': '😁',
    'grinning_squint': '😆',
    'sweat_smile': '😅',
    'rofl': '🤣',
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
    'woman_gesture_no': '🙅',
    'man_gesture_no': '🙅‍♂️',
    'woman_raised_arms': '🙆',
    'man_raised_arms': '🙆‍♂️',
    'woman_tipping_hand': '💁‍♀️',
    'man_tipping_hand': '💁‍♂️',
    'woman_raising_hand': '🙋‍♀️',
    'man_raising_hand': '🙋‍♂️',
    'woman_facepalm': '🤦‍♀️',
    'man_facepalm': '🤦‍♂️',
    'woman_shrug': '🤷',
    'man_shrug': '🤷‍♂️',
    'woman_technologist': '👩‍💻',
    'man_technologist': '👨‍💻',
    'pregnant': '🤰',
    'woman_dancing': '💃',
    'person_climbing': '🧗'
  }

})(chrome);