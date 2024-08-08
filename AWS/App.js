import { useState } from 'react';
import './App.css';
import placeholder from './visitors/placeholder.jpeg';  // Adjust the path based on your actual structure

const uuid = require('uuid');

function App() {
  const [image, setImage] = useState(null);
  const [uploadResultMessage, setUploadResultMessage] = useState('Please enter an image to authenticate');
  const [visitorName, setVisitorName] = useState(placeholder);
  const [isAuth, setAuth] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setVisitorName(URL.createObjectURL(file));
    }
  }

  async function sendImage(e) {
    e.preventDefault();
    if (!image) {
      setUploadResultMessage('Please select an image to upload');
      return;
    }

    const visitorImageName = uuid.v4();

    try {
      const response = await fetch('arn:aws:execute-api:us-east-1:975050156532:w6lyokkmz1/*/PUT/{bucket}/{filename}', {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg'
        },
        body: image
      });

      if (response.ok) {
        const authResponse = await authenticate(visitorImageName);

        if (authResponse.Message === 'Success') {
          setAuth(true);
          setUploadResultMessage('Hi ${authResponse.firstName} ${authResponse.lastName}, welcome to work');
        } else {
          setAuth(false);
          setUploadResultMessage('Authentication Failed');
        }
      } else {
        setAuth(false);
        setUploadResultMessage('There is an error in the authentication process, try again later.');
      }
    } catch (error) {
      setAuth(false);
      setUploadResultMessage('There is an error in the authentication process, try again later.');
      console.error(error);
    }
  }

  async function authenticate(visitorImageName) {
    const requestUrl = `https://w6lyokkmz1.execute-api.us-east-1.amazonaws.com/dev1/employee?${new URLSearchParams({
      objectKey: '${visitorImageName}.jpeg'
    })}`;

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error(error);
      return { Message: 'Error' };
    }
  }

  return (
    <div className="App">
      <h2>FACIAL RECOGNITION SYSTEM</h2>
      <form onSubmit={sendImage}>
        <input type='file' name='image' onChange={handleImageChange} />
        <button type='submit'>Authenticate</button>
      </form>

      <div className={isAuth ? 'success' : 'failure'}>{uploadResultMessage}</div>
      <img src={visitorName} alt="Visitor" height={250} width={250} />
    </div>
  );
}

export default App;