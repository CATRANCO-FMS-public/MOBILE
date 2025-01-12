import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Add Pusher to the global scope for Echo
global.Pusher = Pusher;

// Initialize Echo
const echo = new Echo({
  broadcaster: "pusher",
  key: "a7e5972162f4831c474b", 
  cluster: "ap1",
  encrypted: true,
  forceTLS: true, 
});

export default echo;
