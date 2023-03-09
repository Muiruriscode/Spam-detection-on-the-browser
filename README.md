# Spam Detection using Tensorflow.js
This project involes using tensorflowjs model to detect spam from user input. The project use socket io to broadcast user comments to other connected users using the web page. If a comment is detected as a spam it is captured and user is given a warning. A spam comment is not broadcast to other users.

!["spam_detector"](./assets/spam%20detection.png)

## Handle user comments
Handle the input that the user fills anfter clicking the comment button
```js
function handleCommentPost() {
  if (! POST_COMMENT_BTN.classList.contains(PROCESSING_CLASS)) {
    POST_COMMENT_BTN.classList.add(PROCESSING_CLASS);
    COMMENT_TEXT.classList.add(PROCESSING_CLASS);
    let currentComment = COMMENT_TEXT.innerText;
    console.log(currentComment);
    
    // convert suer input to lower case and remove special characters
    let lowercaseSentenceArray = currentComment.toLowerCase().replace(/[^\w\s]/g, ' ').split(' ');
    
    let li = document.createElement('li');
    let p = document.createElement('p');
    p.innerText = COMMENT_TEXT.innerText;

    let spanName = document.createElement('span');
    spanName.setAttribute('class', 'username');
    spanName.innerText = currentUserName;

    let spanDate = document.createElement('span');
    spanDate.setAttribute('class', 'timestamp');

    let curDate = new Date();
    spanDate.innerText = curDate.toLocaleString();

    li.appendChild(spanName);
    li.appendChild(spanDate);
    li.appendChild(p);
    COMMENTS_LIST.prepend(li);

    COMMENT_TEXT.innerText = '';

    // call loadAndPredict to predict whether the comment is a spam or not
    loadAndPredict(tokenize(lowercaseSentenceArray), li).then(function() {
      POST_COMMENT_BTN.classList.remove(PROCESSING_CLASS);
      COMMENT_TEXT.classList.remove(PROCESSING_CLASS);
      

    });
  }
}

POST_COMMENT_BTN.addEventListener('click', handleCommentPost)
```

## Tokenize the User Comment
Create tokens from the user comments using a dictionary to encode the words for the prediction model to use

```js
// import dictionary to encode the words
import * as DICTIONARY from 'https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/SavedModels/spam/dictionary.js';

// Length of the number of words in each token
const ENCODING_LENGTH = 20;


function tokenize(wordArray) {
// initialize the return array with the value showing the start of a sentence.
  let returnArray = [DICTIONARY.START];
  for (var i = 0; i < wordArray.length; i++) {
//for every word in the comment encode it to the value in the dictionary then push it to return array
    let encoding = DICTIONARY.LOOKUP[wordArray[i]];
    returnArray.push(encoding === undefined ? DICTIONARY.UNKNOWN : encoding);
  }
// if the words sre less than the total number required for one token use the value in PAD to fill the remaining values
  while (returnArray.length < ENCODING_LENGTH) {
    returnArray.push(DICTIONARY.PAD);
  }
  
  console.log([returnArray]);
  
  return tf.tensor2d([returnArray]);
}

```

## Broadcast Comments
```js
//use socket.io client
var socket = io.connect();


function handleRemoteComments(data) {
  let li = document.createElement('li');
  let p = document.createElement('p');
  p.innerText = data.comment;

  let spanName = document.createElement('span');
  spanName.setAttribute('class', 'username');
  spanName.innerText = data.username;

  let spanDate = document.createElement('span');
  spanDate.setAttribute('class', 'timestamp');
  spanDate.innerText = data.timestamp;

  li.appendChild(spanName);
  li.appendChild(spanDate);
  li.appendChild(p);
  
  COMMENTS_LIST.prepend(li);
}

// when you receive a message tagged remoteComment call handleRemoteComment function
socket.on('remoteComment', handleRemoteComments);
```


## Socket.io
```js
io.on('connect', socket => {
//When there is a new connection, exetute this code
  console.log('Client connected');

  socket.on('comment', (data) => {
    //Broadcast data to thje client with the tag remoteComment to all connected users
    socket.broadcast.emit('remoteComment', data);
  });
});

```
