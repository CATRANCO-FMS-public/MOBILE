# Welcome to TransitTrack Mobile Application 👋

## Getting Started

Follow these steps to set up and run the React Native mobile application:

### Prerequisites

- Ensure you have Node.js and npm installed on your machine.
- Install an IDE like Visual Studio Code.

### Setup Instructions

1. **Open Terminal or Command Prompt**

   - Navigate to the project directory:
     ```sh
     cd CATRANCO-FMS-Mobile
     ```

2. **Open the Project in Your IDE**

   - Use the following command to open the project in Visual Studio Code:
     ```sh
     code .
     ```

3. **Install Dependencies**

   - Run the following command to install all necessary dependencies:
     ```sh
     npm install
     ```

4. **Download Android Resources**

   - Download the required Android resources from [this link](https://drive.google.com/drive/folders/1xGtj5Cvj1N0QaSIy9-tqpopmvlecr-1_?usp=sharing).
   - Copy and paste the downloaded resources into the appropriate folder.

5. **Configure AndroidManifest.xml**

   - Update the `android/app/src/main/AndroidManifest.xml` file to include your Google Maps API key.

6. **Update API URL**

   - Change the `apiUrl` in `constants/apiURL` to your Wi-Fi IPv4 address. For example:
     ```
     http://192.168.1.100:8000
     ```
   - Replace `192.168.1.100` with your own IP address.

### Optional: Build the App

- To build the app for development, use the following command:
  ```sh
  eas build --profile development --platform android
  ```

### Start the Application

- Run the app using:
  ```sh
  npm start
  ```

## Additional Resources

- For further assistance, refer to the official React Native documentation or reach out to the project maintainers.

```sh
open the terminal and run the following command:

# Go the the Directory
cd CATRANCO-FMS-Mobile

# Open the IDE
code .

# Install the dependencies
npm install

# Download the Android resources, copy and paste to the folder
- (https://drive.google.com/drive/folders/1xGtj5Cvj1N0QaSIy9-tqpopmvlecr-1_?usp=sharing)
- Must configure the android/app/src/main/AndroidManifest.xml file to include the google maps key

# change the apiUrl to your wifi IPV4 address located at constants->apiURL
e.g. http://192.168.1.100:8000 -> change to your own ip address

# optional:  build the app using eas build development
eas build --profile development --platform android

# start the app
npm start